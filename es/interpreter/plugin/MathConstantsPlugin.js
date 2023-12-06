/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */
import { FunctionArgumentType, FunctionPlugin } from './FunctionPlugin';
export const PI = parseFloat(Math.PI.toFixed(14));
export class MathConstantsPlugin extends FunctionPlugin {
  pi(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('PI'), () => PI);
  }
  sqrtpi(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('SQRTPI'), arg => Math.sqrt(PI * arg));
  }
}
MathConstantsPlugin.implementedFunctions = {
  'PI': {
    method: 'pi',
    parameters: []
  },
  'SQRTPI': {
    method: 'sqrtpi',
    parameters: [{
      argumentType: FunctionArgumentType.NUMBER,
      minValue: 0
    }]
  }
};