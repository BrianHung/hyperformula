/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */
import { ProcedureAst } from '../../parser';
import { InterpreterState } from '../InterpreterState';
import { InterpreterValue } from '../InterpreterValue';
import { FunctionPlugin, FunctionPluginTypecheck, ImplementedFunctions } from './FunctionPlugin';
export declare class RadixConversionPlugin extends FunctionPlugin implements FunctionPluginTypecheck<RadixConversionPlugin> {
    static implementedFunctions: ImplementedFunctions;
    dec2bin(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    dec2oct(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    dec2hex(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    bin2dec(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    bin2oct(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    bin2hex(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    oct2dec(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    oct2bin(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    oct2hex(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    hex2dec(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    hex2bin(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    hex2oct(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    base(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    decimal(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
}