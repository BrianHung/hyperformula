/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */
import { ArraySize } from '../../ArraySize';
import { ProcedureAst } from '../../parser';
import { InterpreterState } from '../InterpreterState';
import { InterpreterValue } from '../InterpreterValue';
import { FunctionPlugin, FunctionPluginTypecheck, ImplementedFunctions } from './FunctionPlugin';
export declare class ArrayPlugin extends FunctionPlugin implements FunctionPluginTypecheck<ArrayPlugin> {
    static implementedFunctions: ImplementedFunctions;
    arrayformula(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    arrayformulaArraySize(ast: ProcedureAst, state: InterpreterState): ArraySize;
    arrayconstrain(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    arrayconstrainArraySize(ast: ProcedureAst, state: InterpreterState): ArraySize;
    filter(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    filterArraySize(ast: ProcedureAst, state: InterpreterState): ArraySize;
}
