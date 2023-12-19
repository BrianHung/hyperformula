"use strict";

exports.__esModule = true;
exports.ProcessableValue = void 0;
/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */
class ProcessableValue {
  constructor(rawValue, processFn) {
    this.rawValue = rawValue;
    this.processFn = processFn;
    this.processedValue = null;
  }
  getProcessedValue() {
    if (this.processedValue === null) {
      this.processedValue = this.processFn(this.rawValue);
    }
    return this.processedValue;
  }
  markAsModified() {
    this.processedValue = null;
  }
}
exports.ProcessableValue = ProcessableValue;