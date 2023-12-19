"use strict";

exports.__esModule = true;
exports.CountUniquePlugin = void 0;
var _Cell = require("../../Cell");
var _FunctionPlugin = require("./FunctionPlugin");
/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */

/**
 * Interpreter plugin containing COUNTUNIQUE function
 */
class CountUniquePlugin extends _FunctionPlugin.FunctionPlugin {
  /**
   * Corresponds to COUNTUNIQUE(Number1, Number2, ...).
   *
   * Returns number of unique numbers from arguments
   *
   * @param ast
   * @param state
   */
  countunique(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('COUNTUNIQUE'), (...args) => {
      const valuesSet = new Set();
      const errorsSet = new Set();
      for (const scalarValue of args) {
        if (scalarValue instanceof _Cell.CellError) {
          errorsSet.add(scalarValue.type);
        } else if (scalarValue !== '') {
          valuesSet.add(scalarValue);
        }
      }
      return valuesSet.size + errorsSet.size;
    });
  }
}
exports.CountUniquePlugin = CountUniquePlugin;
CountUniquePlugin.implementedFunctions = {
  'COUNTUNIQUE': {
    method: 'countunique',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.SCALAR
    }],
    repeatLastArgs: 1,
    expandRanges: true
  }
};