/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */
/**
 * Helper class for recognizing CellReference token in text
 */
export declare class CellReferenceMatcher {
    readonly POSSIBLE_START_CHARACTERS: string[];
    private cellReferenceRegexp;
    /**
     * Method used by the lexer to recognize CellReference token in text
     *
     * Note: using 'y' sticky flag for a named expression which is not supported on IE11...
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/sticky
     */
    match(text: string, startOffset: number): RegExpExecArray | null;
}