"use strict";

exports.__esModule = true;
exports.IsOddPlugin = void 0;
var _FunctionPlugin = require("./FunctionPlugin");
/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */

class IsOddPlugin extends _FunctionPlugin.FunctionPlugin {
  isodd(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('ISODD'), val => val % 2 === 1);
  }
}
exports.IsOddPlugin = IsOddPlugin;
IsOddPlugin.implementedFunctions = {
  'ISODD': {
    method: 'isodd',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }]
  }
};