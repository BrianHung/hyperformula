"use strict";

exports.__esModule = true;
exports.EmptyCellVertex = void 0;
var _InterpreterValue = require("../interpreter/InterpreterValue");
/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */

/**
 * Represents singleton vertex bound to all empty cells
 */
class EmptyCellVertex {
  constructor() {}
  /**
   * Retrieves cell value bound to that singleton
   */
  getCellValue() {
    return _InterpreterValue.EmptyValue;
  }
}
exports.EmptyCellVertex = EmptyCellVertex;