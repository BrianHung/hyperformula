/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */
import { ProcedureAst } from '../../parser';
import { InterpreterState } from '../InterpreterState';
import { InterpreterValue } from '../InterpreterValue';
import { FunctionPlugin, FunctionPluginTypecheck, ImplementedFunctions } from './FunctionPlugin';
/**
 * Interpreter plugin containing MEDIAN function
 */
export declare class CountBlankPlugin extends FunctionPlugin implements FunctionPluginTypecheck<CountBlankPlugin> {
    static implementedFunctions: ImplementedFunctions;
    countblank(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
}
