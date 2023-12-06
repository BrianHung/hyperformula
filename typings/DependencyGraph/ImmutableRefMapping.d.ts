/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */
import { SimpleCellAddress } from '../Cell';
import { SimpleColumnAddress as SimpleColAddress, SimpleRowAddress } from '../Cell';
export interface ImmutableIdMapping {
    getRowId(address: SimpleRowAddress): string;
    getColId(address: SimpleColAddress): string;
    getCellId(address: SimpleCellAddress): string;
}
export interface ImmutableReferenceMapping {
    getRowIndex(id: string): {
        sheet: number;
        index: number;
    };
    getColIndex(id: string): {
        sheet: number;
        index: number;
    };
    getCellAddress(id: string): SimpleCellAddress;
}
/**
 * Basic implementation of a ImmutableReferenceMapping.
 */
export declare class ImmutableReferenceMapping implements ImmutableReferenceMapping {
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
}
/**
 * Basic implementation of a ImmutableIdMapping.
 */
export declare class ImmutableIdMapping extends ImmutableReferenceMapping implements ImmutableIdMapping {
    cellsToId: Map<string, string>;
    constructor(props: any);
}
