/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */
import { ProcedureAst } from '../../parser';
import { InterpreterState } from '../InterpreterState';
import { InterpreterValue } from '../InterpreterValue';
import { FunctionPlugin, FunctionPluginTypecheck, ImplementedFunctions } from './FunctionPlugin';
export declare class MathPlugin extends FunctionPlugin implements FunctionPluginTypecheck<MathPlugin> {
    static implementedFunctions: ImplementedFunctions;
    fact(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    factdouble(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    combin(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    combina(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    gcd(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    lcm(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    mround(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    multinomial(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    quotient(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    seriessum(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    sign(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    sumx2my2(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    sumx2py2(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    sumxmy2(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
}