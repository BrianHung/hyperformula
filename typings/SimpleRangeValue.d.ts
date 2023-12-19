/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */
import { AbsoluteCellRange } from './AbsoluteCellRange';
import { ArraySize } from './ArraySize';
import { SimpleCellAddress } from './Cell';
import { DependencyGraph } from './DependencyGraph';
import { InternalScalarValue } from './interpreter/InterpreterValue';
/**
 * A class that represents a range of data.
 */
export declare class SimpleRangeValue {
    private _data?;
    /**
     * A property that represents the address of the range.
     */
    readonly range?: AbsoluteCellRange | undefined;
    private readonly dependencyGraph?;
    private _hasOnlyNumbers?;
    /**
     * A property that represents the size of the range.
     */
    readonly size: ArraySize;
    /**
     * In most cases, it's more convenient to create a `SimpleRangeValue` object
     * by calling one of the [static factory methods](#fromrange).
     */
    constructor(_data?: InternalScalarValue[][] | undefined, 
    /**
     * A property that represents the address of the range.
     */
    range?: AbsoluteCellRange | undefined, dependencyGraph?: DependencyGraph | undefined, _hasOnlyNumbers?: boolean | undefined);
    /**
     * Returns the range data as a 2D array.
     */
    get data(): InternalScalarValue[][];
    /**
     * A factory method. Returns a `SimpleRangeValue` object with the provided range address and the provided data.
     */
    static fromRange(data: InternalScalarValue[][], range: AbsoluteCellRange, dependencyGraph: DependencyGraph): SimpleRangeValue;
    /**
     * A factory method. Returns a `SimpleRangeValue` object with the provided numeric data.
     */
    static onlyNumbers(data: number[][]): SimpleRangeValue;
    /**
     * A factory method. Returns a `SimpleRangeValue` object with the provided data.
     */
    static onlyValues(data: InternalScalarValue[][]): SimpleRangeValue;
    /**
     * A factory method. Returns a `SimpleRangeValue` object with the provided range address.
     */
    static onlyRange(range: AbsoluteCellRange, dependencyGraph: DependencyGraph): SimpleRangeValue;
    /**
     * A factory method. Returns a `SimpleRangeValue` object that contains a single value.
     */
    static fromScalar(scalar: InternalScalarValue): SimpleRangeValue;
    /**
     * Returns `true` if and only if the `SimpleRangeValue` has no address set.
     */
    isAdHoc(): boolean;
    /**
     * Returns the number of columns contained in the range.
     */
    width(): number;
    /**
     * Returns the number of rows contained in the range.
     */
    height(): number;
    /**
     * Returns the range data as a 1D array.
     */
    valuesFromTopLeftCorner(): InternalScalarValue[];
    /**
     * Generates the addresses of the cells contained in the range assuming the provided address is the left corner of the range.
     */
    effectiveAddressesFromData(leftCorner: SimpleCellAddress): IterableIterator<SimpleCellAddress>;
    /**
     * Generates values and addresses of the cells contained in the range assuming the provided address is the left corner of the range.
     *
     * This method combines the functionalities of [`iterateValuesFromTopLeftCorner()`](#iteratevaluesfromtopleftcorner) and [`effectiveAddressesFromData()`](#effectiveaddressesfromdata).
     */
    entriesFromTopLeftCorner(leftCorner: SimpleCellAddress): IterableIterator<[InternalScalarValue, SimpleCellAddress]>;
    /**
     * Generates the values of the cells contained in the range assuming the provided address is the left corner of the range.
     */
    iterateValuesFromTopLeftCorner(): IterableIterator<InternalScalarValue>;
    /**
     * Returns the number of cells contained in the range.
     */
    numberOfElements(): number;
    /**
     * Returns `true` if and only if the range contains only numeric values.
     */
    hasOnlyNumbers(): boolean;
    /**
     * Returns the range data as a 2D array of numbers.
     *
     * Internal use only.
     */
    rawNumbers(): number[][];
    /**
     * Returns the range data as a 2D array.
     *
     * Internal use only.
     */
    rawData(): InternalScalarValue[][];
    /**
     * Returns `true` if and only if the range has the same width and height as the `other` range object.
     */
    sameDimensionsAs(other: SimpleRangeValue): boolean;
    /**
     * Computes the range data if it is not computed yet.
     */
    private ensureThatComputed;
}