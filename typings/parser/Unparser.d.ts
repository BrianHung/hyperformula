/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */
import { SimpleCellAddress } from '../Cell';
import { ImmutableIdMapping } from '../DependencyGraph/ImmutableRefMapping';
import { NamedExpressions } from '../NamedExpressions';
import { SheetIndexMappingFn } from './addressRepresentationConverters';
import { Ast } from './Ast';
import { LexerConfig } from './LexerConfig';
import { ParserConfig } from './ParserConfig';
export declare class Unparser {
    private readonly config;
    private readonly lexerConfig;
    private readonly sheetMappingFn;
    private readonly namedExpressions;
    private readonly immutableMapping?;
    constructor(config: ParserConfig, lexerConfig: LexerConfig, sheetMappingFn: SheetIndexMappingFn, namedExpressions: NamedExpressions, immutableMapping?: ImmutableIdMapping | undefined);
    unparse(ast: Ast, address: SimpleCellAddress): string;
    unparseImmutable(ast: Ast, address: SimpleCellAddress): string;
    private unparseAstImmutable;
    private unparseAst;
    private unparseSheetName;
    private formatRange;
    private formatImmutableRange;
}
export declare function formatNumber(number: number, decimalSeparator: string): string;
