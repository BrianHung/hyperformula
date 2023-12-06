"use strict";

exports.__esModule = true;
exports.collectAddressesDependentToRange = void 0;
var _parser = require("../parser");
var _FormulaCellVertex = require("./FormulaCellVertex");
var _RangeVertex = require("./RangeVertex");
/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */

const collectAddressesDependentToRange = (functionRegistry, vertex, range, lazilyTransformingAstService, dependencyGraph) => {
  if (vertex instanceof _RangeVertex.RangeVertex) {
    const intersection = vertex.range.intersectionWith(range);
    if (intersection !== undefined) {
      return Array.from(intersection.addresses(dependencyGraph));
    } else {
      return [];
    }
  }
  let formula;
  let address;
  if (vertex instanceof _FormulaCellVertex.FormulaVertex) {
    formula = vertex.getFormula(lazilyTransformingAstService);
    address = vertex.getAddress(lazilyTransformingAstService);
  } else {
    return [];
  }
  return (0, _parser.collectDependencies)(formula, functionRegistry).filter(d => d instanceof _parser.AddressDependency).map(d => d.dependency.toSimpleCellAddress(address)).filter(d => range.addressInRange(d));
};
exports.collectAddressesDependentToRange = collectAddressesDependentToRange;