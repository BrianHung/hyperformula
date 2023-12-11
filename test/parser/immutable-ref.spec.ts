import {Config} from '../../src/Config'
import {SheetMapping} from '../../src/DependencyGraph'
import {buildTranslationPackage} from '../../src/i18n'
import {enGB} from '../../src/i18n/languages'
import {buildLexerConfig, FormulaLexer, buildCellErrorAst, AstNodeType, CellAddress, CellReferenceAst, Unparser} from '../../src/parser'
import {ColumnAddress} from '../../src/parser/ColumnAddress'
import {RowAddress} from '../../src/parser/RowAddress'
import {CellReferenceType} from '../../src/parser/CellAddress'
import {CellReference, EqualsOp, ProcedureName, RangeSeparator, RParen} from '../../src/parser/LexerConfig'
import {expectArrayWithSameContent} from '../testUtils'
import {buildEmptyParserWithCaching} from './common'
import {adr} from '../testUtils'
import {IMMUTABLE_CELL_REFERENCE_PATTERN, IMMUTABLE_COL_REFERENCE_PATTERN, IMMUTABLE_ROW_REFERENCE_PATTERN} from '../../src/parser/parser-consts'
import { CellRangeAst, ColumnRangeAst, RangeSheetReferenceType, RowRangeAst, buildColumnRangeAst, buildRowRangeAst, buildCellRangeAst, buildCellReferenceAst } from '../../src/parser/Ast'
import {ImmutableIdMappingTestImpl, ImmutableReferenceMappingTestImpl} from '../../src/DependencyGraph/ImmutableRefMapping'
import { NamedExpressions } from '../../src/NamedExpressions'
import { AlwaysDense, HyperFormula } from '../../src'
import { ImmutableAddressMapping } from '../../src/DependencyGraph/AddressMapping/ImmutableAddressMapping'

describe('RegExp patterns should match', () => {
  it('IMMUTABLE_CELL_REFERENCE_PATTERN', () => {
    const match = new RegExp(IMMUTABLE_CELL_REFERENCE_PATTERN).exec('REF("row","00000000-0000-0000-0000-000000000000",true,true)')
    expect(match).toBeDefined()
  })
  it('IMMUTABLE_COL_REFERENCE_PATTERN', () => {
    const match = new RegExp(IMMUTABLE_COL_REFERENCE_PATTERN).exec('REF("col","00000000-0000-0000-0000-000000000000",true)')
    expect(match).toBeDefined()
  })
  it('IMMUTABLE_ROW_REFERENCE_PATTERN', () => {
    const match = new RegExp(IMMUTABLE_ROW_REFERENCE_PATTERN).exec('REF("row","00000000-0000-0000-0000-000000000000",true)')
    expect(match).toBeDefined()
  })
})

describe('lexer immutable token types', () => {
  const config = new Config()
  const lexer = new FormulaLexer(buildLexerConfig(config))

  it('should parse basic immutable cell reference', () => {
    const tokens = lexer.tokenizeFormula('REF("cell","00000000-0000-0000-0000-000000000000",true,true)').tokens
    const tokenTypes = tokens.map(token => token.tokenType.name)
    expectArrayWithSameContent(tokenTypes, ['ImmutableCellReference'])
  })

  it('should parse basic immutable row reference', () => {
    const tokens = lexer.tokenizeFormula('REF("row","00000000-0000-0000-0000-000000000000",true)').tokens
    const tokenTypes = tokens.map(token => token.tokenType.name)
    expectArrayWithSameContent(tokenTypes, ['ImmutableRowReference'])
  })

  it('should parse basic immutable row range', () => {
    const tokens = lexer.tokenizeFormula('REF("row","00000000-0000-0000-0000-000000000000",true):REF("row","00000000-0000-0000-0000-000000000000",true)').tokens
    const tokenTypes = tokens.map(token => token.tokenType.name)
    expectArrayWithSameContent(tokenTypes, ['ImmutableRowRange'])
  })

  it('should parse basic immutable col reference', () => {
    const tokens = lexer.tokenizeFormula('REF("col","00000000-0000-0000-0000-000000000000",true)').tokens
    const tokenTypes = tokens.map(token => token.tokenType.name)
    expectArrayWithSameContent(tokenTypes, ['ImmutableColReference'])
  })

  it('should parse basic immutable col range', () => {
    const tokens = lexer.tokenizeFormula('REF("col","00000000-0000-0000-0000-000000000000",true):REF("col","00000000-0000-0000-0000-000000000000",true)').tokens
    const tokenTypes = tokens.map(token => token.tokenType.name)
    expectArrayWithSameContent(tokenTypes, ['ImmutableColRange'])
  })
})

describe('parser immutable tokens into reference ast', () => {
  const config = new Config()

  const rowMap = new Map()
  rowMap.set('00000000-0000-0000-0000-000000000000', { id: '00000000-0000-0000-0000-000000000000', index: 0, sheet: 0 })
  
  const colMap = new Map()
  colMap.set('00000000-0000-0000-0000-000000000000', { id: '00000000-0000-0000-0000-000000000000', index: 0, sheet: 0 })
  
  const cellMap = new Map()
  cellMap.set('00000000-0000-0000-0000-000000000000', { id: '00000000-0000-0000-0000-000000000000', row: '00000000-0000-0000-0000-000000000000', col: '00000000-0000-0000-0000-000000000000' })

  const refMapping = new ImmutableReferenceMappingTestImpl({
    cells: cellMap,
    rows: rowMap,
    cols: colMap,
  })

  const parser = buildEmptyParserWithCaching(config, undefined, refMapping)

  it('absolute cell reference', () => {
    const ast = parser.parse('=REF("cell","00000000-0000-0000-0000-000000000000",true,true)', adr('A1')).ast as CellReferenceAst
    expect(ast).toEqual(buildCellReferenceAst(CellAddress.absolute(0, 0)))
  })

  it('absolute row cell reference', () => {
    const ast = parser.parse('=REF("cell","00000000-0000-0000-0000-000000000000",false,true)', adr('A1')).ast as CellReferenceAst
    expect(ast).toEqual(buildCellReferenceAst(CellAddress.absoluteRow(0, 0)))
  })

  it('absolute col cell reference', () => {
    const ast = parser.parse('=REF("cell","00000000-0000-0000-0000-000000000000",true,false)', adr('A1')).ast as CellReferenceAst
    expect(ast).toEqual(buildCellReferenceAst(CellAddress.absoluteCol(0, 0)))
  })

  it('relative cell reference', () => {
    const ast = parser.parse('=REF("cell","00000000-0000-0000-0000-000000000000",false,false)', adr('A1')).ast as CellReferenceAst
    expect(ast).toEqual(buildCellReferenceAst(CellAddress.relative(0, 0)))
  })

  it('cell reference with sheet defined', () => {
    const ast = parser.parse('=REF("cell","00000000-0000-0000-0000-000000000000",true,true,true)', adr('A1')).ast as CellReferenceAst
    expect(ast).toEqual(buildCellReferenceAst(CellAddress.absolute(0, 0, 0)))
  })

  it('cell range', () => {
    const ast = parser.parse('=REF("cell","00000000-0000-0000-0000-000000000000",true,true):REF("cell","00000000-0000-0000-0000-000000000000",true,true)', adr('A1')).ast as CellRangeAst
    
    expect(ast).toEqual(buildCellRangeAst(
      CellAddress.absolute(0, 0),
      CellAddress.absolute(0, 0),
      RangeSheetReferenceType.RELATIVE
    ))
  })

  it('row range', () => {
    let ast 

    ast = parser.parse('=REF("row","00000000-0000-0000-0000-000000000000",false):REF("row","00000000-0000-0000-0000-000000000000",false)', adr('A1')).ast as RowRangeAst
    expect(ast).toEqual(buildRowRangeAst(
      RowAddress.relative(0),
      RowAddress.relative(0),
      RangeSheetReferenceType.RELATIVE
    ))

    ast = parser.parse('=REF("row","00000000-0000-0000-0000-000000000000",true):REF("row","00000000-0000-0000-0000-000000000000",true)', adr('A1')).ast as RowRangeAst
    expect(ast).toEqual(buildRowRangeAst(
      RowAddress.absolute(0),
      RowAddress.absolute(0),
      RangeSheetReferenceType.RELATIVE
    ))

    ast = parser.parse('=REF("row","00000000-0000-0000-0000-000000000000",false):REF("row","00000000-0000-0000-0000-000000000000",true)', adr('A1')).ast as RowRangeAst
    expect(ast).toEqual(buildRowRangeAst(
      RowAddress.relative(0),
      RowAddress.absolute(0),
      RangeSheetReferenceType.RELATIVE
    ))

    ast = parser.parse('=REF("row","00000000-0000-0000-0000-000000000000",true):REF("row","00000000-0000-0000-0000-000000000000",false)', adr('A1')).ast as RowRangeAst
    expect(ast).toEqual(buildRowRangeAst(
      RowAddress.absolute(0),
      RowAddress.relative(0),
      RangeSheetReferenceType.RELATIVE
    ))
  })

  it('col range', () => {
    let ast
    ast = parser.parse('=REF("col","00000000-0000-0000-0000-000000000000",false):REF("col","00000000-0000-0000-0000-000000000000",false)', adr('A1')).ast as ColumnRangeAst
    
    expect(ast).toEqual(buildColumnRangeAst(
      ColumnAddress.relative(0),
      ColumnAddress.relative(0),
      RangeSheetReferenceType.RELATIVE
    ))

    ast = parser.parse('=REF("col","00000000-0000-0000-0000-000000000000",true):REF("col","00000000-0000-0000-0000-000000000000",true)', adr('A1')).ast as ColumnRangeAst
    
    expect(ast).toEqual(buildColumnRangeAst(
      ColumnAddress.absolute(0),
      ColumnAddress.absolute(0),
      RangeSheetReferenceType.RELATIVE
    ))

    ast = parser.parse('=REF("col","00000000-0000-0000-0000-000000000000",false):REF("col","00000000-0000-0000-0000-000000000000",true)', adr('A1')).ast as ColumnRangeAst
    
    expect(ast).toEqual(buildColumnRangeAst(
      ColumnAddress.relative(0),
      ColumnAddress.absolute(0),
      RangeSheetReferenceType.RELATIVE
    ))

    ast = parser.parse('=REF("col","00000000-0000-0000-0000-000000000000",true):REF("col","00000000-0000-0000-0000-000000000000",false)', adr('A1')).ast as ColumnRangeAst
    
    expect(ast).toEqual(buildColumnRangeAst(
      ColumnAddress.absolute(0),
      ColumnAddress.relative(0),
      RangeSheetReferenceType.RELATIVE
    ))
  })
})

describe('unparser should return REF', () => {

  const rowMap = new Map()
  rowMap.set('00000000-0000-0000-0000-000000000000', { id: '00000000-0000-0000-0000-000000000000', index: 0, sheet: 0 })
  
  const colMap = new Map()
  colMap.set('00000000-0000-0000-0000-000000000000', { id: '00000000-0000-0000-0000-000000000000', index: 0, sheet: 0 })
  
  const cellMap = new Map()
  cellMap.set('00000000-0000-0000-0000-000000000000', { id: '00000000-0000-0000-0000-000000000000', row: '00000000-0000-0000-0000-000000000000', col: '00000000-0000-0000-0000-000000000000' })

  const refMapping = new ImmutableReferenceMappingTestImpl({
    cells: cellMap,
    rows: rowMap,
    cols: colMap,
  })

  const idMapping = new ImmutableIdMappingTestImpl({
    cells: cellMap,
    rows: rowMap,
    cols: colMap,
  })

  const config = new Config()
  const lexerConfig = buildLexerConfig(config)
  const sheetMapping = new SheetMapping(config.translationPackage)
  const parser = buildEmptyParserWithCaching(config, sheetMapping, refMapping)
  const namedExpressions = new NamedExpressions()
  const unparser = new Unparser(config, lexerConfig, sheetMapping.fetchDisplayName, namedExpressions, idMapping)

  describe('cell reference', () => {
    it('relative', () => {
      const formula = '=REF("cell","00000000-0000-0000-0000-000000000000",false,false,false)'
      const ast = parser.parse(formula, adr('A1')).ast
      const unparsedImmutable = unparser.unparseImmutable(ast, adr('A1'))
      expect(unparsedImmutable).toEqual(formula)
      const unparsed = unparser.unparse(ast, adr('A1'))
      expect(unparsed).toEqual('=A1')
    })
    it('absolute col', () => {
      const formula = '=REF("cell","00000000-0000-0000-0000-000000000000",true,false,false)'
      const ast = parser.parse(formula, adr('A1')).ast
      const unparsedImmutable = unparser.unparseImmutable(ast, adr('A1'))
      expect(unparsedImmutable).toEqual(formula)
      const unparsed = unparser.unparse(ast, adr('A1'))
      expect(unparsed).toEqual('=$A1')
    })
    it('absolute row', () => {
      const formula = '=REF("cell","00000000-0000-0000-0000-000000000000",false,true,false)'
      const ast = parser.parse(formula, adr('A1')).ast
      const unparsedImmutable = unparser.unparseImmutable(ast, adr('A1'))
      expect(unparsedImmutable).toEqual(formula)
      const unparsed = unparser.unparse(ast, adr('A1'))
      expect(unparsed).toEqual('=A$1')
    })
    it('absolute', () => {
      const formula = '=REF("cell","00000000-0000-0000-0000-000000000000",true,true,false)'
      const ast = parser.parse(formula, adr('A1')).ast
      const unparsedImmutable = unparser.unparseImmutable(ast, adr('A1'))
      expect(unparsedImmutable).toEqual(formula)
      const unparsed = unparser.unparse(ast, adr('A1'))
      expect(unparsed).toEqual('=$A$1')
    })
  })

  it('cell range', () => {
    const formula = '=REF("cell","00000000-0000-0000-0000-000000000000",false,false,false):REF("cell","00000000-0000-0000-0000-000000000000",false,false,false)'
    const ast = parser.parse(formula, adr('A1')).ast
    const unparsedImmutable = unparser.unparseImmutable(ast, adr('A1'))
    expect(unparsedImmutable).toEqual(formula)
    const unparsed = unparser.unparse(ast, adr('A1'))
    expect(unparsed).toEqual('=A1:A1')
  })

  describe('row range', () => {
    it('relative', () => {
      const formula = '=REF("row","00000000-0000-0000-0000-000000000000",false,false):REF("row","00000000-0000-0000-0000-000000000000",false,false)'
      const ast = parser.parse(formula, adr('A1')).ast
      const unparsedImmutable = unparser.unparseImmutable(ast, adr('A1'))
      expect(unparsedImmutable).toEqual(formula)
      const unparsed = unparser.unparse(ast, adr('A1'))
      expect(unparsed).toEqual('=1:1')
    })
    it('absolute', () => {
      const formula = '=REF("row","00000000-0000-0000-0000-000000000000",true,false):REF("row","00000000-0000-0000-0000-000000000000",true,false)'
      const ast = parser.parse(formula, adr('A1')).ast
      const unparsedImmutable = unparser.unparseImmutable(ast, adr('A1'))
      expect(unparsedImmutable).toEqual(formula)
      const unparsed = unparser.unparse(ast, adr('A1'))
      expect(unparsed).toEqual('=$1:$1')
    })
  })

  describe('col range', () => {
    it('relative', () => {
      const formula = '=REF("col","00000000-0000-0000-0000-000000000000",false,false):REF("col","00000000-0000-0000-0000-000000000000",false,false)'
      const ast = parser.parse(formula, adr('A1')).ast
      const unparsedImmutable = unparser.unparseImmutable(ast, adr('A1'))
      expect(unparsedImmutable).toEqual(formula)
      const unparsed = unparser.unparse(ast, adr('A1'))
      expect(unparsed).toEqual('=A:A')
    })
    it('absolute', () => {
      const formula = '=REF("col","00000000-0000-0000-0000-000000000000",true,false):REF("col","00000000-0000-0000-0000-000000000000",true,false)'
      const ast = parser.parse(formula, adr('A1')).ast
      const unparsedImmutable = unparser.unparseImmutable(ast, adr('A1'))
      expect(unparsedImmutable).toEqual(formula)
      const unparsed = unparser.unparse(ast, adr('A1'))
      expect(unparsed).toEqual('=$A:$A')
    })
  })
})

describe('parser with engine', () => {
  const rowMap = new Map()
  rowMap.set('00000000-0000-0000-0000-000000000000', { id: '00000000-0000-0000-0000-000000000000', index: 0, sheet: 0 })
  
  const colMap = new Map()
  colMap.set('00000000-0000-0000-0000-000000000000', { id: '00000000-0000-0000-0000-000000000000', index: 0, sheet: 0 })
  
  const cellMap = new Map()
  cellMap.set('00000000-0000-0000-0000-000000000000', { id: '00000000-0000-0000-0000-000000000000', row: '00000000-0000-0000-0000-000000000000', col: '00000000-0000-0000-0000-000000000000' })

  const refMapping = new ImmutableReferenceMapping({
    cells: cellMap,
    rows: rowMap,
    cols: colMap,
  })

  it('basic cell reference', () => {
    const addressMapping = new ImmutableAddressMapping(new AlwaysDense(), refMapping)

    const value = 1
    const formula = '=REF("cell","00000000-0000-0000-0000-000000000000",false,false,false)'
  
    const engine = HyperFormula.buildFromArray([[value, formula]], { addressMapping, licenseKey: 'gpl-v3' })
  
    expect(engine.getCellValue(adr('B1'))).toEqual(value)
    expect(engine.getCellSerialized(adr('B1'))).toEqual('=A1')
    expect(engine.getCellSerializedImmutable(adr('B1'))).toEqual(formula)
  })

  it('basic cell reference with sheet name', () => {
    const addressMapping = new ImmutableAddressMapping(new AlwaysDense(), refMapping)

    const value = 1
    const formula = '=REF("cell","00000000-0000-0000-0000-000000000000",false,false,true)'
  
    const engine = HyperFormula.buildFromArray([[value, formula]], { addressMapping, licenseKey: 'gpl-v3' })
  
    expect(engine.getCellValue(adr('B1'))).toEqual(value)
    expect(engine.getCellSerialized(adr('B1'))).toEqual('=Sheet1!A1')
    expect(engine.getCellSerializedImmutable(adr('B1'))).toEqual(formula)
  })

  it('basic cell reference with formula', () => {
    const addressMapping = new ImmutableAddressMapping(new AlwaysDense(), refMapping)

    const value = 1

    const cellRef = 'REF("cell","00000000-0000-0000-0000-000000000000",false,false,false)'
    const formula = `=${cellRef}+1`
  
    const engine = HyperFormula.buildFromArray([[value, formula]], { addressMapping, licenseKey: 'gpl-v3' })
  
    expect(engine.getCellValue(adr('B1'))).toEqual(value+1)
    expect(engine.getCellSerialized(adr('B1'))).toEqual('=A1+1')
    expect(engine.getCellSerializedImmutable(adr('B1'))).toEqual(formula)
  })

  it('basic col reference with formula', () => {
    const addressMapping = new ImmutableAddressMapping(new AlwaysDense(), refMapping)

    const value = 1
  
    const colRef = 'REF("col","00000000-0000-0000-0000-000000000000",false,false)'
    const formula = `=SUM(${colRef}:${colRef})`

    const engine = HyperFormula.buildFromArray([[value, formula]], { addressMapping, licenseKey: 'gpl-v3' })
  
    expect(engine.getCellValue(adr('B1'))).toEqual(value)
    expect(engine.getCellSerialized(adr('B1'))).toEqual('=SUM(A:A)')
    expect(engine.getCellSerializedImmutable(adr('B1'))).toEqual(formula)
  })

  it('basic row reference with formula', () => {
    const addressMapping = new ImmutableAddressMapping(new AlwaysDense(), refMapping)

    const value = 1

    const rowRef = 'REF("row","00000000-0000-0000-0000-000000000000",false,false)'
    const formula = `=SUM(${rowRef}:${rowRef})`
  
    const engine = HyperFormula.buildFromArray([[value], [formula]], { addressMapping, licenseKey: 'gpl-v3' })
  
    expect(engine.getCellValue(adr('A2'))).toEqual(value)
    expect(engine.getCellSerialized(adr('A2'))).toEqual('=SUM(1:1)')
    expect(engine.getCellSerializedImmutable(adr('A2'))).toEqual(formula)
  })
})

