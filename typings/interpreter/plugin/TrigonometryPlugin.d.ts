/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */
import { ProcedureAst } from '../../parser';
import { InterpreterState } from '../InterpreterState';
import { InterpreterValue } from '../InterpreterValue';
import { FunctionPlugin, FunctionPluginTypecheck, ImplementedFunctions } from './FunctionPlugin';
/**
 * Interpreter plugin containing trigonometric functions
 */
export declare class TrigonometryPlugin extends FunctionPlugin implements FunctionPluginTypecheck<TrigonometryPlugin> {
    static implementedFunctions: ImplementedFunctions;
    /**
     * Corresponds to ACOS(value)
     *
     * Returns the arc cosine (or inverse cosine) of a number.
     *
     * @param ast
     * @param state
     */
    acos(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    asin(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    cos(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    sin(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    tan(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    atan(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    atan2(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    cot(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    acot(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    sec(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    csc(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    sinh(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    asinh(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    cosh(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    acosh(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    tanh(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    atanh(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    coth(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    acoth(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    sech(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    csch(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
}