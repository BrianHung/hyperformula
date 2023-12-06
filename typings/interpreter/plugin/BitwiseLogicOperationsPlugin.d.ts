/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */
import { ProcedureAst } from '../../parser';
import { InterpreterState } from '../InterpreterState';
import { InterpreterValue } from '../InterpreterValue';
import { FunctionPlugin, FunctionPluginTypecheck, ImplementedFunctions } from './FunctionPlugin';
export declare class BitwiseLogicOperationsPlugin extends FunctionPlugin implements FunctionPluginTypecheck<BitwiseLogicOperationsPlugin> {
    static implementedFunctions: ImplementedFunctions;
    bitand(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    bitor(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    bitxor(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
}
