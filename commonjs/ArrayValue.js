"use strict";

exports.__esModule = true;
exports.NotComputedArray = exports.ErroredArray = exports.ArrayValue = void 0;
var _ArraySize = require("./ArraySize");
var _InterpreterValue = require("./interpreter/InterpreterValue");
var _SimpleRangeValue = require("./SimpleRangeValue");
/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */

class NotComputedArray {
  constructor(size) {
    this.size = size;
  }
  width() {
    return this.size.width;
  }
  height() {
    return this.size.height;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  get(col, row) {
    throw Error('Array not computed yet.');
  }
  simpleRangeValue() {
    throw Error('Array not computed yet.');
  }
}
exports.NotComputedArray = NotComputedArray;
class ArrayValue {
  constructor(array) {
    this.size = new _ArraySize.ArraySize(array.length > 0 ? array[0].length : 0, array.length);
    this.array = array;
  }
  static fromInterpreterValue(value) {
    if (value instanceof _SimpleRangeValue.SimpleRangeValue) {
      return new ArrayValue(value.data);
    } else {
      return new ArrayValue([[value]]);
    }
  }
  simpleRangeValue() {
    return _SimpleRangeValue.SimpleRangeValue.onlyValues(this.array);
  }
  addRows(aboveRow, numberOfRows) {
    this.array.splice(aboveRow, 0, ...this.nullArrays(numberOfRows, this.width()));
    this.size.height += numberOfRows;
  }
  addColumns(aboveColumn, numberOfColumns) {
    for (let i = 0; i < this.height(); i++) {
      this.array[i].splice(aboveColumn, 0, ...new Array(numberOfColumns).fill(_InterpreterValue.EmptyValue));
    }
    this.size.width += numberOfColumns;
  }
  removeRows(startRow, endRow) {
    if (this.outOfBound(0, startRow) || this.outOfBound(0, endRow)) {
      throw Error('Array index out of bound');
    }
    const numberOfRows = endRow - startRow + 1;
    this.array.splice(startRow, numberOfRows);
    this.size.height -= numberOfRows;
  }
  removeColumns(leftmostColumn, rightmostColumn) {
    if (this.outOfBound(leftmostColumn, 0) || this.outOfBound(rightmostColumn, 0)) {
      throw Error('Array index out of bound');
    }
    const numberOfColumns = rightmostColumn - leftmostColumn + 1;
    for (const row of this.array) {
      row.splice(leftmostColumn, numberOfColumns);
    }
    this.size.width -= numberOfColumns;
  }
  nullArrays(count, size) {
    const result = [];
    for (let i = 0; i < count; ++i) {
      result.push(new Array(size).fill(_InterpreterValue.EmptyValue));
    }
    return result;
  }
  get(col, row) {
    if (this.outOfBound(col, row)) {
      throw Error('Array index out of bound');
    }
    return this.array[row][col];
  }
  set(col, row, value) {
    if (this.outOfBound(col, row)) {
      throw Error('Array index out of bound');
    }
    this.array[row][col] = value;
  }
  width() {
    return this.size.width;
  }
  height() {
    return this.size.height;
  }
  raw() {
    return this.array;
  }
  resize(newSize) {
    if (this.height() < newSize.height && isFinite(newSize.height)) {
      this.addRows(this.height(), newSize.height - this.height());
    }
    if (this.height() > newSize.height) {
      throw Error('Resizing to smaller array');
    }
    if (this.width() < newSize.width && isFinite(newSize.width)) {
      this.addColumns(this.width(), newSize.width - this.width());
    }
    if (this.width() > newSize.width) {
      throw Error('Resizing to smaller array');
    }
  }
  outOfBound(col, row) {
    return col < 0 || row < 0 || row > this.size.height - 1 || col > this.size.width - 1;
  }
}
exports.ArrayValue = ArrayValue;
class ErroredArray {
  constructor(error, size) {
    this.error = error;
    this.size = size;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  get(col, row) {
    return this.error;
  }
  width() {
    return this.size.width;
  }
  height() {
    return this.size.height;
  }
  simpleRangeValue() {
    return this.error;
  }
}
exports.ErroredArray = ErroredArray;