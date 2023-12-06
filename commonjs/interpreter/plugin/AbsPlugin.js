"use strict";

exports.__esModule = true;
exports.AbsPlugin = void 0;
var _FunctionPlugin = require("./FunctionPlugin");
/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */

class AbsPlugin extends _FunctionPlugin.FunctionPlugin {
  abs(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('ABS'), Math.abs);
  }
}
exports.AbsPlugin = AbsPlugin;
AbsPlugin.implementedFunctions = {
  'ABS': {
    method: 'abs',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }]
  }
};