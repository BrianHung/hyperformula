"use strict";

exports.__esModule = true;
exports.CodePlugin = void 0;
var _Cell = require("../../Cell");
var _errorMessage = require("../../error-message");
var _FunctionPlugin = require("./FunctionPlugin");
/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */

class CodePlugin extends _FunctionPlugin.FunctionPlugin {
  code(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('CODE'), value => {
      if (value.length === 0) {
        return new _Cell.CellError(_Cell.ErrorType.VALUE, _errorMessage.ErrorMessage.EmptyString);
      }
      return value.charCodeAt(0);
    });
  }
  unicode(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('UNICODE'), value => {
      var _a;
      return (_a = value.codePointAt(0)) !== null && _a !== void 0 ? _a : new _Cell.CellError(_Cell.ErrorType.VALUE, _errorMessage.ErrorMessage.EmptyString);
    });
  }
}
exports.CodePlugin = CodePlugin;
CodePlugin.implementedFunctions = {
  'CODE': {
    method: 'code',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.STRING
    }]
  },
  'UNICODE': {
    method: 'unicode',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.STRING
    }]
  }
};