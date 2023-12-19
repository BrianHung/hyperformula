"use strict";

exports.__esModule = true;
exports.SumprodPlugin = void 0;
var _Cell = require("../../Cell");
var _errorMessage = require("../../error-message");
var _InterpreterValue = require("../InterpreterValue");
var _FunctionPlugin = require("./FunctionPlugin");
/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */

class SumprodPlugin extends _FunctionPlugin.FunctionPlugin {
  sumproduct(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('SUMPRODUCT'), (...args) => {
      const width = args[0].width();
      const height = args[0].height();
      for (const arg of args) {
        if (arg.width() !== width || arg.height() !== height) {
          return new _Cell.CellError(_Cell.ErrorType.VALUE, _errorMessage.ErrorMessage.EqualLength);
        }
      }
      let ret = 0;
      const iterators = args.map(arg => arg.iterateValuesFromTopLeftCorner());
      for (let i = 0; i < width * height; i++) {
        let acc = 1;
        for (const it of iterators) {
          const val = it.next().value;
          if (val instanceof _Cell.CellError) {
            return val;
          }
          const coercedVal = this.coerceScalarToNumberOrError(val);
          if ((0, _InterpreterValue.isExtendedNumber)(coercedVal)) {
            acc *= (0, _InterpreterValue.getRawValue)(coercedVal);
          } else {
            acc = 0;
          }
        }
        ret += acc;
      }
      return ret;
    });
  }
}
exports.SumprodPlugin = SumprodPlugin;
SumprodPlugin.implementedFunctions = {
  'SUMPRODUCT': {
    method: 'sumproduct',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.RANGE
    }],
    repeatLastArgs: 1
  }
};