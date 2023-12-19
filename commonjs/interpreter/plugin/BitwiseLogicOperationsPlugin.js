"use strict";

exports.__esModule = true;
exports.BitwiseLogicOperationsPlugin = void 0;
var _FunctionPlugin = require("./FunctionPlugin");
/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */

class BitwiseLogicOperationsPlugin extends _FunctionPlugin.FunctionPlugin {
  bitand(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('BITAND'), (left, right) => left & right);
  }
  bitor(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('BITOR'), (left, right) => left | right);
  }
  bitxor(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('BITXOR'), (left, right) => left ^ right);
  }
}
exports.BitwiseLogicOperationsPlugin = BitwiseLogicOperationsPlugin;
BitwiseLogicOperationsPlugin.implementedFunctions = {
  'BITAND': {
    method: 'bitand',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.INTEGER,
      minValue: 0
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.INTEGER,
      minValue: 0
    }]
  },
  'BITOR': {
    method: 'bitor',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.INTEGER,
      minValue: 0
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.INTEGER,
      minValue: 0
    }]
  },
  'BITXOR': {
    method: 'bitxor',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.INTEGER,
      minValue: 0
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.INTEGER,
      minValue: 0
    }]
  }
};