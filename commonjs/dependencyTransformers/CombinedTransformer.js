"use strict";

exports.__esModule = true;
exports.CombinedTransformer = void 0;
/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */
class CombinedTransformer {
  constructor(sheet) {
    this.sheet = sheet;
    this.transformations = [];
  }
  add(transformation) {
    this.transformations.push(transformation);
  }
  performEagerTransformations(graph, parser) {
    this.transformations.forEach(transformation => transformation.performEagerTransformations(graph, parser));
  }
  transformSingleAst(ast, address) {
    let [transformedAst, transformedAddress] = [ast, address];
    this.transformations.forEach(transformation => {
      [transformedAst, transformedAddress] = transformation.transformSingleAst(transformedAst, transformedAddress);
    });
    return [transformedAst, transformedAddress];
  }
  isIrreversible() {
    return true;
  }
}
exports.CombinedTransformer = CombinedTransformer;