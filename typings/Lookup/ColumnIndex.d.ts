/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */
import { SimpleCellAddress } from '../Cell';
import { Config } from '../Config';
import { CellValueChange } from '../ContentChanges';
import { DependencyGraph } from '../DependencyGraph';
import { RawInterpreterValue, RawNoErrorScalarValue, RawScalarValue } from '../interpreter/InterpreterValue';
import { SimpleRangeValue } from '../SimpleRangeValue';
import { ColumnsSpan } from '../Span';
import { Statistics } from '../statistics';
import { ColumnSearchStrategy, SearchOptions } from './SearchStrategy';
declare type ColumnMap = Map<RawInterpreterValue, ValueIndex>;
interface ValueIndex {
    version: number;
    index: number[];
}
export declare class ColumnIndex implements ColumnSearchStrategy {
    private readonly dependencyGraph;
    private readonly config;
    private readonly stats;
    private readonly index;
    private readonly transformingService;
    private readonly binarySearchStrategy;
    constructor(dependencyGraph: DependencyGraph, config: Config, stats: Statistics);
    add(value: RawInterpreterValue, address: SimpleCellAddress): void;
    remove(value: RawInterpreterValue | undefined, address: SimpleCellAddress): void;
    change(oldValue: RawInterpreterValue | undefined, newValue: RawInterpreterValue, address: SimpleCellAddress): void;
    applyChanges(contentChanges: CellValueChange[]): void;
    moveValues(sourceRange: IterableIterator<[RawScalarValue, SimpleCellAddress]>, toRight: number, toBottom: number, toSheet: number): void;
    removeValues(range: IterableIterator<[RawScalarValue, SimpleCellAddress]>): void;
    find(searchKey: RawNoErrorScalarValue, rangeValue: SimpleRangeValue, { ordering, matchExactly }: SearchOptions): number;
    private findUsingColumnIndex;
    private static findRowBelongingToRange;
    advancedFind(keyMatcher: (arg: RawInterpreterValue) => boolean, range: SimpleRangeValue): number;
    addColumns(columnsSpan: ColumnsSpan): void;
    removeColumns(columnsSpan: ColumnsSpan): void;
    removeSheet(sheetId: number): void;
    getColumnMap(sheet: number, col: number): ColumnMap;
    getValueIndex(sheet: number, col: number, value: RawInterpreterValue): ValueIndex;
    ensureRecentData(sheet: number, col: number, value: RawInterpreterValue): void;
    private addSingleCellValue;
    private removeSingleValue;
    private addRows;
    private removeRows;
    private static addValue;
    private static removeRowsFromValues;
    private static shiftRows;
}
export declare function findInOrderedArray(key: number, values: number[], handlingMisses?: 'lowerBound' | 'upperBound'): number;
export {};
