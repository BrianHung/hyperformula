/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */
import { ProcedureAst } from '../../parser';
import { InterpreterState } from '../InterpreterState';
import { InterpreterValue } from '../InterpreterValue';
import { FunctionPlugin, FunctionPluginTypecheck, ImplementedFunctions } from './FunctionPlugin';
export declare class RomanPlugin extends FunctionPlugin implements FunctionPluginTypecheck<RomanPlugin> {
    static implementedFunctions: ImplementedFunctions;
    roman(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    arabic(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
}