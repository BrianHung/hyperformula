"use strict";

exports.__esModule = true;
exports.PI = exports.MathConstantsPlugin = void 0;
var _FunctionPlugin = require("./FunctionPlugin");
/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */

const PI = parseFloat(Math.PI.toFixed(14));
exports.PI = PI;
class MathConstantsPlugin extends _FunctionPlugin.FunctionPlugin {
  pi(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('PI'), () => PI);
  }
  sqrtpi(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('SQRTPI'), arg => Math.sqrt(PI * arg));
  }
}
exports.MathConstantsPlugin = MathConstantsPlugin;
MathConstantsPlugin.implementedFunctions = {
  'PI': {
    method: 'pi',
    parameters: []
  },
  'SQRTPI': {
    method: 'sqrtpi',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      minValue: 0
    }]
  }
};