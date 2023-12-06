"use strict";

exports.__esModule = true;
exports.ArithmeticHelper = void 0;
exports.coerceBooleanToNumber = coerceBooleanToNumber;
exports.coerceComplexToString = coerceComplexToString;
exports.coerceEmptyToValue = coerceEmptyToValue;
exports.coerceRangeToScalar = coerceRangeToScalar;
exports.coerceScalarToBoolean = coerceScalarToBoolean;
exports.coerceScalarToString = coerceScalarToString;
exports.coerceToRange = coerceToRange;
exports.coerceToRangeNumbersOrError = coerceToRangeNumbersOrError;
exports.fixNegativeZero = fixNegativeZero;
exports.forceNormalizeString = forceNormalizeString;
exports.isNumberOverflow = isNumberOverflow;
exports.normalizeString = normalizeString;
exports.numberCmp = numberCmp;
exports.zeroIfEmpty = zeroIfEmpty;
var _unorm = _interopRequireDefault(require("unorm"));
var _Cell = require("../Cell");
var _errorMessage = require("../error-message");
var _StringHelper = require("../StringHelper");
var _InterpreterValue = require("./InterpreterValue");
var _SimpleRangeValue = require("../SimpleRangeValue");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */

const COMPLEX_NUMBER_SYMBOL = 'i';
const complexParsingRegexp = /^\s*([+-]?)\s*(([\d\.,]+(e[+-]?\d+)?)\s*([ij]?)|([ij]))\s*(([+-])\s*([+-]?)\s*(([\d\.,]+(e[+-]?\d+)?)\s*([ij]?)|([ij])))?$/;
class ArithmeticHelper {
  constructor(config, dateTimeHelper, numberLiteralsHelper) {
    this.config = config;
    this.dateTimeHelper = dateTimeHelper;
    this.numberLiteralsHelper = numberLiteralsHelper;
    this.lt = (left, right) => {
      return this.compare(left, right) < 0;
    };
    this.leq = (left, right) => {
      return this.compare(left, right) <= 0;
    };
    this.gt = (left, right) => {
      return this.compare(left, right) > 0;
    };
    this.geq = (left, right) => {
      return this.compare(left, right) >= 0;
    };
    this.eq = (left, right) => {
      return this.compare(left, right) === 0;
    };
    this.neq = (left, right) => {
      return this.compare(left, right) !== 0;
    };
    this.pow = (left, right) => {
      return Math.pow((0, _InterpreterValue.getRawValue)(left), (0, _InterpreterValue.getRawValue)(right));
    };
    this.addWithEpsilonRaw = (left, right) => {
      const ret = left + right;
      if (Math.abs(ret) < this.actualEps * Math.abs(left)) {
        return 0;
      } else {
        return ret;
      }
    };
    this.addWithEpsilon = (left, right) => {
      const typeOfResult = inferExtendedNumberTypeAdditive(left, right);
      return this.ExtendedNumberFactory(this.addWithEpsilonRaw((0, _InterpreterValue.getRawValue)(left), (0, _InterpreterValue.getRawValue)(right)), typeOfResult);
    };
    this.unaryMinus = arg => {
      return (0, _InterpreterValue.cloneNumber)(arg, -(0, _InterpreterValue.getRawValue)(arg));
    };
    this.unaryPlus = arg => arg;
    this.unaryPercent = arg => {
      return new _InterpreterValue.PercentNumber((0, _InterpreterValue.getRawValue)(arg) / 100);
    };
    this.concat = (left, right) => {
      return left.concat(right);
    };
    this.nonstrictadd = (left, right) => {
      if (left instanceof _Cell.CellError) {
        return left;
      } else if (right instanceof _Cell.CellError) {
        return right;
      } else if (typeof left === 'number') {
        if (typeof right === 'number') {
          return this.addWithEpsilonRaw(left, right);
        } else {
          return left;
        }
      } else if (typeof right === 'number') {
        return right;
      } else {
        return 0;
      }
    };
    /**
     * Subtracts two numbers
     *
     * Implementation of subtracting which is used in interpreter.
     *
     * @param left - left operand of subtraction
     * @param right - right operand of subtraction
     * @param eps - precision of comparison
     */
    this.subtract = (leftArg, rightArg) => {
      const typeOfResult = inferExtendedNumberTypeAdditive(leftArg, rightArg);
      const left = (0, _InterpreterValue.getRawValue)(leftArg);
      const right = (0, _InterpreterValue.getRawValue)(rightArg);
      let ret = left - right;
      if (Math.abs(ret) < this.actualEps * Math.abs(left)) {
        ret = 0;
      }
      return this.ExtendedNumberFactory(ret, typeOfResult);
    };
    this.divide = (leftArg, rightArg) => {
      const left = (0, _InterpreterValue.getRawValue)(leftArg);
      const right = (0, _InterpreterValue.getRawValue)(rightArg);
      if (right === 0) {
        return new _Cell.CellError(_Cell.ErrorType.DIV_BY_ZERO);
      } else {
        const typeOfResult = inferExtendedNumberTypeMultiplicative(leftArg, rightArg);
        return this.ExtendedNumberFactory(left / right, typeOfResult);
      }
    };
    this.multiply = (left, right) => {
      const typeOfResult = inferExtendedNumberTypeMultiplicative(left, right);
      return this.ExtendedNumberFactory((0, _InterpreterValue.getRawValue)(left) * (0, _InterpreterValue.getRawValue)(right), typeOfResult);
    };
    this.manyToExactComplex = args => {
      const ret = [];
      for (const arg of args) {
        if (arg instanceof _Cell.CellError) {
          return arg;
        } else if ((0, _InterpreterValue.isExtendedNumber)(arg) || typeof arg === 'string') {
          const coerced = this.coerceScalarToComplex(arg);
          if (!(coerced instanceof _Cell.CellError)) {
            ret.push(coerced);
          }
        }
      }
      return ret;
    };
    this.coerceNumbersExactRanges = args => this.manyToNumbers(args, this.manyToExactNumbers);
    this.coerceNumbersCoerceRangesDropNulls = args => this.manyToNumbers(args, this.manyToCoercedNumbersDropNulls);
    this.manyToExactNumbers = args => {
      const ret = [];
      for (const arg of args) {
        if (arg instanceof _Cell.CellError) {
          return arg;
        } else if ((0, _InterpreterValue.isExtendedNumber)(arg)) {
          ret.push((0, _InterpreterValue.getRawValue)(arg));
        }
      }
      return ret;
    };
    this.manyToOnlyNumbersDropNulls = args => {
      const ret = [];
      for (const arg of args) {
        if (arg instanceof _Cell.CellError) {
          return arg;
        } else if ((0, _InterpreterValue.isExtendedNumber)(arg)) {
          ret.push((0, _InterpreterValue.getRawValue)(arg));
        } else if (arg !== _InterpreterValue.EmptyValue) {
          return new _Cell.CellError(_Cell.ErrorType.VALUE, _errorMessage.ErrorMessage.NumberExpected);
        }
      }
      return ret;
    };
    this.manyToCoercedNumbersDropNulls = args => {
      const ret = [];
      for (const arg of args) {
        if (arg instanceof _Cell.CellError) {
          return arg;
        }
        if (arg === _InterpreterValue.EmptyValue) {
          continue;
        }
        const coerced = this.coerceScalarToNumberOrError(arg);
        if ((0, _InterpreterValue.isExtendedNumber)(coerced)) {
          ret.push((0, _InterpreterValue.getRawValue)(coerced));
        }
      }
      return ret;
    };
    this.collator = (0, _StringHelper.collatorFromConfig)(config);
    this.actualEps = config.smartRounding ? config.precisionEpsilon : 0;
  }
  eqMatcherFunction(pattern) {
    const regexp = this.buildRegex(pattern);
    return cellValue => typeof cellValue === 'string' && regexp.test(this.normalizeString(cellValue));
  }
  neqMatcherFunction(pattern) {
    const regexp = this.buildRegex(pattern);
    return cellValue => {
      return !(typeof cellValue === 'string') || !regexp.test(this.normalizeString(cellValue));
    };
  }
  searchString(pattern, text) {
    var _a;
    const regexp = this.buildRegex(pattern, false);
    const result = regexp.exec(text);
    return (_a = result === null || result === void 0 ? void 0 : result.index) !== null && _a !== void 0 ? _a : -1;
  }
  requiresRegex(pattern) {
    if (!this.config.useRegularExpressions && !this.config.useWildcards) {
      return !this.config.matchWholeCell;
    }
    for (let i = 0; i < pattern.length; i++) {
      const c = pattern.charAt(i);
      if (isWildcard(c) || this.config.useRegularExpressions && needsEscape(c)) {
        return true;
      }
    }
    return false;
  }
  floatCmp(leftArg, rightArg) {
    const left = (0, _InterpreterValue.getRawValue)(leftArg);
    const right = (0, _InterpreterValue.getRawValue)(rightArg);
    const mod = 1 + this.actualEps;
    if (right >= 0 && left * mod >= right && left <= right * mod) {
      return 0;
    } else if (right <= 0 && left * mod <= right && left >= right * mod) {
      return 0;
    } else if (left > right) {
      return 1;
    } else {
      return -1;
    }
  }
  coerceScalarToNumberOrError(arg) {
    var _a;
    if (arg instanceof _Cell.CellError) {
      return arg;
    }
    return (_a = this.coerceToMaybeNumber(arg)) !== null && _a !== void 0 ? _a : new _Cell.CellError(_Cell.ErrorType.VALUE, _errorMessage.ErrorMessage.NumberCoercion);
  }
  coerceToMaybeNumber(arg) {
    var _a;
    return (_a = this.coerceNonDateScalarToMaybeNumber(arg)) !== null && _a !== void 0 ? _a : typeof arg === 'string' ? this.dateTimeHelper.dateStringToDateNumber(arg) : undefined;
  }
  coerceNonDateScalarToMaybeNumber(arg) {
    if (arg === _InterpreterValue.EmptyValue) {
      return 0;
    } else if (typeof arg === 'string') {
      if (arg === '') {
        return 0;
      }
      const maybePercentNumber = this.coerceStringToMaybePercentNumber(arg);
      if (maybePercentNumber !== undefined) {
        return maybePercentNumber;
      }
      const maybeCurrencyNumber = this.coerceStringToMaybeCurrencyNumber(arg);
      if (maybeCurrencyNumber !== undefined) {
        return maybeCurrencyNumber;
      }
      return this.numberLiteralsHelper.numericStringToMaybeNumber(arg.trim());
    } else if ((0, _InterpreterValue.isExtendedNumber)(arg)) {
      return arg;
    } else if (typeof arg === 'boolean') {
      return Number(arg);
    } else {
      return undefined;
    }
  }
  coerceStringToMaybePercentNumber(input) {
    const trimmedInput = input.trim();
    if (trimmedInput.endsWith('%')) {
      const numOfPercents = trimmedInput.slice(0, trimmedInput.length - 1).trim();
      const parsedNumOfPercents = this.numberLiteralsHelper.numericStringToMaybeNumber(numOfPercents);
      if (parsedNumOfPercents !== undefined) {
        return new _InterpreterValue.PercentNumber(parsedNumOfPercents / 100);
      }
    }
    return undefined;
  }
  coerceStringToMaybeCurrencyNumber(input) {
    const matchedCurrency = this.currencyMatcher(input.trim());
    if (matchedCurrency !== undefined) {
      const [currencySymbol, currencyValue] = matchedCurrency;
      const parsedCurrencyValue = this.numberLiteralsHelper.numericStringToMaybeNumber(currencyValue);
      if (parsedCurrencyValue !== undefined) {
        return new _InterpreterValue.CurrencyNumber(parsedCurrencyValue, currencySymbol);
      }
    }
    return undefined;
  }
  currencyMatcher(token) {
    for (const currency of this.config.currencySymbol) {
      if (token.startsWith(currency)) {
        return [currency, token.slice(currency.length).trim()];
      }
      if (token.endsWith(currency)) {
        return [currency, token.slice(0, token.length - currency.length).trim()];
      }
    }
    return undefined;
  }
  coerceComplexExactRanges(args) {
    const vals = [];
    for (const arg of args) {
      if (arg instanceof _SimpleRangeValue.SimpleRangeValue) {
        vals.push(arg);
      } else if (arg !== _InterpreterValue.EmptyValue) {
        const coerced = this.coerceScalarToComplex(arg);
        if (coerced instanceof _Cell.CellError) {
          return coerced;
        } else {
          vals.push(coerced);
        }
      }
    }
    const expandedVals = [];
    for (const val of vals) {
      if (val instanceof _SimpleRangeValue.SimpleRangeValue) {
        const arr = this.manyToExactComplex(val.valuesFromTopLeftCorner());
        if (arr instanceof _Cell.CellError) {
          return arr;
        } else {
          expandedVals.push(...arr);
        }
      } else {
        expandedVals.push(val);
      }
    }
    return expandedVals;
  }
  coerceScalarToComplex(arg) {
    if (arg instanceof _Cell.CellError) {
      return arg;
    } else if (arg === _InterpreterValue.EmptyValue) {
      return [0, 0];
    } else if ((0, _InterpreterValue.isExtendedNumber)(arg)) {
      return [(0, _InterpreterValue.getRawValue)(arg), 0];
    } else if (typeof arg === 'string') {
      return this.coerceStringToComplex(arg);
    } else {
      return new _Cell.CellError(_Cell.ErrorType.NUM, _errorMessage.ErrorMessage.ComplexNumberExpected);
    }
  }
  ExtendedNumberFactory(value, typeFormat) {
    const {
      type,
      format
    } = typeFormat;
    switch (type) {
      case _InterpreterValue.NumberType.NUMBER_RAW:
        return value;
      case _InterpreterValue.NumberType.NUMBER_CURRENCY:
        {
          return new _InterpreterValue.CurrencyNumber(value, format !== null && format !== void 0 ? format : this.config.currencySymbol[0]);
        }
      case _InterpreterValue.NumberType.NUMBER_DATE:
        return new _InterpreterValue.DateNumber(value, format);
      case _InterpreterValue.NumberType.NUMBER_DATETIME:
        return new _InterpreterValue.DateTimeNumber(value, format);
      case _InterpreterValue.NumberType.NUMBER_TIME:
        return new _InterpreterValue.TimeNumber(value, format);
      case _InterpreterValue.NumberType.NUMBER_PERCENT:
        return new _InterpreterValue.PercentNumber(value, format);
    }
  }
  buildRegex(pattern, matchWholeCell = true) {
    pattern = this.normalizeString(pattern);
    let regexpStr;
    let useWildcards = this.config.useWildcards;
    let useRegularExpressions = this.config.useRegularExpressions;
    if (useRegularExpressions) {
      try {
        RegExp(pattern);
      } catch (e) {
        useRegularExpressions = false;
        useWildcards = false;
      }
    }
    if (useRegularExpressions) {
      regexpStr = escapeNoCharacters(pattern, this.config.caseSensitive);
    } else if (useWildcards) {
      regexpStr = escapeNonWildcards(pattern, this.config.caseSensitive);
    } else {
      regexpStr = escapeAllCharacters(pattern, this.config.caseSensitive);
    }
    if (this.config.matchWholeCell && matchWholeCell) {
      return RegExp('^(' + regexpStr + ')$');
    } else {
      return RegExp(regexpStr);
    }
  }
  normalizeString(str) {
    if (!this.config.caseSensitive) {
      str = str.toLowerCase();
    }
    if (!this.config.accentSensitive) {
      str = normalizeString(str, 'nfd').replace(/[\u0300-\u036f]/g, '');
    }
    return str;
  }
  compare(left, right) {
    if (typeof left === 'string' || typeof right === 'string') {
      const leftTmp = typeof left === 'string' ? this.dateTimeHelper.dateStringToDateNumber(left) : left;
      const rightTmp = typeof right === 'string' ? this.dateTimeHelper.dateStringToDateNumber(right) : right;
      if ((0, _InterpreterValue.isExtendedNumber)(leftTmp) && (0, _InterpreterValue.isExtendedNumber)(rightTmp)) {
        return this.floatCmp(leftTmp, rightTmp);
      }
    }
    if (left === _InterpreterValue.EmptyValue) {
      left = coerceEmptyToValue(right);
    } else if (right === _InterpreterValue.EmptyValue) {
      right = coerceEmptyToValue(left);
    }
    if (typeof left === 'string' && typeof right === 'string') {
      return this.stringCmp(left, right);
    } else if (typeof left === 'boolean' && typeof right === 'boolean') {
      return numberCmp(coerceBooleanToNumber(left), coerceBooleanToNumber(right));
    } else if ((0, _InterpreterValue.isExtendedNumber)(left) && (0, _InterpreterValue.isExtendedNumber)(right)) {
      return this.floatCmp(left, right);
    } else if (left === _InterpreterValue.EmptyValue && right === _InterpreterValue.EmptyValue) {
      return 0;
    } else {
      return numberCmp((0, _Cell.CellValueTypeOrd)((0, _Cell.getCellValueType)(left)), (0, _Cell.CellValueTypeOrd)((0, _Cell.getCellValueType)(right)));
    }
  }
  stringCmp(left, right) {
    return this.collator.compare(left, right);
  }
  manyToNumbers(args, rangeFn) {
    const vals = [];
    for (const arg of args) {
      if (arg instanceof _SimpleRangeValue.SimpleRangeValue) {
        vals.push(arg);
      } else {
        const coerced = (0, _InterpreterValue.getRawValue)(this.coerceScalarToNumberOrError(arg));
        if (coerced instanceof _Cell.CellError) {
          return coerced;
        } else {
          vals.push(coerced);
        }
      }
    }
    const expandedVals = [];
    for (const val of vals) {
      if (val instanceof _SimpleRangeValue.SimpleRangeValue) {
        const arr = rangeFn(val.valuesFromTopLeftCorner());
        if (arr instanceof _Cell.CellError) {
          return arr;
        } else {
          expandedVals.push(...arr);
        }
      } else {
        expandedVals.push(val);
      }
    }
    return expandedVals;
  }
  coerceStringToComplex(arg) {
    const match = complexParsingRegexp.exec(arg);
    if (match === null) {
      return new _Cell.CellError(_Cell.ErrorType.NUM, _errorMessage.ErrorMessage.ComplexNumberExpected);
    }
    let val1;
    if (match[6] !== undefined) {
      val1 = match[1] === '-' ? [0, -1] : [0, 1];
    } else {
      val1 = this.parseComplexToken(match[1] + match[3], match[5]);
    }
    if (val1 instanceof _Cell.CellError) {
      return val1;
    }
    if (match[8] === undefined) {
      return val1;
    }
    let val2;
    if (match[14] !== undefined) {
      val2 = match[9] === '-' ? [0, -1] : [0, 1];
    } else {
      val2 = this.parseComplexToken(match[9] + match[11], match[13]);
    }
    if (val2 instanceof _Cell.CellError) {
      return val2;
    }
    if (match[5] !== '' || match[13] === '') {
      return new _Cell.CellError(_Cell.ErrorType.NUM, _errorMessage.ErrorMessage.ComplexNumberExpected);
    }
    if (match[8] === '+') {
      return [val1[0] + val2[0], val1[1] + val2[1]];
    } else {
      return [val1[0] - val2[0], val1[1] - val2[1]];
    }
  }
  parseComplexToken(arg, mod) {
    const val = (0, _InterpreterValue.getRawValue)(this.coerceNonDateScalarToMaybeNumber(arg));
    if (val === undefined) {
      return new _Cell.CellError(_Cell.ErrorType.NUM, _errorMessage.ErrorMessage.ComplexNumberExpected);
    }
    if (mod === '') {
      return [val, 0];
    } else {
      return [0, val];
    }
  }
}
exports.ArithmeticHelper = ArithmeticHelper;
function coerceComplexToString([re, im], symb) {
  if (!isFinite(re) || !isFinite(im)) {
    return new _Cell.CellError(_Cell.ErrorType.NUM, _errorMessage.ErrorMessage.NaN);
  }
  symb = symb !== null && symb !== void 0 ? symb : COMPLEX_NUMBER_SYMBOL;
  if (im === 0) {
    return `${re}`;
  }
  const imStr = `${im === -1 || im === 1 ? '' : Math.abs(im)}${symb}`;
  if (re === 0) {
    return `${im < 0 ? '-' : ''}${imStr}`;
  }
  return `${re}${im < 0 ? '-' : '+'}${imStr}`;
}
function coerceToRange(arg) {
  if (arg instanceof _SimpleRangeValue.SimpleRangeValue) {
    return arg;
  } else {
    return _SimpleRangeValue.SimpleRangeValue.fromScalar(arg);
  }
}
function coerceToRangeNumbersOrError(arg) {
  if (arg instanceof _SimpleRangeValue.SimpleRangeValue && arg.hasOnlyNumbers() || arg instanceof _Cell.CellError) {
    return arg;
  } else if ((0, _InterpreterValue.isExtendedNumber)(arg)) {
    return _SimpleRangeValue.SimpleRangeValue.fromScalar(arg);
  } else {
    return null;
  }
}
function coerceBooleanToNumber(arg) {
  return Number(arg);
}
function coerceEmptyToValue(arg) {
  if (typeof arg === 'string') {
    return '';
  } else if ((0, _InterpreterValue.isExtendedNumber)(arg)) {
    return 0;
  } else if (typeof arg === 'boolean') {
    return false;
  } else {
    return _InterpreterValue.EmptyValue;
  }
}
/**
 * Coerce scalar value to boolean if possible, or error if value is an error
 *
 * @param arg
 */
function coerceScalarToBoolean(arg) {
  if (arg instanceof _Cell.CellError || typeof arg === 'boolean') {
    return arg;
  } else if (arg === _InterpreterValue.EmptyValue) {
    return false;
  } else if ((0, _InterpreterValue.isExtendedNumber)(arg)) {
    return (0, _InterpreterValue.getRawValue)(arg) !== 0;
  } else {
    const argUppered = arg.toUpperCase();
    if (argUppered === 'TRUE') {
      return true;
    } else if (argUppered === 'FALSE') {
      return false;
    } else if (argUppered === '') {
      return false;
    } else {
      return undefined;
    }
  }
}
function coerceScalarToString(arg) {
  if (arg instanceof _Cell.CellError || typeof arg === 'string') {
    return arg;
  } else if (arg === _InterpreterValue.EmptyValue) {
    return '';
  } else if ((0, _InterpreterValue.isExtendedNumber)(arg)) {
    return (0, _InterpreterValue.getRawValue)(arg).toString();
  } else {
    return arg ? 'TRUE' : 'FALSE';
  }
}
function zeroIfEmpty(arg) {
  return arg === _InterpreterValue.EmptyValue ? 0 : arg;
}
function numberCmp(leftArg, rightArg) {
  const left = (0, _InterpreterValue.getRawValue)(leftArg);
  const right = (0, _InterpreterValue.getRawValue)(rightArg);
  if (left > right) {
    return 1;
  } else if (left < right) {
    return -1;
  } else {
    return 0;
  }
}
function isNumberOverflow(arg) {
  return isNaN(arg) || arg === Infinity || arg === -Infinity;
}
function fixNegativeZero(arg) {
  if (arg === 0) {
    return 0;
  } else {
    return arg;
  }
}
function isWildcard(c) {
  return ['*', '?'].includes(c);
}
const escapedCharacters = ['{', '}', '[', ']', '(', ')', '<', '>', '=', '.', '+', '-', ',', '\\', '$', '^', '!'];
function needsEscape(c) {
  return escapedCharacters.includes(c);
}
function escapeNonWildcards(pattern, caseSensitive) {
  let str = '';
  for (let i = 0; i < pattern.length; i++) {
    const c = pattern.charAt(i);
    if (c === '~') {
      if (i == pattern.length - 1) {
        str += '~';
        continue;
      }
      const d = pattern.charAt(i + 1);
      if (isWildcard(d) || needsEscape(d)) {
        str += '\\' + d;
        i++;
      } else {
        str += d;
        i++;
      }
    } else if (isWildcard(c)) {
      str += '.' + c;
    } else if (needsEscape(c)) {
      str += '\\' + c;
    } else if (caseSensitive) {
      str += c;
    } else {
      str += c.toLowerCase();
    }
  }
  return str;
}
function escapeAllCharacters(pattern, caseSensitive) {
  let str = '';
  for (let i = 0; i < pattern.length; i++) {
    const c = pattern.charAt(i);
    if (isWildcard(c) || needsEscape(c)) {
      str += '\\' + c;
    } else if (caseSensitive) {
      str += c;
    } else {
      str += c.toLowerCase();
    }
  }
  return str;
}
function escapeNoCharacters(pattern, caseSensitive) {
  let str = '';
  for (let i = 0; i < pattern.length; i++) {
    const c = pattern.charAt(i);
    if (isWildcard(c) || needsEscape(c)) {
      str += c;
    } else if (caseSensitive) {
      str += c;
    } else {
      str += c.toLowerCase();
    }
  }
  return str;
}
function inferExtendedNumberTypeAdditive(leftArg, rightArg) {
  const {
    type: leftType,
    format: leftFormat
  } = (0, _InterpreterValue.getTypeFormatOfExtendedNumber)(leftArg);
  const {
    type: rightType,
    format: rightFormat
  } = (0, _InterpreterValue.getTypeFormatOfExtendedNumber)(rightArg);
  if (leftType === _InterpreterValue.NumberType.NUMBER_RAW) {
    return {
      type: rightType,
      format: rightFormat
    };
  }
  if (rightType === _InterpreterValue.NumberType.NUMBER_RAW) {
    return {
      type: leftType,
      format: leftFormat
    };
  }
  if ((leftType === _InterpreterValue.NumberType.NUMBER_DATETIME || leftType === _InterpreterValue.NumberType.NUMBER_DATE) && (rightType === _InterpreterValue.NumberType.NUMBER_DATETIME || rightType === _InterpreterValue.NumberType.NUMBER_DATE)) {
    return {
      type: _InterpreterValue.NumberType.NUMBER_RAW
    };
  }
  if (leftType === _InterpreterValue.NumberType.NUMBER_TIME) {
    if (rightType === _InterpreterValue.NumberType.NUMBER_DATE) {
      return {
        type: _InterpreterValue.NumberType.NUMBER_DATETIME,
        format: `${rightFormat} ${leftFormat}`
      };
    }
    if (rightType === _InterpreterValue.NumberType.NUMBER_DATETIME) {
      return {
        type: _InterpreterValue.NumberType.NUMBER_DATETIME,
        format: rightFormat
      };
    }
  }
  if (rightType === _InterpreterValue.NumberType.NUMBER_TIME) {
    if (leftType === _InterpreterValue.NumberType.NUMBER_DATE) {
      return {
        type: _InterpreterValue.NumberType.NUMBER_DATETIME,
        format: `${leftFormat} ${rightFormat}`
      };
    }
    if (leftType === _InterpreterValue.NumberType.NUMBER_DATETIME) {
      return {
        type: _InterpreterValue.NumberType.NUMBER_DATETIME,
        format: leftFormat
      };
    }
  }
  return {
    type: leftType,
    format: leftFormat
  };
}
function inferExtendedNumberTypeMultiplicative(leftArg, rightArg) {
  let {
    type: leftType,
    format: leftFormat
  } = (0, _InterpreterValue.getTypeFormatOfExtendedNumber)(leftArg);
  let {
    type: rightType,
    format: rightFormat
  } = (0, _InterpreterValue.getTypeFormatOfExtendedNumber)(rightArg);
  if (leftType === _InterpreterValue.NumberType.NUMBER_PERCENT) {
    leftType = _InterpreterValue.NumberType.NUMBER_RAW;
    leftFormat = undefined;
  }
  if (rightType === _InterpreterValue.NumberType.NUMBER_PERCENT) {
    rightType = _InterpreterValue.NumberType.NUMBER_RAW;
    rightFormat = undefined;
  }
  if (leftType === _InterpreterValue.NumberType.NUMBER_RAW) {
    return {
      type: rightType,
      format: rightFormat
    };
  }
  if (rightType === _InterpreterValue.NumberType.NUMBER_RAW) {
    return {
      type: leftType,
      format: leftFormat
    };
  }
  return {
    type: _InterpreterValue.NumberType.NUMBER_RAW
  };
}
function forceNormalizeString(str) {
  return normalizeString(str.toLowerCase(), 'nfd').replace(/[\u0300-\u036f]/g, '');
}
function coerceRangeToScalar(arg, state) {
  var _a;
  if (arg.isAdHoc()) {
    return (_a = arg.data[0]) === null || _a === void 0 ? void 0 : _a[0];
  }
  const range = arg.range;
  if (state.formulaAddress.sheet === range.sheet) {
    if (range.width() === 1) {
      const offset = state.formulaAddress.row - range.start.row;
      if (offset >= 0 && offset < range.height()) {
        return arg.data[offset][0];
      }
    } else if (range.height() === 1) {
      const offset = state.formulaAddress.col - range.start.col;
      if (offset >= 0 && offset < range.width()) {
        return arg.data[0][offset];
      }
    }
  }
  return undefined;
}
function normalizeString(str, form) {
  return typeof str.normalize === 'function' ? str.normalize(form.toUpperCase()) : _unorm.default[form](str);
}