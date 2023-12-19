"use strict";

exports.__esModule = true;
exports.ComplexPlugin = void 0;
var _Cell = require("../../Cell");
var _errorMessage = require("../../error-message");
var _ArithmeticHelper = require("../ArithmeticHelper");
var _FunctionPlugin = require("./FunctionPlugin");
/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */

class ComplexPlugin extends _FunctionPlugin.FunctionPlugin {
  complex(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('COMPLEX'), (re, im, unit) => {
      if (unit !== 'i' && unit !== 'j') {
        return new _Cell.CellError(_Cell.ErrorType.VALUE, _errorMessage.ErrorMessage.ShouldBeIorJ);
      }
      return (0, _ArithmeticHelper.coerceComplexToString)([re, im], unit);
    });
  }
  imabs(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('IMABS'), abs);
  }
  imaginary(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('IMAGINARY'), ([_re, im]) => im);
  }
  imreal(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('IMREAL'), ([re, _im]) => re);
  }
  imargument(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('IMARGUMENT'), ([re, im]) => {
      if (re === 0 && im === 0) {
        return new _Cell.CellError(_Cell.ErrorType.DIV_BY_ZERO);
      }
      return Math.atan2(im, re);
    });
  }
  imconjugate(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('IMCONJUGATE'), ([re, im]) => (0, _ArithmeticHelper.coerceComplexToString)([re, -im]));
  }
  imcos(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('IMCOS'), arg => (0, _ArithmeticHelper.coerceComplexToString)(cos(arg)));
  }
  imcosh(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('IMCOSH'), arg => (0, _ArithmeticHelper.coerceComplexToString)(cosh(arg)));
  }
  imcot(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('IMCOT'), arg => (0, _ArithmeticHelper.coerceComplexToString)(div(cos(arg), sin(arg))));
  }
  imcsc(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('IMCSC'), arg => (0, _ArithmeticHelper.coerceComplexToString)(div([1, 0], sin(arg))));
  }
  imcsch(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('IMCSCH'), arg => (0, _ArithmeticHelper.coerceComplexToString)(div([1, 0], sinh(arg))));
  }
  imsec(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('IMSEC'), arg => (0, _ArithmeticHelper.coerceComplexToString)(div([1, 0], cos(arg))));
  }
  imsech(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('IMSECH'), arg => (0, _ArithmeticHelper.coerceComplexToString)(div([1, 0], cosh(arg))));
  }
  imsin(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('IMSIN'), arg => (0, _ArithmeticHelper.coerceComplexToString)(sin(arg)));
  }
  imsinh(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('IMSINH'), arg => (0, _ArithmeticHelper.coerceComplexToString)(sinh(arg)));
  }
  imtan(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('IMTAN'), arg => (0, _ArithmeticHelper.coerceComplexToString)(div(sin(arg), cos(arg))));
  }
  imdiv(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('IMDIV'), (arg1, arg2) => (0, _ArithmeticHelper.coerceComplexToString)(div(arg1, arg2)));
  }
  improduct(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('IMPRODUCT'), (...args) => {
      const coerced = this.arithmeticHelper.coerceComplexExactRanges(args);
      if (coerced instanceof _Cell.CellError) {
        return coerced;
      }
      let prod = [1, 0];
      for (const val of coerced) {
        prod = mul(prod, val);
      }
      return (0, _ArithmeticHelper.coerceComplexToString)(prod);
    });
  }
  imsum(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('IMSUM'), (...args) => {
      const coerced = this.arithmeticHelper.coerceComplexExactRanges(args);
      if (coerced instanceof _Cell.CellError) {
        return coerced;
      }
      let sum = [0, 0];
      for (const val of coerced) {
        sum = add(sum, val);
      }
      return (0, _ArithmeticHelper.coerceComplexToString)(sum);
    });
  }
  imsub(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('IMSUB'), (arg1, arg2) => (0, _ArithmeticHelper.coerceComplexToString)(sub(arg1, arg2)));
  }
  imexp(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('IMEXP'), arg => (0, _ArithmeticHelper.coerceComplexToString)(exp(arg)));
  }
  imln(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('IMLN'), arg => (0, _ArithmeticHelper.coerceComplexToString)(ln(arg)));
  }
  imlog10(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('IMLOG10'), arg => {
      const [re, im] = ln(arg);
      const c = Math.log(10);
      return (0, _ArithmeticHelper.coerceComplexToString)([re / c, im / c]);
    });
  }
  imlog2(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('IMLOG2'), arg => {
      const [re, im] = ln(arg);
      const c = Math.log(2);
      return (0, _ArithmeticHelper.coerceComplexToString)([re / c, im / c]);
    });
  }
  impower(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('IMPOWER'), (arg, n) => (0, _ArithmeticHelper.coerceComplexToString)(power(arg, n)));
  }
  imsqrt(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('IMSQRT'), arg => (0, _ArithmeticHelper.coerceComplexToString)(power(arg, 0.5)));
  }
}
exports.ComplexPlugin = ComplexPlugin;
ComplexPlugin.implementedFunctions = {
  'COMPLEX': {
    method: 'complex',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.STRING,
      defaultValue: 'i'
    }]
  },
  'IMABS': {
    method: 'imabs',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.COMPLEX
    }]
  },
  'IMAGINARY': {
    method: 'imaginary',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.COMPLEX
    }]
  },
  'IMREAL': {
    method: 'imreal',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.COMPLEX
    }]
  },
  'IMARGUMENT': {
    method: 'imargument',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.COMPLEX
    }]
  },
  'IMCONJUGATE': {
    method: 'imconjugate',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.COMPLEX
    }]
  },
  'IMCOS': {
    method: 'imcos',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.COMPLEX
    }]
  },
  'IMCOSH': {
    method: 'imcosh',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.COMPLEX
    }]
  },
  'IMCOT': {
    method: 'imcot',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.COMPLEX
    }]
  },
  'IMCSC': {
    method: 'imcsc',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.COMPLEX
    }]
  },
  'IMCSCH': {
    method: 'imcsch',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.COMPLEX
    }]
  },
  'IMSEC': {
    method: 'imsec',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.COMPLEX
    }]
  },
  'IMSECH': {
    method: 'imsech',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.COMPLEX
    }]
  },
  'IMSIN': {
    method: 'imsin',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.COMPLEX
    }]
  },
  'IMSINH': {
    method: 'imsinh',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.COMPLEX
    }]
  },
  'IMTAN': {
    method: 'imtan',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.COMPLEX
    }]
  },
  'IMDIV': {
    method: 'imdiv',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.COMPLEX
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.COMPLEX
    }]
  },
  'IMPRODUCT': {
    method: 'improduct',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.ANY
    }],
    repeatLastArgs: 1
  },
  'IMSUM': {
    method: 'imsum',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.ANY
    }],
    repeatLastArgs: 1
  },
  'IMSUB': {
    method: 'imsub',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.COMPLEX
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.COMPLEX
    }]
  },
  'IMEXP': {
    method: 'imexp',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.COMPLEX
    }]
  },
  'IMLN': {
    method: 'imln',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.COMPLEX
    }]
  },
  'IMLOG10': {
    method: 'imlog10',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.COMPLEX
    }]
  },
  'IMLOG2': {
    method: 'imlog2',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.COMPLEX
    }]
  },
  'IMPOWER': {
    method: 'impower',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.COMPLEX
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }]
  },
  'IMSQRT': {
    method: 'imsqrt',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.COMPLEX
    }]
  }
};
function add([re1, im1], [re2, im2]) {
  return [re1 + re2, im1 + im2];
}
function sub([re1, im1], [re2, im2]) {
  return [re1 - re2, im1 - im2];
}
function mul([re1, im1], [re2, im2]) {
  return [re1 * re2 - im1 * im2, re1 * im2 + re2 * im1];
}
function div([re1, im1], [re2, im2]) {
  const denom = Math.pow(re2, 2) + Math.pow(im2, 2);
  const [nomRe, nomIm] = mul([re1, im1], [re2, -im2]);
  return [nomRe / denom, nomIm / denom];
}
function cos([re, im]) {
  return [Math.cos(re) * Math.cosh(im), -Math.sin(re) * Math.sinh(im)];
}
function cosh([re, im]) {
  return [Math.cosh(re) * Math.cos(im), Math.sinh(re) * Math.sin(im)];
}
function sin([re, im]) {
  return [Math.sin(re) * Math.cosh(im), Math.cos(re) * Math.sinh(im)];
}
function sinh([re, im]) {
  return [Math.sinh(re) * Math.cos(im), Math.cosh(re) * Math.sin(im)];
}
function exp([re, im]) {
  return [Math.exp(re) * Math.cos(im), Math.exp(re) * Math.sin(im)];
}
function abs([re, im]) {
  return Math.sqrt(re * re + im * im);
}
function ln([re, im]) {
  return [Math.log(abs([re, im])), Math.atan2(im, re)];
}
function power(arg, n) {
  const [re, im] = ln(arg);
  return exp([n * re, n * im]);
}