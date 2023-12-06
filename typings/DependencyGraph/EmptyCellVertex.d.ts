/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */
import { EmptyValueType } from '../interpreter/InterpreterValue';
/**
 * Represents singleton vertex bound to all empty cells
 */
export declare class EmptyCellVertex {
    constructor();
    /**
     * Retrieves cell value bound to that singleton
     */
    getCellValue(): EmptyValueType;
}
