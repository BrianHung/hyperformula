/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */
import { AbsoluteCellRange } from '../AbsoluteCellRange';
import { DependencyGraph } from '../DependencyGraph';
import { RawInterpreterValue, RawNoErrorScalarValue } from './InterpreterValue';
export declare function findLastOccurrenceInOrderedRange(searchKey: RawNoErrorScalarValue, range: AbsoluteCellRange, { searchCoordinate, orderingDirection, matchExactly }: {
    searchCoordinate: 'row' | 'col';
    orderingDirection: 'asc' | 'desc';
    matchExactly?: boolean;
}, dependencyGraph: DependencyGraph): number;
export declare function findLastOccurrenceInOrderedArray(searchKey: RawNoErrorScalarValue, array: RawInterpreterValue[], orderingDirection?: 'asc' | 'desc'): number;
export declare function findLastMatchingIndex(predicate: (index: number) => boolean, startRange: number, endRange: number): number;
export declare function compare(left: RawNoErrorScalarValue, right: RawInterpreterValue): number;