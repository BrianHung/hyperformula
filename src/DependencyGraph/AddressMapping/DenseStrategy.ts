import {CellVertex} from "../Vertex";
import {SheetCellAddress, simpleCellAddress, SimpleCellAddress} from "../../Cell";
import {RowsSpan} from "../../RowsSpan";
import {ColumnsSpan} from "../../ColumnsSpan";
import {IAddressMappingStrategy} from "./IAddressMappingStrategy";

/**
 * Mapping from cell addresses to vertices
 *
 * Uses Array to store addresses, having minimal memory usage for dense sheets and constant set/lookup.
 */
export class DenseStrategy implements IAddressMappingStrategy {
  /**
   * Array in which actual data is stored.
   *
   * It is created when building the mapping and the size of it is fixed.
   */
  private readonly mapping: CellVertex[][]

  /**
   * @param width - width of the stored sheet
   * @param height - height of the stored sheet
   */
  constructor(private width: number, private height: number) {
    this.mapping = new Array(height)
    for (let i = 0; i < height; i++) {
      this.mapping[i] = new Array(width)
    }
  }

  /** @inheritDoc */
  public getCell(address: SheetCellAddress): CellVertex | null {
    const row = this.mapping[address.row]
    if (!row) {
      return null
    }
    return row[address.col] || null
  }

  /** @inheritDoc */
  public setCell(address: SheetCellAddress, newVertex: CellVertex) {
    this.width = Math.max(this.width, address.col + 1)
    this.height = Math.max(this.height, address.row + 1)

    const rowMapping = this.mapping[address.row]
    if (!rowMapping) {
      this.mapping[address.row] = new Array(this.width)
    }
    this.mapping[address.row][address.col] = newVertex
  }

  /** @inheritDoc */
  public has(address: SheetCellAddress): boolean {
    const row = this.mapping[address.row]
    if (!row) {
      return false
    }
    return !!row[address.col]
  }

  /** @inheritDoc */
  public getHeight(): number {
    return this.height
  }

  /** @inheritDoc */
  public getWidth(): number {
    return this.width
  }

  public removeCell(address: SimpleCellAddress): void {
    if (this.mapping[address.row] !== undefined) {
      delete this.mapping[address.row][address.col]
    }
  }

  public addRows(row: number, numberOfRows: number): void {
    const newRows = []
    for (let i = 0; i < numberOfRows; i++) {
      newRows.push(new Array(this.width))
    }
    this.mapping.splice(row, 0, ...newRows)
    this.height += numberOfRows
  }

  public addColumns(column: number, numberOfColumns: number): void {
    for (let i = 0; i < this.height; i++) {
      this.mapping[i].splice(column, 0, ...new Array(numberOfColumns))
    }
    this.width += numberOfColumns
  }

  public removeRows(removedRows: RowsSpan): void {
    this.mapping.splice(removedRows.rowStart, removedRows.numberOfRows)
    const rightmostRowRemoved = Math.min(this.height - 1, removedRows.rowEnd)
    const numberOfRowsRemoved = Math.max(0, rightmostRowRemoved - removedRows.rowStart + 1)
    this.height = Math.max(0, this.height - numberOfRowsRemoved)
  }

  public removeColumns(removedColumns: ColumnsSpan): void {
    for (let i = 0; i < this.height; i++) {
      this.mapping[i].splice(removedColumns.columnStart, removedColumns.numberOfColumns)
    }
    const rightmostColumnRemoved = Math.min(this.width - 1, removedColumns.columnEnd)
    const numberOfColumnsRemoved = Math.max(0, rightmostColumnRemoved - removedColumns.columnStart + 1)
    this.width = Math.max(0, this.width - numberOfColumnsRemoved)
  }

  public* getEntries(sheet: number): IterableIterator<[SimpleCellAddress, CellVertex | null]> {
    for (let y = 0; y < this.height; ++y) {
      for (let x = 0; x < this.width; ++x) {
        yield [simpleCellAddress(sheet, x, y), this.mapping[y][x]]
      }
    }
  }

  public* verticesFromColumn(column: number): IterableIterator<CellVertex> {
    for (let y = 0; y < this.height; ++y) {
      const vertex = this.mapping[y][column]
      if (vertex) {
        yield vertex
      }
    }
  }

  public* verticesFromRow(row: number): IterableIterator<CellVertex> {
    for (let x = 0; x < this.width; ++x) {
      const vertex = this.mapping[row][x]
      if (vertex) {
        yield vertex
      }
    }
  }

  public* verticesFromColumnsSpan(columnsSpan: ColumnsSpan): IterableIterator<CellVertex> {
    for (let x = columnsSpan.columnStart; x <= columnsSpan.columnEnd; ++x) {
      for (let y = 0; y < this.height; ++y) {
        const vertex = this.mapping[y][x]
        if (vertex) {
          yield vertex
        }
      }
    }
  }

  public* verticesFromRowsSpan(rowsSpan: RowsSpan): IterableIterator<CellVertex> {
    for (let x = 0; x < this.width; ++x) {
      for (let y = rowsSpan.rowStart; y <= rowsSpan.rowEnd; ++y) {
        const vertex = this.mapping[y][x]
        if (vertex) {
          yield vertex
        }
      }
    }
  }

  public* vertices(): IterableIterator<CellVertex> {
    for (let y = 0; y < this.height; ++y) {
      for (let x = 0; x < this.width; ++x) {
        const vertex = this.mapping[y][x]
        if (vertex) {
          yield vertex
        }
      }
    }
  }
}