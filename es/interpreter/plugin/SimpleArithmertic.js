/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */
import { FunctionArgumentType, FunctionPlugin } from './FunctionPlugin';
export class SimpleArithmerticPlugin extends FunctionPlugin {
  add(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('HF.ADD'), this.arithmeticHelper.addWithEpsilon);
  }
  concat(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('HF.CONCAT'), this.arithmeticHelper.concat);
  }
  divide(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('HF.DIVIDE'), this.arithmeticHelper.divide);
  }
  eq(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('HF.EQ'), this.arithmeticHelper.eq);
  }
  gt(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('HF.GT'), this.arithmeticHelper.gt);
  }
  gte(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('HF.GTE'), this.arithmeticHelper.geq);
  }
  lt(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('HF.LT'), this.arithmeticHelper.lt);
  }
  lte(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('HF.LTE'), this.arithmeticHelper.leq);
  }
  minus(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('HF.MINUS'), this.arithmeticHelper.subtract);
  }
  multiply(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('HF.MULTIPLY'), this.arithmeticHelper.multiply);
  }
  ne(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('HF.NE'), this.arithmeticHelper.neq);
  }
  pow(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('HF.POW'), this.arithmeticHelper.pow);
  }
  uminus(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('HF.UMINUS'), this.arithmeticHelper.unaryMinus);
  }
  upercent(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('HF.UNARY_PERCENT'), this.arithmeticHelper.unaryPercent);
  }
  uplus(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('HF.UPLUS'), this.arithmeticHelper.unaryPlus);
  }
}
SimpleArithmerticPlugin.implementedFunctions = {
  'HF.ADD': {
    method: 'add',
    parameters: [{
      argumentType: FunctionArgumentType.NUMBER,
      passSubtype: true
    }, {
      argumentType: FunctionArgumentType.NUMBER,
      passSubtype: true
    }]
  },
  'HF.CONCAT': {
    method: 'concat',
    parameters: [{
      argumentType: FunctionArgumentType.STRING,
      passSubtype: true
    }, {
      argumentType: FunctionArgumentType.STRING,
      passSubtype: true
    }]
  },
  'HF.DIVIDE': {
    method: 'divide',
    parameters: [{
      argumentType: FunctionArgumentType.NUMBER,
      passSubtype: true
    }, {
      argumentType: FunctionArgumentType.NUMBER,
      passSubtype: true
    }]
  },
  'HF.EQ': {
    method: 'eq',
    parameters: [{
      argumentType: FunctionArgumentType.NOERROR,
      passSubtype: true
    }, {
      argumentType: FunctionArgumentType.NOERROR,
      passSubtype: true
    }]
  },
  'HF.GT': {
    method: 'gt',
    parameters: [{
      argumentType: FunctionArgumentType.NOERROR,
      passSubtype: true
    }, {
      argumentType: FunctionArgumentType.NOERROR,
      passSubtype: true
    }]
  },
  'HF.GTE': {
    method: 'gte',
    parameters: [{
      argumentType: FunctionArgumentType.NOERROR,
      passSubtype: true
    }, {
      argumentType: FunctionArgumentType.NOERROR,
      passSubtype: true
    }]
  },
  'HF.LT': {
    method: 'lt',
    parameters: [{
      argumentType: FunctionArgumentType.NOERROR,
      passSubtype: true
    }, {
      argumentType: FunctionArgumentType.NOERROR,
      passSubtype: true
    }]
  },
  'HF.LTE': {
    method: 'lte',
    parameters: [{
      argumentType: FunctionArgumentType.NOERROR,
      passSubtype: true
    }, {
      argumentType: FunctionArgumentType.NOERROR,
      passSubtype: true
    }]
  },
  'HF.MINUS': {
    method: 'minus',
    parameters: [{
      argumentType: FunctionArgumentType.NUMBER,
      passSubtype: true
    }, {
      argumentType: FunctionArgumentType.NUMBER,
      passSubtype: true
    }]
  },
  'HF.MULTIPLY': {
    method: 'multiply',
    parameters: [{
      argumentType: FunctionArgumentType.NUMBER,
      passSubtype: true
    }, {
      argumentType: FunctionArgumentType.NUMBER,
      passSubtype: true
    }]
  },
  'HF.NE': {
    method: 'ne',
    parameters: [{
      argumentType: FunctionArgumentType.NOERROR,
      passSubtype: true
    }, {
      argumentType: FunctionArgumentType.NOERROR,
      passSubtype: true
    }]
  },
  'HF.POW': {
    method: 'pow',
    parameters: [{
      argumentType: FunctionArgumentType.NUMBER,
      passSubtype: true
    }, {
      argumentType: FunctionArgumentType.NUMBER,
      passSubtype: true
    }]
  },
  'HF.UMINUS': {
    method: 'uminus',
    parameters: [{
      argumentType: FunctionArgumentType.NUMBER,
      passSubtype: true
    }]
  },
  'HF.UNARY_PERCENT': {
    method: 'upercent',
    parameters: [{
      argumentType: FunctionArgumentType.NUMBER,
      passSubtype: true
    }]
  },
  'HF.UPLUS': {
    method: 'uplus',
    parameters: [{
      argumentType: FunctionArgumentType.NUMBER,
      passSubtype: true
    }]
  }
};