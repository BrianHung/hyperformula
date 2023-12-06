/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */
export class ProcessableValue {
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