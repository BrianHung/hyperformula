"use strict";

exports.__esModule = true;
exports.CellReferenceType = exports.CellAddress = void 0;
var _Cell = require("../Cell");
var _addressRepresentationConverters = require("./addressRepresentationConverters");
var _ColumnAddress = require("./ColumnAddress");
var _RowAddress = require("./RowAddress");
/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */

/** Possible kinds of cell references */
var CellReferenceType;
exports.CellReferenceType = CellReferenceType;
(function (CellReferenceType) {
  /** Cell reference with both row and column relative. */
  CellReferenceType["CELL_REFERENCE_RELATIVE"] = "CELL_REFERENCE";
  /** Cell reference with both row and column absolute. */
  CellReferenceType["CELL_REFERENCE_ABSOLUTE"] = "CELL_REFERENCE_ABSOLUTE";
  /** Cell reference with absolute column and relative row. */
  CellReferenceType["CELL_REFERENCE_ABSOLUTE_COL"] = "CELL_REFERENCE_ABSOLUTE_COL";
  /** Cell reference with relative column and absolute row. */
  CellReferenceType["CELL_REFERENCE_ABSOLUTE_ROW"] = "CELL_REFERENCE_ABSOLUTE_ROW";
})(CellReferenceType || (exports.CellReferenceType = CellReferenceType = {}));
class CellAddress {
  constructor(col, row, type, sheet) {
    this.col = col;
    this.row = row;
    this.type = type;
    this.sheet = sheet;
  }
  static fromColAndRow(col, row, sheet) {
    const factoryMethod = col.isColumnAbsolute() && row.isRowAbsolute() ? CellAddress.absolute.bind(this) : col.isColumnAbsolute() ? CellAddress.absoluteCol.bind(this) : row.isRowAbsolute() ? CellAddress.absoluteRow.bind(this) : CellAddress.relative.bind(this);
    return factoryMethod(col.col, row.row, sheet);
  }
  static relative(col, row, sheet) {
    return new CellAddress(col, row, CellReferenceType.CELL_REFERENCE_RELATIVE, sheet);
  }
  static absolute(col, row, sheet) {
    return new CellAddress(col, row, CellReferenceType.CELL_REFERENCE_ABSOLUTE, sheet);
  }
  static absoluteCol(col, row, sheet) {
    return new CellAddress(col, row, CellReferenceType.CELL_REFERENCE_ABSOLUTE_COL, sheet);
  }
  static absoluteRow(col, row, sheet) {
    return new CellAddress(col, row, CellReferenceType.CELL_REFERENCE_ABSOLUTE_ROW, sheet);
  }
  /**
   * Converts R0C0 representation of cell address to simple object representation.
   *
   * @param baseAddress - base address for R0C0 shifts
   */
  toSimpleCellAddress(baseAddress) {
    const sheet = (0, _Cell.absoluteSheetReference)(this, baseAddress);
    if (this.type === CellReferenceType.CELL_REFERENCE_ABSOLUTE) {
      return (0, _Cell.simpleCellAddress)(sheet, this.col, this.row);
    } else if (this.type === CellReferenceType.CELL_REFERENCE_ABSOLUTE_ROW) {
      return (0, _Cell.simpleCellAddress)(sheet, baseAddress.col + this.col, this.row);
    } else if (this.type === CellReferenceType.CELL_REFERENCE_ABSOLUTE_COL) {
      return (0, _Cell.simpleCellAddress)(sheet, this.col, baseAddress.row + this.row);
    } else {
      return (0, _Cell.simpleCellAddress)(sheet, baseAddress.col + this.col, baseAddress.row + this.row);
    }
  }
  toColumnAddress() {
    const refType = this.isColumnRelative() ? _ColumnAddress.ReferenceType.RELATIVE : _ColumnAddress.ReferenceType.ABSOLUTE;
    return new _ColumnAddress.ColumnAddress(refType, this.col, this.sheet);
  }
  toRowAddress() {
    const refType = this.isRowRelative() ? _ColumnAddress.ReferenceType.RELATIVE : _ColumnAddress.ReferenceType.ABSOLUTE;
    return new _RowAddress.RowAddress(refType, this.row, this.sheet);
  }
  toSimpleColumnAddress(baseAddress) {
    const sheet = (0, _Cell.absoluteSheetReference)(this, baseAddress);
    let column = this.col;
    if (this.isColumnRelative()) {
      column += baseAddress.col;
    }
    return (0, _Cell.simpleColumnAddress)(sheet, column);
  }
  toSimpleRowAddress(baseAddress) {
    const sheet = (0, _Cell.absoluteSheetReference)(this, baseAddress);
    let row = this.row;
    if (this.isRowRelative()) {
      row += baseAddress.row;
    }
    return (0, _Cell.simpleRowAddress)(sheet, row);
  }
  isRowAbsolute() {
    return this.type === CellReferenceType.CELL_REFERENCE_ABSOLUTE || this.type === CellReferenceType.CELL_REFERENCE_ABSOLUTE_ROW;
  }
  isColumnAbsolute() {
    return this.type === CellReferenceType.CELL_REFERENCE_ABSOLUTE || this.type === CellReferenceType.CELL_REFERENCE_ABSOLUTE_COL;
  }
  isColumnRelative() {
    return this.type === CellReferenceType.CELL_REFERENCE_RELATIVE || this.type === CellReferenceType.CELL_REFERENCE_ABSOLUTE_ROW;
  }
  isRowRelative() {
    return this.type === CellReferenceType.CELL_REFERENCE_RELATIVE || this.type === CellReferenceType.CELL_REFERENCE_ABSOLUTE_COL;
  }
  isAbsolute() {
    return this.type === CellReferenceType.CELL_REFERENCE_ABSOLUTE && this.sheet !== undefined;
  }
  shiftedByRows(numberOfRows) {
    return new CellAddress(this.col, this.row + numberOfRows, this.type, this.sheet);
  }
  shiftedByColumns(numberOfColumns) {
    return new CellAddress(this.col + numberOfColumns, this.row, this.type, this.sheet);
  }
  moved(toSheet, toRight, toBottom) {
    const newSheet = this.sheet === undefined ? undefined : toSheet;
    return new CellAddress(this.col + toRight, this.row + toBottom, this.type, newSheet);
  }
  withSheet(sheet) {
    return new CellAddress(this.col, this.row, this.type, sheet);
  }
  isInvalid(baseAddress) {
    return (0, _Cell.invalidSimpleCellAddress)(this.toSimpleCellAddress(baseAddress));
  }
  shiftRelativeDimensions(toRight, toBottom) {
    const col = this.isColumnAbsolute() ? this.col : this.col + toRight;
    const row = this.isRowAbsolute() ? this.row : this.row + toBottom;
    return new CellAddress(col, row, this.type, this.sheet);
  }
  shiftAbsoluteDimensions(toRight, toBottom) {
    const col = this.isColumnRelative() ? this.col : this.col + toRight;
    const row = this.isRowRelative() ? this.row : this.row + toBottom;
    return new CellAddress(col, row, this.type, this.sheet);
  }
  hash(withSheet) {
    const sheetPart = withSheet && this.sheet !== undefined ? `#${this.sheet}` : '';
    switch (this.type) {
      case CellReferenceType.CELL_REFERENCE_RELATIVE:
        {
          return `${sheetPart}#${this.row}R${this.col}`;
        }
      case CellReferenceType.CELL_REFERENCE_ABSOLUTE:
        {
          return `${sheetPart}#${this.row}A${this.col}`;
        }
      case CellReferenceType.CELL_REFERENCE_ABSOLUTE_COL:
        {
          return `${sheetPart}#${this.row}AC${this.col}`;
        }
      case CellReferenceType.CELL_REFERENCE_ABSOLUTE_ROW:
        {
          return `${sheetPart}#${this.row}AR${this.col}`;
        }
    }
  }
  unparse(baseAddress) {
    const simpleAddress = this.toSimpleCellAddress(baseAddress);
    if ((0, _Cell.invalidSimpleCellAddress)(simpleAddress)) {
      return undefined;
    }
    const column = (0, _addressRepresentationConverters.columnIndexToLabel)(simpleAddress.col);
    const rowDollar = this.type === CellReferenceType.CELL_REFERENCE_ABSOLUTE || this.type === CellReferenceType.CELL_REFERENCE_ABSOLUTE_ROW ? '$' : '';
    const colDollar = this.type === CellReferenceType.CELL_REFERENCE_ABSOLUTE || this.type === CellReferenceType.CELL_REFERENCE_ABSOLUTE_COL ? '$' : '';
    return `${colDollar}${column}${rowDollar}${simpleAddress.row + 1}`;
  }
  exceedsSheetSizeLimits(maxColumns, maxRows) {
    return this.row >= maxRows || this.col >= maxColumns;
  }
}
exports.CellAddress = CellAddress;