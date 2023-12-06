"use strict";

exports.__esModule = true;
exports.TextPlugin = void 0;
var _Cell = require("../../Cell");
var _errorMessage = require("../../error-message");
var _FunctionPlugin = require("./FunctionPlugin");
/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */

/**
 * Interpreter plugin containing text-specific functions
 */
class TextPlugin extends _FunctionPlugin.FunctionPlugin {
  /**
   * Corresponds to CONCATENATE(value1, [value2, ...])
   *
   * Concatenates provided arguments to one string.
   *
   * @param ast
   * @param state
   */
  concatenate(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('CONCATENATE'), (...args) => {
      return ''.concat(...args);
    });
  }
  /**
   * Corresponds to SPLIT(string, index)
   *
   * Splits provided string using space separator and returns chunk at zero-based position specified by second argument
   *
   * @param ast
   * @param state
   */
  split(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('SPLIT'), (stringToSplit, indexToUse) => {
      const splittedString = stringToSplit.split(' ');
      if (indexToUse >= splittedString.length || indexToUse < 0) {
        return new _Cell.CellError(_Cell.ErrorType.VALUE, _errorMessage.ErrorMessage.IndexBounds);
      }
      return splittedString[indexToUse];
    });
  }
  len(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('LEN'), arg => {
      return arg.length;
    });
  }
  lower(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('LOWER'), arg => {
      return arg.toLowerCase();
    });
  }
  trim(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('TRIM'), arg => {
      return arg.replace(/^ +| +$/g, '').replace(/ +/g, ' ');
    });
  }
  proper(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('PROPER'), arg => {
      return arg.replace(/\p{L}+/gu, word => word.charAt(0).toUpperCase() + word.substring(1).toLowerCase());
    });
  }
  clean(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('CLEAN'), arg => {
      // eslint-disable-next-line no-control-regex
      return arg.replace(/[\u0000-\u001F]/g, '');
    });
  }
  exact(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('EXACT'), (left, right) => {
      return left === right;
    });
  }
  rept(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('REPT'), (text, count) => {
      if (count < 0) {
        return new _Cell.CellError(_Cell.ErrorType.VALUE, _errorMessage.ErrorMessage.NegativeCount);
      }
      return text.repeat(count);
    });
  }
  right(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('RIGHT'), (text, length) => {
      if (length < 0) {
        return new _Cell.CellError(_Cell.ErrorType.VALUE, _errorMessage.ErrorMessage.NegativeLength);
      } else if (length === 0) {
        return '';
      }
      return text.slice(-length);
    });
  }
  left(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('LEFT'), (text, length) => {
      if (length < 0) {
        return new _Cell.CellError(_Cell.ErrorType.VALUE, _errorMessage.ErrorMessage.NegativeLength);
      }
      return text.slice(0, length);
    });
  }
  mid(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('MID'), (text, startPosition, numberOfChars) => {
      if (startPosition < 1) {
        return new _Cell.CellError(_Cell.ErrorType.VALUE, _errorMessage.ErrorMessage.LessThanOne);
      }
      if (numberOfChars < 0) {
        return new _Cell.CellError(_Cell.ErrorType.VALUE, _errorMessage.ErrorMessage.NegativeLength);
      }
      return text.substring(startPosition - 1, startPosition + numberOfChars - 1);
    });
  }
  replace(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('REPLACE'), (text, startPosition, numberOfChars, newText) => {
      if (startPosition < 1) {
        return new _Cell.CellError(_Cell.ErrorType.VALUE, _errorMessage.ErrorMessage.LessThanOne);
      }
      if (numberOfChars < 0) {
        return new _Cell.CellError(_Cell.ErrorType.VALUE, _errorMessage.ErrorMessage.NegativeLength);
      }
      return text.substring(0, startPosition - 1) + newText + text.substring(startPosition + numberOfChars - 1);
    });
  }
  search(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('SEARCH'), (pattern, text, startIndex) => {
      if (startIndex < 1 || startIndex > text.length) {
        return new _Cell.CellError(_Cell.ErrorType.VALUE, _errorMessage.ErrorMessage.LengthBounds);
      }
      const normalizedPattern = pattern.toLowerCase();
      const normalizedText = text.substring(startIndex - 1).toLowerCase();
      const index = this.arithmeticHelper.requiresRegex(normalizedPattern) ? this.arithmeticHelper.searchString(normalizedPattern, normalizedText) : normalizedText.indexOf(normalizedPattern);
      return index > -1 ? index + startIndex : new _Cell.CellError(_Cell.ErrorType.VALUE, _errorMessage.ErrorMessage.PatternNotFound);
    });
  }
  substitute(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('SUBSTITUTE'), (text, oldText, newText, occurrence) => {
      const oldTextRegexp = new RegExp(oldText, 'g');
      if (occurrence === undefined) {
        return text.replace(oldTextRegexp, newText);
      }
      if (occurrence < 1) {
        return new _Cell.CellError(_Cell.ErrorType.VALUE, _errorMessage.ErrorMessage.LessThanOne);
      }
      let match;
      let i = 0;
      while ((match = oldTextRegexp.exec(text)) !== null) {
        if (occurrence === ++i) {
          return text.substring(0, match.index) + newText + text.substring(oldTextRegexp.lastIndex);
        }
      }
      return text;
    });
  }
  find(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('FIND'), (pattern, text, startIndex) => {
      if (startIndex < 1 || startIndex > text.length) {
        return new _Cell.CellError(_Cell.ErrorType.VALUE, _errorMessage.ErrorMessage.IndexBounds);
      }
      const shiftedText = text.substring(startIndex - 1);
      const index = shiftedText.indexOf(pattern) + startIndex;
      return index > 0 ? index : new _Cell.CellError(_Cell.ErrorType.VALUE, _errorMessage.ErrorMessage.PatternNotFound);
    });
  }
  t(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('T'), arg => {
      if (arg instanceof _Cell.CellError) {
        return arg;
      }
      return typeof arg === 'string' ? arg : '';
    });
  }
  upper(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('UPPER'), arg => {
      return arg.toUpperCase();
    });
  }
}
exports.TextPlugin = TextPlugin;
TextPlugin.implementedFunctions = {
  'CONCATENATE': {
    method: 'concatenate',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.STRING
    }],
    repeatLastArgs: 1,
    expandRanges: true
  },
  'EXACT': {
    method: 'exact',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.STRING
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.STRING
    }]
  },
  'SPLIT': {
    method: 'split',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.STRING
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }]
  },
  'LEN': {
    method: 'len',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.STRING
    }]
  },
  'LOWER': {
    method: 'lower',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.STRING
    }]
  },
  'MID': {
    method: 'mid',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.STRING
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }]
  },
  'TRIM': {
    method: 'trim',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.STRING
    }]
  },
  'T': {
    method: 't',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.SCALAR
    }]
  },
  'PROPER': {
    method: 'proper',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.STRING
    }]
  },
  'CLEAN': {
    method: 'clean',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.STRING
    }]
  },
  'REPT': {
    method: 'rept',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.STRING
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }]
  },
  'RIGHT': {
    method: 'right',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.STRING
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      defaultValue: 1
    }]
  },
  'LEFT': {
    method: 'left',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.STRING
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      defaultValue: 1
    }]
  },
  'REPLACE': {
    method: 'replace',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.STRING
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.STRING
    }]
  },
  'SEARCH': {
    method: 'search',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.STRING
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.STRING
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      defaultValue: 1
    }]
  },
  'SUBSTITUTE': {
    method: 'substitute',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.STRING
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.STRING
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.STRING
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      optionalArg: true
    }]
  },
  'FIND': {
    method: 'find',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.STRING
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.STRING
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      defaultValue: 1
    }]
  },
  'UPPER': {
    method: 'upper',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.STRING
    }]
  }
};