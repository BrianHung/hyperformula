"use strict";

exports.__esModule = true;
exports.defaultStringifyDateTime = defaultStringifyDateTime;
exports.defaultStringifyDuration = defaultStringifyDuration;
exports.format = format;
exports.padLeft = padLeft;
exports.padRight = padRight;
var _DateTimeDefault = require("../DateTimeDefault");
var _DateTimeHelper = require("../DateTimeHelper");
var _parser = require("./parser");
/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */

function format(value, formatArg, config, dateHelper) {
  const tryDateTime = config.stringifyDateTime(dateHelper.numberToSimpleDateTime(value), formatArg); // default points to defaultStringifyDateTime()
  if (tryDateTime !== undefined) {
    return tryDateTime;
  }
  const tryDuration = config.stringifyDuration((0, _DateTimeHelper.numberToSimpleTime)(value), formatArg);
  if (tryDuration !== undefined) {
    return tryDuration;
  }
  const expression = (0, _parser.parseForNumberFormat)(formatArg);
  if (expression !== undefined) {
    return numberFormat(expression.tokens, value);
  }
  return formatArg;
}
function padLeft(number, size) {
  let result = `${number}`;
  while (result.length < size) {
    result = '0' + result;
  }
  return result;
}
function padRight(number, size) {
  let result = `${number}`;
  while (result.length < size) {
    result = result + '0';
  }
  return result;
}
function countChars(text, char) {
  return text.split(char).length - 1;
}
function numberFormat(tokens, value) {
  let result = '';
  for (let i = 0; i < tokens.length; ++i) {
    const token = tokens[i];
    if (token.type === _parser.TokenType.FREE_TEXT) {
      result += token.value;
      continue;
    }
    const tokenParts = token.value.split('.');
    const integerFormat = tokenParts[0];
    const decimalFormat = tokenParts[1] || '';
    const separator = tokenParts[1] ? '.' : '';
    /* get fixed-point number without trailing zeros */
    const valueParts = Number(value.toFixed(decimalFormat.length)).toString().split('.');
    let integerPart = valueParts[0] || '';
    let decimalPart = valueParts[1] || '';
    if (integerFormat.length > integerPart.length) {
      const padSizeInteger = countChars(integerFormat.substr(0, integerFormat.length - integerPart.length), '0');
      integerPart = padLeft(integerPart, padSizeInteger + integerPart.length);
    }
    const padSizeDecimal = countChars(decimalFormat.substr(decimalPart.length, decimalFormat.length - decimalPart.length), '0');
    decimalPart = padRight(decimalPart, padSizeDecimal + decimalPart.length);
    result += integerPart + separator + decimalPart;
  }
  return result;
}
function defaultStringifyDuration(time, formatArg) {
  const expression = (0, _parser.parseForDateTimeFormat)(formatArg);
  if (expression === undefined) {
    return undefined;
  }
  const tokens = expression.tokens;
  let result = '';
  for (const token of tokens) {
    if (token.type === _parser.TokenType.FREE_TEXT) {
      result += token.value;
      continue;
    }
    switch (token.value.toLowerCase()) {
      case 'h':
      case 'hh':
        {
          result += padLeft(time.hours, token.value.length);
          time.hours = 0;
          break;
        }
      case '[hh]':
        {
          result += padLeft(time.hours, token.value.length - 2);
          time.hours = 0;
          break;
        }
      case 'm':
      case 'mm':
        {
          result += padLeft(time.minutes, token.value.length);
          time.minutes = 0;
          break;
        }
      case '[mm]':
        {
          result += padLeft(time.minutes + 60 * time.hours, token.value.length - 2);
          time.minutes = 0;
          time.hours = 0;
          break;
        }
      /* seconds */
      case 's':
      case 'ss':
        {
          result += padLeft(Math.floor(time.seconds), token.value.length);
          break;
        }
      default:
        {
          if (_DateTimeDefault.TIME_FORMAT_SECONDS_ITEM_REGEXP.test(token.value)) {
            const fractionOfSecondPrecision = Math.max(token.value.length - 3, 0);
            result += `${time.seconds < 10 ? '0' : ''}${Math.floor(time.seconds * Math.pow(10, fractionOfSecondPrecision)) / Math.pow(10, fractionOfSecondPrecision)}`;
            continue;
          }
          return undefined;
        }
    }
  }
  return result;
}
function defaultStringifyDateTime(dateTime, formatArg) {
  const expression = (0, _parser.parseForDateTimeFormat)(formatArg);
  if (expression === undefined) {
    return undefined;
  }
  const tokens = expression.tokens;
  let result = '';
  let minutes = false;
  const ampm = tokens.some(token => token.type === _parser.TokenType.FORMAT && (token.value === 'a/p' || token.value === 'A/P' || token.value === 'am/pm' || token.value === 'AM/PM'));
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (token.type === _parser.TokenType.FREE_TEXT) {
      result += token.value;
      continue;
    }
    switch (token.value.toLowerCase()) {
      /* hours*/
      case 'h':
      case 'hh':
        {
          minutes = true;
          result += padLeft(ampm ? (dateTime.hours + 11) % 12 + 1 : dateTime.hours, token.value.length);
          break;
        }
      /* days */
      case 'd':
      case 'dd':
        {
          result += padLeft(dateTime.day, token.value.length);
          break;
        }
      /* seconds */
      case 's':
      case 'ss':
        {
          result += padLeft(Math.floor(dateTime.seconds), token.value.length);
          break;
        }
      /* minutes / months */
      case 'm':
      case 'mm':
        {
          if (i + 1 < tokens.length && tokens[i + 1].value.startsWith(':')) {
            minutes = true;
          }
          if (minutes) {
            result += padLeft(dateTime.minutes, token.value.length);
          } else {
            result += padLeft(dateTime.month, token.value.length);
          }
          minutes = true;
          break;
        }
      /* years */
      case 'yy':
        {
          result += padLeft(dateTime.year % 100, token.value.length);
          break;
        }
      case 'yyyy':
        {
          result += dateTime.year;
          break;
        }
      /* AM / PM */
      case 'am/pm':
      case 'a/p':
        {
          const [am, pm] = token.value.split('/');
          result += dateTime.hours < 12 ? am : pm;
          break;
        }
      default:
        {
          if (_DateTimeDefault.TIME_FORMAT_SECONDS_ITEM_REGEXP.test(token.value)) {
            const fractionOfSecondPrecision = token.value.length - 3;
            result += `${dateTime.seconds < 10 ? '0' : ''}${Math.floor(dateTime.seconds * Math.pow(10, fractionOfSecondPrecision)) / Math.pow(10, fractionOfSecondPrecision)}`;
            continue;
          }
          return undefined;
        }
    }
  }
  return result;
}