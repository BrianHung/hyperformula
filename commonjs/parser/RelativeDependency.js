"use strict";

exports.__esModule = true;
exports.RowRangeDependency = exports.NamedExpressionDependency = exports.ColumnRangeDependency = exports.CellRangeDependency = exports.AddressDependency = void 0;
var _AbsoluteCellRange = require("../AbsoluteCellRange");
/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */

class AddressDependency {
  constructor(dependency) {
    this.dependency = dependency;
  }
  absolutize(baseAddress) {
    return this.dependency.toSimpleCellAddress(baseAddress);
  }
}
exports.AddressDependency = AddressDependency;
class CellRangeDependency {
  constructor(start, end) {
    this.start = start;
    this.end = end;
  }
  absolutize(baseAddress) {
    return new _AbsoluteCellRange.AbsoluteCellRange(this.start.toSimpleCellAddress(baseAddress), this.end.toSimpleCellAddress(baseAddress));
  }
}
exports.CellRangeDependency = CellRangeDependency;
class ColumnRangeDependency {
  constructor(start, end) {
    this.start = start;
    this.end = end;
  }
  absolutize(baseAddress) {
    const start = this.start.toSimpleColumnAddress(baseAddress);
    const end = this.end.toSimpleColumnAddress(baseAddress);
    return new _AbsoluteCellRange.AbsoluteColumnRange(start.sheet, start.col, end.col);
  }
}
exports.ColumnRangeDependency = ColumnRangeDependency;
class RowRangeDependency {
  constructor(start, end) {
    this.start = start;
    this.end = end;
  }
  absolutize(baseAddress) {
    const start = this.start.toSimpleRowAddress(baseAddress);
    const end = this.end.toSimpleRowAddress(baseAddress);
    return new _AbsoluteCellRange.AbsoluteRowRange(start.sheet, start.row, end.row);
  }
}
exports.RowRangeDependency = RowRangeDependency;
class NamedExpressionDependency {
  constructor(name) {
    this.name = name;
  }
  absolutize(_baseAddress) {
    return this;
  }
}
exports.NamedExpressionDependency = NamedExpressionDependency;