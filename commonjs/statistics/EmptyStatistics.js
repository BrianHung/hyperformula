"use strict";

exports.__esModule = true;
exports.EmptyStatistics = void 0;
var _Statistics = require("./Statistics");
/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */

/** Do not store stats in the memory. Stats are not needed on daily basis */
class EmptyStatistics extends _Statistics.Statistics {
  /** @inheritDoc */
  incrementCriterionFunctionFullCacheUsed() {
    // do nothing
  }
  /** @inheritDoc */
  incrementCriterionFunctionPartialCacheUsed() {
    // do nothing
  }
  /** @inheritDoc */
  start(_name) {
    // do nothing
  }
  /** @inheritDoc */
  end(_name) {
    // do nothing
  }
}
exports.EmptyStatistics = EmptyStatistics;