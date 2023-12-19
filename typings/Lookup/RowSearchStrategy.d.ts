/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */
import { DependencyGraph } from '../DependencyGraph';
import { RawNoErrorScalarValue } from '../interpreter/InterpreterValue';
import { SimpleRangeValue } from '../SimpleRangeValue';
import { AdvancedFind } from './AdvancedFind';
import { SearchOptions, SearchStrategy } from './SearchStrategy';
export declare class RowSearchStrategy extends AdvancedFind implements SearchStrategy {
    protected dependencyGraph: DependencyGraph;
    constructor(dependencyGraph: DependencyGraph);
    find(searchKey: RawNoErrorScalarValue, rangeValue: SimpleRangeValue, searchOptions: SearchOptions): number;
}