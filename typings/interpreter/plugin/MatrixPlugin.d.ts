/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */
import { ArraySize } from '../../ArraySize';
import { ProcedureAst } from '../../parser';
import { InterpreterState } from '../InterpreterState';
import { InterpreterValue } from '../InterpreterValue';
import { FunctionPlugin, FunctionPluginTypecheck, ImplementedFunctions } from './FunctionPlugin';
export declare type KernelRunShortcut = (...args: any[]) => number[][];
export declare type KernelFunction = ((this: KernelFunctionThis, ...args: any[]) => number);
export interface KernelFunctionThis {
    thread: {
        x: number;
        y?: number;
    };
}
export declare class MatrixPlugin extends FunctionPlugin implements FunctionPluginTypecheck<MatrixPlugin> {
    static implementedFunctions: ImplementedFunctions;
    mmult(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    mmultArraySize(ast: ProcedureAst, state: InterpreterState): ArraySize;
    maxpool(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    medianpool(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    maxpoolArraySize(ast: ProcedureAst, state: InterpreterState): ArraySize;
    medianpoolArraySize(ast: ProcedureAst, state: InterpreterState): ArraySize;
    transpose(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    transposeArraySize(ast: ProcedureAst, state: InterpreterState): ArraySize;
    private createKernel;
}
