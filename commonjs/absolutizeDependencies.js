"use strict";

exports.__esModule = true;
exports.filterDependenciesOutOfScope = exports.absolutizeDependencies = void 0;
var _AbsoluteCellRange = require("./AbsoluteCellRange");
var _Cell = require("./Cell");
var _parser = require("./parser");
/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */

/**
 * Converts dependencies from maybe relative addressing to absolute addressing.
 *
 * @param deps - list of addresses in R0C0 format
 * @param baseAddress - base address with regard to which make a convertion
 */
const absolutizeDependencies = (deps, baseAddress) => {
  return deps.map(dep => dep.absolutize(baseAddress));
};
exports.absolutizeDependencies = absolutizeDependencies;
const filterDependenciesOutOfScope = deps => {
  return deps.filter(dep => {
    if (dep instanceof _parser.NamedExpressionDependency) {
      return true;
    }
    if (dep instanceof _AbsoluteCellRange.AbsoluteCellRange) {
      return !((0, _Cell.invalidSimpleCellAddress)(dep.start) || (0, _Cell.invalidSimpleCellAddress)(dep.end));
    } else {
      return !(0, _Cell.invalidSimpleCellAddress)(dep);
    }
  });
};
exports.filterDependenciesOutOfScope = filterDependenciesOutOfScope;