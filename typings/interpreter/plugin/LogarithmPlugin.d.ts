/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */
import { ProcedureAst } from '../../parser';
import { InterpreterState } from '../InterpreterState';
import { InterpreterValue } from '../InterpreterValue';
import { FunctionPlugin, FunctionPluginTypecheck, ImplementedFunctions } from './FunctionPlugin';
export declare class LogarithmPlugin extends FunctionPlugin implements FunctionPluginTypecheck<LogarithmPlugin> {
    static implementedFunctions: ImplementedFunctions;
    log10(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    log(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    ln(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
}