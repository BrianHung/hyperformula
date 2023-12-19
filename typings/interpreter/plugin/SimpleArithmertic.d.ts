/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */
import { ProcedureAst } from '../../parser';
import { InterpreterState } from '../InterpreterState';
import { InterpreterValue } from '../InterpreterValue';
import { FunctionPlugin, FunctionPluginTypecheck, ImplementedFunctions } from './FunctionPlugin';
export declare class SimpleArithmerticPlugin extends FunctionPlugin implements FunctionPluginTypecheck<SimpleArithmerticPlugin> {
    static implementedFunctions: ImplementedFunctions;
    add(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    concat(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    divide(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    eq(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    gt(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    gte(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    lt(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    lte(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    minus(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    multiply(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    ne(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    pow(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    uminus(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    upercent(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    uplus(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
}