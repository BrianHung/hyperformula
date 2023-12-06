/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */
import { ArraySize } from './ArraySize';
import { CellError } from './Cell';
import { InternalScalarValue, InterpreterValue } from './interpreter/InterpreterValue';
import { SimpleRangeValue } from './SimpleRangeValue';
export interface CellArray {
    size: ArraySize;
    width(): number;
    height(): number;
    get(col: number, row: number): InternalScalarValue;
    simpleRangeValue(): SimpleRangeValue | CellError;
}
export declare class NotComputedArray implements CellArray {
    readonly size: ArraySize;
    constructor(size: ArraySize);
    width(): number;
    height(): number;
    get(col: number, row: number): number;
    simpleRangeValue(): SimpleRangeValue;
}
export declare class ArrayValue implements CellArray {
    size: ArraySize;
    private readonly array;
    constructor(array: InternalScalarValue[][]);
    static fromInterpreterValue(value: InterpreterValue): ArrayValue;
    simpleRangeValue(): SimpleRangeValue;
    addRows(aboveRow: number, numberOfRows: number): void;
    addColumns(aboveColumn: number, numberOfColumns: number): void;
    removeRows(startRow: number, endRow: number): void;
    removeColumns(leftmostColumn: number, rightmostColumn: number): void;
    nullArrays(count: number, size: number): any[][];
    get(col: number, row: number): InternalScalarValue;
    set(col: number, row: number, value: number): void;
    width(): number;
    height(): number;
    raw(): InternalScalarValue[][];
    resize(newSize: ArraySize): void;
    private outOfBound;
}
export declare class ErroredArray implements CellArray {
    private readonly error;
    readonly size: ArraySize;
    constructor(error: CellError, size: ArraySize);
    get(col: number, row: number): CellError;
    width(): number;
    height(): number;
    simpleRangeValue(): CellError;
}
