/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */
import { ProcedureAst } from '../../parser';
import { InterpreterState } from '../InterpreterState';
import { InterpreterValue } from '../InterpreterValue';
import { FunctionPlugin, FunctionPluginTypecheck, ImplementedFunctions } from './FunctionPlugin';
export declare class PowerPlugin extends FunctionPlugin implements FunctionPluginTypecheck<PowerPlugin> {
    static implementedFunctions: ImplementedFunctions;
    power(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
}
