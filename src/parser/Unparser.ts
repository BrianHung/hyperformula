/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */

import {ErrorType, SimpleCellAddress, simpleCellAddress} from '../Cell'
import {ImmutableIdMapping} from '../DependencyGraph/ImmutableRefMapping'
import {NoSheetWithIdError} from '../index'
import {NamedExpressions} from '../NamedExpressions'
import {SheetIndexMappingFn, sheetIndexToString} from './addressRepresentationConverters'
import {
  Ast,
  AstNodeType,
  CellRangeAst,
  ColumnRangeAst,
  imageWithWhitespace,
  RangeSheetReferenceType,
  RowRangeAst,
} from './Ast'
import {binaryOpTokenMap} from './binaryOpTokenMap'
import {CellAddress} from './CellAddress'
import {ColumnAddress} from './ColumnAddress'
import {RowAddress} from './RowAddress'
import {LexerConfig} from './LexerConfig'
import {ParserConfig} from './ParserConfig'

function unparseAddressToImmutableReference(
  immutableMapping: ImmutableIdMapping,
  address: CellAddress | ColumnAddress | RowAddress, 
  baseAddress: SimpleCellAddress
): string | undefined {
  if (address instanceof CellAddress) {
    const cellId = immutableMapping.getCellId(address.toSimpleCellAddress(baseAddress))
    if (cellId === undefined) return undefined
    const isColAbsolute = address.isColumnAbsolute()
    const isRowAbsolute = address.isRowAbsolute()
    const showSheet = address.sheet === baseAddress.sheet
    return `REF("cell","${cellId}",${isColAbsolute},${isRowAbsolute},${showSheet})`
  }
  if (address instanceof ColumnAddress) {
    const colId = immutableMapping.getColId(address.toSimpleColumnAddress(baseAddress))
    if (colId === undefined) return undefined
    const showSheet = address.sheet === baseAddress.sheet
    const isColAbsolute = address.isColumnAbsolute()
    return `REF("col","${colId}",${isColAbsolute},${showSheet})`
  }
  if (address instanceof RowAddress) {
    const rowId = immutableMapping.getRowId(address.toSimpleRowAddress(baseAddress))
    if (rowId === undefined) return undefined
    const showSheet = address.sheet === baseAddress.sheet
    const isRowAbsolute = address.isRowAbsolute()
    return `REF("row","${rowId}",${isRowAbsolute},${showSheet})`
  }
  return undefined
}

export class Unparser {
  constructor(
    private readonly config: ParserConfig,
    private readonly lexerConfig: LexerConfig,
    private readonly sheetMappingFn: SheetIndexMappingFn,
    private readonly namedExpressions: NamedExpressions,
    private readonly immutableMapping?: ImmutableIdMapping,
  ) {
  }

  public unparse(ast: Ast, address: SimpleCellAddress): string {
    return '=' + this.unparseAst(ast, address)
  }

  public unparseImmutable(ast: Ast, address: SimpleCellAddress): string {
    return '=' + this.unparseAstImmutable(ast, address)
  }

  private unparseAstImmutable(ast: Ast, address: SimpleCellAddress): string {
    if (this.immutableMapping === undefined) throw Error('unparseAstImmutable called without immutableMapping')
    switch (ast.type) {
      case AstNodeType.EMPTY: {
        return imageWithWhitespace('', ast.leadingWhitespace)
      }
      case AstNodeType.NUMBER: {
        return imageWithWhitespace(formatNumber(ast.value, this.config.decimalSeparator), ast.leadingWhitespace)
      }
      case AstNodeType.STRING: {
        return imageWithWhitespace('"' + ast.value + '"', ast.leadingWhitespace)
      }
      case AstNodeType.FUNCTION_CALL: {
        const args = ast.args.map((arg) => arg !== undefined ? this.unparseAstImmutable(arg, address) : ''
        ).join(this.config.functionArgSeparator)
        const procedureName = this.config.translationPackage.isFunctionTranslated(ast.procedureName) ?
          this.config.translationPackage.getFunctionTranslation(ast.procedureName) :
          ast.procedureName
        const rightPart = procedureName + '(' + args + imageWithWhitespace(')', ast.internalWhitespace)
        return imageWithWhitespace(rightPart, ast.leadingWhitespace)
      }
      case AstNodeType.NAMED_EXPRESSION: {
        const originalNamedExpressionName = this.namedExpressions.nearestNamedExpression(ast.expressionName, address.sheet)?.displayName
        return imageWithWhitespace(originalNamedExpressionName || ast.expressionName, ast.leadingWhitespace)
      }
      case AstNodeType.CELL_REFERENCE: {
        const image = unparseAddressToImmutableReference(this.immutableMapping, ast.reference, address) ?? this.config.translationPackage.getErrorTranslation(ErrorType.REF)
        return imageWithWhitespace(image, ast.leadingWhitespace)
      }
      case AstNodeType.COLUMN_RANGE:
      case AstNodeType.ROW_RANGE:
      case AstNodeType.CELL_RANGE: {
        const image = this.formatImmutableRange(ast, address)
        return imageWithWhitespace(image, ast.leadingWhitespace)
      }
      case AstNodeType.PLUS_UNARY_OP: {
        const unparsedExpr = this.unparseAstImmutable(ast.value, address)
        return imageWithWhitespace('+', ast.leadingWhitespace) + unparsedExpr
      }
      case AstNodeType.MINUS_UNARY_OP: {
        const unparsedExpr = this.unparseAstImmutable(ast.value, address)
        return imageWithWhitespace('-', ast.leadingWhitespace) + unparsedExpr
      }
      case AstNodeType.PERCENT_OP: {
        return this.unparseAstImmutable(ast.value, address) + imageWithWhitespace('%', ast.leadingWhitespace)
      }
      case AstNodeType.ERROR: {
        const image = this.config.translationPackage.getErrorTranslation(
          ast.error ? ast.error.type : ErrorType.ERROR
        )
        return imageWithWhitespace(image, ast.leadingWhitespace)
      }
      case AstNodeType.ERROR_WITH_RAW_INPUT: {
        return imageWithWhitespace(ast.rawInput, ast.leadingWhitespace)
      }
      case AstNodeType.PARENTHESIS: {
        const expression = this.unparseAstImmutable(ast.expression, address)
        const rightPart = '(' + expression + imageWithWhitespace(')', ast.internalWhitespace)
        return imageWithWhitespace(rightPart, ast.leadingWhitespace)
      }
      case AstNodeType.ARRAY: {
        const ret = '{' + ast.args.map(row => row.map(val => this.unparseAstImmutable(val, address)).join(this.config.arrayColumnSeparator)).join(this.config.arrayRowSeparator) + imageWithWhitespace('}', ast.internalWhitespace)
        return imageWithWhitespace(ret, ast.leadingWhitespace)
      }
      default: {
        const left = this.unparseAstImmutable(ast.left, address)
        const right = this.unparseAstImmutable(ast.right, address)
        return left + imageWithWhitespace(binaryOpTokenMap[ast.type], ast.leadingWhitespace) + right
      }
    }
  }

  private unparseAst(ast: Ast, address: SimpleCellAddress): string {
    switch (ast.type) {
      case AstNodeType.EMPTY: {
        return imageWithWhitespace('', ast.leadingWhitespace)
      }
      case AstNodeType.NUMBER: {
        return imageWithWhitespace(formatNumber(ast.value, this.config.decimalSeparator), ast.leadingWhitespace)
      }
      case AstNodeType.STRING: {
        return imageWithWhitespace('"' + ast.value + '"', ast.leadingWhitespace)
      }
      case AstNodeType.FUNCTION_CALL: {
        const args = ast.args.map((arg) => arg !== undefined ? this.unparseAst(arg, address) : ''
        ).join(this.config.functionArgSeparator)
        const procedureName = this.config.translationPackage.isFunctionTranslated(ast.procedureName) ?
          this.config.translationPackage.getFunctionTranslation(ast.procedureName) :
          ast.procedureName
        const rightPart = procedureName + '(' + args + imageWithWhitespace(')', ast.internalWhitespace)
        return imageWithWhitespace(rightPart, ast.leadingWhitespace)
      }
      case AstNodeType.NAMED_EXPRESSION: {
        const originalNamedExpressionName = this.namedExpressions.nearestNamedExpression(ast.expressionName, address.sheet)?.displayName
        return imageWithWhitespace(originalNamedExpressionName || ast.expressionName, ast.leadingWhitespace)
      }
      case AstNodeType.CELL_REFERENCE: {
        let image
        if (ast.reference.sheet !== undefined) {
          image = this.unparseSheetName(ast.reference.sheet) + '!'
        } else {
          image = ''
        }
        image += ast.reference.unparse(address) ?? this.config.translationPackage.getErrorTranslation(ErrorType.REF)
        return imageWithWhitespace(image, ast.leadingWhitespace)
      }
      case AstNodeType.COLUMN_RANGE:
      case AstNodeType.ROW_RANGE:
      case AstNodeType.CELL_RANGE: {
        const image = this.formatRange(ast, address)
        return imageWithWhitespace(image, ast.leadingWhitespace)
      }
      case AstNodeType.PLUS_UNARY_OP: {
        const unparsedExpr = this.unparseAst(ast.value, address)
        return imageWithWhitespace('+', ast.leadingWhitespace) + unparsedExpr
      }
      case AstNodeType.MINUS_UNARY_OP: {
        const unparsedExpr = this.unparseAst(ast.value, address)
        return imageWithWhitespace('-', ast.leadingWhitespace) + unparsedExpr
      }
      case AstNodeType.PERCENT_OP: {
        return this.unparseAst(ast.value, address) + imageWithWhitespace('%', ast.leadingWhitespace)
      }
      case AstNodeType.ERROR: {
        const image = this.config.translationPackage.getErrorTranslation(
          ast.error ? ast.error.type : ErrorType.ERROR
        )
        return imageWithWhitespace(image, ast.leadingWhitespace)
      }
      case AstNodeType.ERROR_WITH_RAW_INPUT: {
        return imageWithWhitespace(ast.rawInput, ast.leadingWhitespace)
      }
      case AstNodeType.PARENTHESIS: {
        const expression = this.unparseAst(ast.expression, address)
        const rightPart = '(' + expression + imageWithWhitespace(')', ast.internalWhitespace)
        return imageWithWhitespace(rightPart, ast.leadingWhitespace)
      }
      case AstNodeType.ARRAY: {
        const ret = '{' + ast.args.map(row => row.map(val => this.unparseAst(val, address)).join(this.config.arrayColumnSeparator)).join(this.config.arrayRowSeparator) + imageWithWhitespace('}', ast.internalWhitespace)
        return imageWithWhitespace(ret, ast.leadingWhitespace)
      }
      default: {
        const left = this.unparseAst(ast.left, address)
        const right = this.unparseAst(ast.right, address)
        return left + imageWithWhitespace(binaryOpTokenMap[ast.type], ast.leadingWhitespace) + right
      }
    }
  }

  private unparseSheetName(sheetId: number): string {
    const sheetName = sheetIndexToString(sheetId, this.sheetMappingFn)
    if (sheetName === undefined) {
      throw new NoSheetWithIdError(sheetId)
    }
    return sheetName
  }

  private formatRange(ast: CellRangeAst | ColumnRangeAst | RowRangeAst, baseAddress: SimpleCellAddress): string {
    let startSheet = ''
    let endSheet = ''

    if (ast.start.sheet !== undefined && (ast.sheetReferenceType !== RangeSheetReferenceType.RELATIVE)) {
      startSheet = this.unparseSheetName(ast.start.sheet) + '!'
    }

    if (ast.end.sheet !== undefined && ast.sheetReferenceType === RangeSheetReferenceType.BOTH_ABSOLUTE) {
      endSheet = this.unparseSheetName(ast.end.sheet) + '!'
    }

    const unparsedStart = ast.start.unparse(baseAddress)
    const unparsedEnd = ast.end.unparse(baseAddress)
    if (unparsedStart === undefined || unparsedEnd === undefined) {
      return this.config.translationPackage.getErrorTranslation(ErrorType.REF)
    }

    return `${startSheet}${unparsedStart}:${endSheet}${unparsedEnd}`
  }

  private formatImmutableRange(ast: CellRangeAst | ColumnRangeAst | RowRangeAst, baseAddress: SimpleCellAddress): string {
    const unparsedStart = unparseAddressToImmutableReference(this.immutableMapping as any, ast.start, baseAddress)
    const unparsedEnd = unparseAddressToImmutableReference(this.immutableMapping as any, ast.end, baseAddress)
    if (unparsedStart === undefined || unparsedEnd === undefined) {
      return this.config.translationPackage.getErrorTranslation(ErrorType.REF)
    }
    return `${unparsedStart}:${unparsedEnd}`
  }
}

export function formatNumber(number: number, decimalSeparator: string): string {
  const numericString = number.toString()
  return numericString.replace('.', decimalSeparator)
}
