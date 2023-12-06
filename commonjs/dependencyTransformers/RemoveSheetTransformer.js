"use strict";

exports.__esModule = true;
exports.RemoveSheetTransformer = void 0;
var _Cell = require("../Cell");
var _Transformer = require("./Transformer");
/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */

class RemoveSheetTransformer extends _Transformer.Transformer {
  constructor(sheet) {
    super();
    this.sheet = sheet;
  }
  isIrreversible() {
    return true;
  }
  performEagerTransformations(graph, _parser) {
    for (const node of graph.arrayFormulaNodes()) {
      const [newAst] = this.transformSingleAst(node.getFormula(graph.lazilyTransformingAstService), node.getAddress(graph.lazilyTransformingAstService));
      node.setFormula(newAst);
    }
  }
  fixNodeAddress(address) {
    return address;
  }
  transformCellAddress(dependencyAddress, _formulaAddress) {
    return this.transformAddress(dependencyAddress);
  }
  transformCellRange(start, _end, _formulaAddress) {
    return this.transformAddress(start);
  }
  transformColumnRange(start, _end, _formulaAddress) {
    return this.transformAddress(start);
  }
  transformRowRange(start, _end, _formulaAddress) {
    return this.transformAddress(start);
  }
  transformAddress(address) {
    if (address.sheet === this.sheet) {
      return _Cell.ErrorType.REF;
    }
    return false;
  }
}
exports.RemoveSheetTransformer = RemoveSheetTransformer;