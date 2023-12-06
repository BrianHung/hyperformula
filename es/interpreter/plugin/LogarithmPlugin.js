/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */
import { FunctionArgumentType, FunctionPlugin } from './FunctionPlugin';
export class LogarithmPlugin extends FunctionPlugin {
  log10(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('LOG10'), Math.log10);
  }
  log(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('LOG'), (arg, base) => Math.log(arg) / Math.log(base));
  }
  ln(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('LN'), Math.log);
  }
}
LogarithmPlugin.implementedFunctions = {
  'LOG10': {
    method: 'log10',
    parameters: [{
      argumentType: FunctionArgumentType.NUMBER
    }]
  },
  'LOG': {
    method: 'log',
    parameters: [{
      argumentType: FunctionArgumentType.NUMBER,
      greaterThan: 0
    }, {
      argumentType: FunctionArgumentType.NUMBER,
      defaultValue: 10,
      greaterThan: 0
    }]
  },
  'LN': {
    method: 'ln',
    parameters: [{
      argumentType: FunctionArgumentType.NUMBER
    }]
  }
};