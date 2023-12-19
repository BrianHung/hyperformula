"use strict";

exports.__esModule = true;
exports.buildTimesOpAst = exports.buildStringAst = exports.buildRowRangeAst = exports.buildProcedureAst = exports.buildPowerOpAst = exports.buildPlusUnaryOpAst = exports.buildPlusOpAst = exports.buildPercentOpAst = exports.buildParsingErrorAst = exports.buildParenthesisAst = exports.buildNumberAst = exports.buildNotEqualOpAst = exports.buildNamedExpressionAst = exports.buildMinusUnaryOpAst = exports.buildMinusOpAst = exports.buildLessThanOrEqualOpAst = exports.buildLessThanOpAst = exports.buildGreaterThanOrEqualOpAst = exports.buildGreaterThanOpAst = exports.buildErrorWithRawInputAst = exports.buildEqualsOpAst = exports.buildEmptyArgAst = exports.buildDivOpAst = exports.buildConcatenateOpAst = exports.buildColumnRangeAst = exports.buildCellReferenceAst = exports.buildCellRangeAst = exports.buildCellErrorAst = exports.buildArrayAst = exports.RangeSheetReferenceType = exports.ParsingErrorType = exports.AstNodeType = void 0;
exports.imageWithWhitespace = imageWithWhitespace;
exports.parsingError = void 0;
var _Cell = require("../Cell");
/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */

const parsingError = (type, message) => ({
  type,
  message
});
exports.parsingError = parsingError;
var ParsingErrorType;
exports.ParsingErrorType = ParsingErrorType;
(function (ParsingErrorType) {
  ParsingErrorType["LexingError"] = "LexingError";
  ParsingErrorType["ParserError"] = "ParsingError";
  ParsingErrorType["StaticOffsetError"] = "StaticOffsetError";
  ParsingErrorType["StaticOffsetOutOfRangeError"] = "StaticOffsetOutOfRangeError";
  ParsingErrorType["RangeOffsetNotAllowed"] = "RangeOffsetNotAllowed";
})(ParsingErrorType || (exports.ParsingErrorType = ParsingErrorType = {}));
var AstNodeType;
exports.AstNodeType = AstNodeType;
(function (AstNodeType) {
  AstNodeType["EMPTY"] = "EMPTY";
  AstNodeType["NUMBER"] = "NUMBER";
  AstNodeType["STRING"] = "STRING";
  AstNodeType["MINUS_UNARY_OP"] = "MINUS_UNARY_OP";
  AstNodeType["PLUS_UNARY_OP"] = "PLUS_UNARY_OP";
  AstNodeType["PERCENT_OP"] = "PERCENT_OP";
  AstNodeType["CONCATENATE_OP"] = "CONCATENATE_OP";
  AstNodeType["EQUALS_OP"] = "EQUALS_OP";
  AstNodeType["NOT_EQUAL_OP"] = "NOT_EQUAL_OP";
  AstNodeType["GREATER_THAN_OP"] = "GREATER_THAN_OP";
  AstNodeType["LESS_THAN_OP"] = "LESS_THAN_OP";
  AstNodeType["GREATER_THAN_OR_EQUAL_OP"] = "GREATER_THAN_OR_EQUAL_OP";
  AstNodeType["LESS_THAN_OR_EQUAL_OP"] = "LESS_THAN_OR_EQUAL_OP";
  AstNodeType["PLUS_OP"] = "PLUS_OP";
  AstNodeType["MINUS_OP"] = "MINUS_OP";
  AstNodeType["TIMES_OP"] = "TIMES_OP";
  AstNodeType["DIV_OP"] = "DIV_OP";
  AstNodeType["POWER_OP"] = "POWER_OP";
  AstNodeType["FUNCTION_CALL"] = "FUNCTION_CALL";
  AstNodeType["NAMED_EXPRESSION"] = "NAMED_EXPRESSION";
  AstNodeType["PARENTHESIS"] = "PARENTHESES";
  AstNodeType["CELL_REFERENCE"] = "CELL_REFERENCE";
  AstNodeType["CELL_RANGE"] = "CELL_RANGE";
  AstNodeType["COLUMN_RANGE"] = "COLUMN_RANGE";
  AstNodeType["ROW_RANGE"] = "ROW_RANGE";
  AstNodeType["ERROR"] = "ERROR";
  AstNodeType["ERROR_WITH_RAW_INPUT"] = "ERROR_WITH_RAW_INPUT";
  AstNodeType["ARRAY"] = "ARRAY";
})(AstNodeType || (exports.AstNodeType = AstNodeType = {}));
var RangeSheetReferenceType;
exports.RangeSheetReferenceType = RangeSheetReferenceType;
(function (RangeSheetReferenceType) {
  RangeSheetReferenceType[RangeSheetReferenceType["RELATIVE"] = 0] = "RELATIVE";
  RangeSheetReferenceType[RangeSheetReferenceType["START_ABSOLUTE"] = 1] = "START_ABSOLUTE";
  RangeSheetReferenceType[RangeSheetReferenceType["BOTH_ABSOLUTE"] = 2] = "BOTH_ABSOLUTE";
})(RangeSheetReferenceType || (exports.RangeSheetReferenceType = RangeSheetReferenceType = {}));
const buildEmptyArgAst = leadingWhitespace => ({
  type: AstNodeType.EMPTY,
  leadingWhitespace: leadingWhitespace === null || leadingWhitespace === void 0 ? void 0 : leadingWhitespace.image
});
exports.buildEmptyArgAst = buildEmptyArgAst;
const buildNumberAst = (value, leadingWhitespace) => ({
  type: AstNodeType.NUMBER,
  value: value,
  leadingWhitespace: leadingWhitespace === null || leadingWhitespace === void 0 ? void 0 : leadingWhitespace.image
});
exports.buildNumberAst = buildNumberAst;
const buildStringAst = token => {
  var _a;
  return {
    type: AstNodeType.STRING,
    value: token.image.slice(1, -1),
    leadingWhitespace: (_a = token.leadingWhitespace) === null || _a === void 0 ? void 0 : _a.image
  };
};
exports.buildStringAst = buildStringAst;
const buildCellReferenceAst = (reference, leadingWhitespace) => ({
  type: AstNodeType.CELL_REFERENCE,
  reference,
  leadingWhitespace: leadingWhitespace === null || leadingWhitespace === void 0 ? void 0 : leadingWhitespace.image
});
exports.buildCellReferenceAst = buildCellReferenceAst;
const buildCellRangeAst = (start, end, sheetReferenceType, leadingWhitespace) => {
  assertRangeConsistency(start, end, sheetReferenceType);
  return {
    type: AstNodeType.CELL_RANGE,
    start,
    end,
    sheetReferenceType,
    leadingWhitespace
  };
};
exports.buildCellRangeAst = buildCellRangeAst;
const buildColumnRangeAst = (start, end, sheetReferenceType, leadingWhitespace) => {
  assertRangeConsistency(start, end, sheetReferenceType);
  return {
    type: AstNodeType.COLUMN_RANGE,
    start,
    end,
    sheetReferenceType,
    leadingWhitespace: leadingWhitespace === null || leadingWhitespace === void 0 ? void 0 : leadingWhitespace.image
  };
};
exports.buildColumnRangeAst = buildColumnRangeAst;
const buildRowRangeAst = (start, end, sheetReferenceType, leadingWhitespace) => {
  assertRangeConsistency(start, end, sheetReferenceType);
  return {
    type: AstNodeType.ROW_RANGE,
    start,
    end,
    sheetReferenceType,
    leadingWhitespace: leadingWhitespace === null || leadingWhitespace === void 0 ? void 0 : leadingWhitespace.image
  };
};
exports.buildRowRangeAst = buildRowRangeAst;
const buildConcatenateOpAst = (left, right, leadingWhitespace) => ({
  type: AstNodeType.CONCATENATE_OP,
  left,
  right,
  leadingWhitespace: leadingWhitespace === null || leadingWhitespace === void 0 ? void 0 : leadingWhitespace.image
});
exports.buildConcatenateOpAst = buildConcatenateOpAst;
const buildEqualsOpAst = (left, right, leadingWhitespace) => ({
  type: AstNodeType.EQUALS_OP,
  left,
  right,
  leadingWhitespace: leadingWhitespace === null || leadingWhitespace === void 0 ? void 0 : leadingWhitespace.image
});
exports.buildEqualsOpAst = buildEqualsOpAst;
const buildNotEqualOpAst = (left, right, leadingWhitespace) => ({
  type: AstNodeType.NOT_EQUAL_OP,
  left,
  right,
  leadingWhitespace: leadingWhitespace === null || leadingWhitespace === void 0 ? void 0 : leadingWhitespace.image
});
exports.buildNotEqualOpAst = buildNotEqualOpAst;
const buildGreaterThanOpAst = (left, right, leadingWhitespace) => ({
  type: AstNodeType.GREATER_THAN_OP,
  left,
  right,
  leadingWhitespace: leadingWhitespace === null || leadingWhitespace === void 0 ? void 0 : leadingWhitespace.image
});
exports.buildGreaterThanOpAst = buildGreaterThanOpAst;
const buildLessThanOpAst = (left, right, leadingWhitespace) => ({
  type: AstNodeType.LESS_THAN_OP,
  left,
  right,
  leadingWhitespace: leadingWhitespace === null || leadingWhitespace === void 0 ? void 0 : leadingWhitespace.image
});
exports.buildLessThanOpAst = buildLessThanOpAst;
const buildGreaterThanOrEqualOpAst = (left, right, leadingWhitespace) => ({
  type: AstNodeType.GREATER_THAN_OR_EQUAL_OP,
  left,
  right,
  leadingWhitespace: leadingWhitespace === null || leadingWhitespace === void 0 ? void 0 : leadingWhitespace.image
});
exports.buildGreaterThanOrEqualOpAst = buildGreaterThanOrEqualOpAst;
const buildLessThanOrEqualOpAst = (left, right, leadingWhitespace) => ({
  type: AstNodeType.LESS_THAN_OR_EQUAL_OP,
  left,
  right,
  leadingWhitespace: leadingWhitespace === null || leadingWhitespace === void 0 ? void 0 : leadingWhitespace.image
});
exports.buildLessThanOrEqualOpAst = buildLessThanOrEqualOpAst;
const buildPlusOpAst = (left, right, leadingWhitespace) => ({
  type: AstNodeType.PLUS_OP,
  left,
  right,
  leadingWhitespace: leadingWhitespace === null || leadingWhitespace === void 0 ? void 0 : leadingWhitespace.image
});
exports.buildPlusOpAst = buildPlusOpAst;
const buildMinusOpAst = (left, right, leadingWhitespace) => ({
  type: AstNodeType.MINUS_OP,
  left,
  right,
  leadingWhitespace: leadingWhitespace === null || leadingWhitespace === void 0 ? void 0 : leadingWhitespace.image
});
exports.buildMinusOpAst = buildMinusOpAst;
const buildTimesOpAst = (left, right, leadingWhitespace) => ({
  type: AstNodeType.TIMES_OP,
  left,
  right,
  leadingWhitespace: leadingWhitespace === null || leadingWhitespace === void 0 ? void 0 : leadingWhitespace.image
});
exports.buildTimesOpAst = buildTimesOpAst;
const buildDivOpAst = (left, right, leadingWhitespace) => ({
  type: AstNodeType.DIV_OP,
  left,
  right,
  leadingWhitespace: leadingWhitespace === null || leadingWhitespace === void 0 ? void 0 : leadingWhitespace.image
});
exports.buildDivOpAst = buildDivOpAst;
const buildPowerOpAst = (left, right, leadingWhitespace) => ({
  type: AstNodeType.POWER_OP,
  left,
  right,
  leadingWhitespace: leadingWhitespace === null || leadingWhitespace === void 0 ? void 0 : leadingWhitespace.image
});
exports.buildPowerOpAst = buildPowerOpAst;
const buildMinusUnaryOpAst = (value, leadingWhitespace) => ({
  type: AstNodeType.MINUS_UNARY_OP,
  value,
  leadingWhitespace: leadingWhitespace === null || leadingWhitespace === void 0 ? void 0 : leadingWhitespace.image
});
exports.buildMinusUnaryOpAst = buildMinusUnaryOpAst;
const buildPlusUnaryOpAst = (value, leadingWhitespace) => ({
  type: AstNodeType.PLUS_UNARY_OP,
  value,
  leadingWhitespace: leadingWhitespace === null || leadingWhitespace === void 0 ? void 0 : leadingWhitespace.image
});
exports.buildPlusUnaryOpAst = buildPlusUnaryOpAst;
const buildPercentOpAst = (value, leadingWhitespace) => ({
  type: AstNodeType.PERCENT_OP,
  value,
  leadingWhitespace: leadingWhitespace === null || leadingWhitespace === void 0 ? void 0 : leadingWhitespace.image
});
exports.buildPercentOpAst = buildPercentOpAst;
const buildProcedureAst = (procedureName, args, leadingWhitespace, internalWhitespace, hyperlink) => ({
  type: AstNodeType.FUNCTION_CALL,
  procedureName,
  args,
  leadingWhitespace: leadingWhitespace === null || leadingWhitespace === void 0 ? void 0 : leadingWhitespace.image,
  internalWhitespace: internalWhitespace === null || internalWhitespace === void 0 ? void 0 : internalWhitespace.image,
  hyperlink
});
exports.buildProcedureAst = buildProcedureAst;
const buildArrayAst = (args, leadingWhitespace, internalWhitespace) => ({
  type: AstNodeType.ARRAY,
  args,
  leadingWhitespace: leadingWhitespace === null || leadingWhitespace === void 0 ? void 0 : leadingWhitespace.image,
  internalWhitespace: internalWhitespace === null || internalWhitespace === void 0 ? void 0 : internalWhitespace.image
});
exports.buildArrayAst = buildArrayAst;
const buildNamedExpressionAst = (expressionName, leadingWhitespace) => ({
  type: AstNodeType.NAMED_EXPRESSION,
  expressionName,
  leadingWhitespace: leadingWhitespace === null || leadingWhitespace === void 0 ? void 0 : leadingWhitespace.image
});
exports.buildNamedExpressionAst = buildNamedExpressionAst;
const buildParenthesisAst = (expression, leadingWhitespace, internalWhitespace) => ({
  type: AstNodeType.PARENTHESIS,
  expression,
  leadingWhitespace: leadingWhitespace === null || leadingWhitespace === void 0 ? void 0 : leadingWhitespace.image,
  internalWhitespace: internalWhitespace === null || internalWhitespace === void 0 ? void 0 : internalWhitespace.image
});
exports.buildParenthesisAst = buildParenthesisAst;
const buildCellErrorAst = (error, leadingWhitespace) => ({
  type: AstNodeType.ERROR,
  error,
  leadingWhitespace: leadingWhitespace === null || leadingWhitespace === void 0 ? void 0 : leadingWhitespace.image
});
exports.buildCellErrorAst = buildCellErrorAst;
const buildErrorWithRawInputAst = (rawInput, error, leadingWhitespace) => ({
  type: AstNodeType.ERROR_WITH_RAW_INPUT,
  error,
  rawInput,
  leadingWhitespace: leadingWhitespace === null || leadingWhitespace === void 0 ? void 0 : leadingWhitespace.image
});
exports.buildErrorWithRawInputAst = buildErrorWithRawInputAst;
const buildParsingErrorAst = () => ({
  type: AstNodeType.ERROR,
  error: _Cell.CellError.parsingError()
});
exports.buildParsingErrorAst = buildParsingErrorAst;
function assertRangeConsistency(start, end, sheetReferenceType) {
  if (start.sheet !== undefined && end.sheet === undefined || start.sheet === undefined && end.sheet !== undefined) {
    throw new Error('Start address inconsistent with end address');
  }
  if (start.sheet === undefined && sheetReferenceType !== RangeSheetReferenceType.RELATIVE || start.sheet !== undefined && sheetReferenceType === RangeSheetReferenceType.RELATIVE) {
    throw new Error('Sheet address inconsistent with sheet reference type');
  }
}
function imageWithWhitespace(image, leadingWhitespace) {
  return (leadingWhitespace !== null && leadingWhitespace !== void 0 ? leadingWhitespace : '') + image;
}