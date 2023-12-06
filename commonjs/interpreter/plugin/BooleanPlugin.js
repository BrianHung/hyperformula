"use strict";

exports.__esModule = true;
exports.BooleanPlugin = void 0;
var _Cell = require("../../Cell");
var _errorMessage = require("../../error-message");
var _FunctionPlugin = require("./FunctionPlugin");
/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */

/**
 * Interpreter plugin containing boolean functions
 */
class BooleanPlugin extends _FunctionPlugin.FunctionPlugin {
  /**
   * Corresponds to TRUE()
   *
   * Returns the logical true
   *
   * @param ast
   * @param state
   */
  literalTrue(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('TRUE'), () => true);
  }
  /**
   * Corresponds to FALSE()
   *
   * Returns the logical false
   *
   * @param ast
   * @param state
   */
  literalFalse(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('FALSE'), () => false);
  }
  /**
   * Corresponds to IF(expression, value_if_true, value_if_false)
   *
   * Returns value specified as second argument if expression is true and third argument if expression is false
   *
   * @param ast
   * @param state
   */
  conditionalIf(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('IF'), (condition, arg2, arg3) => {
      return condition ? arg2 : arg3;
    });
  }
  /**
   * Implementation for the IFS function. Returns the value that corresponds to the first true condition.
   *
   * @param ast
   * @param state
   */
  ifs(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('IFS'), (...args) => {
      for (let idx = 0; idx < args.length; idx += 2) {
        if (args[idx]) {
          return args[idx + 1];
        }
      }
      return new _Cell.CellError(_Cell.ErrorType.NA, _errorMessage.ErrorMessage.NoConditionMet);
    });
  }
  /**
   * Corresponds to AND(expression1, [expression2, ...])
   *
   * Returns true if all of the provided arguments are logically true, and false if any of it is logically false
   *
   * @param ast
   * @param state
   */
  and(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('AND'), (...args) => args.filter(arg => arg !== undefined).every(arg => !!arg));
  }
  /**
   * Corresponds to OR(expression1, [expression2, ...])
   *
   * Returns true if any of the provided arguments are logically true, and false otherwise
   *
   * @param ast
   * @param state
   */
  or(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('OR'), (...args) => args.filter(arg => arg !== undefined).some(arg => arg));
  }
  not(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('NOT'), arg => !arg);
  }
  xor(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('XOR'), (...args) => {
      let cnt = 0;
      args.filter(arg => arg !== undefined).forEach(arg => {
        if (arg) {
          cnt++;
        }
      });
      return cnt % 2 === 1;
    });
  }
  switch(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('SWITCH'), (selector, ...args) => {
      const n = args.length;
      let i = 0;
      for (; i + 1 < n; i += 2) {
        if (args[i] instanceof _Cell.CellError) {
          continue;
        }
        if (this.arithmeticHelper.eq(selector, args[i])) {
          return args[i + 1];
        }
      }
      if (i < n) {
        return args[i];
      } else {
        return new _Cell.CellError(_Cell.ErrorType.NA, _errorMessage.ErrorMessage.NoDefault);
      }
    });
  }
  iferror(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('IFERROR'), (arg1, arg2) => {
      if (arg1 instanceof _Cell.CellError) {
        return arg2;
      } else {
        return arg1;
      }
    });
  }
  ifna(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('IFNA'), (arg1, arg2) => {
      if (arg1 instanceof _Cell.CellError && arg1.type === _Cell.ErrorType.NA) {
        return arg2;
      } else {
        return arg1;
      }
    });
  }
  choose(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('CHOOSE'), (selector, ...args) => {
      if (selector > args.length) {
        return new _Cell.CellError(_Cell.ErrorType.NUM, _errorMessage.ErrorMessage.Selector);
      }
      return args[selector - 1];
    });
  }
}
exports.BooleanPlugin = BooleanPlugin;
BooleanPlugin.implementedFunctions = {
  'TRUE': {
    method: 'literalTrue',
    parameters: []
  },
  'FALSE': {
    method: 'literalFalse',
    parameters: []
  },
  'IF': {
    method: 'conditionalIf',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.BOOLEAN
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.SCALAR,
      passSubtype: true
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.SCALAR,
      defaultValue: false,
      passSubtype: true
    }]
  },
  'IFS': {
    method: 'ifs',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.BOOLEAN
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.SCALAR,
      passSubtype: true
    }],
    repeatLastArgs: 2
  },
  'AND': {
    method: 'and',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.BOOLEAN
    }],
    repeatLastArgs: 1,
    expandRanges: true
  },
  'OR': {
    method: 'or',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.BOOLEAN
    }],
    repeatLastArgs: 1,
    expandRanges: true
  },
  'XOR': {
    method: 'xor',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.BOOLEAN
    }],
    repeatLastArgs: 1,
    expandRanges: true
  },
  'NOT': {
    method: 'not',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.BOOLEAN
    }]
  },
  'SWITCH': {
    method: 'switch',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NOERROR
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.SCALAR,
      passSubtype: true
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.SCALAR,
      passSubtype: true
    }],
    repeatLastArgs: 1
  },
  'IFERROR': {
    method: 'iferror',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.SCALAR,
      passSubtype: true
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.SCALAR,
      passSubtype: true
    }]
  },
  'IFNA': {
    method: 'ifna',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.SCALAR,
      passSubtype: true
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.SCALAR,
      passSubtype: true
    }]
  },
  'CHOOSE': {
    method: 'choose',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.INTEGER,
      minValue: 1
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.SCALAR,
      passSubtype: true
    }],
    repeatLastArgs: 1
  }
};