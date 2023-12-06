"use strict";

exports.__esModule = true;
exports.DeltaPlugin = void 0;
var _FunctionPlugin = require("./FunctionPlugin");
/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */

class DeltaPlugin extends _FunctionPlugin.FunctionPlugin {
  delta(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('DELTA'), (left, right) => left === right ? 1 : 0);
  }
}
exports.DeltaPlugin = DeltaPlugin;
DeltaPlugin.implementedFunctions = {
  'DELTA': {
    method: 'delta',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      defaultValue: 0
    }]
  }
};