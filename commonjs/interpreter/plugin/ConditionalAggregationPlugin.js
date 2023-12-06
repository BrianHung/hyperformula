"use strict";

exports.__esModule = true;
exports.ConditionalAggregationPlugin = void 0;
var _Cell = require("../../Cell");
var _errorMessage = require("../../error-message");
var _CriterionFunctionCompute = require("../CriterionFunctionCompute");
var _InterpreterValue = require("../InterpreterValue");
var _FunctionPlugin = require("./FunctionPlugin");
/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */

class AverageResult {
  constructor(sum, count) {
    this.sum = sum;
    this.count = count;
  }
  static single(arg) {
    return new AverageResult(arg, 1);
  }
  compose(other) {
    return new AverageResult(this.sum + other.sum, this.count + other.count);
  }
  averageValue() {
    if (this.count > 0) {
      return this.sum / this.count;
    } else {
      return undefined;
    }
  }
}
AverageResult.empty = new AverageResult(0, 0);
/** Computes key for criterion function cache */
function conditionalAggregationFunctionCacheKey(functionName) {
  return conditions => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const conditionsStrings = conditions.map(c => `${c.conditionRange.range.sheet},${c.conditionRange.range.start.col},${c.conditionRange.range.start.row}`);
    return [functionName, ...conditionsStrings].join(',');
  };
}
function zeroForInfinite(value) {
  if ((0, _InterpreterValue.isExtendedNumber)(value) && !Number.isFinite((0, _InterpreterValue.getRawValue)(value))) {
    return 0;
  } else {
    return value;
  }
}
function mapToRawScalarValue(arg) {
  if (arg instanceof _Cell.CellError) {
    return arg;
  }
  if ((0, _InterpreterValue.isExtendedNumber)(arg)) {
    return (0, _InterpreterValue.getRawValue)(arg);
  }
  return undefined;
}
class ConditionalAggregationPlugin extends _FunctionPlugin.FunctionPlugin {
  /**
   * Corresponds to SUMIF(Range, Criterion, SumRange)
   *
   * Range is the range to which criterion is to be applied.
   * Criterion is the criteria used to choose which cells will be included in sum.
   * SumRange is the range on which adding will be performed.
   *
   * @param ast
   * @param state
   */
  sumif(ast, state) {
    const functionName = 'SUMIF';
    const computeFn = (conditionRange, criterion, values) => this.computeConditionalAggregationFunction(values !== null && values !== void 0 ? values : conditionRange, [conditionRange, criterion], functionName, 0, (left, right) => this.arithmeticHelper.nonstrictadd(left, right), mapToRawScalarValue);
    return this.runFunction(ast.args, state, this.metadata(functionName), computeFn);
  }
  sumifs(ast, state) {
    const functionName = 'SUMIFS';
    const computeFn = (values, ...args) => this.computeConditionalAggregationFunction(values, args, functionName, 0, (left, right) => this.arithmeticHelper.nonstrictadd(left, right), mapToRawScalarValue);
    return this.runFunction(ast.args, state, this.metadata(functionName), computeFn);
  }
  averageif(ast, state) {
    const functionName = 'AVERAGEIF';
    const computeFn = (conditionRange, criterion, values) => {
      const averageResult = this.computeConditionalAggregationFunction(values !== null && values !== void 0 ? values : conditionRange, [conditionRange, criterion], functionName, AverageResult.empty, (left, right) => left.compose(right), arg => (0, _InterpreterValue.isExtendedNumber)(arg) ? AverageResult.single((0, _InterpreterValue.getRawValue)(arg)) : AverageResult.empty);
      if (averageResult instanceof _Cell.CellError) {
        return averageResult;
      } else {
        return averageResult.averageValue() || new _Cell.CellError(_Cell.ErrorType.DIV_BY_ZERO);
      }
    };
    return this.runFunction(ast.args, state, this.metadata(functionName), computeFn);
  }
  /**
   * Corresponds to COUNTIF(Range, Criterion)
   *
   * Range is the range to which criterion is to be applied.
   * Criterion is the criteria used to choose which cells will be included in sum.
   *
   * Returns number of cells on which criteria evaluate to true.
   *
   * @param ast
   * @param state
   */
  countif(ast, state) {
    const functionName = 'COUNTIF';
    const computeFn = (conditionRange, criterion) => this.computeConditionalAggregationFunction(conditionRange, [conditionRange, criterion], functionName, 0, (left, right) => left + right, () => 1);
    return this.runFunction(ast.args, state, this.metadata(functionName), computeFn);
  }
  countifs(ast, state) {
    const functionName = 'COUNTIFS';
    const computeFn = (...args) => this.computeConditionalAggregationFunction(args[0], args, functionName, 0, (left, right) => left + right, () => 1);
    return this.runFunction(ast.args, state, this.metadata(functionName), computeFn);
  }
  minifs(ast, state) {
    const functionName = 'MINIFS';
    const composeFunction = (left, right) => {
      if (right === undefined || left === undefined) {
        return right === undefined ? left : right;
      }
      return Math.min(left, right);
    };
    const computeFn = (values, ...args) => {
      const minResult = this.computeConditionalAggregationFunction(values, args, functionName, Number.POSITIVE_INFINITY, composeFunction, mapToRawScalarValue);
      return zeroForInfinite(minResult);
    };
    return this.runFunction(ast.args, state, this.metadata(functionName), computeFn);
  }
  maxifs(ast, state) {
    const functionName = 'MAXIFS';
    const composeFunction = (left, right) => {
      if (right === undefined || left === undefined) {
        return right === undefined ? left : right;
      }
      return Math.max(left, right);
    };
    const computeFn = (values, ...args) => {
      const maxResult = this.computeConditionalAggregationFunction(values, args, functionName, Number.NEGATIVE_INFINITY, composeFunction, mapToRawScalarValue);
      return zeroForInfinite(maxResult);
    };
    return this.runFunction(ast.args, state, this.metadata(functionName), computeFn);
  }
  computeConditionalAggregationFunction(valuesRange, conditionArgs, functionName, reduceInitialValue, composeFunction, mapFunction) {
    const conditions = [];
    for (let i = 0; i < conditionArgs.length; i += 2) {
      const conditionArg = conditionArgs[i];
      const criterionPackage = this.interpreter.criterionBuilder.fromCellValue(conditionArgs[i + 1], this.arithmeticHelper);
      if (criterionPackage === undefined) {
        return new _Cell.CellError(_Cell.ErrorType.VALUE, _errorMessage.ErrorMessage.BadCriterion);
      }
      conditions.push(new _CriterionFunctionCompute.Condition(conditionArg, criterionPackage));
    }
    return new _CriterionFunctionCompute.CriterionFunctionCompute(this.interpreter, conditionalAggregationFunctionCacheKey(functionName), reduceInitialValue, composeFunction, mapFunction).compute(valuesRange, conditions);
  }
}
exports.ConditionalAggregationPlugin = ConditionalAggregationPlugin;
ConditionalAggregationPlugin.implementedFunctions = {
  SUMIF: {
    method: 'sumif',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.RANGE
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NOERROR
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.RANGE,
      optionalArg: true
    }]
  },
  COUNTIF: {
    method: 'countif',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.RANGE
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NOERROR
    }]
  },
  AVERAGEIF: {
    method: 'averageif',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.RANGE
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NOERROR
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.RANGE,
      optionalArg: true
    }]
  },
  SUMIFS: {
    method: 'sumifs',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.RANGE
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.RANGE
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NOERROR
    }],
    repeatLastArgs: 2
  },
  COUNTIFS: {
    method: 'countifs',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.RANGE
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NOERROR
    }],
    repeatLastArgs: 2
  },
  MINIFS: {
    method: 'minifs',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.RANGE
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.RANGE
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NOERROR
    }],
    repeatLastArgs: 2
  },
  MAXIFS: {
    method: 'maxifs',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.RANGE
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.RANGE
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NOERROR
    }],
    repeatLastArgs: 2
  }
};