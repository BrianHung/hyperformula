"use strict";

exports.__esModule = true;
exports.TimeNumber = exports.RichNumber = exports.PercentNumber = exports.NumberType = exports.EmptyValue = exports.DateTimeNumber = exports.DateNumber = exports.CurrencyNumber = void 0;
exports.cloneNumber = cloneNumber;
exports.getFormatOfExtendedNumber = getFormatOfExtendedNumber;
exports.getRawValue = getRawValue;
exports.getTypeFormatOfExtendedNumber = getTypeFormatOfExtendedNumber;
exports.getTypeOfExtendedNumber = getTypeOfExtendedNumber;
exports.isExtendedNumber = isExtendedNumber;
/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */
/**
 * A symbol representing an empty cell value.
 */
const EmptyValue = Symbol('Empty value');
exports.EmptyValue = EmptyValue;
function getRawValue(num) {
  if (num instanceof RichNumber) {
    return num.val;
  } else {
    return num;
  }
}
class RichNumber {
  constructor(val, format) {
    this.val = val;
    this.format = format;
  }
  fromNumber(val) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    return new this.constructor(val);
  }
}
exports.RichNumber = RichNumber;
function cloneNumber(val, newVal) {
  if (typeof val === 'number') {
    return newVal;
  } else {
    const ret = val.fromNumber(newVal);
    ret.format = val.format;
    return ret;
  }
}
class DateNumber extends RichNumber {
  getDetailedType() {
    return NumberType.NUMBER_DATE;
  }
}
exports.DateNumber = DateNumber;
class CurrencyNumber extends RichNumber {
  getDetailedType() {
    return NumberType.NUMBER_CURRENCY;
  }
}
exports.CurrencyNumber = CurrencyNumber;
class TimeNumber extends RichNumber {
  getDetailedType() {
    return NumberType.NUMBER_TIME;
  }
}
exports.TimeNumber = TimeNumber;
class DateTimeNumber extends RichNumber {
  getDetailedType() {
    return NumberType.NUMBER_DATETIME;
  }
}
exports.DateTimeNumber = DateTimeNumber;
class PercentNumber extends RichNumber {
  getDetailedType() {
    return NumberType.NUMBER_PERCENT;
  }
}
exports.PercentNumber = PercentNumber;
function isExtendedNumber(val) {
  return typeof val === 'number' || val instanceof RichNumber;
}
var NumberType;
exports.NumberType = NumberType;
(function (NumberType) {
  NumberType["NUMBER_RAW"] = "NUMBER_RAW";
  NumberType["NUMBER_DATE"] = "NUMBER_DATE";
  NumberType["NUMBER_TIME"] = "NUMBER_TIME";
  NumberType["NUMBER_DATETIME"] = "NUMBER_DATETIME";
  NumberType["NUMBER_CURRENCY"] = "NUMBER_CURRENCY";
  NumberType["NUMBER_PERCENT"] = "NUMBER_PERCENT";
})(NumberType || (exports.NumberType = NumberType = {}));
function getTypeOfExtendedNumber(num) {
  if (num instanceof RichNumber) {
    return num.getDetailedType();
  } else {
    return NumberType.NUMBER_RAW;
  }
}
function getFormatOfExtendedNumber(num) {
  if (num instanceof RichNumber) {
    return num.format;
  } else {
    return undefined;
  }
}
function getTypeFormatOfExtendedNumber(num) {
  if (num instanceof RichNumber) {
    return {
      type: num.getDetailedType(),
      format: num.format
    };
  } else {
    return {
      type: NumberType.NUMBER_RAW
    };
  }
}