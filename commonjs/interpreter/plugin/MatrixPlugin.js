"use strict";

exports.__esModule = true;
exports.MatrixPlugin = void 0;
var _ArraySize = require("../../ArraySize");
var _Cell = require("../../Cell");
var _errorMessage = require("../../error-message");
var _parser = require("../../parser");
var _InterpreterState = require("../InterpreterState");
var _SimpleRangeValue = require("../../SimpleRangeValue");
var _FunctionPlugin = require("./FunctionPlugin");
/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */

function arraySizeForMultiplication(leftArraySize, rightArraySize) {
  return new _ArraySize.ArraySize(rightArraySize.width, leftArraySize.height);
}
function arraySizeForPoolFunction(inputArray, windowSize, stride) {
  return new _ArraySize.ArraySize(1 + (inputArray.width - windowSize) / stride, 1 + (inputArray.height - windowSize) / stride);
}
class MatrixPlugin extends _FunctionPlugin.FunctionPlugin {
  mmult(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('MMULT'), (leftMatrix, rightMatrix) => {
      if (!leftMatrix.hasOnlyNumbers() || !rightMatrix.hasOnlyNumbers()) {
        return new _Cell.CellError(_Cell.ErrorType.VALUE, _errorMessage.ErrorMessage.NumberRange);
      }
      if (rightMatrix.height() !== leftMatrix.width()) {
        return new _Cell.CellError(_Cell.ErrorType.VALUE, _errorMessage.ErrorMessage.ArrayDimensions);
      }
      const outputSize = arraySizeForMultiplication(leftMatrix.size, rightMatrix.size);
      const result = this.createKernel(function (a, b, width) {
        let sum = 0;
        for (let i = 0; i < width; ++i) {
          sum += a[this.thread.y][i] * b[i][this.thread.x];
        }
        return sum;
      }, outputSize)(leftMatrix.rawNumbers(), rightMatrix.rawNumbers(), leftMatrix.width());
      return _SimpleRangeValue.SimpleRangeValue.onlyNumbers(result);
    });
  }
  mmultArraySize(ast, state) {
    if (ast.args.length !== 2) {
      return _ArraySize.ArraySize.error();
    }
    const metadata = this.metadata('MMULT');
    const subChecks = ast.args.map(arg => {
      var _a;
      return this.arraySizeForAst(arg, new _InterpreterState.InterpreterState(state.formulaAddress, state.arraysFlag || ((_a = metadata === null || metadata === void 0 ? void 0 : metadata.arrayFunction) !== null && _a !== void 0 ? _a : false)));
    });
    const [left, right] = subChecks;
    return arraySizeForMultiplication(left, right);
  }
  maxpool(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('MAXPOOL'), (matrix, windowSize, stride = windowSize) => {
      if (!matrix.hasOnlyNumbers()) {
        return new _Cell.CellError(_Cell.ErrorType.VALUE, _errorMessage.ErrorMessage.NumberRange);
      }
      const outputSize = arraySizeForPoolFunction(matrix.size, windowSize, stride);
      const result = this.createKernel(function (a, windowSize, stride) {
        const leftCornerX = this.thread.x * stride;
        const leftCornerY = this.thread.y * stride;
        let currentMax = a[leftCornerY][leftCornerX];
        for (let i = 0; i < windowSize; i++) {
          for (let j = 0; j < windowSize; j++) {
            currentMax = Math.max(currentMax, a[leftCornerY + i][leftCornerX + j]);
          }
        }
        return currentMax;
      }, outputSize)(matrix.rawNumbers(), windowSize, stride);
      return _SimpleRangeValue.SimpleRangeValue.onlyNumbers(result);
    });
  }
  medianpool(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('MEDIANPOOL'), (matrix, windowSize, stride = windowSize) => {
      if (!matrix.hasOnlyNumbers()) {
        return new _Cell.CellError(_Cell.ErrorType.VALUE, _errorMessage.ErrorMessage.NumberRange);
      }
      const outputSize = arraySizeForPoolFunction(matrix.size, windowSize, stride);
      const result = this.createKernel(function (a, windowSize, stride) {
        const leftCornerX = this.thread.x * stride;
        const leftCornerY = this.thread.y * stride;
        let currentMax = a[leftCornerY][leftCornerX];
        for (let i = 0; i < windowSize; i++) {
          for (let j = 0; j < windowSize; j++) {
            currentMax = Math.max(currentMax, a[leftCornerY + i][leftCornerX + j]);
          }
        }
        let currentMin = a[leftCornerY][leftCornerX];
        for (let i2 = 0; i2 < windowSize; i2++) {
          for (let j2 = 0; j2 < windowSize; j2++) {
            currentMin = Math.min(currentMin, a[leftCornerY + i2][leftCornerX + j2]);
          }
        }
        const numberOfElements = windowSize * windowSize;
        let leftEnd = currentMin;
        let rightEnd = currentMax;
        let result = 42;
        for (let iter = 0; iter < 32; iter++) {
          const medianGuess = (leftEnd + rightEnd) / 2;
          let medianGuessCount = 0;
          for (let i3 = 0; i3 < windowSize; i3++) {
            for (let j3 = 0; j3 < windowSize; j3++) {
              if (a[leftCornerY + i3][leftCornerX + j3] > medianGuess) {
                medianGuessCount++;
              }
            }
          }
          if (windowSize % 2 === 0) {
            if (medianGuessCount === numberOfElements / 2) {
              result = medianGuess;
              break;
            } else if (medianGuessCount > numberOfElements / 2) {
              leftEnd = medianGuess;
            } else {
              rightEnd = medianGuess;
            }
          } else {
            if (medianGuessCount === (numberOfElements - 1) / 2) {
              result = medianGuess;
              break;
            } else if (medianGuessCount > (numberOfElements - 1) / 2) {
              leftEnd = medianGuess;
            } else {
              rightEnd = medianGuess;
            }
          }
        }
        return result;
      }, outputSize)(matrix.rawNumbers(), windowSize, stride);
      return _SimpleRangeValue.SimpleRangeValue.onlyNumbers(result);
    });
  }
  maxpoolArraySize(ast, state) {
    if (ast.args.length < 2 || ast.args.length > 3) {
      return _ArraySize.ArraySize.error();
    }
    const metadata = this.metadata('MAXPOOL');
    const subChecks = ast.args.map(arg => {
      var _a;
      return this.arraySizeForAst(arg, new _InterpreterState.InterpreterState(state.formulaAddress, state.arraysFlag || ((_a = metadata === null || metadata === void 0 ? void 0 : metadata.arrayFunction) !== null && _a !== void 0 ? _a : false)));
    });
    const array = subChecks[0];
    const windowArg = ast.args[1];
    let window;
    if (windowArg.type === _parser.AstNodeType.NUMBER) {
      window = windowArg.value;
    } else {
      window = 1;
    }
    let stride = window;
    if (ast.args.length === 3) {
      const strideArg = ast.args[2];
      if (strideArg.type === _parser.AstNodeType.NUMBER) {
        stride = strideArg.value;
      } else {
        stride = 1; // codecov: unreachable - strideArg is always type AstNodeType.NUMBER due to FunctionPlugin argument checking+coersion
      }
    }

    if (window > array.width || window > array.height || stride > window || (array.width - window) % stride !== 0 || (array.height - window) % stride !== 0) {
      return _ArraySize.ArraySize.error();
    }
    return arraySizeForPoolFunction(array, window, stride);
  }
  medianpoolArraySize(ast, state) {
    return this.maxpoolArraySize(ast, state);
  }
  transpose(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('TRANSPOSE'), matrix => {
      const input = matrix.rawData();
      const inputSize = matrix.size;
      const result = [];
      for (let i = 0; i < inputSize.width; ++i) {
        result[i] = [];
        for (let j = 0; j < inputSize.height; ++j) {
          result[i][j] = input[j][i];
        }
      }
      return _SimpleRangeValue.SimpleRangeValue.onlyValues(result);
    });
  }
  transposeArraySize(ast, state) {
    if (ast.args.length !== 1) {
      return _ArraySize.ArraySize.error();
    }
    const metadata = this.metadata('TRANSPOSE');
    const subChecks = ast.args.map(arg => {
      var _a;
      return this.arraySizeForAst(arg, new _InterpreterState.InterpreterState(state.formulaAddress, state.arraysFlag || ((_a = metadata === null || metadata === void 0 ? void 0 : metadata.arrayFunction) !== null && _a !== void 0 ? _a : false)));
    });
    const [size] = subChecks;
    return new _ArraySize.ArraySize(size.height, size.width);
  }
  createKernel(kernel, outputSize) {
    return function (...args) {
      const result = [];
      for (let y = 0; y < outputSize.height; ++y) {
        result.push([]);
        for (let x = 0; x < outputSize.width; ++x) {
          result[y][x] = kernel.apply({
            thread: {
              x,
              y
            }
          }, args);
        }
      }
      return result;
    };
  }
}
exports.MatrixPlugin = MatrixPlugin;
MatrixPlugin.implementedFunctions = {
  'MMULT': {
    method: 'mmult',
    arraySizeMethod: 'mmultArraySize',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.RANGE
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.RANGE
    }],
    vectorizationForbidden: true
  },
  'TRANSPOSE': {
    method: 'transpose',
    arraySizeMethod: 'transposeArraySize',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.RANGE
    }],
    vectorizationForbidden: true
  },
  'MAXPOOL': {
    method: 'maxpool',
    arraySizeMethod: 'maxpoolArraySize',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.RANGE
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      optionalArg: true
    }],
    vectorizationForbidden: true
  },
  'MEDIANPOOL': {
    method: 'medianpool',
    arraySizeMethod: 'medianpoolArraySize',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.RANGE
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      optionalArg: true
    }],
    vectorizationForbidden: true
  }
};