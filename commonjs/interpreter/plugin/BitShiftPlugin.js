"use strict";

exports.__esModule = true;
exports.BitShiftPlugin = void 0;
var _Cell = require("../../Cell");
var _errorMessage = require("../../error-message");
var _FunctionPlugin = require("./FunctionPlugin");
/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */

const MAX_48BIT_INTEGER = 281474976710655;
const SHIFT_MIN_POSITIONS = -53;
const SHIFT_MAX_POSITIONS = 53;
class BitShiftPlugin extends _FunctionPlugin.FunctionPlugin {
  bitlshift(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('BITLSHIFT'), shiftLeft);
  }
  bitrshift(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('BITRSHIFT'), shiftRight);
  }
}
exports.BitShiftPlugin = BitShiftPlugin;
BitShiftPlugin.implementedFunctions = {
  'BITLSHIFT': {
    method: 'bitlshift',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.INTEGER,
      minValue: 0
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.INTEGER,
      minValue: SHIFT_MIN_POSITIONS,
      maxValue: SHIFT_MAX_POSITIONS
    }]
  },
  'BITRSHIFT': {
    method: 'bitrshift',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.INTEGER,
      minValue: 0
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.INTEGER,
      minValue: SHIFT_MIN_POSITIONS,
      maxValue: SHIFT_MAX_POSITIONS
    }]
  }
};
function shiftLeft(value, positions) {
  if (positions < 0) {
    return shiftRight(value, -positions);
  } else {
    return validate(value * Math.pow(2, positions));
  }
}
function shiftRight(value, positions) {
  if (positions < 0) {
    return shiftLeft(value, -positions);
  } else {
    return validate(Math.floor(value / Math.pow(2, positions)));
  }
}
function validate(result) {
  if (result > MAX_48BIT_INTEGER) {
    return new _Cell.CellError(_Cell.ErrorType.NUM, _errorMessage.ErrorMessage.BitshiftLong);
  } else {
    return result;
  }
}