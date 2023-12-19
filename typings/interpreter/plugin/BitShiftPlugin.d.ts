/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */
import { ProcedureAst } from '../../parser';
import { InterpreterState } from '../InterpreterState';
import { InterpreterValue } from '../InterpreterValue';
import { FunctionPlugin, FunctionPluginTypecheck, ImplementedFunctions } from './FunctionPlugin';
export declare class BitShiftPlugin extends FunctionPlugin implements FunctionPluginTypecheck<BitShiftPlugin> {
    static implementedFunctions: ImplementedFunctions;
    bitlshift(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    bitrshift(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
}