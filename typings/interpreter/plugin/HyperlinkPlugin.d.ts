/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */
import { FunctionPlugin, FunctionPluginTypecheck, ImplementedFunctions } from './FunctionPlugin';
import { InterpreterState } from '../InterpreterState';
import { InterpreterValue } from '../InterpreterValue';
import { ProcedureAst } from '../../parser';
export declare class HyperlinkPlugin extends FunctionPlugin implements FunctionPluginTypecheck<HyperlinkPlugin> {
    static implementedFunctions: ImplementedFunctions;
    hyperlink(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
}