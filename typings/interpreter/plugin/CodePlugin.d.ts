/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */
import { ProcedureAst } from '../../parser';
import { InterpreterState } from '../InterpreterState';
import { InterpreterValue } from '../InterpreterValue';
import { FunctionPlugin, FunctionPluginTypecheck, ImplementedFunctions } from './FunctionPlugin';
export declare class CodePlugin extends FunctionPlugin implements FunctionPluginTypecheck<CodePlugin> {
    static implementedFunctions: ImplementedFunctions;
    code(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    unicode(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
}
