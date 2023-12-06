"use strict";

exports.__esModule = true;
exports.NumericAggregationPlugin = void 0;
var _AbsoluteCellRange = require("../../AbsoluteCellRange");
var _Cell = require("../../Cell");
var _errorMessage = require("../../error-message");
var _errors = require("../../errors");
var _parser = require("../../parser");
var _ArithmeticHelper = require("../ArithmeticHelper");
var _InterpreterValue = require("../InterpreterValue");
var _SimpleRangeValue = require("../../SimpleRangeValue");
var _FunctionPlugin = require("./FunctionPlugin");
/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */

function zeroForInfinite(value) {
  if ((0, _InterpreterValue.isExtendedNumber)(value) && !Number.isFinite((0, _InterpreterValue.getRawValue)(value))) {
    return 0;
  } else {
    return value;
  }
}
class MomentsAggregate {
  constructor(sumsq, sum, count) {
    this.sumsq = sumsq;
    this.sum = sum;
    this.count = count;
  }
  static single(arg) {
    return new MomentsAggregate(arg * arg, arg, 1);
  }
  compose(other) {
    return new MomentsAggregate(this.sumsq + other.sumsq, this.sum + other.sum, this.count + other.count);
  }
  averageValue() {
    if (this.count > 0) {
      return this.sum / this.count;
    } else {
      return undefined;
    }
  }
  varSValue() {
    if (this.count > 1) {
      return (this.sumsq - this.sum * this.sum / this.count) / (this.count - 1);
    } else {
      return undefined;
    }
  }
  varPValue() {
    if (this.count > 0) {
      return (this.sumsq - this.sum * this.sum / this.count) / this.count;
    } else {
      return undefined;
    }
  }
}
MomentsAggregate.empty = new MomentsAggregate(0, 0, 0);
class NumericAggregationPlugin extends _FunctionPlugin.FunctionPlugin {
  constructor() {
    super(...arguments);
    this.addWithEpsilonRaw = (left, right) => this.arithmeticHelper.addWithEpsilonRaw(left, right);
  }
  /**
   * Corresponds to SUM(Number1, Number2, ...).
   *
   * Returns a sum of given numbers.
   *
   * @param ast
   * @param state
   */
  sum(ast, state) {
    return this.doSum(ast.args, state);
  }
  sumsq(ast, state) {
    return this.reduce(ast.args, state, 0, 'SUMSQ', this.addWithEpsilonRaw, arg => Math.pow((0, _InterpreterValue.getRawValue)(arg), 2), strictlyNumbers);
  }
  /**
   * Corresponds to MAX(Number1, Number2, ...).
   *
   * Returns a max of given numbers.
   *
   * @param ast
   * @param state
   */
  max(ast, state) {
    return this.doMax(ast.args, state);
  }
  maxa(ast, state) {
    const value = this.reduce(ast.args, state, Number.NEGATIVE_INFINITY, 'MAXA', (left, right) => Math.max(left, right), _InterpreterValue.getRawValue, numbersBooleans);
    return zeroForInfinite(value);
  }
  /**
   * Corresponds to MIN(Number1, Number2, ...).
   *
   * Returns a min of given numbers.
   *
   * @param ast
   * @param state
   */
  min(ast, state) {
    return this.doMin(ast.args, state);
  }
  mina(ast, state) {
    const value = this.reduce(ast.args, state, Number.POSITIVE_INFINITY, 'MINA', (left, right) => Math.min(left, right), _InterpreterValue.getRawValue, numbersBooleans);
    return zeroForInfinite(value);
  }
  count(ast, state) {
    return this.doCount(ast.args, state);
  }
  counta(ast, state) {
    return this.doCounta(ast.args, state);
  }
  average(ast, state) {
    return this.doAverage(ast.args, state);
  }
  averagea(ast, state) {
    var _a;
    const result = this.reduce(ast.args, state, MomentsAggregate.empty, '_AGGREGATE_A', (left, right) => left.compose(right), arg => MomentsAggregate.single((0, _InterpreterValue.getRawValue)(arg)), numbersBooleans);
    if (result instanceof _Cell.CellError) {
      return result;
    } else {
      return (_a = result.averageValue()) !== null && _a !== void 0 ? _a : new _Cell.CellError(_Cell.ErrorType.DIV_BY_ZERO);
    }
  }
  vars(ast, state) {
    return this.doVarS(ast.args, state);
  }
  varp(ast, state) {
    return this.doVarP(ast.args, state);
  }
  vara(ast, state) {
    var _a;
    const result = this.reduceAggregateA(ast.args, state);
    if (result instanceof _Cell.CellError) {
      return result;
    } else {
      return (_a = result.varSValue()) !== null && _a !== void 0 ? _a : new _Cell.CellError(_Cell.ErrorType.DIV_BY_ZERO);
    }
  }
  varpa(ast, state) {
    var _a;
    const result = this.reduceAggregateA(ast.args, state);
    if (result instanceof _Cell.CellError) {
      return result;
    } else {
      return (_a = result.varPValue()) !== null && _a !== void 0 ? _a : new _Cell.CellError(_Cell.ErrorType.DIV_BY_ZERO);
    }
  }
  stdevs(ast, state) {
    return this.doStdevS(ast.args, state);
  }
  stdevp(ast, state) {
    return this.doStdevP(ast.args, state);
  }
  stdeva(ast, state) {
    const result = this.reduceAggregateA(ast.args, state);
    if (result instanceof _Cell.CellError) {
      return result;
    } else {
      const val = result.varSValue();
      return val === undefined ? new _Cell.CellError(_Cell.ErrorType.DIV_BY_ZERO) : Math.sqrt(val);
    }
  }
  stdevpa(ast, state) {
    const result = this.reduceAggregateA(ast.args, state);
    if (result instanceof _Cell.CellError) {
      return result;
    } else {
      const val = result.varPValue();
      return val === undefined ? new _Cell.CellError(_Cell.ErrorType.DIV_BY_ZERO) : Math.sqrt(val);
    }
  }
  product(ast, state) {
    return this.doProduct(ast.args, state);
  }
  subtotal(ast, state) {
    if (ast.args.length < 2) {
      return new _Cell.CellError(_Cell.ErrorType.NA, _errorMessage.ErrorMessage.WrongArgNumber);
    }
    const functionType = this.coerceToType(this.evaluateAst(ast.args[0], state), {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }, state);
    const args = ast.args.slice(1);
    switch (functionType) {
      case 1:
      case 101:
        return this.doAverage(args, state);
      case 2:
      case 102:
        return this.doCount(args, state);
      case 3:
      case 103:
        return this.doCounta(args, state);
      case 4:
      case 104:
        return this.doMax(args, state);
      case 5:
      case 105:
        return this.doMin(args, state);
      case 6:
      case 106:
        return this.doProduct(args, state);
      case 7:
      case 107:
        return this.doStdevS(args, state);
      case 8:
      case 108:
        return this.doStdevP(args, state);
      case 9:
      case 109:
        return this.doSum(args, state);
      case 10:
      case 110:
        return this.doVarS(args, state);
      case 11:
      case 111:
        return this.doVarP(args, state);
      default:
        return new _Cell.CellError(_Cell.ErrorType.VALUE, _errorMessage.ErrorMessage.BadMode);
    }
  }
  reduceAggregate(args, state) {
    return this.reduce(args, state, MomentsAggregate.empty, '_AGGREGATE', (left, right) => {
      return left.compose(right);
    }, arg => {
      return MomentsAggregate.single((0, _InterpreterValue.getRawValue)(arg));
    }, strictlyNumbers);
  }
  reduceAggregateA(args, state) {
    return this.reduce(args, state, MomentsAggregate.empty, '_AGGREGATE_A', (left, right) => {
      return left.compose(right);
    }, arg => {
      return MomentsAggregate.single((0, _InterpreterValue.getRawValue)(arg));
    }, numbersBooleans);
  }
  doAverage(args, state) {
    var _a;
    const result = this.reduceAggregate(args, state);
    if (result instanceof _Cell.CellError) {
      return result;
    } else {
      return (_a = result.averageValue()) !== null && _a !== void 0 ? _a : new _Cell.CellError(_Cell.ErrorType.DIV_BY_ZERO);
    }
  }
  doVarS(args, state) {
    var _a;
    const result = this.reduceAggregate(args, state);
    if (result instanceof _Cell.CellError) {
      return result;
    } else {
      return (_a = result.varSValue()) !== null && _a !== void 0 ? _a : new _Cell.CellError(_Cell.ErrorType.DIV_BY_ZERO);
    }
  }
  doVarP(args, state) {
    var _a;
    const result = this.reduceAggregate(args, state);
    if (result instanceof _Cell.CellError) {
      return result;
    } else {
      return (_a = result.varPValue()) !== null && _a !== void 0 ? _a : new _Cell.CellError(_Cell.ErrorType.DIV_BY_ZERO);
    }
  }
  doStdevS(args, state) {
    const result = this.reduceAggregate(args, state);
    if (result instanceof _Cell.CellError) {
      return result;
    } else {
      const val = result.varSValue();
      return val === undefined ? new _Cell.CellError(_Cell.ErrorType.DIV_BY_ZERO) : Math.sqrt(val);
    }
  }
  doStdevP(args, state) {
    const result = this.reduceAggregate(args, state);
    if (result instanceof _Cell.CellError) {
      return result;
    } else {
      const val = result.varPValue();
      return val === undefined ? new _Cell.CellError(_Cell.ErrorType.DIV_BY_ZERO) : Math.sqrt(val);
    }
  }
  doCount(args, state) {
    return this.reduce(args, state, 0, 'COUNT', (left, right) => left + right, _InterpreterValue.getRawValue, arg => (0, _InterpreterValue.isExtendedNumber)(arg) ? 1 : 0);
  }
  doCounta(args, state) {
    return this.reduce(args, state, 0, 'COUNTA', (left, right) => left + right, _InterpreterValue.getRawValue, arg => arg === _InterpreterValue.EmptyValue ? 0 : 1);
  }
  doMax(args, state) {
    const value = this.reduce(args, state, Number.NEGATIVE_INFINITY, 'MAX', (left, right) => Math.max(left, right), _InterpreterValue.getRawValue, strictlyNumbers);
    return zeroForInfinite(value);
  }
  doMin(args, state) {
    const value = this.reduce(args, state, Number.POSITIVE_INFINITY, 'MIN', (left, right) => Math.min(left, right), _InterpreterValue.getRawValue, strictlyNumbers);
    return zeroForInfinite(value);
  }
  doSum(args, state) {
    return this.reduce(args, state, 0, 'SUM', this.addWithEpsilonRaw, _InterpreterValue.getRawValue, strictlyNumbers);
  }
  doProduct(args, state) {
    return this.reduce(args, state, 1, 'PRODUCT', (left, right) => left * right, _InterpreterValue.getRawValue, strictlyNumbers);
  }
  /**
   * Reduces procedure arguments with given reducing function
   *
   * @param args
   * @param state
   * @param initialAccValue - "neutral" value (equivalent of 0)
   * @param functionName - function name to use as cache key
   * @param reducingFunction - reducing function
   * @param mapFunction
   * @param coercionFunction
   */
  reduce(args, state, initialAccValue, functionName, reducingFunction, mapFunction, coercionFunction) {
    if (args.length < 1) {
      return new _Cell.CellError(_Cell.ErrorType.NA, _errorMessage.ErrorMessage.WrongArgNumber);
    }
    return args.reduce((acc, arg) => {
      if (acc instanceof _Cell.CellError) {
        return acc;
      }
      if (arg.type === _parser.AstNodeType.CELL_RANGE || arg.type === _parser.AstNodeType.COLUMN_RANGE || arg.type === _parser.AstNodeType.ROW_RANGE) {
        const val = this.evaluateRange(arg, state, initialAccValue, functionName, reducingFunction, mapFunction, coercionFunction);
        if (val instanceof _Cell.CellError) {
          return val;
        }
        return reducingFunction(val, acc);
      }
      let value;
      value = this.evaluateAst(arg, state);
      if (value instanceof _SimpleRangeValue.SimpleRangeValue) {
        const coercedRangeValues = Array.from(value.valuesFromTopLeftCorner()).map(coercionFunction).filter(arg => arg !== undefined);
        return coercedRangeValues.map(arg => {
          if (arg instanceof _Cell.CellError) {
            return arg;
          } else {
            return mapFunction(arg);
          }
        }).reduce((left, right) => {
          if (left instanceof _Cell.CellError) {
            return left;
          } else if (right instanceof _Cell.CellError) {
            return right;
          } else {
            return reducingFunction(left, right);
          }
        }, acc);
      } else if (arg.type === _parser.AstNodeType.CELL_REFERENCE) {
        value = coercionFunction(value);
        if (value === undefined) {
          return acc;
        }
      } else {
        value = this.coerceScalarToNumberOrError(value);
        value = coercionFunction(value);
        if (value === undefined) {
          return acc;
        }
      }
      if (value instanceof _Cell.CellError) {
        return value;
      }
      return reducingFunction(acc, mapFunction(value));
    }, initialAccValue);
  }
  /**
   * Performs range operation on given range
   *
   * @param ast - cell range ast
   * @param state
   * @param initialAccValue - initial accumulator value for reducing function
   * @param functionName - function name to use as cache key
   * @param reducingFunction - reducing function
   * @param mapFunction
   * @param coercionFunction
   */
  evaluateRange(ast, state, initialAccValue, functionName, reducingFunction, mapFunction, coercionFunction) {
    let range;
    try {
      range = _AbsoluteCellRange.AbsoluteCellRange.fromAst(ast, state.formulaAddress);
    } catch (err) {
      if (err instanceof _errors.SheetsNotEqual) {
        return new _Cell.CellError(_Cell.ErrorType.REF, _errorMessage.ErrorMessage.RangeManySheets);
      } else {
        throw err;
      }
    }
    const rangeVertex = this.dependencyGraph.getRange(range.start, range.end);
    if (rangeVertex === undefined) {
      throw new Error('Range does not exists in graph');
    }
    let value = rangeVertex.getFunctionValue(functionName);
    if (value === undefined) {
      const rangeValues = this.getRangeValues(functionName, range, rangeVertex, mapFunction, coercionFunction);
      value = rangeValues.reduce((arg1, arg2) => {
        if (arg1 instanceof _Cell.CellError) {
          return arg1;
        } else if (arg2 instanceof _Cell.CellError) {
          return arg2;
        } else {
          return reducingFunction(arg1, arg2);
        }
      }, initialAccValue);
      rangeVertex.setFunctionValue(functionName, value);
    }
    return value;
  }
  /**
   * Returns list of values for given range and function name
   *
   * If range is dependent on smaller range, list will contain value of smaller range for this function
   * and values of cells that are not present in smaller range
   *
   * @param functionName - function name (e.g. SUM)
   * @param range - cell range
   * @param rangeVertex
   * @param mapFunction
   * @param coercionFunction
   */
  getRangeValues(functionName, range, rangeVertex, mapFunction, coercionFunction) {
    const rangeResult = [];
    const {
      smallerRangeVertex,
      restRange
    } = this.dependencyGraph.rangeMapping.findSmallerRange(range);
    let actualRange;
    if (smallerRangeVertex !== undefined && this.dependencyGraph.existsEdge(smallerRangeVertex, rangeVertex)) {
      const cachedValue = smallerRangeVertex.getFunctionValue(functionName);
      if (cachedValue !== undefined) {
        rangeResult.push(cachedValue);
      } else {
        for (const cellFromRange of smallerRangeVertex.range.addresses(this.dependencyGraph)) {
          const val = coercionFunction(this.dependencyGraph.getScalarValue(cellFromRange));
          if (val instanceof _Cell.CellError) {
            rangeResult.push(val);
          } else if (val !== undefined) {
            rangeResult.push(mapFunction(val));
          }
        }
      }
      actualRange = restRange;
    } else {
      actualRange = range;
    }
    for (const cellFromRange of actualRange.addresses(this.dependencyGraph)) {
      const val = coercionFunction(this.dependencyGraph.getScalarValue(cellFromRange));
      if (val instanceof _Cell.CellError) {
        rangeResult.push(val);
      } else if (val !== undefined) {
        rangeResult.push(mapFunction(val));
      }
    }
    return rangeResult;
  }
}
exports.NumericAggregationPlugin = NumericAggregationPlugin;
NumericAggregationPlugin.implementedFunctions = {
  'SUM': {
    method: 'sum',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.ANY
    }],
    repeatLastArgs: 1
  },
  'SUMSQ': {
    method: 'sumsq',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.ANY
    }],
    repeatLastArgs: 1
  },
  'MAX': {
    method: 'max',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.ANY
    }],
    repeatLastArgs: 1
  },
  'MIN': {
    method: 'min',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.ANY
    }],
    repeatLastArgs: 1
  },
  'MAXA': {
    method: 'maxa',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.ANY
    }],
    repeatLastArgs: 1
  },
  'MINA': {
    method: 'mina',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.ANY
    }],
    repeatLastArgs: 1
  },
  'COUNT': {
    method: 'count',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.ANY
    }],
    repeatLastArgs: 1
  },
  'COUNTA': {
    method: 'counta',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.ANY
    }],
    repeatLastArgs: 1
  },
  'AVERAGE': {
    method: 'average',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.ANY
    }],
    repeatLastArgs: 1
  },
  'AVERAGEA': {
    method: 'averagea',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.ANY
    }],
    repeatLastArgs: 1
  },
  'PRODUCT': {
    method: 'product',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.ANY
    }],
    repeatLastArgs: 1
  },
  'VAR.S': {
    method: 'vars',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.ANY
    }],
    repeatLastArgs: 1
  },
  'VAR.P': {
    method: 'varp',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.ANY
    }],
    repeatLastArgs: 1
  },
  'VARA': {
    method: 'vara',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.ANY
    }],
    repeatLastArgs: 1
  },
  'VARPA': {
    method: 'varpa',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.ANY
    }],
    repeatLastArgs: 1
  },
  'STDEV.S': {
    method: 'stdevs',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.ANY
    }],
    repeatLastArgs: 1
  },
  'STDEV.P': {
    method: 'stdevp',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.ANY
    }],
    repeatLastArgs: 1
  },
  'STDEVA': {
    method: 'stdeva',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.ANY
    }],
    repeatLastArgs: 1
  },
  'STDEVPA': {
    method: 'stdevpa',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.ANY
    }],
    repeatLastArgs: 1
  },
  'SUBTOTAL': {
    method: 'subtotal',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.ANY
    }],
    repeatLastArgs: 1
  }
};
NumericAggregationPlugin.aliases = {
  VAR: 'VAR.S',
  VARP: 'VAR.P',
  STDEV: 'STDEV.S',
  STDEVP: 'STDEV.P',
  VARS: 'VAR.S',
  STDEVS: 'STDEV.S'
};
function strictlyNumbers(arg) {
  if ((0, _InterpreterValue.isExtendedNumber)(arg) || arg instanceof _Cell.CellError) {
    return arg;
  } else {
    return undefined;
  }
}
function numbersBooleans(arg) {
  if (typeof arg === 'boolean') {
    return (0, _ArithmeticHelper.coerceBooleanToNumber)(arg);
  } else if ((0, _InterpreterValue.isExtendedNumber)(arg) || arg instanceof _Cell.CellError) {
    return arg;
  } else if (typeof arg === 'string') {
    return 0;
  } else {
    return undefined;
  }
}