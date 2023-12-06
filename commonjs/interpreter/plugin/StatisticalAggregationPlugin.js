"use strict";

exports.__esModule = true;
exports.StatisticalAggregationPlugin = void 0;
var _Cell = require("../../Cell");
var _errorMessage = require("../../error-message");
var _InterpreterValue = require("../InterpreterValue");
var _jstat = require("./3rdparty/jstat/jstat");
var _FunctionPlugin = require("./FunctionPlugin");
/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */

class StatisticalAggregationPlugin extends _FunctionPlugin.FunctionPlugin {
  avedev(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('AVEDEV'), (...args) => {
      const coerced = this.arithmeticHelper.coerceNumbersExactRanges(args);
      if (coerced instanceof _Cell.CellError) {
        return coerced;
      }
      if (coerced.length === 0) {
        return new _Cell.CellError(_Cell.ErrorType.DIV_BY_ZERO);
      }
      const avg = (0, _jstat.mean)(coerced);
      return coerced.reduce((a, b) => a + Math.abs(b - avg), 0) / coerced.length;
    });
  }
  devsq(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('DEVSQ'), (...args) => {
      const coerced = this.arithmeticHelper.coerceNumbersExactRanges(args);
      if (coerced instanceof _Cell.CellError) {
        return coerced;
      }
      if (coerced.length === 0) {
        return 0;
      }
      return (0, _jstat.sumsqerr)(coerced);
    });
  }
  geomean(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('GEOMEAN'), (...args) => {
      const coerced = this.arithmeticHelper.coerceNumbersExactRanges(args);
      if (coerced instanceof _Cell.CellError) {
        return coerced;
      }
      if (coerced.length === 0) {
        return new _Cell.CellError(_Cell.ErrorType.NUM, _errorMessage.ErrorMessage.OneValue);
      }
      for (const val of coerced) {
        if (val <= 0) {
          return new _Cell.CellError(_Cell.ErrorType.NUM, _errorMessage.ErrorMessage.ValueSmall);
        }
      }
      return (0, _jstat.geomean)(coerced);
    });
  }
  harmean(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('HARMEAN'), (...args) => {
      const coerced = this.arithmeticHelper.coerceNumbersExactRanges(args);
      if (coerced instanceof _Cell.CellError) {
        return coerced;
      }
      if (coerced.length === 0) {
        return new _Cell.CellError(_Cell.ErrorType.NUM, _errorMessage.ErrorMessage.OneValue);
      }
      for (const val of coerced) {
        if (val <= 0) {
          return new _Cell.CellError(_Cell.ErrorType.NUM, _errorMessage.ErrorMessage.ValueSmall);
        }
      }
      return coerced.length / coerced.reduce((a, b) => a + 1 / b, 0);
    });
  }
  correl(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('CORREL'), (dataX, dataY) => {
      if (dataX.numberOfElements() !== dataY.numberOfElements()) {
        return new _Cell.CellError(_Cell.ErrorType.NA, _errorMessage.ErrorMessage.EqualLength);
      }
      const ret = parseTwoArrays(dataX, dataY);
      if (ret instanceof _Cell.CellError) {
        return ret;
      }
      const n = ret[0].length;
      if (n <= 1) {
        return new _Cell.CellError(_Cell.ErrorType.DIV_BY_ZERO, _errorMessage.ErrorMessage.TwoValues);
      }
      return (0, _jstat.corrcoeff)(ret[0], ret[1]);
    });
  }
  rsq(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('RSQ'), (dataX, dataY) => {
      if (dataX.numberOfElements() !== dataY.numberOfElements()) {
        return new _Cell.CellError(_Cell.ErrorType.NA, _errorMessage.ErrorMessage.EqualLength);
      }
      const ret = parseTwoArrays(dataX, dataY);
      if (ret instanceof _Cell.CellError) {
        return ret;
      }
      const n = ret[0].length;
      if (n <= 1) {
        return new _Cell.CellError(_Cell.ErrorType.DIV_BY_ZERO, _errorMessage.ErrorMessage.TwoValues);
      }
      return Math.pow((0, _jstat.corrcoeff)(ret[0], ret[1]), 2);
    });
  }
  covariancep(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('COVARIANCE.P'), (dataX, dataY) => {
      if (dataX.numberOfElements() !== dataY.numberOfElements()) {
        return new _Cell.CellError(_Cell.ErrorType.NA, _errorMessage.ErrorMessage.EqualLength);
      }
      const ret = parseTwoArrays(dataX, dataY);
      if (ret instanceof _Cell.CellError) {
        return ret;
      }
      const n = ret[0].length;
      if (n < 1) {
        return new _Cell.CellError(_Cell.ErrorType.DIV_BY_ZERO, _errorMessage.ErrorMessage.OneValue);
      }
      if (n === 1) {
        return 0;
      }
      return (0, _jstat.covariance)(ret[0], ret[1]) * (n - 1) / n;
    });
  }
  covariances(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('COVARIANCE.S'), (dataX, dataY) => {
      if (dataX.numberOfElements() !== dataY.numberOfElements()) {
        return new _Cell.CellError(_Cell.ErrorType.NA, _errorMessage.ErrorMessage.EqualLength);
      }
      const ret = parseTwoArrays(dataX, dataY);
      if (ret instanceof _Cell.CellError) {
        return ret;
      }
      const n = ret[0].length;
      if (n <= 1) {
        return new _Cell.CellError(_Cell.ErrorType.DIV_BY_ZERO, _errorMessage.ErrorMessage.TwoValues);
      }
      return (0, _jstat.covariance)(ret[0], ret[1]);
    });
  }
  ztest(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('Z.TEST'), (range, x, sigma) => {
      const vals = this.arithmeticHelper.manyToExactNumbers(range.valuesFromTopLeftCorner());
      if (vals instanceof _Cell.CellError) {
        return vals;
      }
      const n = vals.length;
      if (sigma === undefined) {
        if (n < 2) {
          return new _Cell.CellError(_Cell.ErrorType.DIV_BY_ZERO, _errorMessage.ErrorMessage.TwoValues);
        }
        sigma = (0, _jstat.stdev)(vals, true);
      }
      if (n < 1) {
        return new _Cell.CellError(_Cell.ErrorType.NA, _errorMessage.ErrorMessage.OneValue);
      }
      if (sigma === 0) {
        return new _Cell.CellError(_Cell.ErrorType.DIV_BY_ZERO);
      }
      return 1 - _jstat.normal.cdf(((0, _jstat.mean)(vals) - x) / (sigma / Math.sqrt(n)), 0, 1);
    });
  }
  ftest(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('F.TEST'), (dataX, dataY) => {
      const arrX = this.arithmeticHelper.manyToExactNumbers(dataX.valuesFromTopLeftCorner());
      const arrY = this.arithmeticHelper.manyToExactNumbers(dataY.valuesFromTopLeftCorner());
      if (arrX instanceof _Cell.CellError) {
        return arrX;
      }
      if (arrY instanceof _Cell.CellError) {
        return arrY;
      }
      if (arrX.length <= 1 || arrY.length <= 1) {
        return new _Cell.CellError(_Cell.ErrorType.DIV_BY_ZERO);
      }
      const vx = (0, _jstat.variance)(arrX, true);
      const vy = (0, _jstat.variance)(arrY, true);
      if (vx === 0 || vy === 0) {
        return new _Cell.CellError(_Cell.ErrorType.DIV_BY_ZERO);
      }
      const r = vx / vy;
      const v = _jstat.centralF.cdf(r, arrX.length - 1, arrY.length - 1);
      return 2 * Math.min(v, 1 - v);
    });
  }
  steyx(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('STEYX'), (dataX, dataY) => {
      if (dataX.numberOfElements() !== dataY.numberOfElements()) {
        return new _Cell.CellError(_Cell.ErrorType.NA, _errorMessage.ErrorMessage.EqualLength);
      }
      const ret = parseTwoArrays(dataX, dataY);
      if (ret instanceof _Cell.CellError) {
        return ret;
      }
      const n = ret[0].length;
      if (n <= 2) {
        return new _Cell.CellError(_Cell.ErrorType.DIV_BY_ZERO, _errorMessage.ErrorMessage.ThreeValues);
      }
      return Math.sqrt(((0, _jstat.sumsqerr)(ret[0]) - Math.pow((0, _jstat.covariance)(ret[0], ret[1]) * (n - 1), 2) / (0, _jstat.sumsqerr)(ret[1])) / (n - 2));
    });
  }
  slope(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('SLOPE'), (dataX, dataY) => {
      if (dataX.numberOfElements() !== dataY.numberOfElements()) {
        return new _Cell.CellError(_Cell.ErrorType.NA, _errorMessage.ErrorMessage.EqualLength);
      }
      const ret = parseTwoArrays(dataX, dataY);
      if (ret instanceof _Cell.CellError) {
        return ret;
      }
      const n = ret[0].length;
      if (n <= 1) {
        return new _Cell.CellError(_Cell.ErrorType.DIV_BY_ZERO, _errorMessage.ErrorMessage.TwoValues);
      }
      return (0, _jstat.covariance)(ret[0], ret[1]) * (n - 1) / (0, _jstat.sumsqerr)(ret[1]);
    });
  }
  chisqtest(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('CHISQ.TEST'), (dataX, dataY) => {
      const r = dataX.height();
      const c = dataX.width();
      if (dataY.height() !== r || dataY.width() !== c) {
        return new _Cell.CellError(_Cell.ErrorType.NA, _errorMessage.ErrorMessage.EqualLength);
      }
      const ret = parseTwoArrays(dataX, dataY);
      if (ret instanceof _Cell.CellError) {
        return ret;
      }
      if (ret[0].length <= 1) {
        return new _Cell.CellError(_Cell.ErrorType.DIV_BY_ZERO, _errorMessage.ErrorMessage.TwoValues);
      }
      let sum = 0;
      for (let i = 0; i < ret[0].length; i++) {
        if (ret[1][i] === 0) {
          return new _Cell.CellError(_Cell.ErrorType.DIV_BY_ZERO);
        }
        sum += Math.pow(ret[0][i] - ret[1][i], 2) / ret[1][i];
      }
      if (sum < 0) {
        return new _Cell.CellError(_Cell.ErrorType.NUM, _errorMessage.ErrorMessage.NaN);
      }
      return 1 - _jstat.chisquare.cdf(sum, r > 1 && c > 1 ? (r - 1) * (c - 1) : r * c - 1);
    });
  }
  ttest(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('T.TEST'), (dataX, dataY, tails, type) => {
      const arrX = this.arithmeticHelper.manyToExactNumbers(dataX.valuesFromTopLeftCorner());
      const arrY = this.arithmeticHelper.manyToExactNumbers(dataY.valuesFromTopLeftCorner());
      if (arrX instanceof _Cell.CellError) {
        return arrX;
      }
      if (arrY instanceof _Cell.CellError) {
        return arrY;
      }
      const n = arrX.length;
      const m = arrY.length;
      if (type === 1) {
        if (m !== n) {
          return new _Cell.CellError(_Cell.ErrorType.NA, _errorMessage.ErrorMessage.EqualLength);
        }
        if (n <= 1) {
          return new _Cell.CellError(_Cell.ErrorType.DIV_BY_ZERO, _errorMessage.ErrorMessage.TwoValues);
        }
        const sub = Array(n);
        for (let i = 0; i < n; i++) {
          sub[i] = arrX[i] - arrY[i];
        }
        const s = (0, _jstat.stdev)(sub, true);
        if (s === 0) {
          return new _Cell.CellError(_Cell.ErrorType.DIV_BY_ZERO);
        }
        const t = Math.abs(Math.sqrt(n) * (0, _jstat.mean)(sub) / s);
        return tails * (1 - _jstat.studentt.cdf(t, n - 1));
      } else if (type === 2) {
        if (n <= 1 || m <= 1) {
          return new _Cell.CellError(_Cell.ErrorType.DIV_BY_ZERO, _errorMessage.ErrorMessage.TwoValues);
        }
        const s = ((0, _jstat.sumsqerr)(arrX) + (0, _jstat.sumsqerr)(arrY)) / (n + m - 2);
        if (s === 0) {
          return new _Cell.CellError(_Cell.ErrorType.DIV_BY_ZERO);
        }
        const t = Math.abs(((0, _jstat.mean)(arrX) - (0, _jstat.mean)(arrY)) / Math.sqrt(s * (1 / n + 1 / m)));
        return tails * (1 - _jstat.studentt.cdf(t, n + m - 2));
      } else {
        //type === 3
        if (n <= 1 || m <= 1) {
          return new _Cell.CellError(_Cell.ErrorType.DIV_BY_ZERO, _errorMessage.ErrorMessage.TwoValues);
        }
        const sx = (0, _jstat.variance)(arrX, true);
        const sy = (0, _jstat.variance)(arrY, true);
        if (sx === 0 && sy === 0) {
          return new _Cell.CellError(_Cell.ErrorType.DIV_BY_ZERO);
        }
        const t = Math.abs(((0, _jstat.mean)(arrX) - (0, _jstat.mean)(arrY)) / Math.sqrt(sx / n + sy / m));
        const v = Math.pow(sx / n + sy / m, 2) / (Math.pow(sx / n, 2) / (n - 1) + Math.pow(sy / m, 2) / (m - 1));
        return tails * (1 - _jstat.studentt.cdf(t, v));
      }
    });
  }
  skew(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('SKEW'), (...args) => {
      const coerced = this.arithmeticHelper.coerceNumbersExactRanges(args);
      if (coerced instanceof _Cell.CellError) {
        return coerced;
      }
      const n = coerced.length;
      if (n < 3) {
        return new _Cell.CellError(_Cell.ErrorType.DIV_BY_ZERO, _errorMessage.ErrorMessage.ThreeValues);
      }
      const avg = (0, _jstat.mean)(coerced);
      const s = (0, _jstat.stdev)(coerced, true);
      if (s === 0) {
        return new _Cell.CellError(_Cell.ErrorType.DIV_BY_ZERO);
      }
      return coerced.reduce((a, b) => a + Math.pow((b - avg) / s, 3), 0) * n / (n - 1) / (n - 2);
    });
  }
  skewp(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('SKEW.P'), (...args) => {
      const coerced = this.arithmeticHelper.coerceNumbersExactRanges(args);
      if (coerced instanceof _Cell.CellError) {
        return coerced;
      }
      const n = coerced.length;
      if (n < 3) {
        return new _Cell.CellError(_Cell.ErrorType.DIV_BY_ZERO, _errorMessage.ErrorMessage.ThreeValues);
      }
      const avg = (0, _jstat.mean)(coerced);
      const s = (0, _jstat.stdev)(coerced, false);
      if (s === 0) {
        return new _Cell.CellError(_Cell.ErrorType.DIV_BY_ZERO);
      }
      return coerced.reduce((a, b) => a + Math.pow((b - avg) / s, 3), 0) / n;
    });
  }
}
exports.StatisticalAggregationPlugin = StatisticalAggregationPlugin;
StatisticalAggregationPlugin.implementedFunctions = {
  'AVEDEV': {
    method: 'avedev',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.ANY
    }],
    repeatLastArgs: 1
  },
  'DEVSQ': {
    method: 'devsq',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.ANY
    }],
    repeatLastArgs: 1
  },
  'GEOMEAN': {
    method: 'geomean',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.ANY
    }],
    repeatLastArgs: 1
  },
  'HARMEAN': {
    method: 'harmean',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.ANY
    }],
    repeatLastArgs: 1
  },
  'CORREL': {
    method: 'correl',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.RANGE
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.RANGE
    }]
  },
  'RSQ': {
    method: 'rsq',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.RANGE
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.RANGE
    }]
  },
  'COVARIANCE.P': {
    method: 'covariancep',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.RANGE
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.RANGE
    }]
  },
  'COVARIANCE.S': {
    method: 'covariances',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.RANGE
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.RANGE
    }]
  },
  'Z.TEST': {
    method: 'ztest',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.RANGE
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      optionalArg: true
    }]
  },
  'F.TEST': {
    method: 'ftest',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.RANGE
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.RANGE
    }]
  },
  'STEYX': {
    method: 'steyx',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.RANGE
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.RANGE
    }]
  },
  'SLOPE': {
    method: 'slope',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.RANGE
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.RANGE
    }]
  },
  'CHISQ.TEST': {
    method: 'chisqtest',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.RANGE
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.RANGE
    }]
  },
  'T.TEST': {
    method: 'ttest',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.RANGE
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.RANGE
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.INTEGER,
      minValue: 1,
      maxValue: 2
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.INTEGER,
      minValue: 1,
      maxValue: 3
    }]
  },
  'SKEW': {
    method: 'skew',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.ANY
    }],
    repeatLastArgs: 1
  },
  'SKEW.P': {
    method: 'skewp',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.ANY
    }],
    repeatLastArgs: 1
  }
};
StatisticalAggregationPlugin.aliases = {
  COVAR: 'COVARIANCE.P',
  FTEST: 'F.TEST',
  PEARSON: 'CORREL',
  ZTEST: 'Z.TEST',
  CHITEST: 'CHISQ.TEST',
  TTEST: 'T.TEST',
  COVARIANCEP: 'COVARIANCE.P',
  COVARIANCES: 'COVARIANCE.S',
  SKEWP: 'SKEW.P'
};
function parseTwoArrays(dataX, dataY) {
  const xit = dataX.iterateValuesFromTopLeftCorner();
  const yit = dataY.iterateValuesFromTopLeftCorner();
  let x, y;
  const arrX = [];
  const arrY = [];
  while (x = xit.next(), y = yit.next(), !x.done && !y.done) {
    const xval = x.value;
    const yval = y.value;
    if (xval instanceof _Cell.CellError) {
      return xval;
    } else if (yval instanceof _Cell.CellError) {
      return yval;
    } else if ((0, _InterpreterValue.isExtendedNumber)(xval) && (0, _InterpreterValue.isExtendedNumber)(yval)) {
      arrX.push((0, _InterpreterValue.getRawValue)(xval));
      arrY.push((0, _InterpreterValue.getRawValue)(yval));
    }
  }
  return [arrX, arrY];
}