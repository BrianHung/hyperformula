"use strict";

exports.__esModule = true;
exports.IsEvenPlugin = void 0;
var _FunctionPlugin = require("./FunctionPlugin");
/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */

class IsEvenPlugin extends _FunctionPlugin.FunctionPlugin {
  iseven(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('ISEVEN'), val => val % 2 === 0);
  }
}
exports.IsEvenPlugin = IsEvenPlugin;
IsEvenPlugin.implementedFunctions = {
  'ISEVEN': {
    method: 'iseven',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }]
  }
};