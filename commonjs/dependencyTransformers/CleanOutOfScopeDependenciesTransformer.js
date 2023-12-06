"use strict";

exports.__esModule = true;
exports.CleanOutOfScopeDependenciesTransformer = void 0;
var _Cell = require("../Cell");
var _Transformer = require("./Transformer");
/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */

class CleanOutOfScopeDependenciesTransformer extends _Transformer.Transformer {
  constructor(sheet) {
    super();
    this.sheet = sheet;
  }
  isIrreversible() {
    return true;
  }
  fixNodeAddress(address) {
    return address;
  }
  transformCellAddress(dependencyAddress, formulaAddress) {
    return dependencyAddress.isInvalid(formulaAddress) ? _Cell.ErrorType.REF : false;
  }
  transformCellRange(start, end, formulaAddress) {
    return start.isInvalid(formulaAddress) || end.isInvalid(formulaAddress) ? _Cell.ErrorType.REF : false;
  }
  transformColumnRange(start, end, formulaAddress) {
    return start.isInvalid(formulaAddress) || end.isInvalid(formulaAddress) ? _Cell.ErrorType.REF : false;
  }
  transformRowRange(start, end, formulaAddress) {
    return start.isInvalid(formulaAddress) || end.isInvalid(formulaAddress) ? _Cell.ErrorType.REF : false;
  }
}
exports.CleanOutOfScopeDependenciesTransformer = CleanOutOfScopeDependenciesTransformer;