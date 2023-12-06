/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */
import { ProcedureAst } from '../../parser';
import { InterpreterState } from '../InterpreterState';
import { InterpreterValue } from '../InterpreterValue';
import { FunctionPlugin, FunctionPluginTypecheck, ImplementedFunctions } from './FunctionPlugin';
export declare class AddressPlugin extends FunctionPlugin implements FunctionPluginTypecheck<AddressPlugin> {
    static implementedFunctions: ImplementedFunctions;
    private verifyAddressArguments;
    address(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
}
