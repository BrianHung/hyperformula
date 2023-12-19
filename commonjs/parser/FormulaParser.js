"use strict";

exports.__esModule = true;
exports.FormulaParser = exports.FormulaLexer = void 0;
var _chevrotain = require("chevrotain");
var _Cell = require("../Cell");
var _errorMessage = require("../error-message");
var _addressRepresentationConverters = require("./addressRepresentationConverters");
var _Ast = require("./Ast");
var _CellAddress = require("./CellAddress");
var _LexerConfig = require("./LexerConfig");
/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */

/**
 * LL(k) formula parser described using Chevrotain DSL
 *
 * It is equivalent to the grammar below:
 *
 * F -> '=' E <br/>
 * B -> K < B | K >= B ... | K <br/>
 * K -> E & K | E <br/>
 * E -> M + E | M - E | M <br/>
 * M -> W * M | W / M | W <br/>
 * W -> C * W | C <br/>
 * C -> N | R | O | A | P | I | num <br/>
 * N -> '(' E ')' <br/>
 * R -> A:OFFSET(..) | A:A <br/>
 * O -> OFFSET(..) | OFFSET(..):A | OFFSET(..):OFFSET(..) <br/>
 * A -> A1 | $A1 | A$1 | $A$1 <br/>
 * P -> SUM(..) <br/>
 * I -> REF('cell',..) | REF(..):REF(..) <br/>
 */
class FormulaParser extends _chevrotain.EmbeddedActionsParser {
  constructor(lexerConfig, sheetMapping, immutableReferenceMapping) {
    super(lexerConfig.allTokens, {
      outputCst: false,
      maxLookahead: 7
    });
    this.booleanExpressionOrEmpty = this.RULE('booleanExpressionOrEmpty', () => {
      return this.OR([{
        ALT: () => this.SUBRULE(this.booleanExpression)
      }, {
        ALT: (0, _chevrotain.EMPTY_ALT)((0, _Ast.buildEmptyArgAst)())
      }]);
    });
    /**
     * Rule for procedure expressions: SUM(1,A1)
     */
    this.procedureExpression = this.RULE('procedureExpression', () => {
      var _a;
      const procedureNameToken = this.CONSUME(_LexerConfig.ProcedureName);
      const procedureName = procedureNameToken.image.toUpperCase().slice(0, -1);
      const canonicalProcedureName = (_a = this.lexerConfig.functionMapping[procedureName]) !== null && _a !== void 0 ? _a : procedureName;
      const args = [];
      let argument = this.SUBRULE(this.booleanExpressionOrEmpty);
      this.MANY(() => {
        var _a;
        const separator = this.CONSUME(this.lexerConfig.ArgSeparator);
        if (argument.type === _Ast.AstNodeType.EMPTY) {
          argument.leadingWhitespace = (_a = separator.leadingWhitespace) === null || _a === void 0 ? void 0 : _a.image;
        }
        args.push(argument);
        argument = this.SUBRULE2(this.booleanExpressionOrEmpty);
      });
      args.push(argument);
      if (args.length === 1 && args[0].type === _Ast.AstNodeType.EMPTY) {
        args.length = 0;
      }
      const rParenToken = this.CONSUME(_LexerConfig.RParen);
      return (0, _Ast.buildProcedureAst)(canonicalProcedureName, args, procedureNameToken.leadingWhitespace, rParenToken.leadingWhitespace);
    });
    this.namedExpressionExpression = this.RULE('namedExpressionExpression', () => {
      const name = this.CONSUME(_LexerConfig.NamedExpression);
      return (0, _Ast.buildNamedExpressionAst)(name.image, name.leadingWhitespace);
    });
    /**
     * Rule for OFFSET() function expression
     */
    this.offsetProcedureExpression = this.RULE('offsetProcedureExpression', () => {
      const args = [];
      this.CONSUME(this.lexerConfig.OffsetProcedureName);
      this.CONSUME(_LexerConfig.LParen);
      this.MANY_SEP({
        SEP: this.lexerConfig.ArgSeparator,
        DEF: () => {
          args.push(this.SUBRULE(this.booleanExpression));
        }
      });
      this.CONSUME(_LexerConfig.RParen);
      return this.handleOffsetHeuristic(args);
    });
    /**
     * Rule for column range, e.g. A:B, Sheet1!A:B, Sheet1!A:Sheet1!B
     */
    this.columnRangeExpression = this.RULE('columnRangeExpression', () => {
      const range = this.CONSUME(_LexerConfig.ColumnRange);
      const [startImage, endImage] = range.image.split(':');
      const firstAddress = this.ACTION(() => (0, _addressRepresentationConverters.columnAddressFromString)(this.sheetMapping, startImage, this.formulaAddress));
      const secondAddress = this.ACTION(() => (0, _addressRepresentationConverters.columnAddressFromString)(this.sheetMapping, endImage, this.formulaAddress));
      if (firstAddress === undefined || secondAddress === undefined) {
        return (0, _Ast.buildCellErrorAst)(new _Cell.CellError(_Cell.ErrorType.REF));
      }
      if (firstAddress.exceedsSheetSizeLimits(this.lexerConfig.maxColumns) || secondAddress.exceedsSheetSizeLimits(this.lexerConfig.maxColumns)) {
        return (0, _Ast.buildErrorWithRawInputAst)(range.image, new _Cell.CellError(_Cell.ErrorType.NAME), range.leadingWhitespace);
      }
      if (firstAddress.sheet === undefined && secondAddress.sheet !== undefined) {
        return this.parsingError(_Ast.ParsingErrorType.ParserError, 'Malformed range expression');
      }
      const {
        firstEnd,
        secondEnd,
        sheetRefType
      } = FormulaParser.fixSheetIdsForRangeEnds(firstAddress, secondAddress);
      return (0, _Ast.buildColumnRangeAst)(firstEnd, secondEnd, sheetRefType, range.leadingWhitespace);
    });
    /**
     * Rule for row range, e.g. 1:2, Sheet1!1:2, Sheet1!1:Sheet1!2
     */
    this.rowRangeExpression = this.RULE('rowRangeExpression', () => {
      const range = this.CONSUME(_LexerConfig.RowRange);
      const [startImage, endImage] = range.image.split(':');
      const firstAddress = this.ACTION(() => (0, _addressRepresentationConverters.rowAddressFromString)(this.sheetMapping, startImage, this.formulaAddress));
      const secondAddress = this.ACTION(() => (0, _addressRepresentationConverters.rowAddressFromString)(this.sheetMapping, endImage, this.formulaAddress));
      if (firstAddress === undefined || secondAddress === undefined) {
        return (0, _Ast.buildCellErrorAst)(new _Cell.CellError(_Cell.ErrorType.REF));
      }
      if (firstAddress.exceedsSheetSizeLimits(this.lexerConfig.maxRows) || secondAddress.exceedsSheetSizeLimits(this.lexerConfig.maxRows)) {
        return (0, _Ast.buildErrorWithRawInputAst)(range.image, new _Cell.CellError(_Cell.ErrorType.NAME), range.leadingWhitespace);
      }
      if (firstAddress.sheet === undefined && secondAddress.sheet !== undefined) {
        return this.parsingError(_Ast.ParsingErrorType.ParserError, 'Malformed range expression');
      }
      const {
        firstEnd,
        secondEnd,
        sheetRefType
      } = FormulaParser.fixSheetIdsForRangeEnds(firstAddress, secondAddress);
      return (0, _Ast.buildRowRangeAst)(firstEnd, secondEnd, sheetRefType, range.leadingWhitespace);
    });
    /**
     * Rule for column range, e.g. A:B, Sheet1!A:B, Sheet1!A:Sheet1!B
     */
    this.immutableColumnRangeExpression = this.RULE('immutableColumnRangeExpression', () => {
      const range = this.CONSUME(_LexerConfig.ImmutableColRange);
      const [startImage, endImage] = range.image.split(':');
      const firstAddress = this.ACTION(() => (0, _addressRepresentationConverters.colAddressFromImmutableReference)(this.immutableReferenceMapping, startImage, this.formulaAddress));
      const secondAddress = this.ACTION(() => (0, _addressRepresentationConverters.colAddressFromImmutableReference)(this.immutableReferenceMapping, endImage, this.formulaAddress));
      if (firstAddress === undefined || secondAddress === undefined) {
        return (0, _Ast.buildCellErrorAst)(new _Cell.CellError(_Cell.ErrorType.REF));
      }
      if (firstAddress.exceedsSheetSizeLimits(this.lexerConfig.maxColumns) || secondAddress.exceedsSheetSizeLimits(this.lexerConfig.maxColumns)) {
        return (0, _Ast.buildErrorWithRawInputAst)(range.image, new _Cell.CellError(_Cell.ErrorType.NAME), range.leadingWhitespace);
      }
      if (firstAddress.sheet === undefined && secondAddress.sheet !== undefined) {
        return this.parsingError(_Ast.ParsingErrorType.ParserError, 'Malformed range expression');
      }
      const {
        firstEnd,
        secondEnd,
        sheetRefType
      } = FormulaParser.fixSheetIdsForRangeEnds(firstAddress, secondAddress);
      return (0, _Ast.buildColumnRangeAst)(firstEnd, secondEnd, sheetRefType, range.leadingWhitespace);
    });
    /**
     * Rule for row range, e.g. 1:2, Sheet1!1:2, Sheet1!1:Sheet1!2
     */
    this.immutableRowRangeExpression = this.RULE('immutableRowRangeExpression', () => {
      const range = this.CONSUME(_LexerConfig.ImmutableRowRange);
      const [startImage, endImage] = range.image.split(':');
      const firstAddress = this.ACTION(() => (0, _addressRepresentationConverters.rowAddressFromImmutableReference)(this.immutableReferenceMapping, startImage, this.formulaAddress));
      const secondAddress = this.ACTION(() => (0, _addressRepresentationConverters.rowAddressFromImmutableReference)(this.immutableReferenceMapping, endImage, this.formulaAddress));
      if (firstAddress === undefined || secondAddress === undefined) {
        return (0, _Ast.buildCellErrorAst)(new _Cell.CellError(_Cell.ErrorType.REF));
      }
      if (firstAddress.exceedsSheetSizeLimits(this.lexerConfig.maxRows) || secondAddress.exceedsSheetSizeLimits(this.lexerConfig.maxRows)) {
        return (0, _Ast.buildErrorWithRawInputAst)(range.image, new _Cell.CellError(_Cell.ErrorType.NAME), range.leadingWhitespace);
      }
      if (firstAddress.sheet === undefined && secondAddress.sheet !== undefined) {
        return this.parsingError(_Ast.ParsingErrorType.ParserError, 'Malformed range expression');
      }
      const {
        firstEnd,
        secondEnd,
        sheetRefType
      } = FormulaParser.fixSheetIdsForRangeEnds(firstAddress, secondAddress);
      return (0, _Ast.buildRowRangeAst)(firstEnd, secondEnd, sheetRefType, range.leadingWhitespace);
    });
    this.immutableCellReference = this.RULE('immutableCellReference', () => {
      const cell = this.CONSUME(_LexerConfig.ImmutableCellReference);
      const address = this.ACTION(() => {
        return (0, _addressRepresentationConverters.cellAddressFromImmutableReference)(this.immutableReferenceMapping, cell.image, this.formulaAddress);
      });
      if (address === undefined) {
        return (0, _Ast.buildErrorWithRawInputAst)(cell.image, new _Cell.CellError(_Cell.ErrorType.REF), cell.leadingWhitespace);
      } else if (address.exceedsSheetSizeLimits(this.lexerConfig.maxColumns, this.lexerConfig.maxRows)) {
        return (0, _Ast.buildErrorWithRawInputAst)(cell.image, new _Cell.CellError(_Cell.ErrorType.NAME), cell.leadingWhitespace);
      } else {
        return (0, _Ast.buildCellReferenceAst)(address, cell.leadingWhitespace);
      }
    });
    /**
     * Rule for cell reference expression (e.g. A1, $A1, A$1, $A$1, $Sheet42!A$17)
     */
    this.cellReference = this.RULE('cellReference', () => {
      const cell = this.CONSUME(_LexerConfig.CellReference);
      const address = this.ACTION(() => {
        return (0, _addressRepresentationConverters.cellAddressFromString)(this.sheetMapping, cell.image, this.formulaAddress);
      });
      if (address === undefined) {
        return (0, _Ast.buildErrorWithRawInputAst)(cell.image, new _Cell.CellError(_Cell.ErrorType.REF), cell.leadingWhitespace);
      } else if (address.exceedsSheetSizeLimits(this.lexerConfig.maxColumns, this.lexerConfig.maxRows)) {
        return (0, _Ast.buildErrorWithRawInputAst)(cell.image, new _Cell.CellError(_Cell.ErrorType.NAME), cell.leadingWhitespace);
      } else {
        return (0, _Ast.buildCellReferenceAst)(address, cell.leadingWhitespace);
      }
    });
    /**
     * Rule for end range reference expression with additional checks considering range start
     */
    this.endRangeReference = this.RULE('endRangeReference', start => {
      var _a;
      const end = this.CONSUME(_LexerConfig.CellReference);
      const startAddress = this.ACTION(() => {
        return (0, _addressRepresentationConverters.cellAddressFromString)(this.sheetMapping, start.image, this.formulaAddress);
      });
      const endAddress = this.ACTION(() => {
        return (0, _addressRepresentationConverters.cellAddressFromString)(this.sheetMapping, end.image, this.formulaAddress);
      });
      if (startAddress === undefined || endAddress === undefined) {
        return this.ACTION(() => {
          return (0, _Ast.buildErrorWithRawInputAst)(`${start.image}:${end.image}`, new _Cell.CellError(_Cell.ErrorType.REF), start.leadingWhitespace);
        });
      } else if (startAddress.exceedsSheetSizeLimits(this.lexerConfig.maxColumns, this.lexerConfig.maxRows) || endAddress.exceedsSheetSizeLimits(this.lexerConfig.maxColumns, this.lexerConfig.maxRows)) {
        return this.ACTION(() => {
          return (0, _Ast.buildErrorWithRawInputAst)(`${start.image}:${end.image}`, new _Cell.CellError(_Cell.ErrorType.NAME), start.leadingWhitespace);
        });
      }
      return this.buildCellRange(startAddress, endAddress, (_a = start.leadingWhitespace) === null || _a === void 0 ? void 0 : _a.image);
    });
    /**
     * Rule for end range reference expression with additional checks considering range start
     */
    this.endImmutableRangeReference = this.RULE('endImmutableRangeReference', start => {
      var _a;
      const end = this.CONSUME(_LexerConfig.ImmutableCellReference);
      const startAddress = this.ACTION(() => {
        return (0, _addressRepresentationConverters.cellAddressFromImmutableReference)(this.immutableReferenceMapping, start.image, this.formulaAddress);
      });
      const endAddress = this.ACTION(() => {
        return (0, _addressRepresentationConverters.cellAddressFromImmutableReference)(this.immutableReferenceMapping, end.image, this.formulaAddress);
      });
      if (startAddress === undefined || endAddress === undefined) {
        return this.ACTION(() => {
          return (0, _Ast.buildErrorWithRawInputAst)(`${start.image}:${end.image}`, new _Cell.CellError(_Cell.ErrorType.REF), start.leadingWhitespace);
        });
      } else if (startAddress.exceedsSheetSizeLimits(this.lexerConfig.maxColumns, this.lexerConfig.maxRows) || endAddress.exceedsSheetSizeLimits(this.lexerConfig.maxColumns, this.lexerConfig.maxRows)) {
        return this.ACTION(() => {
          return (0, _Ast.buildErrorWithRawInputAst)(`${start.image}:${end.image}`, new _Cell.CellError(_Cell.ErrorType.NAME), start.leadingWhitespace);
        });
      }
      return this.buildCellRange(startAddress, endAddress, (_a = start.leadingWhitespace) === null || _a === void 0 ? void 0 : _a.image);
    });
    /**
     * Rule for end of range expression
     *
     * End of range may be a cell reference or OFFSET() function call
     */
    this.endOfRangeExpression = this.RULE('endOfRangeExpression', start => {
      return this.OR([{
        ALT: () => {
          return this.SUBRULE(this.endRangeReference, {
            ARGS: [start]
          });
        }
      }, {
        ALT: () => {
          var _a;
          const offsetProcedure = this.SUBRULE(this.offsetProcedureExpression);
          const startAddress = this.ACTION(() => {
            return (0, _addressRepresentationConverters.cellAddressFromString)(this.sheetMapping, start.image, this.formulaAddress);
          });
          if (startAddress === undefined) {
            return (0, _Ast.buildCellErrorAst)(new _Cell.CellError(_Cell.ErrorType.REF));
          }
          if (offsetProcedure.type === _Ast.AstNodeType.CELL_REFERENCE) {
            return this.buildCellRange(startAddress, offsetProcedure.reference, (_a = start.leadingWhitespace) === null || _a === void 0 ? void 0 : _a.image);
          } else {
            return this.parsingError(_Ast.ParsingErrorType.RangeOffsetNotAllowed, 'Range offset not allowed here');
          }
        }
      }]);
    });
    /**
     * Rule for cell ranges (e.g. A1:B$3, A1:OFFSET())
     */
    this.cellRangeExpression = this.RULE('cellRangeExpression', () => {
      const start = this.CONSUME(_LexerConfig.CellReference);
      this.CONSUME2(_LexerConfig.RangeSeparator);
      return this.SUBRULE(this.endOfRangeExpression, {
        ARGS: [start]
      });
    });
    /**
     * Rule for end of range expression
     *
     * End of range may be a cell reference or OFFSET() function call
     */
    this.endOfImmutableRangeExpression = this.RULE('endOfImmutableRangeExpression', start => {
      return this.OR([{
        ALT: () => {
          return this.SUBRULE(this.endImmutableRangeReference, {
            ARGS: [start]
          });
        }
      }, {
        ALT: () => {
          var _a;
          const offsetProcedure = this.SUBRULE(this.offsetProcedureExpression);
          const startAddress = this.ACTION(() => {
            return (0, _addressRepresentationConverters.cellAddressFromImmutableReference)(this.immutableReferenceMapping, start.image, this.formulaAddress);
          });
          if (startAddress === undefined) {
            return (0, _Ast.buildCellErrorAst)(new _Cell.CellError(_Cell.ErrorType.REF));
          }
          if (offsetProcedure.type === _Ast.AstNodeType.CELL_REFERENCE) {
            return this.buildCellRange(startAddress, offsetProcedure.reference, (_a = start.leadingWhitespace) === null || _a === void 0 ? void 0 : _a.image);
          } else {
            return this.parsingError(_Ast.ParsingErrorType.RangeOffsetNotAllowed, 'Range offset not allowed here');
          }
        }
      }]);
    });
    /**
     * Rule for cell ranges (e.g. A1:B$3, A1:OFFSET())
     */
    this.immutableCellRangeExpression = this.RULE('immutableCellRangeExpression', () => {
      const start = this.CONSUME(_LexerConfig.ImmutableCellReference);
      this.CONSUME2(_LexerConfig.RangeSeparator);
      return this.SUBRULE(this.endOfImmutableRangeExpression, {
        ARGS: [start]
      });
    });
    /**
     * Rule for end range reference expression starting with offset procedure with additional checks considering range start
     */
    this.endRangeWithOffsetStartReference = this.RULE('endRangeWithOffsetStartReference', start => {
      const end = this.CONSUME(_LexerConfig.CellReference);
      const endAddress = this.ACTION(() => {
        return (0, _addressRepresentationConverters.cellAddressFromString)(this.sheetMapping, end.image, this.formulaAddress);
      });
      if (endAddress === undefined) {
        return this.ACTION(() => {
          return (0, _Ast.buildCellErrorAst)(new _Cell.CellError(_Cell.ErrorType.REF));
        });
      }
      return this.buildCellRange(start.reference, endAddress, start.leadingWhitespace);
    });
    /**
     * Rule for end of range expression
     *
     * End of range may be a cell reference or OFFSET() function call
     */
    this.endOfRangeWithOffsetStartExpression = this.RULE('endOfRangeWithOffsetStartExpression', start => {
      return this.OR([{
        ALT: () => {
          return this.SUBRULE(this.endRangeWithOffsetStartReference, {
            ARGS: [start]
          });
        }
      }, {
        ALT: () => {
          const offsetProcedure = this.SUBRULE(this.offsetProcedureExpression);
          if (offsetProcedure.type === _Ast.AstNodeType.CELL_REFERENCE) {
            return this.buildCellRange(start.reference, offsetProcedure.reference, start.leadingWhitespace);
          } else {
            return this.parsingError(_Ast.ParsingErrorType.RangeOffsetNotAllowed, 'Range offset not allowed here');
          }
        }
      }]);
    });
    /**
     * Rule for expressions that start with the OFFSET function.
     *
     * The OFFSET function can occur as a cell reference, or as a part of a cell range.
     * To preserve LL(k) properties, expressions that start with the OFFSET function need a separate rule.
     *
     * Depending on the presence of the {@link RangeSeparator}, a proper {@link Ast} node type is built.
     */
    this.offsetExpression = this.RULE('offsetExpression', () => {
      const offsetProcedure = this.SUBRULE(this.offsetProcedureExpression);
      let end;
      this.OPTION(() => {
        this.CONSUME(_LexerConfig.RangeSeparator);
        if (offsetProcedure.type === _Ast.AstNodeType.CELL_RANGE) {
          end = this.parsingError(_Ast.ParsingErrorType.RangeOffsetNotAllowed, 'Range offset not allowed here');
        } else {
          end = this.SUBRULE(this.endOfRangeWithOffsetStartExpression, {
            ARGS: [offsetProcedure]
          });
        }
      });
      if (end !== undefined) {
        return end;
      }
      return offsetProcedure;
    });
    this.insideArrayExpression = this.RULE('insideArrayExpression', () => {
      const ret = [[]];
      ret[ret.length - 1].push(this.SUBRULE(this.booleanExpression));
      this.MANY(() => {
        this.OR([{
          ALT: () => {
            this.CONSUME(this.lexerConfig.ArrayColSeparator);
            ret[ret.length - 1].push(this.SUBRULE2(this.booleanExpression));
          }
        }, {
          ALT: () => {
            this.CONSUME(this.lexerConfig.ArrayRowSeparator);
            ret.push([]);
            ret[ret.length - 1].push(this.SUBRULE3(this.booleanExpression));
          }
        }]);
      });
      return (0, _Ast.buildArrayAst)(ret);
    });
    /**
     * Rule for parenthesis expression
     */
    this.parenthesisExpression = this.RULE('parenthesisExpression', () => {
      const lParenToken = this.CONSUME(_LexerConfig.LParen);
      const expression = this.SUBRULE(this.booleanExpression);
      const rParenToken = this.CONSUME(_LexerConfig.RParen);
      return (0, _Ast.buildParenthesisAst)(expression, lParenToken.leadingWhitespace, rParenToken.leadingWhitespace);
    });
    this.arrayExpression = this.RULE('arrayExpression', () => {
      return this.OR([{
        ALT: () => {
          const ltoken = this.CONSUME(_LexerConfig.ArrayLParen);
          const ret = this.SUBRULE(this.insideArrayExpression);
          const rtoken = this.CONSUME(_LexerConfig.ArrayRParen);
          return (0, _Ast.buildArrayAst)(ret.args, ltoken.leadingWhitespace, rtoken.leadingWhitespace);
        }
      }, {
        ALT: () => this.SUBRULE(this.parenthesisExpression)
      }]);
    });
    this.numericStringToNumber = input => {
      const normalized = input.replace(this.lexerConfig.decimalSeparator, '.');
      return Number(normalized);
    };
    /**
     * Rule for positive atomic expressions
     */
    this.positiveAtomicExpression = this.RULE('positiveAtomicExpression', () => {
      var _a;
      return this.OR((_a = this.atomicExpCache) !== null && _a !== void 0 ? _a : this.atomicExpCache = [{
        ALT: () => this.SUBRULE(this.immutableCellRangeExpression)
      }, {
        ALT: () => this.SUBRULE(this.immutableCellReference)
      }, {
        ALT: () => this.SUBRULE(this.immutableRowRangeExpression)
      }, {
        ALT: () => this.SUBRULE(this.immutableColumnRangeExpression)
      }, {
        ALT: () => this.SUBRULE(this.arrayExpression)
      }, {
        ALT: () => this.SUBRULE(this.cellRangeExpression)
      }, {
        ALT: () => this.SUBRULE(this.columnRangeExpression)
      }, {
        ALT: () => this.SUBRULE(this.rowRangeExpression)
      }, {
        ALT: () => this.SUBRULE(this.offsetExpression)
      }, {
        ALT: () => this.SUBRULE(this.cellReference)
      }, {
        ALT: () => this.SUBRULE(this.procedureExpression)
      }, {
        ALT: () => this.SUBRULE(this.namedExpressionExpression)
      }, {
        ALT: () => {
          const number = this.CONSUME(this.lexerConfig.NumberLiteral);
          return (0, _Ast.buildNumberAst)(this.numericStringToNumber(number.image), number.leadingWhitespace);
        }
      }, {
        ALT: () => {
          const str = this.CONSUME(_LexerConfig.StringLiteral);
          return (0, _Ast.buildStringAst)(str);
        }
      }, {
        ALT: () => {
          const token = this.CONSUME(_LexerConfig.ErrorLiteral);
          const errString = token.image.toUpperCase();
          const errorType = this.lexerConfig.errorMapping[errString];
          if (errorType) {
            return (0, _Ast.buildCellErrorAst)(new _Cell.CellError(errorType), token.leadingWhitespace);
          } else {
            return this.parsingError(_Ast.ParsingErrorType.ParserError, 'Unknown error literal');
          }
        }
      }]);
    });
    this.rightUnaryOpAtomicExpression = this.RULE('rightUnaryOpAtomicExpression', () => {
      const positiveAtomicExpression = this.SUBRULE(this.positiveAtomicExpression);
      const percentage = this.OPTION(() => {
        return this.CONSUME(_LexerConfig.PercentOp);
      });
      if (percentage) {
        return (0, _Ast.buildPercentOpAst)(positiveAtomicExpression, percentage.leadingWhitespace);
      }
      return positiveAtomicExpression;
    });
    /**
     * Rule for atomic expressions, which is positive atomic expression or negation of it
     */
    this.atomicExpression = this.RULE('atomicExpression', () => {
      return this.OR([{
        ALT: () => {
          const op = this.CONSUME(_LexerConfig.AdditionOp);
          const value = this.SUBRULE(this.atomicExpression);
          if ((0, _chevrotain.tokenMatcher)(op, _LexerConfig.PlusOp)) {
            return (0, _Ast.buildPlusUnaryOpAst)(value, op.leadingWhitespace);
          } else if ((0, _chevrotain.tokenMatcher)(op, _LexerConfig.MinusOp)) {
            return (0, _Ast.buildMinusUnaryOpAst)(value, op.leadingWhitespace);
          } else {
            this.customParsingError = (0, _Ast.parsingError)(_Ast.ParsingErrorType.ParserError, 'Mismatched token type');
            return this.customParsingError;
          }
        }
      }, {
        ALT: () => this.SUBRULE2(this.rightUnaryOpAtomicExpression)
      }]);
    });
    /**
     * Rule for power expression
     */
    this.powerExpression = this.RULE('powerExpression', () => {
      let lhs = this.SUBRULE(this.atomicExpression);
      this.MANY(() => {
        const op = this.CONSUME(_LexerConfig.PowerOp);
        const rhs = this.SUBRULE2(this.atomicExpression);
        if ((0, _chevrotain.tokenMatcher)(op, _LexerConfig.PowerOp)) {
          lhs = (0, _Ast.buildPowerOpAst)(lhs, rhs, op.leadingWhitespace);
        } else {
          this.ACTION(() => {
            throw Error('Operator not supported');
          });
        }
      });
      return lhs;
    });
    /**
     * Rule for multiplication category operators (e.g. 1 * A1, 1 / A1)
     */
    this.multiplicationExpression = this.RULE('multiplicationExpression', () => {
      let lhs = this.SUBRULE(this.powerExpression);
      this.MANY(() => {
        const op = this.CONSUME(_LexerConfig.MultiplicationOp);
        const rhs = this.SUBRULE2(this.powerExpression);
        if ((0, _chevrotain.tokenMatcher)(op, _LexerConfig.TimesOp)) {
          lhs = (0, _Ast.buildTimesOpAst)(lhs, rhs, op.leadingWhitespace);
        } else if ((0, _chevrotain.tokenMatcher)(op, _LexerConfig.DivOp)) {
          lhs = (0, _Ast.buildDivOpAst)(lhs, rhs, op.leadingWhitespace);
        } else {
          this.ACTION(() => {
            throw Error('Operator not supported');
          });
        }
      });
      return lhs;
    });
    /**
     * Rule for addition category operators (e.g. 1 + A1, 1 - A1)
     */
    this.additionExpression = this.RULE('additionExpression', () => {
      let lhs = this.SUBRULE(this.multiplicationExpression);
      this.MANY(() => {
        const op = this.CONSUME(_LexerConfig.AdditionOp);
        const rhs = this.SUBRULE2(this.multiplicationExpression);
        if ((0, _chevrotain.tokenMatcher)(op, _LexerConfig.PlusOp)) {
          lhs = (0, _Ast.buildPlusOpAst)(lhs, rhs, op.leadingWhitespace);
        } else if ((0, _chevrotain.tokenMatcher)(op, _LexerConfig.MinusOp)) {
          lhs = (0, _Ast.buildMinusOpAst)(lhs, rhs, op.leadingWhitespace);
        } else {
          this.ACTION(() => {
            throw Error('Operator not supported');
          });
        }
      });
      return lhs;
    });
    /**
     * Rule for concatenation operator expression (e.g. "=" & A1)
     */
    this.concatenateExpression = this.RULE('concatenateExpression', () => {
      let lhs = this.SUBRULE(this.additionExpression);
      this.MANY(() => {
        const op = this.CONSUME(_LexerConfig.ConcatenateOp);
        const rhs = this.SUBRULE2(this.additionExpression);
        lhs = (0, _Ast.buildConcatenateOpAst)(lhs, rhs, op.leadingWhitespace);
      });
      return lhs;
    });
    /**
     * Rule for boolean expression (e.g. 1 <= A1)
     */
    this.booleanExpression = this.RULE('booleanExpression', () => {
      let lhs = this.SUBRULE(this.concatenateExpression);
      this.MANY(() => {
        const op = this.CONSUME(_LexerConfig.BooleanOp);
        const rhs = this.SUBRULE2(this.concatenateExpression);
        if ((0, _chevrotain.tokenMatcher)(op, _LexerConfig.EqualsOp)) {
          lhs = (0, _Ast.buildEqualsOpAst)(lhs, rhs, op.leadingWhitespace);
        } else if ((0, _chevrotain.tokenMatcher)(op, _LexerConfig.NotEqualOp)) {
          lhs = (0, _Ast.buildNotEqualOpAst)(lhs, rhs, op.leadingWhitespace);
        } else if ((0, _chevrotain.tokenMatcher)(op, _LexerConfig.GreaterThanOp)) {
          lhs = (0, _Ast.buildGreaterThanOpAst)(lhs, rhs, op.leadingWhitespace);
        } else if ((0, _chevrotain.tokenMatcher)(op, _LexerConfig.LessThanOp)) {
          lhs = (0, _Ast.buildLessThanOpAst)(lhs, rhs, op.leadingWhitespace);
        } else if ((0, _chevrotain.tokenMatcher)(op, _LexerConfig.GreaterThanOrEqualOp)) {
          lhs = (0, _Ast.buildGreaterThanOrEqualOpAst)(lhs, rhs, op.leadingWhitespace);
        } else if ((0, _chevrotain.tokenMatcher)(op, _LexerConfig.LessThanOrEqualOp)) {
          lhs = (0, _Ast.buildLessThanOrEqualOpAst)(lhs, rhs, op.leadingWhitespace);
        } else {
          this.ACTION(() => {
            throw Error('Operator not supported');
          });
        }
      });
      return lhs;
    });
    /**
     * Entry rule
     */
    this.formula = this.RULE('formula', () => {
      this.CONSUME(_LexerConfig.EqualsOp);
      return this.SUBRULE(this.booleanExpression);
    });
    this.lexerConfig = lexerConfig;
    this.sheetMapping = sheetMapping;
    this.formulaAddress = (0, _Cell.simpleCellAddress)(0, 0, 0);
    this.performSelfAnalysis();
    this.immutableReferenceMapping = immutableReferenceMapping;
  }
  /**
   * Parses tokenized formula and builds abstract syntax tree
   *
   * @param {ExtendedToken[]} tokens - tokenized formula
   * @param {SimpleCellAddress} formulaAddress - address of the cell in which formula is located
   */
  parseFromTokens(tokens, formulaAddress) {
    this.input = tokens;
    let ast = this.formulaWithContext(formulaAddress);
    let errors = [];
    if (this.customParsingError) {
      errors.push(this.customParsingError);
    }
    errors = errors.concat(this.errors.map(e => ({
      type: _Ast.ParsingErrorType.ParserError,
      message: e.message
    })));
    if (errors.length > 0) {
      ast = (0, _Ast.buildParsingErrorAst)();
    }
    return {
      ast,
      errors
    };
  }
  reset() {
    super.reset();
    this.customParsingError = undefined;
  }
  /**
   * Entry rule wrapper that sets formula address
   *
   * @param {SimpleCellAddress} address - address of the cell in which formula is located
   */
  formulaWithContext(address) {
    this.formulaAddress = address;
    return this.formula();
  }
  buildCellRange(firstAddress, secondAddress, leadingWhitespace) {
    if (firstAddress.sheet === undefined && secondAddress.sheet !== undefined) {
      return this.parsingError(_Ast.ParsingErrorType.ParserError, 'Malformed range expression');
    }
    const {
      firstEnd,
      secondEnd,
      sheetRefType
    } = FormulaParser.fixSheetIdsForRangeEnds(firstAddress, secondAddress);
    return (0, _Ast.buildCellRangeAst)(firstEnd, secondEnd, sheetRefType, leadingWhitespace);
  }
  static fixSheetIdsForRangeEnds(firstEnd, secondEnd) {
    const sheetRefType = FormulaParser.rangeSheetReferenceType(firstEnd.sheet, secondEnd.sheet);
    const secondEndFixed = firstEnd.sheet !== undefined && secondEnd.sheet === undefined ? secondEnd.withSheet(firstEnd.sheet) : secondEnd;
    return {
      firstEnd,
      secondEnd: secondEndFixed,
      sheetRefType
    };
  }
  /**
   * Returns {@link CellReferenceAst} or {@link CellRangeAst} based on OFFSET function arguments
   *
   * @param {Ast[]} args - OFFSET function arguments
   */
  handleOffsetHeuristic(args) {
    const cellArg = args[0];
    if (cellArg.type !== _Ast.AstNodeType.CELL_REFERENCE) {
      return this.parsingError(_Ast.ParsingErrorType.StaticOffsetError, 'First argument to OFFSET is not a reference');
    }
    const rowsArg = args[1];
    let rowShift;
    if (rowsArg.type === _Ast.AstNodeType.NUMBER && Number.isInteger(rowsArg.value)) {
      rowShift = rowsArg.value;
    } else if (rowsArg.type === _Ast.AstNodeType.PLUS_UNARY_OP && rowsArg.value.type === _Ast.AstNodeType.NUMBER && Number.isInteger(rowsArg.value.value)) {
      rowShift = rowsArg.value.value;
    } else if (rowsArg.type === _Ast.AstNodeType.MINUS_UNARY_OP && rowsArg.value.type === _Ast.AstNodeType.NUMBER && Number.isInteger(rowsArg.value.value)) {
      rowShift = -rowsArg.value.value;
    } else {
      return this.parsingError(_Ast.ParsingErrorType.StaticOffsetError, 'Second argument to OFFSET is not a static number');
    }
    const columnsArg = args[2];
    let colShift;
    if (columnsArg.type === _Ast.AstNodeType.NUMBER && Number.isInteger(columnsArg.value)) {
      colShift = columnsArg.value;
    } else if (columnsArg.type === _Ast.AstNodeType.PLUS_UNARY_OP && columnsArg.value.type === _Ast.AstNodeType.NUMBER && Number.isInteger(columnsArg.value.value)) {
      colShift = columnsArg.value.value;
    } else if (columnsArg.type === _Ast.AstNodeType.MINUS_UNARY_OP && columnsArg.value.type === _Ast.AstNodeType.NUMBER && Number.isInteger(columnsArg.value.value)) {
      colShift = -columnsArg.value.value;
    } else {
      return this.parsingError(_Ast.ParsingErrorType.StaticOffsetError, 'Third argument to OFFSET is not a static number');
    }
    const heightArg = args[3];
    let height;
    if (heightArg === undefined) {
      height = 1;
    } else if (heightArg.type === _Ast.AstNodeType.NUMBER) {
      height = heightArg.value;
      if (height < 1) {
        return this.parsingError(_Ast.ParsingErrorType.StaticOffsetError, 'Fourth argument to OFFSET is too small number');
      } else if (!Number.isInteger(height)) {
        return this.parsingError(_Ast.ParsingErrorType.StaticOffsetError, 'Fourth argument to OFFSET is not integer');
      }
    } else {
      return this.parsingError(_Ast.ParsingErrorType.StaticOffsetError, 'Fourth argument to OFFSET is not a static number');
    }
    const widthArg = args[4];
    let width;
    if (widthArg === undefined) {
      width = 1;
    } else if (widthArg.type === _Ast.AstNodeType.NUMBER) {
      width = widthArg.value;
      if (width < 1) {
        return this.parsingError(_Ast.ParsingErrorType.StaticOffsetError, 'Fifth argument to OFFSET is too small number');
      } else if (!Number.isInteger(width)) {
        return this.parsingError(_Ast.ParsingErrorType.StaticOffsetError, 'Fifth argument to OFFSET is not integer');
      }
    } else {
      return this.parsingError(_Ast.ParsingErrorType.StaticOffsetError, 'Fifth argument to OFFSET is not a static number');
    }
    const topLeftCorner = new _CellAddress.CellAddress(cellArg.reference.col + colShift, cellArg.reference.row + rowShift, cellArg.reference.type);
    let absoluteCol = topLeftCorner.col;
    let absoluteRow = topLeftCorner.row;
    if (cellArg.reference.type === _CellAddress.CellReferenceType.CELL_REFERENCE_RELATIVE || cellArg.reference.type === _CellAddress.CellReferenceType.CELL_REFERENCE_ABSOLUTE_COL) {
      absoluteRow = absoluteRow + this.formulaAddress.row;
    }
    if (cellArg.reference.type === _CellAddress.CellReferenceType.CELL_REFERENCE_RELATIVE || cellArg.reference.type === _CellAddress.CellReferenceType.CELL_REFERENCE_ABSOLUTE_ROW) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      absoluteCol = absoluteCol + this.formulaAddress.col;
    }
    if (absoluteCol < 0 || absoluteRow < 0) {
      return (0, _Ast.buildCellErrorAst)(new _Cell.CellError(_Cell.ErrorType.REF, _errorMessage.ErrorMessage.OutOfSheet));
    }
    if (width === 1 && height === 1) {
      return (0, _Ast.buildCellReferenceAst)(topLeftCorner);
    } else {
      const bottomRightCorner = new _CellAddress.CellAddress(topLeftCorner.col + width - 1, topLeftCorner.row + height - 1, topLeftCorner.type);
      return (0, _Ast.buildCellRangeAst)(topLeftCorner, bottomRightCorner, _Ast.RangeSheetReferenceType.RELATIVE);
    }
  }
  parsingError(type, message) {
    this.customParsingError = (0, _Ast.parsingError)(type, message);
    return (0, _Ast.buildParsingErrorAst)();
  }
  static rangeSheetReferenceType(start, end) {
    if (start === undefined) {
      return _Ast.RangeSheetReferenceType.RELATIVE;
    } else if (end === undefined) {
      return _Ast.RangeSheetReferenceType.START_ABSOLUTE;
    } else {
      return _Ast.RangeSheetReferenceType.BOTH_ABSOLUTE;
    }
  }
}
exports.FormulaParser = FormulaParser;
class FormulaLexer {
  constructor(lexerConfig) {
    this.lexerConfig = lexerConfig;
    this.lexer = new _chevrotain.Lexer(lexerConfig.allTokens, {
      ensureOptimizations: false
    });
  }
  /**
   * Returns Lexer tokens from formula string
   *
   * @param {string} text - string representation of a formula
   */
  tokenizeFormula(text) {
    const lexingResult = this.lexer.tokenize(text);
    let tokens = lexingResult.tokens;
    tokens = this.trimTrailingWhitespaces(tokens);
    tokens = this.skipWhitespacesInsideRanges(tokens);
    tokens = this.skipWhitespacesBeforeArgSeparators(tokens);
    lexingResult.tokens = tokens;
    return lexingResult;
  }
  skipWhitespacesInsideRanges(tokens) {
    return FormulaLexer.filterTokensByNeighbors(tokens, (previous, current, next) => {
      return ((0, _chevrotain.tokenMatcher)(previous, _LexerConfig.CellReference) || (0, _chevrotain.tokenMatcher)(previous, _LexerConfig.RangeSeparator)) && (0, _chevrotain.tokenMatcher)(current, this.lexerConfig.WhiteSpace) && ((0, _chevrotain.tokenMatcher)(next, _LexerConfig.CellReference) || (0, _chevrotain.tokenMatcher)(next, _LexerConfig.RangeSeparator));
    });
  }
  skipWhitespacesBeforeArgSeparators(tokens) {
    return FormulaLexer.filterTokensByNeighbors(tokens, (previous, current, next) => {
      return !(0, _chevrotain.tokenMatcher)(previous, this.lexerConfig.ArgSeparator) && (0, _chevrotain.tokenMatcher)(current, this.lexerConfig.WhiteSpace) && (0, _chevrotain.tokenMatcher)(next, this.lexerConfig.ArgSeparator);
    });
  }
  static filterTokensByNeighbors(tokens, shouldBeSkipped) {
    if (tokens.length < 3) {
      return tokens;
    }
    let i = 0;
    const filteredTokens = [tokens[i++]];
    while (i < tokens.length - 1) {
      if (!shouldBeSkipped(tokens[i - 1], tokens[i], tokens[i + 1])) {
        filteredTokens.push(tokens[i]);
      }
      ++i;
    }
    filteredTokens.push(tokens[i]);
    return filteredTokens;
  }
  trimTrailingWhitespaces(tokens) {
    if (tokens.length > 0 && (0, _chevrotain.tokenMatcher)(tokens[tokens.length - 1], this.lexerConfig.WhiteSpace)) {
      tokens.pop();
    }
    return tokens;
  }
}
exports.FormulaLexer = FormulaLexer;