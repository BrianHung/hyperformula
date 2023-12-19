"use strict";

exports.__esModule = true;
exports.ExpPlugin = void 0;
var _FunctionPlugin = require("./FunctionPlugin");
/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */

class ExpPlugin extends _FunctionPlugin.FunctionPlugin {
  /**
   * Corresponds to EXP(value)
   *
   * Calculates the exponent for basis e
   *
   * @param ast
   * @param state
   */
  exp(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('EXP'), Math.exp);
  }
}
exports.ExpPlugin = ExpPlugin;
ExpPlugin.implementedFunctions = {
  'EXP': {
    method: 'exp',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }]
  }
};