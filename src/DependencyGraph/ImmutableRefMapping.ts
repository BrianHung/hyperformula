/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */

import {addressKey, SimpleCellAddress} from '../Cell'
import {SimpleColumnAddress as SimpleColAddress, SimpleRowAddress} from '../Cell'

export interface ImmutableIdMapping {
  getRowId(address: SimpleRowAddress): string | undefined,
  getColId(address: SimpleColAddress): string | undefined,
  getCellId(address: SimpleCellAddress): string | undefined,
}

export interface ImmutableReferenceMapping {
  getRowIndex(id: string): { sheet: number, index: number } | undefined,
  getColIndex(id: string): { sheet: number, index: number } | undefined,
  getCellAddress(id: string): SimpleCellAddress | undefined,
}

/**
 * Basic implementation of a ImmutableReferenceMapping.
 */
export class ImmutableReferenceMappingTestImpl implements ImmutableReferenceMapping {

  cols: Map<string, { id: string, order: string, sheet: number }> = new Map()
  rows: Map<string, { id: string, order: string, sheet: number }> = new Map()
  cells: Map<string, { id: string, row: string, col: string }> = new Map()

  constructor({ 
    cols, 
    rows, 
    cells 
  }: { 
    cols: Map<string, { id: string, order: string, sheet: number }>, 
    rows: Map<string, { id: string, order: string, sheet: number }>, 
    cells: Map<string, { id: string, row: string, col: string }>, 
  } = {} as any) {
    this.cols = cols ?? new Map()
    this.rows = rows ?? new Map()
    this.cells = cells ?? new Map()
  }

  private get sortedRows() {
    return Array.from(this.rows.values())
    .sort((x, y) => (x.order < y.order ? -1 : 1))
  }

  private get sortedCols() {
    return Array.from(this.cols.values())
    .sort((x, y) => (x.order < y.order ? -1 : 1))
  }

  public getRowId({sheet, row}: SimpleRowAddress): string {
    return this.sortedRows[row]?.id
  }

  public getColId({sheet, col}: SimpleColAddress): string {
    return this.sortedRows[col]?.id
  }

  public getCellId(address: SimpleCellAddress) {
    const rowId = this.getRowId(address)
    const colId = this.getColId(address)
    const cell = Array.from(this.cells.values()).find(cell => cell.row === rowId && cell.col === colId)
    return cell?.id
  }

  getRowIndex(id: string): { sheet: number, index: number } | undefined {
    const index = this.sortedRows.findIndex(row => row.id === id)
    if (index === -1) return undefined
    return { index, sheet: 0 }
  }

  getColIndex(id: string): { sheet: number, index: number } | undefined {
    const index = this.sortedCols.findIndex(row => row.id === id)
    if (index === -1) return undefined
    return { index, sheet: 0 }
  }

  public getCellAddress(id: string): SimpleCellAddress | undefined {
    const cell = this.cells.get(id)
    if (cell === undefined) return undefined
    const row = this.getRowIndex(cell.row)
    const col = this.getColIndex(cell.col)
    if (row === undefined || col === undefined) return undefined
    if (row.sheet !== col.sheet) throw Error()
    return { sheet: 0, row: row.index, col: col.index }
  }
}

/**
 * Basic implementation of a ImmutableIdMapping.
 */
export class ImmutableIdMappingTestImpl extends ImmutableReferenceMappingTestImpl implements ImmutableIdMapping {

  cellsToId: Map<string, string> = new Map()

  constructor(props: any) {
    super(props)
    this.cells.forEach(({ id, row: r, col: c }) => {
      const row = this.getRowIndex(r)?.index
      const col = this.getColIndex(c)?.index
      if (row === undefined || col === undefined) return
      this.cellsToId.set(addressKey({ sheet: 0, row, col }), id)
    })
  }

  public getCellId(address: SimpleCellAddress) {
    return this.cellsToId.get(addressKey(address))
  }
}