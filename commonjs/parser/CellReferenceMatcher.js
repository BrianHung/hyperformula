"use strict";

exports.__esModule = true;
exports.CellReferenceMatcher = void 0;
var _parserConsts = require("./parser-consts");
/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */

/**
 * Helper class for recognizing CellReference token in text
 */
class CellReferenceMatcher {
  constructor() {
    this.POSSIBLE_START_CHARACTERS = [..._parserConsts.ALL_UNICODE_LETTERS_ARRAY, ..._parserConsts.ALL_DIGITS_ARRAY, _parserConsts.ABSOLUTE_OPERATOR, "'", '_'];
    this.cellReferenceRegexp = new RegExp(_parserConsts.CELL_REFERENCE_WITH_NEXT_CHARACTER_PATTERN, 'y');
  }
  /**
   * Method used by the lexer to recognize CellReference token in text
   *
   * Note: using 'y' sticky flag for a named expression which is not supported on IE11...
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/sticky
   */
  match(text, startOffset) {
    this.cellReferenceRegexp.lastIndex = startOffset;
    const execResult = this.cellReferenceRegexp.exec(text + '@');
    if (execResult == null || execResult[1] == null) {
      return null;
    }
    execResult[0] = execResult[1];
    return execResult;
  }
}
exports.CellReferenceMatcher = CellReferenceMatcher;