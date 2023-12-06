/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */
import { ProcedureAst } from '../../parser';
import { InterpreterState } from '../InterpreterState';
import { InterpreterValue } from '../InterpreterValue';
import { FunctionPlugin, FunctionPluginTypecheck, ImplementedFunctions } from './FunctionPlugin';
export declare class ConditionalAggregationPlugin extends FunctionPlugin implements FunctionPluginTypecheck<ConditionalAggregationPlugin> {
    static implementedFunctions: ImplementedFunctions;
    /**
     * Corresponds to SUMIF(Range, Criterion, SumRange)
     *
     * Range is the range to which criterion is to be applied.
     * Criterion is the criteria used to choose which cells will be included in sum.
     * SumRange is the range on which adding will be performed.
     *
     * @param ast
     * @param state
     */
    sumif(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    sumifs(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    averageif(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    /**
     * Corresponds to COUNTIF(Range, Criterion)
     *
     * Range is the range to which criterion is to be applied.
     * Criterion is the criteria used to choose which cells will be included in sum.
     *
     * Returns number of cells on which criteria evaluate to true.
     *
     * @param ast
     * @param state
     */
    countif(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    countifs(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    minifs(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    maxifs(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    private computeConditionalAggregationFunction;
}
