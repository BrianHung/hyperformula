"use strict";

exports.__esModule = true;
exports.Unparser = void 0;
exports.formatNumber = formatNumber;
var _Cell = require("../Cell");
var _index = require("../index");
var _addressRepresentationConverters = require("./addressRepresentationConverters");
var _Ast = require("./Ast");
var _binaryOpTokenMap = require("./binaryOpTokenMap");
var _CellAddress = require("./CellAddress");
var _ColumnAddress = require("./ColumnAddress");
var _RowAddress = require("./RowAddress");
/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */

function unparseAddressToImmutableReference(immutableMapping, address, baseAddress) {
  if (address instanceof _CellAddress.CellAddress) {
    const cellId = immutableMapping.getCellId(address.toSimpleCellAddress(baseAddress));
    if (cellId === undefined) return undefined;
    const isColAbsolute = address.isColumnAbsolute();
    const isRowAbsolute = address.isRowAbsolute();
    const showSheet = address.sheet === baseAddress.sheet;
    return `REF("cell","${cellId}",${isColAbsolute},${isRowAbsolute},${showSheet})`;
  }
  if (address instanceof _ColumnAddress.ColumnAddress) {
    const colId = immutableMapping.getColId(address.toSimpleColumnAddress(baseAddress));
    if (colId === undefined) return undefined;
    const showSheet = address.sheet === baseAddress.sheet;
    const isColAbsolute = address.isColumnAbsolute();
    return `REF("col","${colId}",${isColAbsolute},${showSheet})`;
  }
  if (address instanceof _RowAddress.RowAddress) {
    const rowId = immutableMapping.getRowId(address.toSimpleRowAddress(baseAddress));
    if (rowId === undefined) return undefined;
    const showSheet = address.sheet === baseAddress.sheet;
    const isRowAbsolute = address.isRowAbsolute();
    return `REF("row","${rowId}",${isRowAbsolute},${showSheet})`;
  }
  return undefined;
}
class Unparser {
  constructor(config, lexerConfig, sheetMappingFn, namedExpressions, immutableMapping) {
    this.config = config;
    this.lexerConfig = lexerConfig;
    this.sheetMappingFn = sheetMappingFn;
    this.namedExpressions = namedExpressions;
    this.immutableMapping = immutableMapping;
  }
  unparse(ast, address) {
    return '=' + this.unparseAst(ast, address);
  }
  unparseImmutable(ast, address) {
    return '=' + this.unparseAstImmutable(ast, address);
  }
  unparseAstImmutable(ast, address) {
    var _a, _b;
    if (this.immutableMapping === undefined) throw Error('unparseAstImmutable called without immutableMapping');
    switch (ast.type) {
      case _Ast.AstNodeType.EMPTY:
        {
          return (0, _Ast.imageWithWhitespace)('', ast.leadingWhitespace);
        }
      case _Ast.AstNodeType.NUMBER:
        {
          return (0, _Ast.imageWithWhitespace)(formatNumber(ast.value, this.config.decimalSeparator), ast.leadingWhitespace);
        }
      case _Ast.AstNodeType.STRING:
        {
          return (0, _Ast.imageWithWhitespace)('"' + ast.value + '"', ast.leadingWhitespace);
        }
      case _Ast.AstNodeType.FUNCTION_CALL:
        {
          const args = ast.args.map(arg => arg !== undefined ? this.unparseAstImmutable(arg, address) : '').join(this.config.functionArgSeparator);
          const procedureName = this.config.translationPackage.isFunctionTranslated(ast.procedureName) ? this.config.translationPackage.getFunctionTranslation(ast.procedureName) : ast.procedureName;
          const rightPart = procedureName + '(' + args + (0, _Ast.imageWithWhitespace)(')', ast.internalWhitespace);
          return (0, _Ast.imageWithWhitespace)(rightPart, ast.leadingWhitespace);
        }
      case _Ast.AstNodeType.NAMED_EXPRESSION:
        {
          const originalNamedExpressionName = (_a = this.namedExpressions.nearestNamedExpression(ast.expressionName, address.sheet)) === null || _a === void 0 ? void 0 : _a.displayName;
          return (0, _Ast.imageWithWhitespace)(originalNamedExpressionName || ast.expressionName, ast.leadingWhitespace);
        }
      case _Ast.AstNodeType.CELL_REFERENCE:
        {
          const image = (_b = unparseAddressToImmutableReference(this.immutableMapping, ast.reference, address)) !== null && _b !== void 0 ? _b : this.config.translationPackage.getErrorTranslation(_Cell.ErrorType.REF);
          return (0, _Ast.imageWithWhitespace)(image, ast.leadingWhitespace);
        }
      case _Ast.AstNodeType.COLUMN_RANGE:
      case _Ast.AstNodeType.ROW_RANGE:
      case _Ast.AstNodeType.CELL_RANGE:
        {
          const image = this.formatImmutableRange(ast, address);
          return (0, _Ast.imageWithWhitespace)(image, ast.leadingWhitespace);
        }
      case _Ast.AstNodeType.PLUS_UNARY_OP:
        {
          const unparsedExpr = this.unparseAstImmutable(ast.value, address);
          return (0, _Ast.imageWithWhitespace)('+', ast.leadingWhitespace) + unparsedExpr;
        }
      case _Ast.AstNodeType.MINUS_UNARY_OP:
        {
          const unparsedExpr = this.unparseAstImmutable(ast.value, address);
          return (0, _Ast.imageWithWhitespace)('-', ast.leadingWhitespace) + unparsedExpr;
        }
      case _Ast.AstNodeType.PERCENT_OP:
        {
          return this.unparseAstImmutable(ast.value, address) + (0, _Ast.imageWithWhitespace)('%', ast.leadingWhitespace);
        }
      case _Ast.AstNodeType.ERROR:
        {
          const image = this.config.translationPackage.getErrorTranslation(ast.error ? ast.error.type : _Cell.ErrorType.ERROR);
          return (0, _Ast.imageWithWhitespace)(image, ast.leadingWhitespace);
        }
      case _Ast.AstNodeType.ERROR_WITH_RAW_INPUT:
        {
          return (0, _Ast.imageWithWhitespace)(ast.rawInput, ast.leadingWhitespace);
        }
      case _Ast.AstNodeType.PARENTHESIS:
        {
          const expression = this.unparseAstImmutable(ast.expression, address);
          const rightPart = '(' + expression + (0, _Ast.imageWithWhitespace)(')', ast.internalWhitespace);
          return (0, _Ast.imageWithWhitespace)(rightPart, ast.leadingWhitespace);
        }
      case _Ast.AstNodeType.ARRAY:
        {
          const ret = '{' + ast.args.map(row => row.map(val => this.unparseAstImmutable(val, address)).join(this.config.arrayColumnSeparator)).join(this.config.arrayRowSeparator) + (0, _Ast.imageWithWhitespace)('}', ast.internalWhitespace);
          return (0, _Ast.imageWithWhitespace)(ret, ast.leadingWhitespace);
        }
      default:
        {
          const left = this.unparseAstImmutable(ast.left, address);
          const right = this.unparseAstImmutable(ast.right, address);
          return left + (0, _Ast.imageWithWhitespace)(_binaryOpTokenMap.binaryOpTokenMap[ast.type], ast.leadingWhitespace) + right;
        }
    }
  }
  unparseAst(ast, address) {
    var _a, _b;
    switch (ast.type) {
      case _Ast.AstNodeType.EMPTY:
        {
          return (0, _Ast.imageWithWhitespace)('', ast.leadingWhitespace);
        }
      case _Ast.AstNodeType.NUMBER:
        {
          return (0, _Ast.imageWithWhitespace)(formatNumber(ast.value, this.config.decimalSeparator), ast.leadingWhitespace);
        }
      case _Ast.AstNodeType.STRING:
        {
          return (0, _Ast.imageWithWhitespace)('"' + ast.value + '"', ast.leadingWhitespace);
        }
      case _Ast.AstNodeType.FUNCTION_CALL:
        {
          const args = ast.args.map(arg => arg !== undefined ? this.unparseAst(arg, address) : '').join(this.config.functionArgSeparator);
          const procedureName = this.config.translationPackage.isFunctionTranslated(ast.procedureName) ? this.config.translationPackage.getFunctionTranslation(ast.procedureName) : ast.procedureName;
          const rightPart = procedureName + '(' + args + (0, _Ast.imageWithWhitespace)(')', ast.internalWhitespace);
          return (0, _Ast.imageWithWhitespace)(rightPart, ast.leadingWhitespace);
        }
      case _Ast.AstNodeType.NAMED_EXPRESSION:
        {
          const originalNamedExpressionName = (_a = this.namedExpressions.nearestNamedExpression(ast.expressionName, address.sheet)) === null || _a === void 0 ? void 0 : _a.displayName;
          return (0, _Ast.imageWithWhitespace)(originalNamedExpressionName || ast.expressionName, ast.leadingWhitespace);
        }
      case _Ast.AstNodeType.CELL_REFERENCE:
        {
          let image;
          if (ast.reference.sheet !== undefined) {
            image = this.unparseSheetName(ast.reference.sheet) + '!';
          } else {
            image = '';
          }
          image += (_b = ast.reference.unparse(address)) !== null && _b !== void 0 ? _b : this.config.translationPackage.getErrorTranslation(_Cell.ErrorType.REF);
          return (0, _Ast.imageWithWhitespace)(image, ast.leadingWhitespace);
        }
      case _Ast.AstNodeType.COLUMN_RANGE:
      case _Ast.AstNodeType.ROW_RANGE:
      case _Ast.AstNodeType.CELL_RANGE:
        {
          const image = this.formatRange(ast, address);
          return (0, _Ast.imageWithWhitespace)(image, ast.leadingWhitespace);
        }
      case _Ast.AstNodeType.PLUS_UNARY_OP:
        {
          const unparsedExpr = this.unparseAst(ast.value, address);
          return (0, _Ast.imageWithWhitespace)('+', ast.leadingWhitespace) + unparsedExpr;
        }
      case _Ast.AstNodeType.MINUS_UNARY_OP:
        {
          const unparsedExpr = this.unparseAst(ast.value, address);
          return (0, _Ast.imageWithWhitespace)('-', ast.leadingWhitespace) + unparsedExpr;
        }
      case _Ast.AstNodeType.PERCENT_OP:
        {
          return this.unparseAst(ast.value, address) + (0, _Ast.imageWithWhitespace)('%', ast.leadingWhitespace);
        }
      case _Ast.AstNodeType.ERROR:
        {
          const image = this.config.translationPackage.getErrorTranslation(ast.error ? ast.error.type : _Cell.ErrorType.ERROR);
          return (0, _Ast.imageWithWhitespace)(image, ast.leadingWhitespace);
        }
      case _Ast.AstNodeType.ERROR_WITH_RAW_INPUT:
        {
          return (0, _Ast.imageWithWhitespace)(ast.rawInput, ast.leadingWhitespace);
        }
      case _Ast.AstNodeType.PARENTHESIS:
        {
          const expression = this.unparseAst(ast.expression, address);
          const rightPart = '(' + expression + (0, _Ast.imageWithWhitespace)(')', ast.internalWhitespace);
          return (0, _Ast.imageWithWhitespace)(rightPart, ast.leadingWhitespace);
        }
      case _Ast.AstNodeType.ARRAY:
        {
          const ret = '{' + ast.args.map(row => row.map(val => this.unparseAst(val, address)).join(this.config.arrayColumnSeparator)).join(this.config.arrayRowSeparator) + (0, _Ast.imageWithWhitespace)('}', ast.internalWhitespace);
          return (0, _Ast.imageWithWhitespace)(ret, ast.leadingWhitespace);
        }
      default:
        {
          const left = this.unparseAst(ast.left, address);
          const right = this.unparseAst(ast.right, address);
          return left + (0, _Ast.imageWithWhitespace)(_binaryOpTokenMap.binaryOpTokenMap[ast.type], ast.leadingWhitespace) + right;
        }
    }
  }
  unparseSheetName(sheetId) {
    const sheetName = (0, _addressRepresentationConverters.sheetIndexToString)(sheetId, this.sheetMappingFn);
    if (sheetName === undefined) {
      throw new _index.NoSheetWithIdError(sheetId);
    }
    return sheetName;
  }
  formatRange(ast, baseAddress) {
    let startSheet = '';
    let endSheet = '';
    if (ast.start.sheet !== undefined && ast.sheetReferenceType !== _Ast.RangeSheetReferenceType.RELATIVE) {
      startSheet = this.unparseSheetName(ast.start.sheet) + '!';
    }
    if (ast.end.sheet !== undefined && ast.sheetReferenceType === _Ast.RangeSheetReferenceType.BOTH_ABSOLUTE) {
      endSheet = this.unparseSheetName(ast.end.sheet) + '!';
    }
    const unparsedStart = ast.start.unparse(baseAddress);
    const unparsedEnd = ast.end.unparse(baseAddress);
    if (unparsedStart === undefined || unparsedEnd === undefined) {
      return this.config.translationPackage.getErrorTranslation(_Cell.ErrorType.REF);
    }
    return `${startSheet}${unparsedStart}:${endSheet}${unparsedEnd}`;
  }
  formatImmutableRange(ast, baseAddress) {
    const unparsedStart = unparseAddressToImmutableReference(this.immutableMapping, ast.start, baseAddress);
    const unparsedEnd = unparseAddressToImmutableReference(this.immutableMapping, ast.end, baseAddress);
    if (unparsedStart === undefined || unparsedEnd === undefined) {
      return this.config.translationPackage.getErrorTranslation(_Cell.ErrorType.REF);
    }
    return `${unparsedStart}:${unparsedEnd}`;
  }
}
exports.Unparser = Unparser;
function formatNumber(number, decimalSeparator) {
  const numericString = number.toString();
  return numericString.replace('.', decimalSeparator);
}