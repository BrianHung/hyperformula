"use strict";

exports.__esModule = true;
exports.ParserWithCaching = void 0;
var _chevrotain = require("chevrotain");
var _Cell = require("../Cell");
var _ = require("./");
var _addressRepresentationConverters = require("./addressRepresentationConverters");
var _Ast = require("./Ast");
var _binaryOpTokenMap = require("./binaryOpTokenMap");
var _Cache = require("./Cache");
var _FormulaParser = require("./FormulaParser");
var _LexerConfig = require("./LexerConfig");
var _Unparser = require("./Unparser");
var _ColumnAddress = require("./ColumnAddress");
var _RowAddress = require("./RowAddress");
/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */

/**
 * Parses formula using caching if feasible.
 */
class ParserWithCaching {
  constructor(config, functionRegistry, sheetMapping, immutableReferenceMapping) {
    this.config = config;
    this.functionRegistry = functionRegistry;
    this.sheetMapping = sheetMapping;
    this.immutableReferenceMapping = immutableReferenceMapping;
    this.statsCacheUsed = 0;
    this.lexerConfig = (0, _LexerConfig.buildLexerConfig)(config);
    this.lexer = new _FormulaParser.FormulaLexer(this.lexerConfig);
    this.formulaParser = new _FormulaParser.FormulaParser(this.lexerConfig, this.sheetMapping, this.immutableReferenceMapping);
    this.cache = new _Cache.Cache(this.functionRegistry);
  }
  /**
   * Parses a formula.
   *
   * @param text - formula to parse
   * @param formulaAddress - address with regard to which formula should be parsed. Impacts computed addresses in R0C0 format.
   */
  parse(text, formulaAddress) {
    this.formulaAddress = formulaAddress;
    const lexerResult = this.tokenizeFormula(text);
    if (lexerResult.errors.length > 0) {
      const errors = lexerResult.errors.map(e => ({
        type: _Ast.ParsingErrorType.LexingError,
        message: e.message
      }));
      return {
        ast: (0, _.buildParsingErrorAst)(),
        errors,
        hasVolatileFunction: false,
        hasStructuralChangeFunction: false,
        dependencies: []
      };
    }
    const hash = this.computeHashFromTokens(lexerResult.tokens, formulaAddress);
    let cacheResult = this.cache.get(hash);
    if (cacheResult !== undefined) {
      ++this.statsCacheUsed;
    } else {
      const processedTokens = this.bindWhitespacesToTokens(lexerResult.tokens);
      const parsingResult = this.formulaParser.parseFromTokens(processedTokens, formulaAddress);
      if (parsingResult.errors.length > 0) {
        return Object.assign(Object.assign({}, parsingResult), {
          hasVolatileFunction: false,
          hasStructuralChangeFunction: false,
          dependencies: []
        });
      } else {
        cacheResult = this.cache.set(hash, parsingResult.ast);
      }
    }
    const {
      ast,
      hasVolatileFunction,
      hasStructuralChangeFunction
    } = cacheResult;
    const astWithNoReversedRanges = this.convertReversedRangesToRegularRanges(ast);
    const dependencies = (0, _.collectDependencies)(astWithNoReversedRanges, this.functionRegistry);
    return {
      ast: astWithNoReversedRanges,
      errors: [],
      hasVolatileFunction,
      hasStructuralChangeFunction,
      dependencies
    };
  }
  convertReversedRangesToRegularRanges(ast) {
    switch (ast.type) {
      case _.AstNodeType.EMPTY:
      case _.AstNodeType.NUMBER:
      case _.AstNodeType.STRING:
      case _.AstNodeType.ERROR:
      case _.AstNodeType.ERROR_WITH_RAW_INPUT:
      case _.AstNodeType.CELL_REFERENCE:
      case _.AstNodeType.NAMED_EXPRESSION:
        return ast;
      case _.AstNodeType.CELL_RANGE:
        {
          const {
            start,
            end
          } = ast;
          const orderedEnds = this.orderCellRangeEnds(start, end);
          return Object.assign(Object.assign({}, ast), {
            start: orderedEnds.start,
            end: orderedEnds.end
          });
        }
      case _.AstNodeType.COLUMN_RANGE:
        {
          const {
            start,
            end
          } = ast;
          const orderedEnds = this.orderColumnRangeEnds(start, end);
          return Object.assign(Object.assign({}, ast), {
            start: orderedEnds.start,
            end: orderedEnds.end
          });
        }
      case _.AstNodeType.ROW_RANGE:
        {
          const {
            start,
            end
          } = ast;
          const orderedEnds = this.orderRowRangeEnds(start, end);
          return Object.assign(Object.assign({}, ast), {
            start: orderedEnds.start,
            end: orderedEnds.end
          });
        }
      case _.AstNodeType.PERCENT_OP:
      case _.AstNodeType.PLUS_UNARY_OP:
      case _.AstNodeType.MINUS_UNARY_OP:
        {
          const valueFixed = this.convertReversedRangesToRegularRanges(ast.value);
          return Object.assign(Object.assign({}, ast), {
            value: valueFixed
          });
        }
      case _.AstNodeType.CONCATENATE_OP:
      case _.AstNodeType.EQUALS_OP:
      case _.AstNodeType.NOT_EQUAL_OP:
      case _.AstNodeType.LESS_THAN_OP:
      case _.AstNodeType.GREATER_THAN_OP:
      case _.AstNodeType.LESS_THAN_OR_EQUAL_OP:
      case _.AstNodeType.GREATER_THAN_OR_EQUAL_OP:
      case _.AstNodeType.MINUS_OP:
      case _.AstNodeType.PLUS_OP:
      case _.AstNodeType.TIMES_OP:
      case _.AstNodeType.DIV_OP:
      case _.AstNodeType.POWER_OP:
        {
          const leftFixed = this.convertReversedRangesToRegularRanges(ast.left);
          const rightFixed = this.convertReversedRangesToRegularRanges(ast.right);
          return Object.assign(Object.assign({}, ast), {
            left: leftFixed,
            right: rightFixed
          });
        }
      case _.AstNodeType.PARENTHESIS:
        {
          const exprFixed = this.convertReversedRangesToRegularRanges(ast.expression);
          return Object.assign(Object.assign({}, ast), {
            expression: exprFixed
          });
        }
      case _.AstNodeType.FUNCTION_CALL:
        {
          const argsFixed = ast.args.map(arg => this.convertReversedRangesToRegularRanges(arg));
          return Object.assign(Object.assign({}, ast), {
            args: argsFixed
          });
        }
      case _.AstNodeType.ARRAY:
        {
          const argsFixed = ast.args.map(argsRow => argsRow.map(arg => this.convertReversedRangesToRegularRanges(arg)));
          return Object.assign(Object.assign({}, ast), {
            args: argsFixed
          });
        }
    }
  }
  orderCellRangeEnds(endA, endB) {
    const ends = [endA, endB];
    const [startCol, endCol] = ends.map(e => e.toColumnAddress()).sort(_ColumnAddress.ColumnAddress.compareByAbsoluteAddress(this.formulaAddress));
    const [startRow, endRow] = ends.map(e => e.toRowAddress()).sort(_RowAddress.RowAddress.compareByAbsoluteAddress(this.formulaAddress));
    const [startSheet, endSheet] = ends.map(e => e.sheet).sort(ParserWithCaching.compareSheetIds.bind(this));
    return {
      start: _.CellAddress.fromColAndRow(startCol, startRow, startSheet),
      end: _.CellAddress.fromColAndRow(endCol, endRow, endSheet)
    };
  }
  orderColumnRangeEnds(endA, endB) {
    const ends = [endA, endB];
    const [startCol, endCol] = ends.sort(_ColumnAddress.ColumnAddress.compareByAbsoluteAddress(this.formulaAddress));
    const [startSheet, endSheet] = ends.map(e => e.sheet).sort(ParserWithCaching.compareSheetIds.bind(this));
    return {
      start: new _ColumnAddress.ColumnAddress(startCol.type, startCol.col, startSheet),
      end: new _ColumnAddress.ColumnAddress(endCol.type, endCol.col, endSheet)
    };
  }
  orderRowRangeEnds(endA, endB) {
    const ends = [endA, endB];
    const [startRow, endRow] = ends.sort(_RowAddress.RowAddress.compareByAbsoluteAddress(this.formulaAddress));
    const [startSheet, endSheet] = ends.map(e => e.sheet).sort(ParserWithCaching.compareSheetIds.bind(this));
    return {
      start: new _RowAddress.RowAddress(startRow.type, startRow.row, startSheet),
      end: new _RowAddress.RowAddress(endRow.type, endRow.row, endSheet)
    };
  }
  static compareSheetIds(sheetA, sheetB) {
    sheetA = sheetA != null ? sheetA : Infinity;
    sheetB = sheetB != null ? sheetB : Infinity;
    return sheetA - sheetB;
  }
  fetchCachedResultForAst(ast) {
    const hash = this.computeHashFromAst(ast);
    return this.fetchCachedResult(hash);
  }
  fetchCachedResult(hash) {
    const cacheResult = this.cache.get(hash);
    if (cacheResult === undefined) {
      throw new Error('There is no AST with such key in the cache');
    } else {
      const {
        ast,
        hasVolatileFunction,
        hasStructuralChangeFunction,
        relativeDependencies
      } = cacheResult;
      return {
        ast,
        errors: [],
        hasVolatileFunction,
        hasStructuralChangeFunction,
        dependencies: relativeDependencies
      };
    }
  }
  computeHashFromTokens(tokens, baseAddress) {
    var _a;
    let hash = '';
    let idx = 0;
    while (idx < tokens.length) {
      const token = tokens[idx];
      if ((0, _chevrotain.tokenMatcher)(token, _LexerConfig.CellReference)) {
        const cellAddress = (0, _addressRepresentationConverters.cellAddressFromString)(this.sheetMapping, token.image, baseAddress);
        if (cellAddress === undefined) {
          hash = hash.concat(token.image);
        } else {
          hash = hash.concat(cellAddress.hash(true));
        }
      } else if ((0, _chevrotain.tokenMatcher)(token, _LexerConfig.ProcedureName)) {
        const procedureName = token.image.toUpperCase().slice(0, -1);
        const canonicalProcedureName = (_a = this.lexerConfig.functionMapping[procedureName]) !== null && _a !== void 0 ? _a : procedureName;
        hash = hash.concat(canonicalProcedureName, '(');
      } else if ((0, _chevrotain.tokenMatcher)(token, _LexerConfig.ColumnRange)) {
        const [start, end] = token.image.split(':');
        const startAddress = (0, _addressRepresentationConverters.columnAddressFromString)(this.sheetMapping, start, baseAddress);
        const endAddress = (0, _addressRepresentationConverters.columnAddressFromString)(this.sheetMapping, end, baseAddress);
        if (startAddress === undefined || endAddress === undefined) {
          hash = hash.concat('!REF');
        } else {
          hash = hash.concat(startAddress.hash(true), ':', endAddress.hash(true));
        }
      } else if ((0, _chevrotain.tokenMatcher)(token, _LexerConfig.RowRange)) {
        const [start, end] = token.image.split(':');
        const startAddress = (0, _addressRepresentationConverters.rowAddressFromString)(this.sheetMapping, start, baseAddress);
        const endAddress = (0, _addressRepresentationConverters.rowAddressFromString)(this.sheetMapping, end, baseAddress);
        if (startAddress === undefined || endAddress === undefined) {
          hash = hash.concat('!REF');
        } else {
          hash = hash.concat(startAddress.hash(true), ':', endAddress.hash(true));
        }
      } else {
        hash = hash.concat(token.image);
      }
      idx++;
    }
    return hash;
  }
  rememberNewAst(ast) {
    const hash = this.computeHashFromAst(ast);
    return this.cache.maybeSetAndThenGet(hash, ast);
  }
  computeHashFromAst(ast) {
    return '=' + this.computeHashOfAstNode(ast);
  }
  computeHashOfAstNode(ast) {
    switch (ast.type) {
      case _.AstNodeType.EMPTY:
        {
          return ast.leadingWhitespace || '';
        }
      case _.AstNodeType.NUMBER:
        {
          return (0, _Ast.imageWithWhitespace)((0, _Unparser.formatNumber)(ast.value, this.config.decimalSeparator), ast.leadingWhitespace);
        }
      case _.AstNodeType.STRING:
        {
          return (0, _Ast.imageWithWhitespace)('"' + ast.value + '"', ast.leadingWhitespace);
        }
      case _.AstNodeType.NAMED_EXPRESSION:
        {
          return (0, _Ast.imageWithWhitespace)(ast.expressionName, ast.leadingWhitespace);
        }
      case _.AstNodeType.FUNCTION_CALL:
        {
          const args = ast.args.map(arg => this.computeHashOfAstNode(arg)).join(this.config.functionArgSeparator);
          const rightPart = ast.procedureName + '(' + args + (0, _Ast.imageWithWhitespace)(')', ast.internalWhitespace);
          return (0, _Ast.imageWithWhitespace)(rightPart, ast.leadingWhitespace);
        }
      case _.AstNodeType.CELL_REFERENCE:
        {
          return (0, _Ast.imageWithWhitespace)(ast.reference.hash(true), ast.leadingWhitespace);
        }
      case _.AstNodeType.COLUMN_RANGE:
      case _.AstNodeType.ROW_RANGE:
      case _.AstNodeType.CELL_RANGE:
        {
          const start = ast.start.hash(ast.sheetReferenceType !== _Ast.RangeSheetReferenceType.RELATIVE);
          const end = ast.end.hash(ast.sheetReferenceType === _Ast.RangeSheetReferenceType.BOTH_ABSOLUTE);
          return (0, _Ast.imageWithWhitespace)(start + ':' + end, ast.leadingWhitespace);
        }
      case _.AstNodeType.MINUS_UNARY_OP:
        {
          return (0, _Ast.imageWithWhitespace)('-' + this.computeHashOfAstNode(ast.value), ast.leadingWhitespace);
        }
      case _.AstNodeType.PLUS_UNARY_OP:
        {
          return (0, _Ast.imageWithWhitespace)('+' + this.computeHashOfAstNode(ast.value), ast.leadingWhitespace);
        }
      case _.AstNodeType.PERCENT_OP:
        {
          return this.computeHashOfAstNode(ast.value) + (0, _Ast.imageWithWhitespace)('%', ast.leadingWhitespace);
        }
      case _.AstNodeType.ERROR:
        {
          const image = this.config.translationPackage.getErrorTranslation(ast.error ? ast.error.type : _Cell.ErrorType.ERROR);
          return (0, _Ast.imageWithWhitespace)(image, ast.leadingWhitespace);
        }
      case _.AstNodeType.ERROR_WITH_RAW_INPUT:
        {
          return (0, _Ast.imageWithWhitespace)(ast.rawInput, ast.leadingWhitespace);
        }
      case _.AstNodeType.ARRAY:
        {
          const args = ast.args.map(row => row.map(val => this.computeHashOfAstNode(val)).join(',')).join(';');
          return (0, _Ast.imageWithWhitespace)('{' + args + (0, _Ast.imageWithWhitespace)('}', ast.internalWhitespace), ast.leadingWhitespace);
        }
      case _.AstNodeType.PARENTHESIS:
        {
          const expression = this.computeHashOfAstNode(ast.expression);
          const rightPart = '(' + expression + (0, _Ast.imageWithWhitespace)(')', ast.internalWhitespace);
          return (0, _Ast.imageWithWhitespace)(rightPart, ast.leadingWhitespace);
        }
      default:
        {
          return this.computeHashOfAstNode(ast.left) + (0, _Ast.imageWithWhitespace)(_binaryOpTokenMap.binaryOpTokenMap[ast.type], ast.leadingWhitespace) + this.computeHashOfAstNode(ast.right);
        }
    }
  }
  bindWhitespacesToTokens(tokens) {
    const processedTokens = [];
    const first = tokens[0];
    if (!(0, _chevrotain.tokenMatcher)(first, this.lexerConfig.WhiteSpace)) {
      processedTokens.push(first);
    }
    for (let i = 1; i < tokens.length; ++i) {
      const current = tokens[i];
      if ((0, _chevrotain.tokenMatcher)(current, this.lexerConfig.WhiteSpace)) {
        continue;
      }
      const previous = tokens[i - 1];
      if ((0, _chevrotain.tokenMatcher)(previous, this.lexerConfig.WhiteSpace)) {
        current.leadingWhitespace = previous;
      }
      processedTokens.push(current);
    }
    return processedTokens;
  }
  tokenizeFormula(text) {
    return this.lexer.tokenizeFormula(text);
  }
}
exports.ParserWithCaching = ParserWithCaching;