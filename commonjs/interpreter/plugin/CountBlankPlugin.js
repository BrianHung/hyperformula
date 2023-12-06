"use strict";

exports.__esModule = true;
exports.CountBlankPlugin = void 0;
var _InterpreterValue = require("../InterpreterValue");
var _FunctionPlugin = require("./FunctionPlugin");
/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */

/**
 * Interpreter plugin containing MEDIAN function
 */
class CountBlankPlugin extends _FunctionPlugin.FunctionPlugin {
  countblank(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('COUNTBLANK'), (...args) => {
      let counter = 0;
      args.forEach(arg => {
        if (arg === _InterpreterValue.EmptyValue) {
          counter++;
        }
      });
      return counter;
    });
  }
}
exports.CountBlankPlugin = CountBlankPlugin;
CountBlankPlugin.implementedFunctions = {
  'COUNTBLANK': {
    method: 'countblank',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.SCALAR
    }],
    repeatLastArgs: 1,
    expandRanges: true
  }
};