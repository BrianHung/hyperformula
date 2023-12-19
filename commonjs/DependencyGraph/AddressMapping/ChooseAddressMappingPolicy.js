"use strict";

exports.__esModule = true;
exports.DenseSparseChooseBasedOnThreshold = exports.AlwaysSparse = exports.AlwaysDense = void 0;
var _DenseStrategy = require("./DenseStrategy");
var _SparseStrategy = require("./SparseStrategy");
/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */

class DenseSparseChooseBasedOnThreshold {
  constructor(threshold) {
    this.threshold = threshold;
  }
  call(fill) {
    if (fill > this.threshold) {
      return _DenseStrategy.DenseStrategy;
    } else {
      return _SparseStrategy.SparseStrategy;
    }
  }
}
exports.DenseSparseChooseBasedOnThreshold = DenseSparseChooseBasedOnThreshold;
class AlwaysSparse {
  call() {
    return _SparseStrategy.SparseStrategy;
  }
}
exports.AlwaysSparse = AlwaysSparse;
class AlwaysDense {
  call() {
    return _DenseStrategy.DenseStrategy;
  }
}
exports.AlwaysDense = AlwaysDense;