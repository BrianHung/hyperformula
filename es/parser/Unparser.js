/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */
import { ErrorType } from '../Cell';
import { NoSheetWithIdError } from '../index';
import { sheetIndexToString } from './addressRepresentationConverters';
import { AstNodeType, imageWithWhitespace, RangeSheetReferenceType } from './Ast';
import { binaryOpTokenMap } from './binaryOpTokenMap';
import { CellAddress } from './CellAddress';
import { ColumnAddress } from './ColumnAddress';
import { RowAddress } from './RowAddress';
function unparseAddressToImmutableReference(immutableMapping, address, baseAddress) {
  if (address instanceof CellAddress) {
    const cellId = immutableMapping.getCellId(address.toSimpleCellAddress(baseAddress));
    if (cellId === undefined) return undefined;
    const isColAbsolute = address.isColumnAbsolute();
    const isRowAbsolute = address.isRowAbsolute();
    const showSheet = address.sheet === baseAddress.sheet;
    return `REF("cell","${cellId}",${isColAbsolute},${isRowAbsolute},${showSheet})`;
  }
  if (address instanceof ColumnAddress) {
    const colId = immutableMapping.getColId(address.toSimpleColumnAddress(baseAddress));
    if (colId === undefined) return undefined;
    const showSheet = address.sheet === baseAddress.sheet;
    const isColAbsolute = address.isColumnAbsolute();
    return `REF("col","${colId}",${isColAbsolute},${showSheet})`;
  }
  if (address instanceof RowAddress) {
    const rowId = immutableMapping.getRowId(address.toSimpleRowAddress(baseAddress));
    if (rowId === undefined) return undefined;
    const showSheet = address.sheet === baseAddress.sheet;
    const isRowAbsolute = address.isRowAbsolute();
    return `REF("row","${rowId}",${isRowAbsolute},${showSheet})`;
  }
  return undefined;
}
export class Unparser {
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
      case AstNodeType.EMPTY:
        {
          return imageWithWhitespace('', ast.leadingWhitespace);
        }
      case AstNodeType.NUMBER:
        {
          return imageWithWhitespace(formatNumber(ast.value, this.config.decimalSeparator), ast.leadingWhitespace);
        }
      case AstNodeType.STRING:
        {
          return imageWithWhitespace('"' + ast.value + '"', ast.leadingWhitespace);
        }
      case AstNodeType.FUNCTION_CALL:
        {
          const args = ast.args.map(arg => arg !== undefined ? this.unparseAstImmutable(arg, address) : '').join(this.config.functionArgSeparator);
          const procedureName = this.config.translationPackage.isFunctionTranslated(ast.procedureName) ? this.config.translationPackage.getFunctionTranslation(ast.procedureName) : ast.procedureName;
          const rightPart = procedureName + '(' + args + imageWithWhitespace(')', ast.internalWhitespace);
          return imageWithWhitespace(rightPart, ast.leadingWhitespace);
        }
      case AstNodeType.NAMED_EXPRESSION:
        {
          const originalNamedExpressionName = (_a = this.namedExpressions.nearestNamedExpression(ast.expressionName, address.sheet)) === null || _a === void 0 ? void 0 : _a.displayName;
          return imageWithWhitespace(originalNamedExpressionName || ast.expressionName, ast.leadingWhitespace);
        }
      case AstNodeType.CELL_REFERENCE:
        {
          const image = (_b = unparseAddressToImmutableReference(this.immutableMapping, ast.reference, address)) !== null && _b !== void 0 ? _b : this.config.translationPackage.getErrorTranslation(ErrorType.REF);
          return imageWithWhitespace(image, ast.leadingWhitespace);
        }
      case AstNodeType.COLUMN_RANGE:
      case AstNodeType.ROW_RANGE:
      case AstNodeType.CELL_RANGE:
        {
          const image = this.formatImmutableRange(ast, address);
          return imageWithWhitespace(image, ast.leadingWhitespace);
        }
      case AstNodeType.PLUS_UNARY_OP:
        {
          const unparsedExpr = this.unparseAstImmutable(ast.value, address);
          return imageWithWhitespace('+', ast.leadingWhitespace) + unparsedExpr;
        }
      case AstNodeType.MINUS_UNARY_OP:
        {
          const unparsedExpr = this.unparseAstImmutable(ast.value, address);
          return imageWithWhitespace('-', ast.leadingWhitespace) + unparsedExpr;
        }
      case AstNodeType.PERCENT_OP:
        {
          return this.unparseAstImmutable(ast.value, address) + imageWithWhitespace('%', ast.leadingWhitespace);
        }
      case AstNodeType.ERROR:
        {
          const image = this.config.translationPackage.getErrorTranslation(ast.error ? ast.error.type : ErrorType.ERROR);
          return imageWithWhitespace(image, ast.leadingWhitespace);
        }
      case AstNodeType.ERROR_WITH_RAW_INPUT:
        {
          return imageWithWhitespace(ast.rawInput, ast.leadingWhitespace);
        }
      case AstNodeType.PARENTHESIS:
        {
          const expression = this.unparseAstImmutable(ast.expression, address);
          const rightPart = '(' + expression + imageWithWhitespace(')', ast.internalWhitespace);
          return imageWithWhitespace(rightPart, ast.leadingWhitespace);
        }
      case AstNodeType.ARRAY:
        {
          const ret = '{' + ast.args.map(row => row.map(val => this.unparseAstImmutable(val, address)).join(this.config.arrayColumnSeparator)).join(this.config.arrayRowSeparator) + imageWithWhitespace('}', ast.internalWhitespace);
          return imageWithWhitespace(ret, ast.leadingWhitespace);
        }
      default:
        {
          const left = this.unparseAstImmutable(ast.left, address);
          const right = this.unparseAstImmutable(ast.right, address);
          return left + imageWithWhitespace(binaryOpTokenMap[ast.type], ast.leadingWhitespace) + right;
        }
    }
  }
  unparseAst(ast, address) {
    var _a, _b;
    switch (ast.type) {
      case AstNodeType.EMPTY:
        {
          return imageWithWhitespace('', ast.leadingWhitespace);
        }
      case AstNodeType.NUMBER:
        {
          return imageWithWhitespace(formatNumber(ast.value, this.config.decimalSeparator), ast.leadingWhitespace);
        }
      case AstNodeType.STRING:
        {
          return imageWithWhitespace('"' + ast.value + '"', ast.leadingWhitespace);
        }
      case AstNodeType.FUNCTION_CALL:
        {
          const args = ast.args.map(arg => arg !== undefined ? this.unparseAst(arg, address) : '').join(this.config.functionArgSeparator);
          const procedureName = this.config.translationPackage.isFunctionTranslated(ast.procedureName) ? this.config.translationPackage.getFunctionTranslation(ast.procedureName) : ast.procedureName;
          const rightPart = procedureName + '(' + args + imageWithWhitespace(')', ast.internalWhitespace);
          return imageWithWhitespace(rightPart, ast.leadingWhitespace);
        }
      case AstNodeType.NAMED_EXPRESSION:
        {
          const originalNamedExpressionName = (_a = this.namedExpressions.nearestNamedExpression(ast.expressionName, address.sheet)) === null || _a === void 0 ? void 0 : _a.displayName;
          return imageWithWhitespace(originalNamedExpressionName || ast.expressionName, ast.leadingWhitespace);
        }
      case AstNodeType.CELL_REFERENCE:
        {
          let image;
          if (ast.reference.sheet !== undefined) {
            image = this.unparseSheetName(ast.reference.sheet) + '!';
          } else {
            image = '';
          }
          image += (_b = ast.reference.unparse(address)) !== null && _b !== void 0 ? _b : this.config.translationPackage.getErrorTranslation(ErrorType.REF);
          return imageWithWhitespace(image, ast.leadingWhitespace);
        }
      case AstNodeType.COLUMN_RANGE:
      case AstNodeType.ROW_RANGE:
      case AstNodeType.CELL_RANGE:
        {
          const image = this.formatRange(ast, address);
          return imageWithWhitespace(image, ast.leadingWhitespace);
        }
      case AstNodeType.PLUS_UNARY_OP:
        {
          const unparsedExpr = this.unparseAst(ast.value, address);
          return imageWithWhitespace('+', ast.leadingWhitespace) + unparsedExpr;
        }
      case AstNodeType.MINUS_UNARY_OP:
        {
          const unparsedExpr = this.unparseAst(ast.value, address);
          return imageWithWhitespace('-', ast.leadingWhitespace) + unparsedExpr;
        }
      case AstNodeType.PERCENT_OP:
        {
          return this.unparseAst(ast.value, address) + imageWithWhitespace('%', ast.leadingWhitespace);
        }
      case AstNodeType.ERROR:
        {
          const image = this.config.translationPackage.getErrorTranslation(ast.error ? ast.error.type : ErrorType.ERROR);
          return imageWithWhitespace(image, ast.leadingWhitespace);
        }
      case AstNodeType.ERROR_WITH_RAW_INPUT:
        {
          return imageWithWhitespace(ast.rawInput, ast.leadingWhitespace);
        }
      case AstNodeType.PARENTHESIS:
        {
          const expression = this.unparseAst(ast.expression, address);
          const rightPart = '(' + expression + imageWithWhitespace(')', ast.internalWhitespace);
          return imageWithWhitespace(rightPart, ast.leadingWhitespace);
        }
      case AstNodeType.ARRAY:
        {
          const ret = '{' + ast.args.map(row => row.map(val => this.unparseAst(val, address)).join(this.config.arrayColumnSeparator)).join(this.config.arrayRowSeparator) + imageWithWhitespace('}', ast.internalWhitespace);
          return imageWithWhitespace(ret, ast.leadingWhitespace);
        }
      default:
        {
          const left = this.unparseAst(ast.left, address);
          const right = this.unparseAst(ast.right, address);
          return left + imageWithWhitespace(binaryOpTokenMap[ast.type], ast.leadingWhitespace) + right;
        }
    }
  }
  unparseSheetName(sheetId) {
    const sheetName = sheetIndexToString(sheetId, this.sheetMappingFn);
    if (sheetName === undefined) {
      throw new NoSheetWithIdError(sheetId);
    }
    return sheetName;
  }
  formatRange(ast, baseAddress) {
    let startSheet = '';
    let endSheet = '';
    if (ast.start.sheet !== undefined && ast.sheetReferenceType !== RangeSheetReferenceType.RELATIVE) {
      startSheet = this.unparseSheetName(ast.start.sheet) + '!';
    }
    if (ast.end.sheet !== undefined && ast.sheetReferenceType === RangeSheetReferenceType.BOTH_ABSOLUTE) {
      endSheet = this.unparseSheetName(ast.end.sheet) + '!';
    }
    const unparsedStart = ast.start.unparse(baseAddress);
    const unparsedEnd = ast.end.unparse(baseAddress);
    if (unparsedStart === undefined || unparsedEnd === undefined) {
      return this.config.translationPackage.getErrorTranslation(ErrorType.REF);
    }
    return `${startSheet}${unparsedStart}:${endSheet}${unparsedEnd}`;
  }
  formatImmutableRange(ast, baseAddress) {
    const unparsedStart = unparseAddressToImmutableReference(this.immutableMapping, ast.start, baseAddress);
    const unparsedEnd = unparseAddressToImmutableReference(this.immutableMapping, ast.end, baseAddress);
    if (unparsedStart === undefined || unparsedEnd === undefined) {
      return this.config.translationPackage.getErrorTranslation(ErrorType.REF);
    }
    return `${unparsedStart}:${unparsedEnd}`;
  }
}
export function formatNumber(number, decimalSeparator) {
  const numericString = number.toString();
  return numericString.replace('.', decimalSeparator);
}