"use strict";

exports.__esModule = true;
exports.TrigonometryPlugin = void 0;
var _Cell = require("../../Cell");
var _errorMessage = require("../../error-message");
var _FunctionPlugin = require("./FunctionPlugin");
var _MathConstantsPlugin = require("./MathConstantsPlugin");
/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */

/**
 * Interpreter plugin containing trigonometric functions
 */
class TrigonometryPlugin extends _FunctionPlugin.FunctionPlugin {
  /**
   * Corresponds to ACOS(value)
   *
   * Returns the arc cosine (or inverse cosine) of a number.
   *
   * @param ast
   * @param state
   */
  acos(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('ACOS'), Math.acos);
  }
  asin(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('ASIN'), Math.asin);
  }
  cos(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('COS'), Math.cos);
  }
  sin(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('SIN'), Math.sin);
  }
  tan(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('TAN'), Math.tan);
  }
  atan(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('ATAN'), Math.atan);
  }
  atan2(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('ATAN2'), (x, y) => {
      if (x === 0 && y === 0) {
        return new _Cell.CellError(_Cell.ErrorType.DIV_BY_ZERO);
      }
      return Math.atan2(y, x);
    });
  }
  cot(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('COT'), arg => arg === 0 ? new _Cell.CellError(_Cell.ErrorType.DIV_BY_ZERO) : 1 / Math.tan(arg));
  }
  acot(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('ACOT'), arg => arg === 0 ? _MathConstantsPlugin.PI / 2 : Math.atan(1 / arg));
  }
  sec(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('SEC'), arg => 1 / Math.cos(arg));
  }
  csc(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('CSC'), arg => arg === 0 ? new _Cell.CellError(_Cell.ErrorType.DIV_BY_ZERO) : 1 / Math.sin(arg));
  }
  sinh(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('SINH'), Math.sinh);
  }
  asinh(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('ASINH'), Math.asinh);
  }
  cosh(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('COSH'), Math.cosh);
  }
  acosh(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('ACOSH'), Math.acosh);
  }
  tanh(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('TANH'), Math.tanh);
  }
  atanh(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('ATANH'), Math.atanh);
  }
  coth(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('COTH'), arg => arg === 0 ? new _Cell.CellError(_Cell.ErrorType.DIV_BY_ZERO) : 1 / Math.tanh(arg));
  }
  acoth(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('ACOTH'), arg => arg === 0 ? new _Cell.CellError(_Cell.ErrorType.NUM, _errorMessage.ErrorMessage.NonZero) : Math.atanh(1 / arg));
  }
  sech(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('SECH'), arg => 1 / Math.cosh(arg));
  }
  csch(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('CSCH'), arg => arg === 0 ? new _Cell.CellError(_Cell.ErrorType.DIV_BY_ZERO) : 1 / Math.sinh(arg));
  }
}
exports.TrigonometryPlugin = TrigonometryPlugin;
TrigonometryPlugin.implementedFunctions = {
  'ACOS': {
    method: 'acos',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }]
  },
  'ASIN': {
    method: 'asin',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }]
  },
  'COS': {
    method: 'cos',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }]
  },
  'SIN': {
    method: 'sin',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }]
  },
  'TAN': {
    method: 'tan',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }]
  },
  'ATAN': {
    method: 'atan',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }]
  },
  'ATAN2': {
    method: 'atan2',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }]
  },
  'COT': {
    method: 'cot',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }]
  },
  'SEC': {
    method: 'sec',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }]
  },
  'CSC': {
    method: 'csc',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }]
  },
  'SINH': {
    method: 'sinh',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }]
  },
  'COSH': {
    method: 'cosh',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }]
  },
  'TANH': {
    method: 'tanh',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }]
  },
  'COTH': {
    method: 'coth',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }]
  },
  'SECH': {
    method: 'sech',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }]
  },
  'CSCH': {
    method: 'csch',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }]
  },
  'ACOT': {
    method: 'acot',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }]
  },
  'ASINH': {
    method: 'asinh',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }]
  },
  'ACOSH': {
    method: 'acosh',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }]
  },
  'ATANH': {
    method: 'atanh',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }]
  },
  'ACOTH': {
    method: 'acoth',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }]
  }
};