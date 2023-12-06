"use strict";

exports.__esModule = true;
exports.RadiansPlugin = void 0;
var _FunctionPlugin = require("./FunctionPlugin");
/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */

class RadiansPlugin extends _FunctionPlugin.FunctionPlugin {
  radians(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('RADIANS'), arg => arg * (Math.PI / 180));
  }
}
exports.RadiansPlugin = RadiansPlugin;
RadiansPlugin.implementedFunctions = {
  'RADIANS': {
    method: 'radians',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }]
  }
};