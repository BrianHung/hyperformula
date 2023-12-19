/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */
import { ProcedureAst } from '../../parser';
import { InterpreterState } from '../InterpreterState';
import { InterpreterValue } from '../InterpreterValue';
import { FunctionPlugin, FunctionPluginTypecheck, ImplementedFunctions } from './FunctionPlugin';
/**
 * Interpreter plugin containing text-specific functions
 */
export declare class TextPlugin extends FunctionPlugin implements FunctionPluginTypecheck<TextPlugin> {
    static implementedFunctions: ImplementedFunctions;
    /**
     * Corresponds to CONCATENATE(value1, [value2, ...])
     *
     * Concatenates provided arguments to one string.
     *
     * @param ast
     * @param state
     */
    concatenate(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    /**
     * Corresponds to SPLIT(string, index)
     *
     * Splits provided string using space separator and returns chunk at zero-based position specified by second argument
     *
     * @param ast
     * @param state
     */
    split(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    len(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    lower(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    trim(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    proper(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    clean(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    exact(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    rept(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    right(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    left(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    mid(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    replace(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    search(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    substitute(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    find(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    t(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    upper(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
}