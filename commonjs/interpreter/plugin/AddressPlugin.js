"use strict";

exports.__esModule = true;
exports.AddressPlugin = void 0;
var _addressRepresentationConverters = require("../../parser/addressRepresentationConverters");
var _FunctionPlugin = require("./FunctionPlugin");
var _Cell = require("../../Cell");
var _errorMessage = require("../../error-message");
/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */

var AbsStyle;
(function (AbsStyle) {
  AbsStyle[AbsStyle["FullyAbsolute"] = 1] = "FullyAbsolute";
  AbsStyle[AbsStyle["RowAbsoluteColRelative"] = 2] = "RowAbsoluteColRelative";
  AbsStyle[AbsStyle["RowRelativeColAbsolute"] = 3] = "RowRelativeColAbsolute";
  AbsStyle[AbsStyle["FullyRelative"] = 4] = "FullyRelative";
})(AbsStyle || (AbsStyle = {}));
class AddressPlugin extends _FunctionPlugin.FunctionPlugin {
  verifyAddressArguments(row, col, abs, useA1Style) {
    if (useA1Style) {
      if (row < 1 || col < 1) {
        return new _Cell.CellError(_Cell.ErrorType.VALUE, _errorMessage.ErrorMessage.LessThanOne);
      }
    } else {
      if (AbsStyle.FullyAbsolute == abs) {
        if (row < 1 || col < 1) {
          return new _Cell.CellError(_Cell.ErrorType.VALUE, _errorMessage.ErrorMessage.LessThanOne);
        }
      } else if (AbsStyle.RowAbsoluteColRelative == abs) {
        if (row < 1) {
          return new _Cell.CellError(_Cell.ErrorType.VALUE, _errorMessage.ErrorMessage.LessThanOne);
        }
      } else if (AbsStyle.RowRelativeColAbsolute == abs) {
        if (col < 1) {
          return new _Cell.CellError(_Cell.ErrorType.VALUE, _errorMessage.ErrorMessage.LessThanOne);
        }
      }
    }
    return undefined;
  }
  address(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('ADDRESS'), (row, col, abs, useA1Style, sheetName) => {
      const argumentError = this.verifyAddressArguments(row, col, abs, useA1Style);
      if (argumentError !== undefined) {
        return argumentError;
      }
      const colLetter = (0, _addressRepresentationConverters.columnIndexToLabel)(col - 1);
      let sheetPrefix = '';
      if (sheetName !== undefined && sheetName !== null) {
        sheetPrefix = `${sheetName}!`;
      }
      const r1c1ColSegment = col == 0 ? 'C' : `C[${col}]`;
      const r1c1RowSegment = row == 0 ? 'R' : `R[${row}]`;
      if (AbsStyle.FullyRelative == abs) {
        return useA1Style ? `${sheetPrefix}${colLetter}${row}` : `${sheetPrefix}${r1c1RowSegment}${r1c1ColSegment}`;
      } else if (AbsStyle.RowRelativeColAbsolute == abs) {
        return useA1Style ? `${sheetPrefix}$${colLetter}${row}` : `${sheetPrefix}${r1c1RowSegment}C${col}`;
      } else if (AbsStyle.RowAbsoluteColRelative == abs) {
        return useA1Style ? `${sheetPrefix}${colLetter}$${row}` : `${sheetPrefix}R${row}${r1c1ColSegment}`;
      }
      return useA1Style ? `${sheetPrefix}$${colLetter}$${row}` : `${sheetPrefix}R${row}C${col}`;
    });
  }
}
exports.AddressPlugin = AddressPlugin;
AddressPlugin.implementedFunctions = {
  'ADDRESS': {
    method: 'address',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      optionalArg: true,
      defaultValue: 1,
      minValue: 1,
      maxValue: 4
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.BOOLEAN,
      optionalArg: true,
      defaultValue: true
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.STRING,
      optionalArg: true
    }]
  }
};