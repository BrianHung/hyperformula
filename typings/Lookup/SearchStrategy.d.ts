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
export interface SearchOptions {
    ordering: 'asc' | 'desc' | 'none';
    matchExactly?: boolean;
}
export interface SearchStrategy {
    find(searchKey: RawNoErrorScalarValue, range: SimpleRangeValue, options: SearchOptions): number;
    advancedFind(keyMatcher: (arg: RawInterpreterValue) => boolean, range: SimpleRangeValue): number;
}
export interface ColumnSearchStrategy extends SearchStrategy {
    add(value: RawInterpreterValue, address: SimpleCellAddress): void;
    remove(value: RawInterpreterValue | undefined, address: SimpleCellAddress): void;
    change(oldValue: RawInterpreterValue | undefined, newValue: RawInterpreterValue, address: SimpleCellAddress): void;
    applyChanges(contentChanges: CellValueChange[]): void;
    addColumns(columnsSpan: ColumnsSpan): void;
    removeColumns(columnsSpan: ColumnsSpan): void;
    removeSheet(sheetId: number): void;
    moveValues(range: IterableIterator<[RawScalarValue, SimpleCellAddress]>, toRight: number, toBottom: number, toSheet: number): void;
    removeValues(range: IterableIterator<[RawScalarValue, SimpleCellAddress]>): void;
}
export declare function buildColumnSearchStrategy(dependencyGraph: DependencyGraph, config: Config, statistics: Statistics): ColumnSearchStrategy;