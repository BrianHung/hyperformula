import {Config, HandsOnEngine} from '../../src'
import {AbsoluteCellRange} from '../../src/AbsoluteCellRange'
import { simpleCellAddress} from '../../src/Cell'
import { FormulaCellVertex, MatrixVertex} from '../../src/DependencyGraph'
import '../testConfig'
import {adr, extractMatrixRange, extractRange} from '../testUtils'

describe('Adding column - matrix check', () => {
  it('raise error if trying to add a row in a row with matrix', () => {
    const engine = HandsOnEngine.buildFromArray([
      ['1', '2'],
      ['3', '4'],
      ['{=TRANSPOSE(A1:B2)}', '{=TRANSPOSE(A1:B2)}'],
      ['{=TRANSPOSE(A1:B2)}', '{=TRANSPOSE(A1:B2)}'],
      ['13'],
    ])

    expect(() => {
      engine.addColumns(0, 0, 1)
    }).toThrow(new Error('It is not possible to add column in column with matrix'))

    expect(() => {
      engine.addColumns(0, 0, 1)
    }).toThrow(new Error('It is not possible to add column in column with matrix'))
  })
})

describe('Adding column - reevaluation', () => {
  it('reevaluates cells', () => {
    const engine = HandsOnEngine.buildFromArray([
      ['1', /* new col */ '2', '=COUNTBLANK(A1:B1)'],
    ])

    expect(engine.getCellValue('C1')).toEqual(0)
    engine.addColumns(0, 1, 1)
    expect(engine.getCellValue('D1')).toEqual(1)
  })

  it('dont reevaluate everything', () => {
    const engine = HandsOnEngine.buildFromArray([
      ['1', /* new col */ '2', '=COUNTBLANK(A1:B1)'],
      ['=SUM(A1:A1)'],
    ])
    const c1 = engine.addressMapping.getCell(adr('C1'))
    const a2 = engine.addressMapping.getCell(adr('A2'))
    const c1setCellValueSpy = jest.spyOn(c1 as any, 'setCellValue')
    const a2setCellValueSpy = jest.spyOn(a2 as any, 'setCellValue')

    engine.addColumns(0, 1, 1)

    expect(a2setCellValueSpy).not.toHaveBeenCalled()
    expect(c1setCellValueSpy).toHaveBeenCalled()
  })

  it('reevaluates cells which are dependent on structure changes', () => {
    const engine = HandsOnEngine.buildFromArray([
      ['1', /* */ '2', '=COLUMNS(A1:B1)'],
    ])
    const c1 = engine.addressMapping.getCell(adr('C1'))
    const c1setCellValueSpy = jest.spyOn(c1 as any, 'setCellValue')

    engine.addColumns(0, 1, 1)

    expect(c1setCellValueSpy).toHaveBeenCalled()
    expect(extractRange(engine, adr('D1'))).toEqual(new AbsoluteCellRange(adr('A1'), adr('C1')))
  })
})

describe('Adding column - FormulaCellVertex#address update', () => {
  it('updates addresses in formulas', () => {
    const engine = HandsOnEngine.buildFromArray([
      ['1', /* new col */ '=A1'],
    ])

    engine.addColumns(0, 1, 1)

    const c1 = engine.addressMapping.getCell(adr('C1')) as FormulaCellVertex
    expect(c1).toBeInstanceOf(FormulaCellVertex)
    expect(c1.getAddress(engine.lazilyTransformingAstService)).toEqual(adr('C1'))
  })
})

describe('Adding column', () => {
  it('MatrixVertex#formula should be updated', () => {
    const engine = HandsOnEngine.buildFromArray([
      ['1', '2', '{=TRANSPOSE(A1:B2)}', '{=TRANSPOSE(A1:B2)}'],
      ['3', '4', '{=TRANSPOSE(A1:B2)}', '{=TRANSPOSE(A1:B2)}'],
    ])

    engine.addColumns(0, 1, 1)

    expect(extractMatrixRange(engine, adr('D1'))).toEqual(new AbsoluteCellRange(adr('A1'), adr('C2')))
  })

  it('MatrixVertex#address should be updated', () => {
    const engine = HandsOnEngine.buildFromArray([
      ['1', '2', '{=TRANSPOSE(A1:B2)}', '{=TRANSPOSE(A1:B2)}'],
      ['3', '4', '{=TRANSPOSE(A1:B2)}', '{=TRANSPOSE(A1:B2)}'],
    ])

    engine.addColumns(0, 1, 1)

    const matrixVertex = engine.addressMapping.fetchCell(adr('D1')) as MatrixVertex
    expect(matrixVertex.cellAddress).toEqual(adr('D1'))
  })

  it('MatrixVertex#formula should be updated when different sheets', () => {
    const engine = HandsOnEngine.buildFromSheets({
      Sheet1: [
        ['1', '2'],
        ['3', '4'],
      ],
      Sheet2: [
        ['{=TRANSPOSE($Sheet1.A1:B2)}', '{=TRANSPOSE($Sheet1.A1:B2)}'],
        ['{=TRANSPOSE($Sheet1.A1:B2)}', '{=TRANSPOSE($Sheet1.A1:B2)}'],
      ],
    })

    engine.addColumns(0, 1, 1)

    expect(extractMatrixRange(engine, adr('A1', 1))).toEqual(new AbsoluteCellRange(adr('A1'), adr('C2')))
  })
})

describe('Adding column', () => {
  it('add column inside numeric matrix, expand matrix', () => {
    const config = new Config({ matrixDetection: true, matrixDetectionThreshold: 1})
    const engine = HandsOnEngine.buildFromArray([
      ['1', '2'],
      ['3', '4'],
    ], config)

    expect(engine.getCellValue('B1')).toEqual(2)

    engine.addColumns(0, 1, 2)

    expect(engine.getCellValue('B1')).toEqual(0)
    expect(engine.getCellValue('C1')).toEqual(0)
    expect(engine.getCellValue('D1')).toEqual(2)
  })
})

describe('Adding column - address mapping', () => {
  it('verify sheet dimensions', () => {
    const engine = HandsOnEngine.buildFromArray([
      ['1', /* new col */ '=A1'],
    ])

    engine.addColumns(0, 1, 1)

    expect(engine.getSheetDimensions(0)).toEqual({
      width: 3,
      height: 1,
    })
  })
})

describe('different sheet', () => {
  it('adding row in different sheet but same row as formula should not update formula address', () => {
    const engine = HandsOnEngine.buildFromSheets({
      Sheet1: [
        ['1'],
      ],
      Sheet2: [
        ['=$Sheet1.A1'],
      ],
    })

    engine.addColumns(0, 0, 1)

    const formulaVertex = engine.addressMapping.fetchCell(adr('A1', 1)) as FormulaCellVertex

    expect(formulaVertex.address).toEqual(simpleCellAddress(1, 0, 0))
    formulaVertex.getFormula(engine.lazilyTransformingAstService) // force transformations to be applied
    expect(formulaVertex.address).toEqual(simpleCellAddress(1, 0, 0))
  })
})