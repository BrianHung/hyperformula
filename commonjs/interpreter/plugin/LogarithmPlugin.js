"use strict";

exports.__esModule = true;
exports.LogarithmPlugin = void 0;
var _FunctionPlugin = require("./FunctionPlugin");
/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */

class LogarithmPlugin extends _FunctionPlugin.FunctionPlugin {
  log10(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('LOG10'), Math.log10);
  }
  log(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('LOG'), (arg, base) => Math.log(arg) / Math.log(base));
  }
  ln(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('LN'), Math.log);
  }
}
exports.LogarithmPlugin = LogarithmPlugin;
LogarithmPlugin.implementedFunctions = {
  'LOG10': {
    method: 'log10',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }]
  },
  'LOG': {
    method: 'log',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      greaterThan: 0
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      defaultValue: 10,
      greaterThan: 0
    }]
  },
  'LN': {
    method: 'ln',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }]
  }
};