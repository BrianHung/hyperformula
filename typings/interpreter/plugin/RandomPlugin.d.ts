/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */
import { ProcedureAst } from '../../parser';
import { InterpreterState } from '../InterpreterState';
import { InterpreterValue } from '../InterpreterValue';
import { FunctionPlugin, FunctionPluginTypecheck, ImplementedFunctions } from './FunctionPlugin';
export declare class RandomPlugin extends FunctionPlugin implements FunctionPluginTypecheck<RandomPlugin> {
    static implementedFunctions: ImplementedFunctions;
    /**
     * Corresponds to RAND()
     *
     * Returns a pseudo-random floating-point random number
     * in the range [0,1).
     *
     * @param ast
     * @param state
     */
    rand(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    randbetween(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
}
