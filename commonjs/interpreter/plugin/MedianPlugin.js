"use strict";

exports.__esModule = true;
exports.MedianPlugin = void 0;
var _Cell = require("../../Cell");
var _errorMessage = require("../../error-message");
var _FunctionPlugin = require("./FunctionPlugin");
/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */

/**
 * Interpreter plugin containing MEDIAN function
 */
class MedianPlugin extends _FunctionPlugin.FunctionPlugin {
  /**
   * Corresponds to MEDIAN(Number1, Number2, ...).
   *
   * Returns a median of given numbers.
   *
   * @param ast
   * @param state
   */
  median(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('MEDIAN'), (...args) => {
      const values = this.arithmeticHelper.coerceNumbersExactRanges(args);
      if (values instanceof _Cell.CellError) {
        return values;
      }
      if (values.length === 0) {
        return new _Cell.CellError(_Cell.ErrorType.NUM, _errorMessage.ErrorMessage.OneValue);
      }
      values.sort((a, b) => a - b);
      if (values.length % 2 === 0) {
        return (values[values.length / 2 - 1] + values[values.length / 2]) / 2;
      } else {
        return values[Math.floor(values.length / 2)];
      }
    });
  }
  large(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('LARGE'), (range, n) => {
      const vals = this.arithmeticHelper.manyToExactNumbers(range.valuesFromTopLeftCorner());
      if (vals instanceof _Cell.CellError) {
        return vals;
      }
      vals.sort((a, b) => a - b);
      n = Math.trunc(n);
      if (n > vals.length) {
        return new _Cell.CellError(_Cell.ErrorType.NUM, _errorMessage.ErrorMessage.ValueLarge);
      }
      return vals[vals.length - n];
    });
  }
  small(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('SMALL'), (range, n) => {
      const vals = this.arithmeticHelper.manyToExactNumbers(range.valuesFromTopLeftCorner());
      if (vals instanceof _Cell.CellError) {
        return vals;
      }
      vals.sort((a, b) => a - b);
      n = Math.trunc(n);
      if (n > vals.length) {
        return new _Cell.CellError(_Cell.ErrorType.NUM, _errorMessage.ErrorMessage.ValueLarge);
      }
      return vals[n - 1];
    });
  }
}
exports.MedianPlugin = MedianPlugin;
MedianPlugin.implementedFunctions = {
  'MEDIAN': {
    method: 'median',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.ANY
    }],
    repeatLastArgs: 1
  },
  'LARGE': {
    method: 'large',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.RANGE
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      minValue: 1
    }]
  },
  'SMALL': {
    method: 'small',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.RANGE
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      minValue: 1
    }]
  }
};