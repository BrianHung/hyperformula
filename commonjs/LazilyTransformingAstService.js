"use strict";

exports.__esModule = true;
exports.LazilyTransformingAstService = void 0;
var _CombinedTransformer = require("./dependencyTransformers/CombinedTransformer");
var _statistics = require("./statistics");
/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */

class LazilyTransformingAstService {
  constructor(stats) {
    this.stats = stats;
    this.transformations = [];
  }
  version() {
    return this.transformations.length;
  }
  addTransformation(transformation) {
    if (this.combinedTransformer !== undefined) {
      this.combinedTransformer.add(transformation);
    } else {
      this.transformations.push(transformation);
    }
    return this.version();
  }
  beginCombinedMode(sheet) {
    this.combinedTransformer = new _CombinedTransformer.CombinedTransformer(sheet);
  }
  commitCombinedMode() {
    if (this.combinedTransformer === undefined) {
      throw Error('Combined mode wasn\'t started');
    }
    this.transformations.push(this.combinedTransformer);
    this.combinedTransformer = undefined;
    return this.version();
  }
  applyTransformations(ast, address, version) {
    this.stats.start(_statistics.StatType.TRANSFORM_ASTS_POSTPONED);
    for (let v = version; v < this.transformations.length; v++) {
      const transformation = this.transformations[v];
      if (transformation.isIrreversible()) {
        this.undoRedo.storeDataForVersion(v, address, this.parser.computeHashFromAst(ast));
        this.parser.rememberNewAst(ast);
      }
      const [newAst, newAddress] = transformation.transformSingleAst(ast, address);
      ast = newAst;
      address = newAddress;
    }
    const cachedAst = this.parser.rememberNewAst(ast);
    this.stats.end(_statistics.StatType.TRANSFORM_ASTS_POSTPONED);
    return [cachedAst, address, this.transformations.length];
  }
  *getTransformationsFrom(version, filter) {
    for (let v = version; v < this.transformations.length; v++) {
      const transformation = this.transformations[v];
      if (!filter || filter(transformation)) {
        yield transformation;
      }
    }
  }
}
exports.LazilyTransformingAstService = LazilyTransformingAstService;