"use strict";

exports.__esModule = true;
exports.DegreesPlugin = void 0;
var _FunctionPlugin = require("./FunctionPlugin");
/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */

class DegreesPlugin extends _FunctionPlugin.FunctionPlugin {
  degrees(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('DEGREES'), arg => arg * (180 / Math.PI));
  }
}
exports.DegreesPlugin = DegreesPlugin;
DegreesPlugin.implementedFunctions = {
  'DEGREES': {
    method: 'degrees',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }]
  }
};