/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */
import { CellError, ErrorType } from '../../Cell';
import { ErrorMessage } from '../../error-message';
import { FunctionArgumentType, FunctionPlugin } from './FunctionPlugin';
/**
 * Interpreter plugin containing MEDIAN function
 */
export class MedianPlugin extends FunctionPlugin {
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
      if (values instanceof CellError) {
        return values;
      }
      if (values.length === 0) {
        return new CellError(ErrorType.NUM, ErrorMessage.OneValue);
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
      if (vals instanceof CellError) {
        return vals;
      }
      vals.sort((a, b) => a - b);
      n = Math.trunc(n);
      if (n > vals.length) {
        return new CellError(ErrorType.NUM, ErrorMessage.ValueLarge);
      }
      return vals[vals.length - n];
    });
  }
  small(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('SMALL'), (range, n) => {
      const vals = this.arithmeticHelper.manyToExactNumbers(range.valuesFromTopLeftCorner());
      if (vals instanceof CellError) {
        return vals;
      }
      vals.sort((a, b) => a - b);
      n = Math.trunc(n);
      if (n > vals.length) {
        return new CellError(ErrorType.NUM, ErrorMessage.ValueLarge);
      }
      return vals[n - 1];
    });
  }
}
MedianPlugin.implementedFunctions = {
  'MEDIAN': {
    method: 'median',
    parameters: [{
      argumentType: FunctionArgumentType.ANY
    }],
    repeatLastArgs: 1
  },
  'LARGE': {
    method: 'large',
    parameters: [{
      argumentType: FunctionArgumentType.RANGE
    }, {
      argumentType: FunctionArgumentType.NUMBER,
      minValue: 1
    }]
  },
  'SMALL': {
    method: 'small',
    parameters: [{
      argumentType: FunctionArgumentType.RANGE
    }, {
      argumentType: FunctionArgumentType.NUMBER,
      minValue: 1
    }]
  }
};