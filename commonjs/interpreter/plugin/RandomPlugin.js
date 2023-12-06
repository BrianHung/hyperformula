"use strict";

exports.__esModule = true;
exports.RandomPlugin = void 0;
var _Cell = require("../../Cell");
var _errorMessage = require("../../error-message");
var _FunctionPlugin = require("./FunctionPlugin");
/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */

class RandomPlugin extends _FunctionPlugin.FunctionPlugin {
  /**
   * Corresponds to RAND()
   *
   * Returns a pseudo-random floating-point random number
   * in the range [0,1).
   *
   * @param ast
   * @param state
   */
  rand(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('RAND'), Math.random);
  }
  randbetween(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('RANDBETWEEN'), (lower, upper) => {
      if (upper < lower) {
        return new _Cell.CellError(_Cell.ErrorType.NUM, _errorMessage.ErrorMessage.WrongOrder);
      }
      lower = Math.ceil(lower);
      upper = Math.floor(upper) + 1;
      if (lower === upper) {
        upper += 1;
      }
      return lower + Math.floor(Math.random() * (upper - lower));
    });
  }
}
exports.RandomPlugin = RandomPlugin;
RandomPlugin.implementedFunctions = {
  'RAND': {
    method: 'rand',
    parameters: [],
    isVolatile: true
  },
  'RANDBETWEEN': {
    method: 'randbetween',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }],
    isVolatile: true
  }
};