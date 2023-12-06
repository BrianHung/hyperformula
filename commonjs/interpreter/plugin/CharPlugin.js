"use strict";

exports.__esModule = true;
exports.CharPlugin = void 0;
var _Cell = require("../../Cell");
var _errorMessage = require("../../error-message");
var _FunctionPlugin = require("./FunctionPlugin");
/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */

class CharPlugin extends _FunctionPlugin.FunctionPlugin {
  char(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('CHAR'), value => {
      if (value < 1 || value >= 256) {
        return new _Cell.CellError(_Cell.ErrorType.VALUE, _errorMessage.ErrorMessage.CharacterCodeBounds);
      }
      return String.fromCharCode(Math.trunc(value));
    });
  }
  unichar(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('CHAR'), value => {
      if (value < 1 || value >= 1114112) {
        return new _Cell.CellError(_Cell.ErrorType.VALUE, _errorMessage.ErrorMessage.CharacterCodeBounds);
      }
      return String.fromCodePoint(Math.trunc(value));
    });
  }
}
exports.CharPlugin = CharPlugin;
CharPlugin.implementedFunctions = {
  'CHAR': {
    method: 'char',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }]
  },
  'UNICHAR': {
    method: 'unichar',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }]
  }
};