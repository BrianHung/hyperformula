"use strict";

exports.__esModule = true;
exports.ArrayPlugin = void 0;
var _ArraySize = require("../../ArraySize");
var _Cell = require("../../Cell");
var _errorMessage = require("../../error-message");
var _parser = require("../../parser");
var _ArithmeticHelper = require("../ArithmeticHelper");
var _InterpreterState = require("../InterpreterState");
var _SimpleRangeValue = require("../../SimpleRangeValue");
var _FunctionPlugin = require("./FunctionPlugin");
/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */

class ArrayPlugin extends _FunctionPlugin.FunctionPlugin {
  arrayformula(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('ARRAYFORMULA'), value => value);
  }
  arrayformulaArraySize(ast, state) {
    if (ast.args.length !== 1) {
      return _ArraySize.ArraySize.error();
    }
    const metadata = this.metadata('ARRAYFORMULA');
    const subChecks = ast.args.map(arg => {
      var _a;
      return this.arraySizeForAst(arg, new _InterpreterState.InterpreterState(state.formulaAddress, state.arraysFlag || ((_a = metadata === null || metadata === void 0 ? void 0 : metadata.arrayFunction) !== null && _a !== void 0 ? _a : false)));
    });
    return subChecks[0];
  }
  arrayconstrain(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('ARRAY_CONSTRAIN'), (range, numRows, numCols) => {
      numRows = Math.min(numRows, range.height());
      numCols = Math.min(numCols, range.width());
      const data = range.data;
      const ret = [];
      for (let i = 0; i < numRows; i++) {
        ret.push(data[i].slice(0, numCols));
      }
      return _SimpleRangeValue.SimpleRangeValue.onlyValues(ret);
    });
  }
  arrayconstrainArraySize(ast, state) {
    if (ast.args.length !== 3) {
      return _ArraySize.ArraySize.error();
    }
    const metadata = this.metadata('ARRAY_CONSTRAIN');
    const subChecks = ast.args.map(arg => {
      var _a;
      return this.arraySizeForAst(arg, new _InterpreterState.InterpreterState(state.formulaAddress, state.arraysFlag || ((_a = metadata === null || metadata === void 0 ? void 0 : metadata.arrayFunction) !== null && _a !== void 0 ? _a : false)));
    });
    let {
      height,
      width
    } = subChecks[0];
    if (ast.args[1].type === _parser.AstNodeType.NUMBER) {
      height = Math.min(height, ast.args[1].value);
    }
    if (ast.args[2].type === _parser.AstNodeType.NUMBER) {
      width = Math.min(width, ast.args[2].value);
    }
    if (height < 1 || width < 1 || !Number.isInteger(height) || !Number.isInteger(width)) {
      return _ArraySize.ArraySize.error();
    }
    return new _ArraySize.ArraySize(width, height);
  }
  filter(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('FILTER'), (rangeVals, ...rangeFilters) => {
      for (const filter of rangeFilters) {
        if (rangeVals.width() !== filter.width() || rangeVals.height() !== filter.height()) {
          return new _Cell.CellError(_Cell.ErrorType.NA, _errorMessage.ErrorMessage.EqualLength);
        }
      }
      if (rangeVals.width() > 1 && rangeVals.height() > 1) {
        return new _Cell.CellError(_Cell.ErrorType.NA, _errorMessage.ErrorMessage.WrongDimension);
      }
      const vals = rangeVals.data;
      const ret = [];
      for (let i = 0; i < rangeVals.height(); i++) {
        const row = [];
        for (let j = 0; j < rangeVals.width(); j++) {
          let ok = true;
          for (const filter of rangeFilters) {
            const val = (0, _ArithmeticHelper.coerceScalarToBoolean)(filter.data[i][j]);
            if (val !== true) {
              ok = false;
              break;
            }
          }
          if (ok) {
            row.push(vals[i][j]);
          }
        }
        if (row.length > 0) {
          ret.push(row);
        }
      }
      if (ret.length > 0) {
        return _SimpleRangeValue.SimpleRangeValue.onlyValues(ret);
      } else {
        return new _Cell.CellError(_Cell.ErrorType.NA, _errorMessage.ErrorMessage.EmptyRange);
      }
    });
  }
  filterArraySize(ast, state) {
    if (ast.args.length <= 1) {
      return _ArraySize.ArraySize.error();
    }
    const metadata = this.metadata('FILTER');
    const subChecks = ast.args.map(arg => {
      var _a;
      return this.arraySizeForAst(arg, new _InterpreterState.InterpreterState(state.formulaAddress, state.arraysFlag || ((_a = metadata === null || metadata === void 0 ? void 0 : metadata.arrayFunction) !== null && _a !== void 0 ? _a : false)));
    });
    const width = Math.max(...subChecks.map(val => val.width));
    const height = Math.max(...subChecks.map(val => val.height));
    return new _ArraySize.ArraySize(width, height);
  }
}
exports.ArrayPlugin = ArrayPlugin;
ArrayPlugin.implementedFunctions = {
  'ARRAYFORMULA': {
    method: 'arrayformula',
    arraySizeMethod: 'arrayformulaArraySize',
    arrayFunction: true,
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.ANY
    }]
  },
  'ARRAY_CONSTRAIN': {
    method: 'arrayconstrain',
    arraySizeMethod: 'arrayconstrainArraySize',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.RANGE
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.INTEGER,
      minValue: 1
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.INTEGER,
      minValue: 1
    }],
    vectorizationForbidden: true
  },
  'FILTER': {
    method: 'filter',
    arraySizeMethod: 'filterArraySize',
    arrayFunction: true,
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.RANGE
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.RANGE
    }],
    repeatLastArgs: 1
  }
};