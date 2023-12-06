"use strict";

exports.__esModule = true;
exports.InformationPlugin = void 0;
var _Cell = require("../../Cell");
var _FormulaCellVertex = require("../../DependencyGraph/FormulaCellVertex");
var _errorMessage = require("../../error-message");
var _parser = require("../../parser");
var _InterpreterValue = require("../InterpreterValue");
var _SimpleRangeValue = require("../../SimpleRangeValue");
var _FunctionPlugin = require("./FunctionPlugin");
/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */

/**
 * Interpreter plugin containing information functions
 */
class InformationPlugin extends _FunctionPlugin.FunctionPlugin {
  /**
   * Corresponds to ISBINARY(value)
   *
   * Returns true if provided value is a valid binary number
   *
   * @param ast
   * @param state
   */
  isbinary(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('ISBINARY'), arg => /^[01]{1,10}$/.test(arg));
  }
  /**
   * Corresponds to ISERR(value)
   *
   * Returns true if provided value is an error except #N/A!
   *
   * @param ast
   * @param state
   */
  iserr(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('ISERR'), arg => arg instanceof _Cell.CellError && arg.type !== _Cell.ErrorType.NA);
  }
  /**
   * Corresponds to ISERROR(value)
   *
   * Checks whether provided value is an error
   *
   * @param ast
   * @param state
   */
  iserror(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('ISERROR'), arg => arg instanceof _Cell.CellError);
  }
  /**
   * Corresponds to ISFORMULA(value)
   *
   * Checks whether referenced cell is a formula
   *
   * @param ast
   * @param state
   */
  isformula(ast, state) {
    return this.runFunctionWithReferenceArgument(ast.args, state, this.metadata('ISFORMULA'), () => new _Cell.CellError(_Cell.ErrorType.NA, _errorMessage.ErrorMessage.WrongArgNumber), reference => {
      const vertex = this.dependencyGraph.addressMapping.getCell(reference);
      return vertex instanceof _FormulaCellVertex.FormulaVertex;
    });
  }
  /**
   * Corresponds to ISBLANK(value)
   *
   * Checks whether provided cell reference is empty
   *
   * @param ast
   * @param state
   */
  isblank(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('ISBLANK'), arg => arg === _InterpreterValue.EmptyValue);
  }
  /**
   * Corresponds to ISNA(value)
   *
   * Returns true if provided value is #N/A! error
   *
   * @param ast
   * @param state
   */
  isna(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('ISNA'), arg => arg instanceof _Cell.CellError && arg.type == _Cell.ErrorType.NA);
  }
  /**
   * Corresponds to ISNUMBER(value)
   *
   * Checks whether provided cell reference is a number
   *
   * @param ast
   * @param state
   */
  isnumber(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('ISNUMBER'), _InterpreterValue.isExtendedNumber);
  }
  /**
   * Corresponds to ISLOGICAL(value)
   *
   * Checks whether provided cell reference is of logical type
   *
   * @param ast
   * @param state
   */
  islogical(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('ISLOGICAL'), arg => typeof arg === 'boolean');
  }
  /**
   * Corresponds to ISREF(value)
   *
   * Returns true if provided value is #REF! error
   *
   * @param ast
   * @param state
   */
  isref(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('ISREF'), arg => arg instanceof _Cell.CellError && (arg.type == _Cell.ErrorType.REF || arg.type == _Cell.ErrorType.CYCLE));
  }
  /**
   * Corresponds to ISTEXT(value)
   *
   * Checks whether provided cell reference is of logical type
   *
   * @param ast
   * @param state
   */
  istext(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('ISTEXT'), arg => typeof arg === 'string');
  }
  /**
   * Corresponds to ISNONTEXT(value)
   *
   * Checks whether provided cell reference is of logical type
   *
   * @param ast
   * @param state
   */
  isnontext(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('ISNONTEXT'), arg => !(typeof arg === 'string'));
  }
  /**
   * Corresponds to COLUMN(reference)
   *
   * Returns column number of a reference or a formula cell if reference not provided
   *
   * @param ast
   * @param state
   */
  column(ast, state) {
    return this.runFunctionWithReferenceArgument(ast.args, state, this.metadata('COLUMN'), () => state.formulaAddress.col + 1, reference => reference.col + 1);
  }
  /**
   * Corresponds to COLUMNS(range)
   *
   * Returns number of columns in provided range of cells
   *
   * @param ast
   * @param state
   */
  columns(ast, state) {
    if (ast.args.length !== 1) {
      return new _Cell.CellError(_Cell.ErrorType.NA, _errorMessage.ErrorMessage.WrongArgNumber);
    }
    if (ast.args.some(astIt => astIt.type === _parser.AstNodeType.EMPTY)) {
      return new _Cell.CellError(_Cell.ErrorType.NUM, _errorMessage.ErrorMessage.EmptyArg);
    }
    let argAst = ast.args[0];
    while (argAst.type === _parser.AstNodeType.PARENTHESIS) {
      argAst = argAst.expression;
    }
    if (argAst.type === _parser.AstNodeType.CELL_RANGE || argAst.type === _parser.AstNodeType.COLUMN_RANGE) {
      return argAst.end.col - argAst.start.col + 1;
    } else if (argAst.type === _parser.AstNodeType.CELL_REFERENCE) {
      return 1;
    } else if (argAst.type === _parser.AstNodeType.ROW_RANGE) {
      return this.config.maxColumns;
    } else {
      const val = this.evaluateAst(argAst, state);
      if (val instanceof _SimpleRangeValue.SimpleRangeValue) {
        return val.width();
      } else if (val instanceof _Cell.CellError) {
        return val;
      } else {
        return 1;
      }
    }
  }
  /**
   * Corresponds to ROW(reference)
   *
   * Returns row number of a reference or a formula cell if reference not provided
   *
   * @param ast
   * @param state
   */
  row(ast, state) {
    return this.runFunctionWithReferenceArgument(ast.args, state, this.metadata('ROW'), () => state.formulaAddress.row + 1, reference => reference.row + 1);
  }
  /**
   * Corresponds to ROWS(range)
   *
   * Returns number of rows in provided range of cells
   *
   * @param ast
   * @param state
   */
  rows(ast, state) {
    if (ast.args.length !== 1) {
      return new _Cell.CellError(_Cell.ErrorType.NA, _errorMessage.ErrorMessage.WrongArgNumber);
    }
    if (ast.args.some(astIt => astIt.type === _parser.AstNodeType.EMPTY)) {
      return new _Cell.CellError(_Cell.ErrorType.NUM, _errorMessage.ErrorMessage.EmptyArg);
    }
    let argAst = ast.args[0];
    while (argAst.type === _parser.AstNodeType.PARENTHESIS) {
      argAst = argAst.expression;
    }
    if (argAst.type === _parser.AstNodeType.CELL_RANGE || argAst.type === _parser.AstNodeType.ROW_RANGE) {
      return argAst.end.row - argAst.start.row + 1;
    } else if (argAst.type === _parser.AstNodeType.CELL_REFERENCE) {
      return 1;
    } else if (argAst.type === _parser.AstNodeType.COLUMN_RANGE) {
      return this.config.maxRows;
    } else {
      const val = this.evaluateAst(argAst, state);
      if (val instanceof _SimpleRangeValue.SimpleRangeValue) {
        return val.height();
      } else if (val instanceof _Cell.CellError) {
        return val;
      } else {
        return 1;
      }
    }
  }
  /**
   * Corresponds to INDEX
   *
   * Returns specific position in 2d array.
   *
   * @param ast
   * @param state
   */
  index(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('INDEX'), (rangeValue, row, col) => {
      var _a, _b, _c, _d, _e, _f;
      if (col < 1 || row < 1) {
        return new _Cell.CellError(_Cell.ErrorType.VALUE, _errorMessage.ErrorMessage.LessThanOne);
      }
      if (col > rangeValue.width() || row > rangeValue.height()) {
        return new _Cell.CellError(_Cell.ErrorType.NUM, _errorMessage.ErrorMessage.ValueLarge);
      }
      return (_f = (_c = (_b = (_a = rangeValue === null || rangeValue === void 0 ? void 0 : rangeValue.data) === null || _a === void 0 ? void 0 : _a[row - 1]) === null || _b === void 0 ? void 0 : _b[col - 1]) !== null && _c !== void 0 ? _c : (_e = (_d = rangeValue === null || rangeValue === void 0 ? void 0 : rangeValue.data) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e[0]) !== null && _f !== void 0 ? _f : new _Cell.CellError(_Cell.ErrorType.VALUE, _errorMessage.ErrorMessage.CellRangeExpected);
    });
  }
  /**
   * Corresponds to NA()
   *
   * Returns #N/A!
   *
   * @param _ast
   * @param _state
   */
  na(_ast, _state) {
    return new _Cell.CellError(_Cell.ErrorType.NA);
  }
  /**
   * Corresponds to SHEET(value)
   *
   * Returns sheet number of a given value or a formula sheet number if no argument is provided
   *
   * @param ast
   * @param state
   */
  sheet(ast, state) {
    return this.runFunctionWithReferenceArgument(ast.args, state, this.metadata('SHEET'), () => state.formulaAddress.sheet + 1, reference => reference.sheet + 1, value => {
      const sheetNumber = this.dependencyGraph.sheetMapping.get(value);
      if (sheetNumber !== undefined) {
        return sheetNumber + 1;
      } else {
        return new _Cell.CellError(_Cell.ErrorType.NA, _errorMessage.ErrorMessage.SheetRef);
      }
    });
  }
  /**
   * Corresponds to SHEETS(value)
   *
   * Returns number of sheet of a given reference or number of all sheets in workbook when no argument is provided.
   * It returns always 1 for a valid reference as 3D references are not supported.
   *
   * @param ast
   * @param state
   */
  sheets(ast, state) {
    return this.runFunctionWithReferenceArgument(ast.args, state, this.metadata('SHEETS'), () => this.dependencyGraph.sheetMapping.numberOfSheets(),
    // return number of sheets if no argument
    () => 1,
    // return 1 for valid reference
    () => new _Cell.CellError(_Cell.ErrorType.VALUE, _errorMessage.ErrorMessage.CellRefExpected) // error otherwise
    );
  }
}
exports.InformationPlugin = InformationPlugin;
InformationPlugin.implementedFunctions = {
  'COLUMN': {
    method: 'column',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NOERROR,
      optionalArg: true
    }],
    isDependentOnSheetStructureChange: true,
    doesNotNeedArgumentsToBeComputed: true,
    vectorizationForbidden: true
  },
  'COLUMNS': {
    method: 'columns',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.RANGE
    }],
    isDependentOnSheetStructureChange: true,
    doesNotNeedArgumentsToBeComputed: true,
    vectorizationForbidden: true
  },
  'ISBINARY': {
    method: 'isbinary',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.STRING
    }]
  },
  'ISERR': {
    method: 'iserr',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.SCALAR
    }]
  },
  'ISFORMULA': {
    method: 'isformula',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NOERROR
    }],
    doesNotNeedArgumentsToBeComputed: true,
    vectorizationForbidden: true
  },
  'ISNA': {
    method: 'isna',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.SCALAR
    }]
  },
  'ISREF': {
    method: 'isref',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.SCALAR
    }],
    vectorizationForbidden: true
  },
  'ISERROR': {
    method: 'iserror',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.SCALAR
    }]
  },
  'ISBLANK': {
    method: 'isblank',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.SCALAR
    }]
  },
  'ISNUMBER': {
    method: 'isnumber',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.SCALAR
    }]
  },
  'ISLOGICAL': {
    method: 'islogical',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.SCALAR
    }]
  },
  'ISTEXT': {
    method: 'istext',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.SCALAR
    }]
  },
  'ISNONTEXT': {
    method: 'isnontext',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.SCALAR
    }]
  },
  'INDEX': {
    method: 'index',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.RANGE
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      defaultValue: 1
    }]
  },
  'NA': {
    method: 'na',
    parameters: []
  },
  'ROW': {
    method: 'row',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NOERROR,
      optionalArg: true
    }],
    isDependentOnSheetStructureChange: true,
    doesNotNeedArgumentsToBeComputed: true,
    vectorizationForbidden: true
  },
  'ROWS': {
    method: 'rows',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.RANGE
    }],
    isDependentOnSheetStructureChange: true,
    doesNotNeedArgumentsToBeComputed: true,
    vectorizationForbidden: true
  },
  'SHEET': {
    method: 'sheet',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.STRING
    }],
    doesNotNeedArgumentsToBeComputed: true,
    vectorizationForbidden: true
  },
  'SHEETS': {
    method: 'sheets',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.STRING
    }],
    doesNotNeedArgumentsToBeComputed: true,
    vectorizationForbidden: true
  }
};