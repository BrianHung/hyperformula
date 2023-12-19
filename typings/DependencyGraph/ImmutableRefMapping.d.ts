/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */
import { SimpleCellAddress } from '../Cell';
import { SimpleColumnAddress as SimpleColAddress, SimpleRowAddress } from '../Cell';
export interface ImmutableIdMapping {
    getRowId(address: SimpleRowAddress): string | undefined;
    getColId(address: SimpleColAddress): string | undefined;
    getCellId(address: SimpleCellAddress): string | undefined;
}
export interface ImmutableReferenceMapping {
    getRowIndex(id: string): SimpleRowAddress | undefined;
    getColIndex(id: string): SimpleColAddress | undefined;
    getCellAddress(id: string): SimpleCellAddress | undefined;
}
/**
 * Basic implementation of a ImmutableReferenceMapping.
 */
export declare class ImmutableReferenceMappingTestImpl implements ImmutableReferenceMapping {
    cols: Map<string, {
        id: string;
        order: string;
        sheet: number;
    }>;
    rows: Map<string, {
        id: string;
        order: string;
        sheet: number;
    }>;
    cells: Map<string, {
        id: string;
        row: string;
        col: string;
    }>;
    constructor({ cols, rows, cells }?: {
        cols: Map<string, {
            id: string;
            order: string;
            sheet: number;
        }>;
        rows: Map<string, {
            id: string;
            order: string;
            sheet: number;
        }>;
        cells: Map<string, {
            id: string;
            row: string;
            col: string;
        }>;
    });
    private get sortedRows();
    private get sortedCols();
    getRowId({ sheet, row }: SimpleRowAddress): string;
    getColId({ sheet, col }: SimpleColAddress): string;
    getCellId(address: SimpleCellAddress): string | undefined;
    getRowIndex(id: string): SimpleRowAddress | undefined;
    getColIndex(id: string): SimpleColAddress | undefined;
    getCellAddress(id: string): SimpleCellAddress | undefined;
}
/**
 * Basic implementation of a ImmutableIdMapping.
 */
export declare class ImmutableIdMappingTestImpl extends ImmutableReferenceMappingTestImpl implements ImmutableIdMapping {
    cellsToId: Map<string, string>;
    constructor(props: any);
    getCellId(address: SimpleCellAddress): string | undefined;
}
