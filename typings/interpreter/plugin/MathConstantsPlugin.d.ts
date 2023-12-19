/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */
import { ProcedureAst } from '../../parser';
import { InterpreterState } from '../InterpreterState';
import { InterpreterValue } from '../InterpreterValue';
import { FunctionPlugin, FunctionPluginTypecheck, ImplementedFunctions } from './FunctionPlugin';
export declare const PI: number;
export declare class MathConstantsPlugin extends FunctionPlugin implements FunctionPluginTypecheck<MathConstantsPlugin> {
    static implementedFunctions: ImplementedFunctions;
    pi(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    sqrtpi(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
}