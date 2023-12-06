/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */
import { ProcedureAst } from '../../parser';
import { InterpreterState } from '../InterpreterState';
import { InterpreterValue } from '../InterpreterValue';
import { FunctionPlugin, FunctionPluginTypecheck, ImplementedFunctions } from './FunctionPlugin';
export declare class FinancialPlugin extends FunctionPlugin implements FunctionPluginTypecheck<FinancialPlugin> {
    static implementedFunctions: ImplementedFunctions;
    pmt(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    ipmt(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    ppmt(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    fv(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    cumipmt(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    cumprinc(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    db(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    ddb(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    dollarde(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    dollarfr(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    effect(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    ispmt(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    nominal(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    nper(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    rate(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    pv(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    rri(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    sln(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    syd(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    tbilleq(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    tbillprice(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    tbillyield(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    fvschedule(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    npv(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    mirr(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    pduration(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    xnpv(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
}
