"use strict";

exports.__esModule = true;
exports.RowAddress = void 0;
var _Cell = require("../Cell");
var _ColumnAddress = require("./ColumnAddress");
/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */

class RowAddress {
  constructor(type, row, sheet) {
    this.type = type;
    this.row = row;
    this.sheet = sheet;
  }
  static absolute(row, sheet) {
    return new RowAddress(_ColumnAddress.ReferenceType.ABSOLUTE, row, sheet);
  }
  static relative(row, sheet) {
    return new RowAddress(_ColumnAddress.ReferenceType.RELATIVE, row, sheet);
  }
  static compareByAbsoluteAddress(baseAddress) {
    return (rowA, rowB) => rowA.toSimpleRowAddress(baseAddress).row - rowB.toSimpleRowAddress(baseAddress).row;
  }
  isRowAbsolute() {
    return this.type === _ColumnAddress.ReferenceType.ABSOLUTE;
  }
  isRowRelative() {
    return this.type === _ColumnAddress.ReferenceType.RELATIVE;
  }
  isAbsolute() {
    return this.type === _ColumnAddress.ReferenceType.ABSOLUTE && this.sheet !== undefined;
  }
  moved(toSheet, toRight, toBottom) {
    const newSheet = this.sheet === undefined ? undefined : toSheet;
    return new RowAddress(this.type, this.row + toBottom, newSheet);
  }
  shiftedByRows(numberOfColumns) {
    return new RowAddress(this.type, this.row + numberOfColumns, this.sheet);
  }
  toSimpleRowAddress(baseAddress) {
    const sheet = (0, _Cell.absoluteSheetReference)(this, baseAddress);
    let row = this.row;
    if (this.isRowRelative()) {
      row = baseAddress.row + this.row;
    }
    return (0, _Cell.simpleRowAddress)(sheet, row);
  }
  shiftRelativeDimensions(toRight, toBottom) {
    const row = this.isRowRelative() ? this.row + toBottom : this.row;
    return new RowAddress(this.type, row, this.sheet);
  }
  shiftAbsoluteDimensions(toRight, toBottom) {
    const row = this.isRowAbsolute() ? this.row + toBottom : this.row;
    return new RowAddress(this.type, row, this.sheet);
  }
  withSheet(sheet) {
    return new RowAddress(this.type, this.row, sheet);
  }
  isInvalid(baseAddress) {
    return this.toSimpleRowAddress(baseAddress).row < 0;
  }
  hash(withSheet) {
    const sheetPart = withSheet && this.sheet !== undefined ? `#${this.sheet}` : '';
    switch (this.type) {
      case _ColumnAddress.ReferenceType.RELATIVE:
        {
          return `${sheetPart}#ROWR${this.row}`;
        }
      case _ColumnAddress.ReferenceType.ABSOLUTE:
        {
          return `${sheetPart}#ROWA${this.row}`;
        }
    }
  }
  unparse(baseAddress) {
    const simpleAddress = this.toSimpleRowAddress(baseAddress);
    if ((0, _Cell.invalidSimpleRowAddress)(simpleAddress)) {
      return undefined;
    }
    const dollar = this.type === _ColumnAddress.ReferenceType.ABSOLUTE ? '$' : '';
    return `${dollar}${simpleAddress.row + 1}`;
  }
  exceedsSheetSizeLimits(maxRows) {
    return this.row >= maxRows;
  }
}
exports.RowAddress = RowAddress;