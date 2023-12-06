"use strict";

exports.__esModule = true;
exports.CellContentParser = exports.CellContent = void 0;
exports.isBoolean = isBoolean;
exports.isError = isError;
exports.isFormula = isFormula;
var _Cell = require("./Cell");
var _DateTimeHelper = require("./DateTimeHelper");
var _errorMessage = require("./error-message");
var _errors = require("./errors");
var _ArithmeticHelper = require("./interpreter/ArithmeticHelper");
var _InterpreterValue = require("./interpreter/InterpreterValue");
/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */

var CellContent;
exports.CellContent = CellContent;
(function (CellContent) {
  class Number {
    constructor(value) {
      this.value = value;
      this.value = (0, _InterpreterValue.cloneNumber)(this.value, (0, _ArithmeticHelper.fixNegativeZero)((0, _InterpreterValue.getRawValue)(this.value)));
    }
  }
  CellContent.Number = Number;
  class String {
    constructor(value) {
      this.value = value;
    }
  }
  CellContent.String = String;
  class Boolean {
    constructor(value) {
      this.value = value;
    }
  }
  CellContent.Boolean = Boolean;
  class Empty {
    static getSingletonInstance() {
      if (!Empty.instance) {
        Empty.instance = new Empty();
      }
      return Empty.instance;
    }
  }
  CellContent.Empty = Empty;
  class Formula {
    constructor(formula) {
      this.formula = formula;
    }
  }
  CellContent.Formula = Formula;
  class Error {
    constructor(errorType, message) {
      this.value = new _Cell.CellError(errorType, message);
    }
  }
  CellContent.Error = Error;
})(CellContent || (exports.CellContent = CellContent = {}));
/**
 * Checks whether string looks like formula or not.
 *
 * @param text - formula
 */
function isFormula(text) {
  return text.startsWith('=');
}
function isBoolean(text) {
  const tl = text.toLowerCase();
  return tl === 'true' || tl === 'false';
}
function isError(text, errorMapping) {
  const upperCased = text.toUpperCase();
  const errorRegex = /#[A-Za-z0-9\/]+[?!]?/;
  return errorRegex.test(upperCased) && Object.prototype.hasOwnProperty.call(errorMapping, upperCased);
}
class CellContentParser {
  constructor(config, dateHelper, numberLiteralsHelper) {
    this.config = config;
    this.dateHelper = dateHelper;
    this.numberLiteralsHelper = numberLiteralsHelper;
  }
  parse(content) {
    if (content === undefined || content === null) {
      return CellContent.Empty.getSingletonInstance();
    } else if (typeof content === 'number') {
      if ((0, _ArithmeticHelper.isNumberOverflow)(content)) {
        return new CellContent.Error(_Cell.ErrorType.NUM, _errorMessage.ErrorMessage.ValueLarge);
      } else {
        return new CellContent.Number(content);
      }
    } else if (typeof content === 'boolean') {
      return new CellContent.Boolean(content);
    } else if (content instanceof Date) {
      const dateVal = this.dateHelper.dateToNumber({
        day: content.getDate(),
        month: content.getMonth() + 1,
        year: content.getFullYear()
      });
      const timeVal = (0, _DateTimeHelper.timeToNumber)({
        hours: content.getHours(),
        minutes: content.getMinutes(),
        seconds: content.getSeconds() + content.getMilliseconds() / 1000
      });
      const val = dateVal + timeVal;
      if (val < 0) {
        return new CellContent.Error(_Cell.ErrorType.NUM, _errorMessage.ErrorMessage.DateBounds);
      }
      if (val % 1 === 0) {
        return new CellContent.Number(new _InterpreterValue.DateNumber(val, 'Date()'));
      } else if (val < 1) {
        return new CellContent.Number(new _InterpreterValue.TimeNumber(val, 'Date()'));
      } else {
        return new CellContent.Number(new _InterpreterValue.DateTimeNumber(val, 'Date()'));
      }
    } else if (typeof content === 'string') {
      if (isBoolean(content)) {
        return new CellContent.Boolean(content.toLowerCase() === 'true');
      } else if (isFormula(content)) {
        return new CellContent.Formula(content);
      } else if (isError(content, this.config.errorMapping)) {
        return new CellContent.Error(this.config.errorMapping[content.toUpperCase()]);
      } else {
        let trimmedContent = content.trim();
        let mode = 0;
        let currency;
        if (trimmedContent.endsWith('%')) {
          mode = 1;
          trimmedContent = trimmedContent.slice(0, trimmedContent.length - 1);
        } else {
          const res = this.currencyMatcher(trimmedContent);
          if (res !== undefined) {
            mode = 2;
            [currency, trimmedContent] = res;
          }
        }
        const val = this.numberLiteralsHelper.numericStringToMaybeNumber(trimmedContent);
        if (val !== undefined) {
          let parseAsNum;
          if (mode === 1) {
            parseAsNum = new _InterpreterValue.PercentNumber(val / 100);
          } else if (mode === 2) {
            parseAsNum = new _InterpreterValue.CurrencyNumber(val, currency);
          } else {
            parseAsNum = val;
          }
          return new CellContent.Number(parseAsNum);
        }
        const parsedDateNumber = this.dateHelper.dateStringToDateNumber(trimmedContent);
        if (parsedDateNumber !== undefined) {
          return new CellContent.Number(parsedDateNumber);
        } else {
          return new CellContent.String(content.startsWith('\'') ? content.slice(1) : content);
        }
      }
    } else {
      throw new _errors.UnableToParseError(content);
    }
  }
  currencyMatcher(token) {
    for (const currency of this.config.currencySymbol) {
      if (token.startsWith(currency)) {
        return [currency, token.slice(currency.length)];
      }
      if (token.endsWith(currency)) {
        return [currency, token.slice(0, token.length - currency.length)];
      }
    }
    return undefined;
  }
}
exports.CellContentParser = CellContentParser;