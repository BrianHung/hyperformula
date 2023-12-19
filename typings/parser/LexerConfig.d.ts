/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */
import { TokenType } from 'chevrotain';
import { ErrorType } from '../Cell';
import { ParserConfig } from './ParserConfig';
export declare const AdditionOp: TokenType;
export declare const PlusOp: TokenType;
export declare const MinusOp: TokenType;
export declare const MultiplicationOp: TokenType;
export declare const TimesOp: TokenType;
export declare const DivOp: TokenType;
export declare const PowerOp: TokenType;
export declare const PercentOp: TokenType;
export declare const BooleanOp: TokenType;
export declare const EqualsOp: TokenType;
export declare const NotEqualOp: TokenType;
export declare const GreaterThanOp: TokenType;
export declare const LessThanOp: TokenType;
export declare const GreaterThanOrEqualOp: TokenType;
export declare const LessThanOrEqualOp: TokenType;
export declare const ConcatenateOp: TokenType;
export declare const LParen: TokenType;
export declare const RParen: TokenType;
export declare const ArrayLParen: TokenType;
export declare const ArrayRParen: TokenType;
export declare const StringLiteral: TokenType;
export declare const ErrorLiteral: TokenType;
export declare const RangeSeparator: TokenType;
export declare const ColumnRange: TokenType;
export declare const RowRange: TokenType;
export declare const ProcedureName: TokenType;
export declare const ImmutableColRange: TokenType;
export declare const ImmutableRowRange: TokenType;
export declare const CellReference: TokenType;
export declare const NamedExpression: TokenType;
export declare const ImmutableCellReference: TokenType;
export declare const ImmutableRowReference: TokenType;
export declare const ImmutableColReference: TokenType;
export interface LexerConfig {
    ArgSeparator: TokenType;
    NumberLiteral: TokenType;
    OffsetProcedureName: TokenType;
    allTokens: TokenType[];
    errorMapping: Record<string, ErrorType>;
    functionMapping: Record<string, string>;
    decimalSeparator: '.' | ',';
    ArrayColSeparator: TokenType;
    ArrayRowSeparator: TokenType;
    WhiteSpace: TokenType;
    maxColumns: number;
    maxRows: number;
}
/**
 * Builds the configuration object for the lexer
 */
export declare const buildLexerConfig: (config: ParserConfig) => LexerConfig;