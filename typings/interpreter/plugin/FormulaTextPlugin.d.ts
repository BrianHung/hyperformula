/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */
import { ProcedureAst } from '../../parser';
import { FunctionPlugin } from '../index';
import { InterpreterState } from '../InterpreterState';
import { InterpreterValue } from '../InterpreterValue';
import { FunctionPluginTypecheck, ImplementedFunctions } from './FunctionPlugin';
export declare class FormulaTextPlugin extends FunctionPlugin implements FunctionPluginTypecheck<FormulaTextPlugin> {
    static implementedFunctions: ImplementedFunctions;
    /**
     * Corresponds to FORMULATEXT(value)
     *
     * Returns a formula in a given cell as a string.
     *
     * @param ast
     * @param state
     */
    formulatext(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
}
