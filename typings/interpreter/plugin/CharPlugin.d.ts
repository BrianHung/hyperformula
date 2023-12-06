/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */
import { ProcedureAst } from '../../parser';
import { InterpreterState } from '../InterpreterState';
import { InterpreterValue } from '../InterpreterValue';
import { FunctionPlugin, FunctionPluginTypecheck, ImplementedFunctions } from './FunctionPlugin';
export declare class CharPlugin extends FunctionPlugin implements FunctionPluginTypecheck<CharPlugin> {
    static implementedFunctions: ImplementedFunctions;
    char(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    unichar(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
}
