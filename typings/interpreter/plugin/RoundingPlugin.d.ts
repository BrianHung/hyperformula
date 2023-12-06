/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */
import { ProcedureAst } from '../../parser';
import { InterpreterState } from '../InterpreterState';
import { InterpreterValue } from '../InterpreterValue';
import { FunctionPlugin, FunctionPluginTypecheck, ImplementedFunctions } from './FunctionPlugin';
export declare function findNextOddNumber(arg: number): number;
export declare function findNextEvenNumber(arg: number): number;
export declare class RoundingPlugin extends FunctionPlugin implements FunctionPluginTypecheck<RoundingPlugin> {
    static implementedFunctions: ImplementedFunctions;
    static aliases: {
        'ISO.CEILING': string;
        TRUNC: string;
    };
    roundup(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    rounddown(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    round(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    intFunc(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    even(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    odd(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    ceilingmath(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    ceiling(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    ceilingprecise(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    floormath(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    floor(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    floorprecise(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
}
