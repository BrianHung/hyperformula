"use strict";

exports.__esModule = true;
exports.PowerPlugin = void 0;
var _FunctionPlugin = require("./FunctionPlugin");
/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */

class PowerPlugin extends _FunctionPlugin.FunctionPlugin {
  power(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('POWER'), Math.pow);
  }
}
exports.PowerPlugin = PowerPlugin;
PowerPlugin.implementedFunctions = {
  'POWER': {
    method: 'power',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }]
  }
};