/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */
import { SimpleCellAddress } from '../Cell';
import { CellValueChange } from '../ContentChanges';
import { DependencyGraph } from '../DependencyGraph';
import { RawNoErrorScalarValue, RawScalarValue } from '../interpreter/InterpreterValue';
import { SimpleRangeValue } from '../SimpleRangeValue';
import { ColumnsSpan } from '../Span';
import { AdvancedFind } from './AdvancedFind';
import { ColumnSearchStrategy, SearchOptions } from './SearchStrategy';
export declare class ColumnBinarySearch extends AdvancedFind implements ColumnSearchStrategy {
    protected dependencyGraph: DependencyGraph;
    constructor(dependencyGraph: DependencyGraph);
    add(value: RawScalarValue, address: SimpleCellAddress): void;
    remove(value: RawScalarValue | undefined, address: SimpleCellAddress): void;
    change(oldValue: RawScalarValue | undefined, newValue: RawScalarValue, address: SimpleCellAddress): void;
    applyChanges(contentChanges: CellValueChange[]): void;
    addColumns(columnsSpan: ColumnsSpan): void;
    removeColumns(columnsSpan: ColumnsSpan): void;
    removeSheet(sheetId: number): void;
    moveValues(sourceRange: IterableIterator<[RawScalarValue, SimpleCellAddress]>, toRight: number, toBottom: number, toSheet: number): void;
    removeValues(range: IterableIterator<[RawScalarValue, SimpleCellAddress]>): void;
    find(searchKey: RawNoErrorScalarValue, rangeValue: SimpleRangeValue, searchOptions: SearchOptions): number;
}
