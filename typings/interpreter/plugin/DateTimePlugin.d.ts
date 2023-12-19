/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */
import { ProcedureAst } from '../../parser';
import { InterpreterState } from '../InterpreterState';
import { InterpreterValue } from '../InterpreterValue';
import { FunctionPlugin, FunctionPluginTypecheck, ImplementedFunctions } from './FunctionPlugin';
/**
 * Interpreter plugin containing date-specific functions
 */
export declare class DateTimePlugin extends FunctionPlugin implements FunctionPluginTypecheck<DateTimePlugin> {
    static implementedFunctions: ImplementedFunctions;
    /**
     * Corresponds to DATE(year, month, day)
     *
     * Converts a provided year, month and day into date
     *
     * @param ast
     * @param state
     */
    date(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    time(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    /**
     * Implementation for the EOMONTH function
     */
    eomonth(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    day(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    days(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    /**
     * Corresponds to MONTH(date)
     *
     * Returns the month of the year specified by a given date
     *
     * @param ast
     * @param state
     */
    month(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    /**
     * Corresponds to YEAR(date)
     *
     * Returns the year specified by a given date
     *
     * @param ast
     * @param state
     */
    year(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    hour(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    minute(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    second(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    /**
     * Corresponds to TEXT(number, format)
     *
     * Tries to convert number to specified date format.
     *
     * @param ast
     * @param state
     */
    text(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    weekday(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    weeknum(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    isoweeknum(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    datevalue(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    timevalue(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    now(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    today(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    edate(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    datedif(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    days360(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    yearfrac(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    interval(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    networkdays(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    networkdaysintl(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    workday(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    workdayintl(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    private isoweeknumCore;
    private days360Core;
    private networkdayscore;
    private workdaycore;
    private countWorkdays;
    private simpleRangeToFilteredHolidays;
}