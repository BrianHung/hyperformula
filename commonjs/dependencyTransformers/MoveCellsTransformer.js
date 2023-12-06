"use strict";

exports.__esModule = true;
exports.MoveCellsTransformer = exports.DependentFormulaTransformer = void 0;
var _Cell = require("../Cell");
var _parser = require("../parser");
var _RowAddress = require("../parser/RowAddress");
var _Transformer = require("./Transformer");
/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */

class MoveCellsTransformer extends _Transformer.Transformer {
  constructor(sourceRange, toRight, toBottom, toSheet) {
    super();
    this.sourceRange = sourceRange;
    this.toRight = toRight;
    this.toBottom = toBottom;
    this.toSheet = toSheet;
    this.dependentFormulaTransformer = new DependentFormulaTransformer(sourceRange, toRight, toBottom, toSheet);
  }
  get sheet() {
    return this.sourceRange.sheet;
  }
  isIrreversible() {
    return true;
  }
  transformSingleAst(ast, address) {
    if (this.sourceRange.addressInRange(address)) {
      const newAst = this.transformAst(ast, address);
      return [newAst, this.fixNodeAddress(address)];
    } else {
      return this.dependentFormulaTransformer.transformSingleAst(ast, address);
    }
  }
  fixNodeAddress(address) {
    return (0, _Cell.simpleCellAddress)(this.toSheet, address.col + this.toRight, address.row + this.toBottom);
  }
  transformCellAddress(dependencyAddress, formulaAddress) {
    return this.transformAddress(dependencyAddress, formulaAddress);
  }
  transformCellRange(start, end, formulaAddress) {
    return this.transformRange(start, end, formulaAddress);
  }
  transformColumnRange(start, end, formulaAddress) {
    return this.transformRange(start, end, formulaAddress);
  }
  transformRowRange(start, end, formulaAddress) {
    return this.transformRange(start, end, formulaAddress);
  }
  transformAddress(dependencyAddress, formulaAddress) {
    const sourceRange = this.sourceRange;
    if (dependencyAddress instanceof _parser.CellAddress) {
      const absoluteDependencyAddress = dependencyAddress.toSimpleCellAddress(formulaAddress);
      if (sourceRange.addressInRange(absoluteDependencyAddress)) {
        // If dependency is internal, move only absolute dimensions
        return dependencyAddress.shiftAbsoluteDimensions(this.toRight, this.toBottom);
      }
    }
    return dependencyAddress.shiftRelativeDimensions(-this.toRight, -this.toBottom);
  }
  transformRange(start, end, formulaAddress) {
    const sourceRange = this.sourceRange;
    if (start instanceof _parser.CellAddress && end instanceof _parser.CellAddress) {
      const absoluteStart = start.toSimpleCellAddress(formulaAddress);
      const absoluteEnd = end.toSimpleCellAddress(formulaAddress);
      if (sourceRange.addressInRange(absoluteStart) && sourceRange.addressInRange(absoluteEnd)) {
        return [start.shiftAbsoluteDimensions(this.toRight, this.toBottom), end.shiftAbsoluteDimensions(this.toRight, this.toBottom)];
      }
    }
    return [start.shiftRelativeDimensions(-this.toRight, -this.toBottom), end.shiftRelativeDimensions(-this.toRight, -this.toBottom)];
  }
}
exports.MoveCellsTransformer = MoveCellsTransformer;
class DependentFormulaTransformer extends _Transformer.Transformer {
  constructor(sourceRange, toRight, toBottom, toSheet) {
    super();
    this.sourceRange = sourceRange;
    this.toRight = toRight;
    this.toBottom = toBottom;
    this.toSheet = toSheet;
  }
  get sheet() {
    return this.sourceRange.sheet;
  }
  isIrreversible() {
    return true;
  }
  fixNodeAddress(address) {
    return address;
  }
  transformCellAddress(dependencyAddress, formulaAddress) {
    if (this.shouldMove(dependencyAddress, formulaAddress)) {
      return dependencyAddress.moved(this.toSheet, this.toRight, this.toBottom);
    }
    return false;
  }
  transformCellRange(start, end, formulaAddress) {
    return this.transformRange(start, end, formulaAddress);
  }
  transformColumnRange(start, end, formulaAddress) {
    return this.transformRange(start, end, formulaAddress);
  }
  transformRowRange(start, end, formulaAddress) {
    return this.transformRange(start, end, formulaAddress);
  }
  shouldMove(dependencyAddress, formulaAddress) {
    if (dependencyAddress instanceof _parser.CellAddress) {
      return this.sourceRange.addressInRange(dependencyAddress.toSimpleCellAddress(formulaAddress));
    } else if (dependencyAddress instanceof _RowAddress.RowAddress) {
      return this.sourceRange.rowInRange(dependencyAddress.toSimpleRowAddress(formulaAddress)) && !this.sourceRange.isFinite();
    } else {
      return this.sourceRange.columnInRange(dependencyAddress.toSimpleColumnAddress(formulaAddress)) && !this.sourceRange.isFinite();
    }
  }
  transformRange(start, end, formulaAddress) {
    const newStart = this.transformCellAddress(start, formulaAddress);
    const newEnd = this.transformCellAddress(end, formulaAddress);
    if (newStart && newEnd) {
      return [newStart, newEnd];
    }
    return false;
  }
}
exports.DependentFormulaTransformer = DependentFormulaTransformer;