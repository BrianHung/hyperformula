"use strict";

exports.__esModule = true;
exports.SimpleRangeValue = void 0;
var _ArraySize = require("./ArraySize");
var _Cell = require("./Cell");
var _errorMessage = require("./error-message");
var _InterpreterValue = require("./interpreter/InterpreterValue");
/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */

/**
 * A class that represents a range of data.
 */
class SimpleRangeValue {
  /**
   * In most cases, it's more convenient to create a `SimpleRangeValue` object
   * by calling one of the [static factory methods](#fromrange).
   */
  constructor(_data,
  /**
   * A property that represents the address of the range.
   */
  range, dependencyGraph, _hasOnlyNumbers) {
    this._data = _data;
    this.range = range;
    this.dependencyGraph = dependencyGraph;
    this._hasOnlyNumbers = _hasOnlyNumbers;
    this.size = _data === undefined ? new _ArraySize.ArraySize(range.effectiveWidth(dependencyGraph), range.effectiveHeight(dependencyGraph)) : new _ArraySize.ArraySize(_data[0].length, _data.length);
  }
  /**
   * Returns the range data as a 2D array.
   */
  get data() {
    this.ensureThatComputed();
    return this._data;
  }
  /**
   * A factory method. Returns a `SimpleRangeValue` object with the provided range address and the provided data.
   */
  static fromRange(data, range, dependencyGraph) {
    return new SimpleRangeValue(data, range, dependencyGraph, true);
  }
  /**
   * A factory method. Returns a `SimpleRangeValue` object with the provided numeric data.
   */
  static onlyNumbers(data) {
    return new SimpleRangeValue(data, undefined, undefined, true);
  }
  /**
   * A factory method. Returns a `SimpleRangeValue` object with the provided data.
   */
  static onlyValues(data) {
    return new SimpleRangeValue(data, undefined, undefined, undefined);
  }
  /**
   * A factory method. Returns a `SimpleRangeValue` object with the provided range address.
   */
  static onlyRange(range, dependencyGraph) {
    return new SimpleRangeValue(undefined, range, dependencyGraph, undefined);
  }
  /**
   * A factory method. Returns a `SimpleRangeValue` object that contains a single value.
   */
  static fromScalar(scalar) {
    return new SimpleRangeValue([[scalar]], undefined, undefined, undefined);
  }
  /**
   * Returns `true` if and only if the `SimpleRangeValue` has no address set.
   */
  isAdHoc() {
    return this.range === undefined;
  }
  /**
   * Returns the number of columns contained in the range.
   */
  width() {
    return this.size.width;
  }
  /**
   * Returns the number of rows contained in the range.
   */
  height() {
    return this.size.height;
  }
  /**
   * Returns the range data as a 1D array.
   */
  valuesFromTopLeftCorner() {
    this.ensureThatComputed();
    const ret = [];
    for (let i = 0; i < this._data.length; i++) {
      for (let j = 0; j < this._data[0].length; j++) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        ret.push(this._data[i][j]);
      }
    }
    return ret;
  }
  /**
   * Generates the addresses of the cells contained in the range assuming the provided address is the left corner of the range.
   */
  *effectiveAddressesFromData(leftCorner) {
    for (let row = 0; row < this.data.length; ++row) {
      const rowData = this.data[row];
      for (let col = 0; col < rowData.length; ++col) {
        yield (0, _Cell.simpleCellAddress)(leftCorner.sheet, leftCorner.col + col, leftCorner.row + row);
      }
    }
  }
  /**
   * Generates values and addresses of the cells contained in the range assuming the provided address is the left corner of the range.
   *
   * This method combines the functionalities of [`iterateValuesFromTopLeftCorner()`](#iteratevaluesfromtopleftcorner) and [`effectiveAddressesFromData()`](#effectiveaddressesfromdata).
   */
  *entriesFromTopLeftCorner(leftCorner) {
    this.ensureThatComputed();
    for (let row = 0; row < this.size.height; ++row) {
      for (let col = 0; col < this.size.width; ++col) {
        yield [this._data[row][col], (0, _Cell.simpleCellAddress)(leftCorner.sheet, leftCorner.col + col, leftCorner.row + row)];
      }
    }
  }
  /**
   * Generates the values of the cells contained in the range assuming the provided address is the left corner of the range.
   */
  *iterateValuesFromTopLeftCorner() {
    yield* this.valuesFromTopLeftCorner();
  }
  /**
   * Returns the number of cells contained in the range.
   */
  numberOfElements() {
    return this.size.width * this.size.height;
  }
  /**
   * Returns `true` if and only if the range contains only numeric values.
   */
  hasOnlyNumbers() {
    if (this._hasOnlyNumbers === undefined) {
      this._hasOnlyNumbers = true;
      for (const row of this.data) {
        for (const v of row) {
          if (typeof v !== 'number') {
            this._hasOnlyNumbers = false;
            return false;
          }
        }
      }
    }
    return this._hasOnlyNumbers;
  }
  /**
   * Returns the range data as a 2D array of numbers.
   *
   * Internal use only.
   */
  rawNumbers() {
    return this._data;
  }
  /**
   * Returns the range data as a 2D array.
   *
   * Internal use only.
   */
  rawData() {
    var _a;
    this.ensureThatComputed();
    return (_a = this._data) !== null && _a !== void 0 ? _a : [];
  }
  /**
   * Returns `true` if and only if the range has the same width and height as the `other` range object.
   */
  sameDimensionsAs(other) {
    return this.width() === other.width() && this.height() === other.height();
  }
  /**
   * Computes the range data if it is not computed yet.
   */
  ensureThatComputed() {
    if (this._data !== undefined) {
      return;
    }
    this._hasOnlyNumbers = true;
    this._data = this.range.addressesArrayMap(this.dependencyGraph, cellFromRange => {
      const value = this.dependencyGraph.getCellValue(cellFromRange);
      if (value instanceof SimpleRangeValue) {
        this._hasOnlyNumbers = false;
        return new _Cell.CellError(_Cell.ErrorType.VALUE, _errorMessage.ErrorMessage.ScalarExpected);
      } else if ((0, _InterpreterValue.isExtendedNumber)(value)) {
        return value;
      } else {
        this._hasOnlyNumbers = false;
        return value;
      }
    });
  }
}
exports.SimpleRangeValue = SimpleRangeValue;