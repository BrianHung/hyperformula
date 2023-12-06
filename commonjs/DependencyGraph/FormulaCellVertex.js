"use strict";

exports.__esModule = true;
exports.FormulaVertex = exports.FormulaCellVertex = exports.ArrayVertex = void 0;
var _AbsoluteCellRange = require("../AbsoluteCellRange");
var _ArraySize = require("../ArraySize");
var _ArrayValue = require("../ArrayValue");
var _Cell = require("../Cell");
var _errorMessage = require("../error-message");
var _InterpreterValue = require("../interpreter/InterpreterValue");
var _Span = require("../Span");
/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */

class FormulaVertex {
  constructor(formula, cellAddress, version) {
    this.formula = formula;
    this.cellAddress = cellAddress;
    this.version = version;
  }
  get width() {
    return 1;
  }
  get height() {
    return 1;
  }
  static fromAst(formula, address, size, version) {
    if (size.isScalar()) {
      return new FormulaCellVertex(formula, address, version);
    } else {
      return new ArrayVertex(formula, address, size, version);
    }
  }
  /**
   * Returns formula stored in this vertex
   */
  getFormula(updatingService) {
    this.ensureRecentData(updatingService);
    return this.formula;
  }
  ensureRecentData(updatingService) {
    if (this.version != updatingService.version()) {
      const [newAst, newAddress, newVersion] = updatingService.applyTransformations(this.formula, this.cellAddress, this.version);
      this.formula = newAst;
      this.cellAddress = newAddress;
      this.version = newVersion;
    }
  }
  /**
   * Returns address of the cell associated with vertex
   */
  getAddress(updatingService) {
    this.ensureRecentData(updatingService);
    return this.cellAddress;
  }
}
exports.FormulaVertex = FormulaVertex;
class ArrayVertex extends FormulaVertex {
  constructor(formula, cellAddress, size, version = 0) {
    super(formula, cellAddress, version);
    if (size.isRef) {
      this.array = new _ArrayValue.ErroredArray(new _Cell.CellError(_Cell.ErrorType.REF, _errorMessage.ErrorMessage.NoSpaceForArrayResult), _ArraySize.ArraySize.error());
    } else {
      this.array = new _ArrayValue.NotComputedArray(size);
    }
  }
  get width() {
    return this.array.width();
  }
  get height() {
    return this.array.height();
  }
  get sheet() {
    return this.cellAddress.sheet;
  }
  get leftCorner() {
    return this.cellAddress;
  }
  setCellValue(value) {
    if (value instanceof _Cell.CellError) {
      this.setErrorValue(value);
      return value;
    }
    const array = _ArrayValue.ArrayValue.fromInterpreterValue(value);
    array.resize(this.array.size);
    this.array = array;
    return value;
  }
  getCellValue() {
    if (this.array instanceof _ArrayValue.NotComputedArray) {
      throw Error('Array not computed yet.');
    }
    return this.array.simpleRangeValue();
  }
  valueOrUndef() {
    if (this.array instanceof _ArrayValue.NotComputedArray) {
      return undefined;
    }
    return this.array.simpleRangeValue();
  }
  getArrayCellValue(address) {
    const col = address.col - this.cellAddress.col;
    const row = address.row - this.cellAddress.row;
    try {
      return this.array.get(col, row);
    } catch (e) {
      return new _Cell.CellError(_Cell.ErrorType.REF);
    }
  }
  getArrayCellRawValue(address) {
    const val = this.getArrayCellValue(address);
    if (val instanceof _Cell.CellError || val === _InterpreterValue.EmptyValue) {
      return undefined;
    } else {
      return (0, _InterpreterValue.getRawValue)(val);
    }
  }
  setArrayCellValue(address, value) {
    const col = address.col - this.cellAddress.col;
    const row = address.row - this.cellAddress.row;
    if (this.array instanceof _ArrayValue.ArrayValue) {
      this.array.set(col, row, value);
    }
  }
  setNoSpace() {
    this.array = new _ArrayValue.ErroredArray(new _Cell.CellError(_Cell.ErrorType.SPILL, _errorMessage.ErrorMessage.NoSpaceForArrayResult), _ArraySize.ArraySize.error());
    return this.getCellValue();
  }
  getRange() {
    return _AbsoluteCellRange.AbsoluteCellRange.spanFrom(this.cellAddress, this.width, this.height);
  }
  getRangeOrUndef() {
    return _AbsoluteCellRange.AbsoluteCellRange.spanFromOrUndef(this.cellAddress, this.width, this.height);
  }
  setAddress(address) {
    this.cellAddress = address;
  }
  setFormula(newFormula) {
    this.formula = newFormula;
  }
  spansThroughSheetRows(sheet, startRow, endRow = startRow) {
    return this.cellAddress.sheet === sheet && this.cellAddress.row <= endRow && startRow < this.cellAddress.row + this.height;
  }
  spansThroughSheetColumn(sheet, col, columnEnd = col) {
    return this.cellAddress.sheet === sheet && this.cellAddress.col <= columnEnd && col < this.cellAddress.col + this.width;
  }
  isComputed() {
    return !(this.array instanceof _ArrayValue.NotComputedArray);
  }
  columnsFromArray() {
    return _Span.ColumnsSpan.fromNumberOfColumns(this.cellAddress.sheet, this.cellAddress.col, this.width);
  }
  rowsFromArray() {
    return _Span.RowsSpan.fromNumberOfRows(this.cellAddress.sheet, this.cellAddress.row, this.height);
  }
  /**
   * No-op as array vertices are transformed eagerly.
   */
  ensureRecentData(_updatingService) {}
  isLeftCorner(address) {
    return (0, _Cell.equalSimpleCellAddress)(this.cellAddress, address);
  }
  setErrorValue(error) {
    this.array = new _ArrayValue.ErroredArray(error, this.array.size);
  }
}
/**
 * Represents vertex which keeps formula
 */
exports.ArrayVertex = ArrayVertex;
class FormulaCellVertex extends FormulaVertex {
  constructor( /** Formula in AST format */
  formula, /** Address which this vertex represents */
  address, version) {
    super(formula, address, version);
  }
  valueOrUndef() {
    return this.cachedCellValue;
  }
  /**
   * Sets computed cell value stored in this vertex
   */
  setCellValue(cellValue) {
    this.cachedCellValue = cellValue;
    return this.cachedCellValue;
  }
  /**
   * Returns cell value stored in vertex
   */
  getCellValue() {
    if (this.cachedCellValue !== undefined) {
      return this.cachedCellValue;
    } else {
      throw Error('Value of the formula cell is not computed.');
    }
  }
  isComputed() {
    return this.cachedCellValue !== undefined;
  }
}
exports.FormulaCellVertex = FormulaCellVertex;