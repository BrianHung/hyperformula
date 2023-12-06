"use strict";

exports.__esModule = true;
exports.FormulaTextPlugin = void 0;
var _Cell = require("../../Cell");
var _errorMessage = require("../../error-message");
var _index = require("../index");
var _FunctionPlugin = require("./FunctionPlugin");
/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */

class FormulaTextPlugin extends _index.FunctionPlugin {
  /**
   * Corresponds to FORMULATEXT(value)
   *
   * Returns a formula in a given cell as a string.
   *
   * @param ast
   * @param state
   */
  formulatext(ast, state) {
    return this.runFunctionWithReferenceArgument(ast.args, state, this.metadata('FORMULATEXT'), () => new _Cell.CellError(_Cell.ErrorType.NA, _errorMessage.ErrorMessage.WrongArgNumber), cellReference => {
      var _a;
      return (_a = this.serialization.getCellFormula(cellReference)) !== null && _a !== void 0 ? _a : new _Cell.CellError(_Cell.ErrorType.NA, _errorMessage.ErrorMessage.Formula);
    });
  }
}
exports.FormulaTextPlugin = FormulaTextPlugin;
FormulaTextPlugin.implementedFunctions = {
  'FORMULATEXT': {
    method: 'formulatext',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NOERROR
    }],
    doesNotNeedArgumentsToBeComputed: true,
    isDependentOnSheetStructureChange: true,
    vectorizationForbidden: true
  }
};