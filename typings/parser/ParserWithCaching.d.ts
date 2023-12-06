/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */
import { IToken, ILexingResult } from 'chevrotain';
import { SimpleCellAddress } from '../Cell';
import { FunctionRegistry } from '../interpreter/FunctionRegistry';
import { RelativeDependency } from './';
import { SheetMappingFn } from './addressRepresentationConverters';
import { Ast, ParsingError } from './Ast';
import { ExtendedToken } from './FormulaParser';
import { ParserConfig } from './ParserConfig';
import { ImmutableReferenceMapping } from '../DependencyGraph/ImmutableRefMapping';
export interface ParsingResult {
    ast: Ast;
    errors: ParsingError[];
    dependencies: RelativeDependency[];
    hasVolatileFunction: boolean;
    hasStructuralChangeFunction: boolean;
}
/**
 * Parses formula using caching if feasible.
 */
export declare class ParserWithCaching {
    private readonly config;
    private readonly functionRegistry;
    private readonly sheetMapping;
    private readonly immutableReferenceMapping;
    statsCacheUsed: number;
    private cache;
    private lexer;
    private readonly lexerConfig;
    private formulaParser;
    private formulaAddress?;
    constructor(config: ParserConfig, functionRegistry: FunctionRegistry, sheetMapping: SheetMappingFn, immutableReferenceMapping: ImmutableReferenceMapping);
    /**
     * Parses a formula.
     *
     * @param text - formula to parse
     * @param formulaAddress - address with regard to which formula should be parsed. Impacts computed addresses in R0C0 format.
     */
    parse(text: string, formulaAddress: SimpleCellAddress): ParsingResult;
    private convertReversedRangesToRegularRanges;
    private orderCellRangeEnds;
    private orderColumnRangeEnds;
    private orderRowRangeEnds;
    private static compareSheetIds;
    fetchCachedResultForAst(ast: Ast): ParsingResult;
    fetchCachedResult(hash: string): ParsingResult;
    computeHashFromTokens(tokens: IToken[], baseAddress: SimpleCellAddress): string;
    rememberNewAst(ast: Ast): Ast;
    computeHashFromAst(ast: Ast): string;
    private computeHashOfAstNode;
    bindWhitespacesToTokens(tokens: IToken[]): ExtendedToken[];
    tokenizeFormula(text: string): ILexingResult;
}
