"use strict";

exports.__esModule = true;
exports.ImmutableReferenceMapping = exports.ImmutableIdMapping = void 0;
var _Cell = require("../Cell");
/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */

/**
 * Basic implementation of a ImmutableReferenceMapping.
 */
class ImmutableReferenceMapping {
  constructor({
    cols,
    rows,
    cells
  } = {}) {
    this.cols = new Map();
    this.rows = new Map();
    this.cells = new Map();
    this.cols = cols !== null && cols !== void 0 ? cols : new Map();
    this.rows = rows !== null && rows !== void 0 ? rows : new Map();
    this.cells = cells !== null && cells !== void 0 ? cells : new Map();
  }
  get sortedRows() {
    return Array.from(this.rows.values()).sort((x, y) => x.order < y.order ? -1 : 1);
  }
  get sortedCols() {
    return Array.from(this.cols.values()).sort((x, y) => x.order < y.order ? -1 : 1);
  }
  getRowId({
    sheet,
    row
  }) {
    var _a;
    return (_a = this.sortedRows[row]) === null || _a === void 0 ? void 0 : _a.id;
  }
  getColId({
    sheet,
    col
  }) {
    var _a;
    return (_a = this.sortedRows[col]) === null || _a === void 0 ? void 0 : _a.id;
  }
  getCellId(address) {
    const rowId = this.getRowId(address);
    const colId = this.getColId(address);
    const cell = Array.from(this.cells.values()).find(cell => cell.row === rowId && cell.col === colId);
    return cell === null || cell === void 0 ? void 0 : cell.id;
  }
  getRowIndex(id) {
    const index = this.sortedRows.findIndex(row => row.id === id);
    if (index === -1) return undefined;
    return {
      index,
      sheet: 0
    };
  }
  getColIndex(id) {
    const index = this.sortedCols.findIndex(row => row.id === id);
    if (index === -1) return undefined;
    return {
      index,
      sheet: 0
    };
  }
  getCellAddress(id) {
    const cell = this.cells.get(id);
    if (cell === undefined) return undefined;
    const row = this.getRowIndex(cell.row);
    const col = this.getColIndex(cell.col);
    if (row === undefined || col === undefined) return undefined;
    if (row.sheet !== col.sheet) throw Error();
    return {
      sheet: 0,
      row: row.index,
      col: col.index
    };
  }
}
/**
 * Basic implementation of a ImmutableIdMapping.
 */
exports.ImmutableReferenceMapping = ImmutableReferenceMapping;
class ImmutableIdMapping extends ImmutableReferenceMapping {
  constructor(props) {
    super(props);
    this.cellsToId = new Map();
    this.cells.forEach(({
      id,
      row: r,
      col: c
    }) => {
      var _a, _b;
      const row = (_a = this.getRowIndex(r)) === null || _a === void 0 ? void 0 : _a.index;
      const col = (_b = this.getColIndex(c)) === null || _b === void 0 ? void 0 : _b.index;
      if (row === undefined || col === undefined) return;
      this.cellsToId.set((0, _Cell.addressKey)({
        sheet: 0,
        row,
        col
      }), id);
    });
  }
  getCellId(address) {
    return this.cellsToId.get((0, _Cell.addressKey)(address));
  }
}
exports.ImmutableIdMapping = ImmutableIdMapping;