"use strict";

exports.__esModule = true;
exports.SqrtPlugin = void 0;
var _FunctionPlugin = require("./FunctionPlugin");
/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */

class SqrtPlugin extends _FunctionPlugin.FunctionPlugin {
  sqrt(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('SQRT'), Math.sqrt);
  }
}
exports.SqrtPlugin = SqrtPlugin;
SqrtPlugin.implementedFunctions = {
  'SQRT': {
    method: 'sqrt',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }]
  }
};