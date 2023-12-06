"use strict";

exports.__esModule = true;
exports.RowSearchStrategy = void 0;
var _AdvancedFind = require("./AdvancedFind");
/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */

class RowSearchStrategy extends _AdvancedFind.AdvancedFind {
  constructor(dependencyGraph) {
    super(dependencyGraph);
    this.dependencyGraph = dependencyGraph;
  }
  /*
   * WARNING: Finding lower/upper bounds in unordered ranges is not supported. When ordering === 'none', assumes matchExactly === true
   */
  find(searchKey, rangeValue, searchOptions) {
    return this.basicFind(searchKey, rangeValue, 'col', searchOptions);
  }
}
exports.RowSearchStrategy = RowSearchStrategy;