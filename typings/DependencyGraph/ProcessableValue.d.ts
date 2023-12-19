/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */
export declare class ProcessableValue<Raw, Processed> {
    rawValue: Raw;
    private processFn;
    private processedValue;
    constructor(rawValue: Raw, processFn: (r: Raw) => Processed);
    getProcessedValue(): Processed;
    markAsModified(): void;
}