/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */
import { ProcedureAst } from '../../parser';
import { InterpreterState } from '../InterpreterState';
import { InterpreterValue } from '../InterpreterValue';
import { FunctionPlugin, FunctionPluginTypecheck, ImplementedFunctions } from './FunctionPlugin';
export declare class StatisticalAggregationPlugin extends FunctionPlugin implements FunctionPluginTypecheck<StatisticalAggregationPlugin> {
    static implementedFunctions: ImplementedFunctions;
    static aliases: {
        COVAR: string;
        FTEST: string;
        PEARSON: string;
        ZTEST: string;
        CHITEST: string;
        TTEST: string;
        COVARIANCEP: string;
        COVARIANCES: string;
        SKEWP: string;
    };
    avedev(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    devsq(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    geomean(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    harmean(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    correl(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    rsq(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    covariancep(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    covariances(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    ztest(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    ftest(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    steyx(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    slope(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    chisqtest(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    ttest(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    skew(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    skewp(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
}
