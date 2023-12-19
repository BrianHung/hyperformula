"use strict";

exports.__esModule = true;
exports.MathPlugin = void 0;
var _Cell = require("../../Cell");
var _errorMessage = require("../../error-message");
var _FunctionPlugin = require("./FunctionPlugin");
/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */

class MathPlugin extends _FunctionPlugin.FunctionPlugin {
  fact(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('FACT'), arg => {
      arg = Math.trunc(arg);
      let ret = 1;
      for (let i = 1; i <= arg; i++) {
        ret *= i;
      }
      return ret;
    });
  }
  factdouble(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('FACTDOUBLE'), arg => {
      arg = Math.trunc(arg);
      let ret = 1;
      for (let i = arg; i >= 1; i -= 2) {
        ret *= i;
      }
      return ret;
    });
  }
  combin(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('COMBIN'), (n, m) => {
      if (m > n) {
        return new _Cell.CellError(_Cell.ErrorType.NUM, _errorMessage.ErrorMessage.WrongOrder);
      }
      n = Math.trunc(n);
      m = Math.trunc(m);
      return combin(n, m);
    });
  }
  combina(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('COMBINA'), (n, m) => {
      n = Math.trunc(n);
      m = Math.trunc(m);
      if (n + m - 1 >= 1030) {
        //Product #2 does not enforce this
        return new _Cell.CellError(_Cell.ErrorType.NUM, _errorMessage.ErrorMessage.ValueLarge);
      }
      if (n === 0 && m === 0) {
        return 1;
      }
      return combin(n + m - 1, m);
    });
  }
  gcd(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('GCD'), (...args) => {
      const processedArgs = this.arithmeticHelper.coerceNumbersCoerceRangesDropNulls(args);
      if (processedArgs instanceof _Cell.CellError) {
        return processedArgs;
      }
      let ret = 0;
      for (const val of processedArgs) {
        if (val < 0) {
          return new _Cell.CellError(_Cell.ErrorType.NUM, _errorMessage.ErrorMessage.ValueSmall);
        }
        ret = binaryGCD(ret, Math.trunc(val));
      }
      if (ret > Number.MAX_SAFE_INTEGER) {
        //inconsistency with product #1
        return new _Cell.CellError(_Cell.ErrorType.NUM, _errorMessage.ErrorMessage.ValueLarge);
      }
      return ret;
    });
  }
  lcm(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('LCM'), (...args) => {
      const processedArgs = this.arithmeticHelper.coerceNumbersCoerceRangesDropNulls(args);
      if (processedArgs instanceof _Cell.CellError) {
        return processedArgs;
      }
      let ret = 1;
      for (const val of processedArgs) {
        if (val < 0) {
          return new _Cell.CellError(_Cell.ErrorType.NUM, _errorMessage.ErrorMessage.ValueSmall);
        }
        ret = binaryLCM(ret, Math.trunc(val));
      }
      if (ret > Number.MAX_SAFE_INTEGER) {
        //inconsistency with product #1
        return new _Cell.CellError(_Cell.ErrorType.NUM, _errorMessage.ErrorMessage.ValueLarge);
      }
      return ret;
    });
  }
  mround(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('MROUND'), (nom, denom) => {
      if (denom === 0) {
        return 0;
      }
      if (nom > 0 && denom < 0 || nom < 0 && denom > 0) {
        return new _Cell.CellError(_Cell.ErrorType.NUM, _errorMessage.ErrorMessage.DistinctSigns);
      }
      return Math.round(nom / denom) * denom;
    });
  }
  multinomial(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('MULTINOMIAL'), (...args) => {
      let n = 0;
      let ans = 1;
      for (let arg of args) {
        if (arg < 0) {
          return new _Cell.CellError(_Cell.ErrorType.NUM, _errorMessage.ErrorMessage.ValueSmall);
        }
        arg = Math.trunc(arg);
        for (let i = 1; i <= arg; i++) {
          ans *= (n + i) / i;
        }
        n += arg;
      }
      return Math.round(ans);
    });
  }
  quotient(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('QUOTIENT'), (nom, denom) => {
      if (denom === 0) {
        return new _Cell.CellError(_Cell.ErrorType.DIV_BY_ZERO);
      }
      return Math.trunc(nom / denom);
    });
  }
  seriessum(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('SERIESSUM'), (x, n, m, range) => {
      const coefs = this.arithmeticHelper.manyToOnlyNumbersDropNulls(range.valuesFromTopLeftCorner());
      if (coefs instanceof _Cell.CellError) {
        return coefs;
      }
      let ret = 0;
      coefs.reverse();
      for (const coef of coefs) {
        ret *= Math.pow(x, m);
        ret += coef;
      }
      return ret * Math.pow(x, n);
    });
  }
  sign(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('SIGN'), arg => {
      if (arg > 0) {
        return 1;
      } else if (arg < 0) {
        return -1;
      } else {
        return 0;
      }
    });
  }
  sumx2my2(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('SUMX2MY2'), (rangeX, rangeY) => {
      const valsX = rangeX.valuesFromTopLeftCorner();
      const valsY = rangeY.valuesFromTopLeftCorner();
      if (valsX.length !== valsY.length) {
        return new _Cell.CellError(_Cell.ErrorType.NA, _errorMessage.ErrorMessage.EqualLength);
      }
      const n = valsX.length;
      let ret = 0;
      for (let i = 0; i < n; i++) {
        const valX = valsX[i];
        const valY = valsY[i];
        if (valX instanceof _Cell.CellError) {
          return valX;
        }
        if (valY instanceof _Cell.CellError) {
          return valY;
        }
        if (typeof valX === 'number' && typeof valY === 'number') {
          ret += Math.pow(valX, 2) - Math.pow(valY, 2);
        }
      }
      return ret;
    });
  }
  sumx2py2(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('SUMX2PY2'), (rangeX, rangeY) => {
      const valsX = rangeX.valuesFromTopLeftCorner();
      const valsY = rangeY.valuesFromTopLeftCorner();
      if (valsX.length !== valsY.length) {
        return new _Cell.CellError(_Cell.ErrorType.NA, _errorMessage.ErrorMessage.EqualLength);
      }
      const n = valsX.length;
      let ret = 0;
      for (let i = 0; i < n; i++) {
        const valX = valsX[i];
        const valY = valsY[i];
        if (valX instanceof _Cell.CellError) {
          return valX;
        }
        if (valY instanceof _Cell.CellError) {
          return valY;
        }
        if (typeof valX === 'number' && typeof valY === 'number') {
          ret += Math.pow(valX, 2) + Math.pow(valY, 2);
        }
      }
      return ret;
    });
  }
  sumxmy2(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('SUMXMY2'), (rangeX, rangeY) => {
      const valsX = rangeX.valuesFromTopLeftCorner();
      const valsY = rangeY.valuesFromTopLeftCorner();
      if (valsX.length !== valsY.length) {
        return new _Cell.CellError(_Cell.ErrorType.NA, _errorMessage.ErrorMessage.EqualLength);
      }
      const n = valsX.length;
      let ret = 0;
      for (let i = 0; i < n; i++) {
        const valX = valsX[i];
        const valY = valsY[i];
        if (valX instanceof _Cell.CellError) {
          return valX;
        }
        if (valY instanceof _Cell.CellError) {
          return valY;
        }
        if (typeof valX === 'number' && typeof valY === 'number') {
          ret += Math.pow(valX - valY, 2);
        }
      }
      return ret;
    });
  }
}
exports.MathPlugin = MathPlugin;
MathPlugin.implementedFunctions = {
  'FACT': {
    method: 'fact',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      minValue: 0,
      maxValue: 170
    }]
  },
  'FACTDOUBLE': {
    method: 'factdouble',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      minValue: 0,
      maxValue: 288
    }]
  },
  'COMBIN': {
    method: 'combin',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      minValue: 0,
      lessThan: 1030
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      minValue: 0
    }]
  },
  'COMBINA': {
    method: 'combina',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      minValue: 0
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      minValue: 0
    }]
  },
  'GCD': {
    method: 'gcd',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.ANY
    }],
    repeatLastArgs: 1
  },
  'LCM': {
    method: 'lcm',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.ANY
    }],
    repeatLastArgs: 1
  },
  'MROUND': {
    method: 'mround',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }]
  },
  'MULTINOMIAL': {
    method: 'multinomial',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }],
    repeatLastArgs: 1,
    expandRanges: true
  },
  'QUOTIENT': {
    method: 'quotient',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }]
  },
  'SERIESSUM': {
    method: 'seriessum',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.RANGE
    }]
  },
  'SIGN': {
    method: 'sign',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }]
  },
  'SUMX2MY2': {
    method: 'sumx2my2',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.RANGE
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.RANGE
    }]
  },
  'SUMX2PY2': {
    method: 'sumx2py2',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.RANGE
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.RANGE
    }]
  },
  'SUMXMY2': {
    method: 'sumxmy2',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.RANGE
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.RANGE
    }]
  }
};
function combin(n, m) {
  if (2 * m > n) {
    m = n - m;
  }
  let ret = 1;
  for (let i = 1; i <= m; i++) {
    ret *= (n - m + i) / i;
  }
  return Math.round(ret);
}
function binaryGCD(a, b) {
  if (a < b) {
    [a, b] = [b, a];
  }
  while (b > 0) {
    [a, b] = [b, a % b];
  }
  return a;
}
function binaryLCM(a, b) {
  if (a === 0 || b === 0) {
    return 0;
  }
  return a * (b / binaryGCD(a, b));
}