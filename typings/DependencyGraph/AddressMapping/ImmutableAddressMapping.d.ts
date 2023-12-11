/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */
import { SimpleCellAddress, SimpleColumnAddress as SimpleColAddress, SimpleRowAddress } from '../../Cell';
import { RawCellContent } from '../../CellContentParser';
import { InterpreterValue } from '../../interpreter/InterpreterValue';
import { Maybe } from '../../Maybe';
import { SheetBoundaries } from '../../Sheet';
import { ColumnsSpan, RowsSpan } from '../../Span';
import { CellVertex } from '../Vertex';
import { ChooseAddressMapping } from './ChooseAddressMappingPolicy';
import { AddressMappingStrategy } from './AddressMappingStrategy';
import { AddressMapping } from '../index';
import { ImmutableIdMapping } from '../ImmutableRefMapping';
export declare class ImmutableAddressMapping extends AddressMapping {
    readonly policy: ChooseAddressMapping;
    readonly immutableMapping: ImmutableIdMapping;
    constructor(policy: ChooseAddressMapping, immutableMapping: ImmutableIdMapping);
    getCellId(address: SimpleCellAddress): any;
    hasCellId(address: SimpleCellAddress): boolean;
    setCellId(address: SimpleCellAddress, id: string): void;
    getColId(address: SimpleColAddress): string | undefined;
    getRowId(address: SimpleRowAddress): string | undefined;
    /** @inheritDoc */
    getCell(address: SimpleCellAddress): Maybe<CellVertex>;
    fetchCell(address: SimpleCellAddress): CellVertex;
    strategyFor(sheetId: number): AddressMappingStrategy;
    addSheet(sheetId: number, strategy: AddressMappingStrategy): void;
    autoAddSheet(sheetId: number, sheetBoundaries: SheetBoundaries): void;
    getCellValue(address: SimpleCellAddress): InterpreterValue;
    getRawValue(address: SimpleCellAddress): RawCellContent;
    /** @inheritDoc */
    setCell(address: SimpleCellAddress, newVertex: CellVertex): void;
    moveCell(source: SimpleCellAddress, destination: SimpleCellAddress): void;
    removeCell(address: SimpleCellAddress): void;
    /** @inheritDoc */
    has(address: SimpleCellAddress): boolean;
    /** @inheritDoc */
    getHeight(sheetId: number): number;
    /** @inheritDoc */
    getWidth(sheetId: number): number;
    addRows(sheet: number, row: number, numberOfRows: number): void;
    removeRows(removedRows: RowsSpan): void;
    removeSheet(sheetId: number): void;
    addColumns(sheet: number, column: number, numberOfColumns: number): void;
    removeColumns(removedColumns: ColumnsSpan): void;
    verticesFromRowsSpan(rowsSpan: RowsSpan): IterableIterator<CellVertex>;
    verticesFromColumnsSpan(columnsSpan: ColumnsSpan): IterableIterator<CellVertex>;
    entriesFromRowsSpan(rowsSpan: RowsSpan): IterableIterator<[SimpleCellAddress, CellVertex]>;
    entriesFromColumnsSpan(columnsSpan: ColumnsSpan): IterableIterator<[SimpleCellAddress, CellVertex]>;
    entries(): IterableIterator<[SimpleCellAddress, Maybe<CellVertex>]>;
    sheetEntries(sheet: number): IterableIterator<[SimpleCellAddress, CellVertex]>;
}
