"use strict";

exports.__esModule = true;
exports.NamedExpressionMatcher = void 0;
var _parserConsts = require("./parser-consts");
/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */

/**
 * Helper class for recognizing NamedExpression token in text
 */
class NamedExpressionMatcher {
  constructor() {
    this.POSSIBLE_START_CHARACTERS = [..._parserConsts.ALL_UNICODE_LETTERS_ARRAY, '_'];
    this.namedExpressionRegexp = new RegExp(_parserConsts.NAMED_EXPRESSION_PATTERN, 'y');
    this.r1c1CellRefRegexp = new RegExp(`^${_parserConsts.R1C1_CELL_REFERENCE_PATTERN}$`);
  }
  /**
   * Method used by the lexer to recognize NamedExpression token in text
   *
   * Note: using 'y' sticky flag for a named expression which is not supported on IE11...
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/sticky
   */
  match(text, startOffset) {
    this.namedExpressionRegexp.lastIndex = startOffset;
    const execResult = this.namedExpressionRegexp.exec(text);
    if (execResult == null || execResult[0] == null) {
      return null;
    }
    if (this.r1c1CellRefRegexp.test(execResult[0])) {
      return null;
    }
    return execResult;
  }
}
exports.NamedExpressionMatcher = NamedExpressionMatcher;