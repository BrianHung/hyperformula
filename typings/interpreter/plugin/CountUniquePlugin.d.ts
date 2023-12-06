/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */
import { ProcedureAst } from '../../parser';
import { InterpreterState } from '../InterpreterState';
import { InterpreterValue } from '../InterpreterValue';
import { FunctionPlugin, FunctionPluginTypecheck, ImplementedFunctions } from './FunctionPlugin';
/**
 * Interpreter plugin containing COUNTUNIQUE function
 */
export declare class CountUniquePlugin extends FunctionPlugin implements FunctionPluginTypecheck<CountUniquePlugin> {
    static implementedFunctions: ImplementedFunctions;
    /**
     * Corresponds to COUNTUNIQUE(Number1, Number2, ...).
     *
     * Returns number of unique numbers from arguments
     *
     * @param ast
     * @param state
     */
    countunique(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
}
