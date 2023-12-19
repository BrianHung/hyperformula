"use strict";

exports.__esModule = true;
exports.ModuloPlugin = void 0;
var _Cell = require("../../Cell");
var _FunctionPlugin = require("./FunctionPlugin");
/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */

class ModuloPlugin extends _FunctionPlugin.FunctionPlugin {
  mod(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('MOD'), (dividend, divisor) => {
      if (divisor === 0) {
        return new _Cell.CellError(_Cell.ErrorType.DIV_BY_ZERO);
      } else {
        return dividend % divisor;
      }
    });
  }
}
exports.ModuloPlugin = ModuloPlugin;
ModuloPlugin.implementedFunctions = {
  'MOD': {
    method: 'mod',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }]
  }
};