/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */
import { ProcedureAst } from '../../parser';
import { InterpreterState } from '../InterpreterState';
import { InterpreterValue } from '../InterpreterValue';
import { FunctionPlugin, FunctionPluginTypecheck, ImplementedFunctions } from './FunctionPlugin';
export declare class AbsPlugin extends FunctionPlugin implements FunctionPluginTypecheck<AbsPlugin> {
    static implementedFunctions: ImplementedFunctions;
    abs(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
}
