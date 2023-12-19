/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */
import { ProcedureAst } from '../../parser';
import { InterpreterState } from '../InterpreterState';
import { InterpreterValue } from '../InterpreterValue';
import { FunctionPlugin, FunctionPluginTypecheck, ImplementedFunctions } from './FunctionPlugin';
export declare class ComplexPlugin extends FunctionPlugin implements FunctionPluginTypecheck<ComplexPlugin> {
    static implementedFunctions: ImplementedFunctions;
    complex(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    imabs(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    imaginary(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    imreal(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    imargument(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    imconjugate(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    imcos(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    imcosh(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    imcot(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    imcsc(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    imcsch(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    imsec(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    imsech(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    imsin(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    imsinh(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    imtan(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    imdiv(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    improduct(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    imsum(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    imsub(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    imexp(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    imln(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    imlog10(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    imlog2(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    impower(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    imsqrt(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
}