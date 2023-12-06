/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */
import { SimpleCellAddress } from './Cell';
import { Maybe } from './Maybe';
import { Ast } from './parser';
export interface NamedExpression {
    name: string;
    scope?: number;
    expression?: string;
    options?: NamedExpressionOptions;
}
export declare type NamedExpressionOptions = Record<string, string | number | boolean>;
export declare class InternalNamedExpression {
    displayName: string;
    readonly address: SimpleCellAddress;
    added: boolean;
    options?: Record<string, string | number | boolean> | undefined;
    constructor(displayName: string, address: SimpleCellAddress, added: boolean, options?: Record<string, string | number | boolean> | undefined);
    normalizeExpressionName(): string;
    copy(): InternalNamedExpression;
}
export declare class NamedExpressions {
    static SHEET_FOR_WORKBOOK_EXPRESSIONS: number;
    private nextNamedExpressionRow;
    private readonly workbookStore;
    private readonly worksheetStores;
    private readonly addressCache;
    isNameAvailable(expressionName: string, sheetId?: number): boolean;
    namedExpressionInAddress(row: number): Maybe<InternalNamedExpression>;
    namedExpressionForScope(expressionName: string, sheetId?: number): Maybe<InternalNamedExpression>;
    nearestNamedExpression(expressionName: string, sheetId: number): Maybe<InternalNamedExpression>;
    isExpressionInScope(expressionName: string, sheetId: number): boolean;
    /**
     * Checks the validity of a named-expression's name.
     *
     * The name:
     * - Must start with a Unicode letter or with an underscore (`_`).
     * - Can contain only Unicode letters, numbers, underscores, and periods (`.`).
     * - Can't be the same as any possible reference in the A1 notation (`[A-Za-z]+[0-9]+`).
     * - Can't be the same as any possible reference in the R1C1 notation (`[rR][0-9]*[cC][0-9]*`).
     *
     * The naming rules follow the [OpenDocument](https://docs.oasis-open.org/office/OpenDocument/v1.3/os/part4-formula/OpenDocument-v1.3-os-part4-formula.html#__RefHeading__1017964_715980110) standard.
     */
    isNameValid(expressionName: string): boolean;
    addNamedExpression(expressionName: string, sheetId?: number, options?: NamedExpressionOptions): InternalNamedExpression;
    restoreNamedExpression(namedExpression: InternalNamedExpression, sheetId?: number): InternalNamedExpression;
    namedExpressionOrPlaceholder(expressionName: string, sheetId: number): InternalNamedExpression;
    workbookNamedExpressionOrPlaceholder(expressionName: string): InternalNamedExpression;
    remove(expressionName: string, sheetId?: number): void;
    getAllNamedExpressionsNamesInScope(sheetId?: number): string[];
    getAllNamedExpressionsNames(): string[];
    getAllNamedExpressions(): {
        expression: InternalNamedExpression;
        scope?: number;
    }[];
    getAllNamedExpressionsForScope(scope?: number): InternalNamedExpression[];
    private worksheetStoreOrCreate;
    private worksheetStore;
    private nextAddress;
}
export declare const doesContainRelativeReferences: (ast: Ast) => boolean;
