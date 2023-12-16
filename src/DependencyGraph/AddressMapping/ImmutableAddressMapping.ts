/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */

import {SimpleCellAddress, SimpleColumnAddress as SimpleColAddress, SimpleRowAddress} from '../../Cell'
import {RawCellContent} from '../../CellContentParser'
import {NoSheetWithIdError} from '../../errors'
import {EmptyValue, InterpreterValue} from '../../interpreter/InterpreterValue'
import {Maybe} from '../../Maybe'
import {Sheet, SheetBoundaries} from '../../Sheet'
import {ColumnsSpan, RowsSpan} from '../../Span'
import {ArrayVertex, ValueCellVertex} from '../index'
import {CellVertex} from '../Vertex'
import {ChooseAddressMapping} from './ChooseAddressMappingPolicy'
import {AddressMappingStrategy} from './AddressMappingStrategy'
import {AddressMapping} from '../index'
import { ImmutableIdMapping } from '../ImmutableRefMapping'

export class ImmutableAddressMapping extends AddressMapping {

  constructor(
    public readonly policy: ChooseAddressMapping,
    public readonly immutableMapping: ImmutableIdMapping
  ) {
    super(policy)
  }

  public getCellId(address: SimpleCellAddress) {
    return (this.getCell(address) as any).id
  }

  setCellId(address: SimpleCellAddress, id: string) {
    const vertex = this.getCell(address)
    if (vertex) (vertex as any).id = id
  }

  public getColId(address: SimpleColAddress) {
    return this.immutableMapping.getColId(address)
  }

  public getRowId(address: SimpleRowAddress) {
    return this.immutableMapping.getRowId(address)
  }

  /** @inheritDoc */
  public getCell(address: SimpleCellAddress): Maybe<CellVertex> {
    const sheetMapping = this.mapping.get(address.sheet)
    if (sheetMapping === undefined) {
      throw new NoSheetWithIdError(address.sheet)
    }
    return sheetMapping.getCell(address)
  }

  public fetchCell(address: SimpleCellAddress): CellVertex {
    const sheetMapping = this.mapping.get(address.sheet)
    if (sheetMapping === undefined) {
      throw  new NoSheetWithIdError(address.sheet)
    }
    const vertex = sheetMapping.getCell(address)
    if (!vertex) {
      throw Error('Vertex for address missing in AddressMapping')
    }
    return vertex
  }

  public addSheet(sheetId: number, strategy: AddressMappingStrategy) {
    if (this.mapping.has(sheetId)) {
      throw Error('Sheet already added')
    }

    this.mapping.set(sheetId, strategy)
  }

  public autoAddSheet(sheetId: number, sheetBoundaries: SheetBoundaries) {
    const {height, width, fill} = sheetBoundaries
    const strategyConstructor = this.policy.call(fill)
    this.addSheet(sheetId, new strategyConstructor(width, height))
  }

  public getCellValue(address: SimpleCellAddress): InterpreterValue {
    const vertex = this.getCell(address)

    if (vertex === undefined) {
      return EmptyValue
    } else if (vertex instanceof ArrayVertex) {
      return vertex.getArrayCellValue(address)
    } else {
      return vertex.getCellValue()
    }
  }

  public getRawValue(address: SimpleCellAddress): RawCellContent {
    const vertex = this.getCell(address)
    if (vertex instanceof ValueCellVertex) {
      return vertex.getValues().rawValue
    } else if (vertex instanceof ArrayVertex) {
      return vertex.getArrayCellRawValue(address)
    } else {
      return null
    }
  }

  /** @inheritDoc */
  public setCell(address: SimpleCellAddress, newVertex: CellVertex) {
    const sheetMapping = this.mapping.get(address.sheet)
    if (!sheetMapping) {
      throw Error('Sheet not initialized')
    }
    // PERF: Optimize this using LazilyTransformingAstService version
    if ((newVertex as any).id === undefined) (newVertex as any).id = this.immutableMapping.getCellId(address)
    sheetMapping.setCell(address, newVertex)
  }

  public moveCell(source: SimpleCellAddress, destination: SimpleCellAddress) {
    const sheetMapping = this.mapping.get(source.sheet)
    if (!sheetMapping) {
      throw Error('Sheet not initialized.')
    }
    if (source.sheet !== destination.sheet) {
      throw Error('Cannot move cells between sheets.')
    }
    if (sheetMapping.has(destination)) {
      throw new Error('Cannot move cell. Destination already occupied.')
    }
    const vertex = sheetMapping.getCell(source)
    if (vertex === undefined) {
      throw new Error('Cannot move cell. No cell with such address.')
    }
    this.setCell(destination, vertex)
    this.removeCell(source)
  }

  public removeCell(address: SimpleCellAddress) {
    const sheetMapping = this.mapping.get(address.sheet)
    if (!sheetMapping) {
      throw Error('Sheet not initialized')
    }
    sheetMapping.removeCell(address)
  }

  /** @inheritDoc */
  public has(address: SimpleCellAddress): boolean {
    const sheetMapping = this.mapping.get(address.sheet)
    if (sheetMapping === undefined) {
      return false
    }
    return sheetMapping.has(address)
  }

  /** @inheritDoc */
  public getHeight(sheetId: number): number {
    const sheetMapping = this.mapping.get(sheetId)
    if (sheetMapping === undefined) {
      throw new NoSheetWithIdError(sheetId)
    }
    return sheetMapping.getHeight()
  }

  /** @inheritDoc */
  public getWidth(sheetId: number): number {
    const sheetMapping = this.mapping.get(sheetId)
    if (!sheetMapping) {
      throw new NoSheetWithIdError(sheetId)
    }
    return sheetMapping.getWidth()
  }

  public addRows(sheet: number, row: number, numberOfRows: number) {
    const sheetMapping = this.mapping.get(sheet)
    if (sheetMapping === undefined) {
      throw new NoSheetWithIdError(sheet)
    }
    sheetMapping.addRows(row, numberOfRows)
  }

  public removeRows(removedRows: RowsSpan) {
    const sheetMapping = this.mapping.get(removedRows.sheet)
    if (sheetMapping === undefined) {
      throw new NoSheetWithIdError(removedRows.sheet)
    }
    sheetMapping.removeRows(removedRows)
  }

  public removeSheet(sheetId: number) {
    this.mapping.delete(sheetId)
  }

  public addColumns(sheet: number, column: number, numberOfColumns: number) {
    const sheetMapping = this.mapping.get(sheet)
    if (sheetMapping === undefined) {
      throw new NoSheetWithIdError(sheet)
    }
    sheetMapping.addColumns(column, numberOfColumns)
  }

  public removeColumns(removedColumns: ColumnsSpan) {
    const sheetMapping = this.mapping.get(removedColumns.sheet)
    if (sheetMapping === undefined) {
      throw new NoSheetWithIdError(removedColumns.sheet)
    }
    sheetMapping.removeColumns(removedColumns)
  }
}
