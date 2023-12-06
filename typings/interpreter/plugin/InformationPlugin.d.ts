/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */
import { CellError } from '../../Cell';
import { ProcedureAst } from '../../parser';
import { InterpreterState } from '../InterpreterState';
import { InternalScalarValue, InterpreterValue } from '../InterpreterValue';
import { FunctionPlugin, FunctionPluginTypecheck, ImplementedFunctions } from './FunctionPlugin';
/**
 * Interpreter plugin containing information functions
 */
export declare class InformationPlugin extends FunctionPlugin implements FunctionPluginTypecheck<InformationPlugin> {
    static implementedFunctions: ImplementedFunctions;
    /**
     * Corresponds to ISBINARY(value)
     *
     * Returns true if provided value is a valid binary number
     *
     * @param ast
     * @param state
     */
    isbinary(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    /**
     * Corresponds to ISERR(value)
     *
     * Returns true if provided value is an error except #N/A!
     *
     * @param ast
     * @param state
     */
    iserr(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    /**
     * Corresponds to ISERROR(value)
     *
     * Checks whether provided value is an error
     *
     * @param ast
     * @param state
     */
    iserror(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    /**
     * Corresponds to ISFORMULA(value)
     *
     * Checks whether referenced cell is a formula
     *
     * @param ast
     * @param state
     */
    isformula(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    /**
     * Corresponds to ISBLANK(value)
     *
     * Checks whether provided cell reference is empty
     *
     * @param ast
     * @param state
     */
    isblank(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    /**
     * Corresponds to ISNA(value)
     *
     * Returns true if provided value is #N/A! error
     *
     * @param ast
     * @param state
     */
    isna(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    /**
     * Corresponds to ISNUMBER(value)
     *
     * Checks whether provided cell reference is a number
     *
     * @param ast
     * @param state
     */
    isnumber(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    /**
     * Corresponds to ISLOGICAL(value)
     *
     * Checks whether provided cell reference is of logical type
     *
     * @param ast
     * @param state
     */
    islogical(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    /**
     * Corresponds to ISREF(value)
     *
     * Returns true if provided value is #REF! error
     *
     * @param ast
     * @param state
     */
    isref(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    /**
     * Corresponds to ISTEXT(value)
     *
     * Checks whether provided cell reference is of logical type
     *
     * @param ast
     * @param state
     */
    istext(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    /**
     * Corresponds to ISNONTEXT(value)
     *
     * Checks whether provided cell reference is of logical type
     *
     * @param ast
     * @param state
     */
    isnontext(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    /**
     * Corresponds to COLUMN(reference)
     *
     * Returns column number of a reference or a formula cell if reference not provided
     *
     * @param ast
     * @param state
     */
    column(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    /**
     * Corresponds to COLUMNS(range)
     *
     * Returns number of columns in provided range of cells
     *
     * @param ast
     * @param state
     */
    columns(ast: ProcedureAst, state: InterpreterState): InternalScalarValue;
    /**
     * Corresponds to ROW(reference)
     *
     * Returns row number of a reference or a formula cell if reference not provided
     *
     * @param ast
     * @param state
     */
    row(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    /**
     * Corresponds to ROWS(range)
     *
     * Returns number of rows in provided range of cells
     *
     * @param ast
     * @param state
     */
    rows(ast: ProcedureAst, state: InterpreterState): InternalScalarValue;
    /**
     * Corresponds to INDEX
     *
     * Returns specific position in 2d array.
     *
     * @param ast
     * @param state
     */
    index(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    /**
     * Corresponds to NA()
     *
     * Returns #N/A!
     *
     * @param _ast
     * @param _state
     */
    na(_ast: ProcedureAst, _state: InterpreterState): CellError;
    /**
     * Corresponds to SHEET(value)
     *
     * Returns sheet number of a given value or a formula sheet number if no argument is provided
     *
     * @param ast
     * @param state
     */
    sheet(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    /**
     * Corresponds to SHEETS(value)
     *
     * Returns number of sheet of a given reference or number of all sheets in workbook when no argument is provided.
     * It returns always 1 for a valid reference as 3D references are not supported.
     *
     * @param ast
     * @param state
     */
    sheets(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
}
