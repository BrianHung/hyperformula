/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */
export declare const RANGE_OPERATOR = ":";
export declare const ABSOLUTE_OPERATOR = "$";
export declare const ALL_WHITESPACE_PATTERN = "\\s+";
export declare const ODFF_WHITESPACE_PATTERN = "[ \\t\\n\\r]+";
export declare const UNICODE_LETTER_PATTERN = "A-Za-z\u00C0-\u02AF";
export declare const NON_RESERVED_CHARACTER_PATTERN: string;
export declare const UNQUOTED_SHEET_NAME_PATTERN: string;
export declare const QUOTED_SHEET_NAME_PATTERN = "'(((?!').|'')*)'";
export declare const SHEET_NAME_PATTERN: string;
export declare const CELL_REFERENCE_PATTERN: string;
export declare const COLUMN_REFERENCE_PATTERN: string;
export declare const ROW_REFERENCE_PATTERN: string;
export declare const R1C1_CELL_REFERENCE_PATTERN = "[rR][0-9]*[cC][0-9]*";
export declare const CELL_REFERENCE_WITH_NEXT_CHARACTER_PATTERN: string;
export declare const NAMED_EXPRESSION_PATTERN: string;
export declare const ALL_DIGITS_ARRAY: string[];
export declare const ALL_UNICODE_LETTERS_ARRAY: string[];
export declare const IMMUTABLE_CELL_REFERENCE_PATTERN = "REF\\(\"cell\",\"([0-9a-fA-F-]+)\",(true|false),(true|false)(?:,(true|false))?\\)";
export declare const IMMUTABLE_ROW_REFERENCE_PATTERN = "REF\\(\"row\",\"([0-9a-fA-F-]+)\",(true|false)(?:,(true|false))?\\)";
export declare const IMMUTABLE_COL_REFERENCE_PATTERN = "REF\\(\"col\",\"([0-9a-fA-F-]+)\",(true|false)(?:,(true|false))?\\)";