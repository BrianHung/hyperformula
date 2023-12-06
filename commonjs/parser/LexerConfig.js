"use strict";

exports.__esModule = true;
exports.buildLexerConfig = exports.TimesOp = exports.StringLiteral = exports.RowRange = exports.RangeSeparator = exports.RParen = exports.ProcedureName = exports.PowerOp = exports.PlusOp = exports.PercentOp = exports.NotEqualOp = exports.NamedExpression = exports.MultiplicationOp = exports.MinusOp = exports.LessThanOrEqualOp = exports.LessThanOp = exports.LParen = exports.ImmutableRowReference = exports.ImmutableRowRange = exports.ImmutableColReference = exports.ImmutableColRange = exports.ImmutableCellReference = exports.GreaterThanOrEqualOp = exports.GreaterThanOp = exports.ErrorLiteral = exports.EqualsOp = exports.DivOp = exports.ConcatenateOp = exports.ColumnRange = exports.CellReference = exports.BooleanOp = exports.ArrayRParen = exports.ArrayLParen = exports.AdditionOp = void 0;
var _chevrotain = require("chevrotain");
var _parserConsts = require("./parser-consts");
var _CellReferenceMatcher = require("./CellReferenceMatcher");
var _NamedExpressionMatcher = require("./NamedExpressionMatcher");
/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */

const AdditionOp = (0, _chevrotain.createToken)({
  name: 'AdditionOp',
  pattern: _chevrotain.Lexer.NA
});
exports.AdditionOp = AdditionOp;
const PlusOp = (0, _chevrotain.createToken)({
  name: 'PlusOp',
  pattern: /\+/,
  categories: AdditionOp
});
exports.PlusOp = PlusOp;
const MinusOp = (0, _chevrotain.createToken)({
  name: 'MinusOp',
  pattern: /-/,
  categories: AdditionOp
});
exports.MinusOp = MinusOp;
const MultiplicationOp = (0, _chevrotain.createToken)({
  name: 'MultiplicationOp',
  pattern: _chevrotain.Lexer.NA
});
exports.MultiplicationOp = MultiplicationOp;
const TimesOp = (0, _chevrotain.createToken)({
  name: 'TimesOp',
  pattern: /\*/,
  categories: MultiplicationOp
});
exports.TimesOp = TimesOp;
const DivOp = (0, _chevrotain.createToken)({
  name: 'DivOp',
  pattern: /\//,
  categories: MultiplicationOp
});
exports.DivOp = DivOp;
const PowerOp = (0, _chevrotain.createToken)({
  name: 'PowerOp',
  pattern: /\^/
});
exports.PowerOp = PowerOp;
const PercentOp = (0, _chevrotain.createToken)({
  name: 'PercentOp',
  pattern: /%/
});
exports.PercentOp = PercentOp;
const BooleanOp = (0, _chevrotain.createToken)({
  name: 'BooleanOp',
  pattern: _chevrotain.Lexer.NA
});
exports.BooleanOp = BooleanOp;
const EqualsOp = (0, _chevrotain.createToken)({
  name: 'EqualsOp',
  pattern: /=/,
  categories: BooleanOp
});
exports.EqualsOp = EqualsOp;
const NotEqualOp = (0, _chevrotain.createToken)({
  name: 'NotEqualOp',
  pattern: /<>/,
  categories: BooleanOp
});
exports.NotEqualOp = NotEqualOp;
const GreaterThanOp = (0, _chevrotain.createToken)({
  name: 'GreaterThanOp',
  pattern: />/,
  categories: BooleanOp
});
exports.GreaterThanOp = GreaterThanOp;
const LessThanOp = (0, _chevrotain.createToken)({
  name: 'LessThanOp',
  pattern: /</,
  categories: BooleanOp
});
exports.LessThanOp = LessThanOp;
const GreaterThanOrEqualOp = (0, _chevrotain.createToken)({
  name: 'GreaterThanOrEqualOp',
  pattern: />=/,
  categories: BooleanOp
});
exports.GreaterThanOrEqualOp = GreaterThanOrEqualOp;
const LessThanOrEqualOp = (0, _chevrotain.createToken)({
  name: 'LessThanOrEqualOp',
  pattern: /<=/,
  categories: BooleanOp
});
exports.LessThanOrEqualOp = LessThanOrEqualOp;
const ConcatenateOp = (0, _chevrotain.createToken)({
  name: 'ConcatenateOp',
  pattern: /&/
});
exports.ConcatenateOp = ConcatenateOp;
const LParen = (0, _chevrotain.createToken)({
  name: 'LParen',
  pattern: /\(/
});
exports.LParen = LParen;
const RParen = (0, _chevrotain.createToken)({
  name: 'RParen',
  pattern: /\)/
});
exports.RParen = RParen;
const ArrayLParen = (0, _chevrotain.createToken)({
  name: 'ArrayLParen',
  pattern: /{/
});
exports.ArrayLParen = ArrayLParen;
const ArrayRParen = (0, _chevrotain.createToken)({
  name: 'ArrayRParen',
  pattern: /}/
});
exports.ArrayRParen = ArrayRParen;
const StringLiteral = (0, _chevrotain.createToken)({
  name: 'StringLiteral',
  pattern: /"([^"\\]*(\\.[^"\\]*)*)"/
});
exports.StringLiteral = StringLiteral;
const ErrorLiteral = (0, _chevrotain.createToken)({
  name: 'ErrorLiteral',
  pattern: /#[A-Za-z0-9\/]+[?!]?/
});
exports.ErrorLiteral = ErrorLiteral;
const RangeSeparator = (0, _chevrotain.createToken)({
  name: 'RangeSeparator',
  pattern: new RegExp(_parserConsts.RANGE_OPERATOR)
});
exports.RangeSeparator = RangeSeparator;
const ColumnRange = (0, _chevrotain.createToken)({
  name: 'ColumnRange',
  pattern: new RegExp(`${_parserConsts.COLUMN_REFERENCE_PATTERN}${_parserConsts.RANGE_OPERATOR}${_parserConsts.COLUMN_REFERENCE_PATTERN}`)
});
exports.ColumnRange = ColumnRange;
const RowRange = (0, _chevrotain.createToken)({
  name: 'RowRange',
  pattern: new RegExp(`${_parserConsts.ROW_REFERENCE_PATTERN}${_parserConsts.RANGE_OPERATOR}${_parserConsts.ROW_REFERENCE_PATTERN}`)
});
exports.RowRange = RowRange;
const ProcedureName = (0, _chevrotain.createToken)({
  name: 'ProcedureName',
  pattern: new RegExp(`([${_parserConsts.UNICODE_LETTER_PATTERN}][${_parserConsts.NON_RESERVED_CHARACTER_PATTERN}]*)\\(`)
});
exports.ProcedureName = ProcedureName;
const ImmutableColRange = (0, _chevrotain.createToken)({
  name: 'ImmutableColRange',
  pattern: new RegExp(`${_parserConsts.IMMUTABLE_COL_REFERENCE_PATTERN}${_parserConsts.RANGE_OPERATOR}${_parserConsts.IMMUTABLE_COL_REFERENCE_PATTERN}`)
});
exports.ImmutableColRange = ImmutableColRange;
const ImmutableRowRange = (0, _chevrotain.createToken)({
  name: 'ImmutableRowRange',
  pattern: new RegExp(`${_parserConsts.IMMUTABLE_ROW_REFERENCE_PATTERN}${_parserConsts.RANGE_OPERATOR}${_parserConsts.IMMUTABLE_ROW_REFERENCE_PATTERN}`)
});
exports.ImmutableRowRange = ImmutableRowRange;
const cellReferenceMatcher = new _CellReferenceMatcher.CellReferenceMatcher();
const CellReference = (0, _chevrotain.createToken)({
  name: 'CellReference',
  pattern: cellReferenceMatcher.match.bind(cellReferenceMatcher),
  start_chars_hint: cellReferenceMatcher.POSSIBLE_START_CHARACTERS,
  line_breaks: false
});
exports.CellReference = CellReference;
const namedExpressionMatcher = new _NamedExpressionMatcher.NamedExpressionMatcher();
const NamedExpression = (0, _chevrotain.createToken)({
  name: 'NamedExpression',
  pattern: namedExpressionMatcher.match.bind(namedExpressionMatcher),
  start_chars_hint: namedExpressionMatcher.POSSIBLE_START_CHARACTERS,
  line_breaks: false
});
exports.NamedExpression = NamedExpression;
class ImmutableCellReferenceMatcher {
  constructor() {
    this.cellReferenceRegexp = new RegExp(_parserConsts.IMMUTABLE_CELL_REFERENCE_PATTERN, 'y');
  }
  /**
   * Method used by the lexer to recognize CellReference token in text
   *
   * Note: using 'y' sticky flag for a named expression which is not supported on IE11...
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/sticky
   */
  match(text, startOffset) {
    this.cellReferenceRegexp.lastIndex = startOffset;
    const execResult = this.cellReferenceRegexp.exec(text);
    if (execResult !== null) {
      /**
       * Save RegExp capturing groups on the token object.
       * https://chevrotain.io/docs/guide/custom_token_patterns.html#custom-payloads
       */
      execResult.payload = [execResult[1], execResult[2], execResult[3], execResult[4]];
    }
    return execResult;
  }
}
const immutableCellReferenceMatcher = new ImmutableCellReferenceMatcher();
const ImmutableCellReference = (0, _chevrotain.createToken)({
  name: 'ImmutableCellReference',
  pattern: immutableCellReferenceMatcher.match.bind(immutableCellReferenceMatcher),
  line_breaks: false
});
exports.ImmutableCellReference = ImmutableCellReference;
const ImmutableRowReference = (0, _chevrotain.createToken)({
  name: 'ImmutableRowReference',
  pattern: new RegExp(_parserConsts.IMMUTABLE_ROW_REFERENCE_PATTERN),
  line_breaks: false
});
exports.ImmutableRowReference = ImmutableRowReference;
const ImmutableColReference = (0, _chevrotain.createToken)({
  name: 'ImmutableColReference',
  pattern: new RegExp(_parserConsts.IMMUTABLE_COL_REFERENCE_PATTERN),
  line_breaks: false
});
/**
 * Builds the configuration object for the lexer
 */
exports.ImmutableColReference = ImmutableColReference;
const buildLexerConfig = config => {
  const offsetProcedureNameLiteral = config.translationPackage.getFunctionTranslation('OFFSET');
  const errorMapping = config.errorMapping;
  const functionMapping = config.translationPackage.buildFunctionMapping();
  const whitespaceTokenRegexp = new RegExp(config.ignoreWhiteSpace === 'standard' ? _parserConsts.ODFF_WHITESPACE_PATTERN : _parserConsts.ALL_WHITESPACE_PATTERN);
  const WhiteSpace = (0, _chevrotain.createToken)({
    name: 'WhiteSpace',
    pattern: whitespaceTokenRegexp
  });
  const ArrayRowSeparator = (0, _chevrotain.createToken)({
    name: 'ArrayRowSep',
    pattern: config.arrayRowSeparator
  });
  const ArrayColSeparator = (0, _chevrotain.createToken)({
    name: 'ArrayColSep',
    pattern: config.arrayColumnSeparator
  });
  const NumberLiteral = (0, _chevrotain.createToken)({
    name: 'NumberLiteral',
    pattern: new RegExp(`(([${config.decimalSeparator}]\\d+)|(\\d+([${config.decimalSeparator}]\\d*)?))(e[+-]?\\d+)?`)
  });
  const OffsetProcedureName = (0, _chevrotain.createToken)({
    name: 'OffsetProcedureName',
    pattern: new RegExp(offsetProcedureNameLiteral, 'i')
  });
  let ArgSeparator;
  let inject;
  if (config.functionArgSeparator === config.arrayColumnSeparator) {
    ArgSeparator = ArrayColSeparator;
    inject = [];
  } else if (config.functionArgSeparator === config.arrayRowSeparator) {
    ArgSeparator = ArrayRowSeparator;
    inject = [];
  } else {
    ArgSeparator = (0, _chevrotain.createToken)({
      name: 'ArgSeparator',
      pattern: config.functionArgSeparator
    });
    inject = [ArgSeparator];
  }
  /* order is important, first pattern is used */
  const allTokens = [WhiteSpace, PlusOp, MinusOp, TimesOp, DivOp, PowerOp, EqualsOp, NotEqualOp, PercentOp, GreaterThanOrEqualOp, LessThanOrEqualOp, GreaterThanOp, LessThanOp, LParen, RParen, ArrayLParen, ArrayRParen, ImmutableColRange, ImmutableRowRange, ImmutableCellReference, ImmutableRowReference, ImmutableColReference, OffsetProcedureName, ProcedureName, RangeSeparator, ...inject, ColumnRange, RowRange, NumberLiteral, StringLiteral, ErrorLiteral, ConcatenateOp, BooleanOp, AdditionOp, MultiplicationOp, CellReference, NamedExpression, ArrayRowSeparator, ArrayColSeparator];
  return {
    ArgSeparator,
    NumberLiteral,
    OffsetProcedureName,
    ArrayRowSeparator,
    ArrayColSeparator,
    WhiteSpace,
    allTokens,
    errorMapping,
    functionMapping,
    decimalSeparator: config.decimalSeparator,
    maxColumns: config.maxColumns,
    maxRows: config.maxRows
  };
};
exports.buildLexerConfig = buildLexerConfig;