"use strict";

exports.__esModule = true;
exports.DateTimeHelper = void 0;
exports.instanceOfSimpleDate = instanceOfSimpleDate;
exports.instanceOfSimpleTime = instanceOfSimpleTime;
exports.maxDate = void 0;
exports.numberToSimpleTime = numberToSimpleTime;
exports.offsetMonth = offsetMonth;
exports.roundToNearestSecond = roundToNearestSecond;
exports.timeToNumber = timeToNumber;
exports.toBasisEU = toBasisEU;
exports.truncateDayInMonth = truncateDayInMonth;
var _InterpreterValue = require("./interpreter/InterpreterValue");
/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */

const numDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const prefSumDays = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
const SECONDS_PER_MINUTE = 60;
const MINUTES_PER_HOUR = 60;
const HOURS_PER_DAY = 24;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function instanceOfSimpleDate(obj) {
  if (obj && (typeof obj === 'object' || typeof obj === 'function')) {
    return 'year' in obj && typeof obj.year === 'number' && 'month' in obj && typeof obj.month === 'number' && 'day' in obj && typeof obj.day === 'number';
  } else {
    return false;
  }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function instanceOfSimpleTime(obj) {
  if (obj && (typeof obj === 'object' || typeof obj === 'function')) {
    return 'hours' in obj && typeof obj.hours === 'number' && 'minutes' in obj && typeof obj.minutes === 'number' && 'seconds' in obj && typeof obj.seconds === 'number';
  } else {
    return false;
  }
}
const maxDate = {
  year: 9999,
  month: 12,
  day: 31
};
exports.maxDate = maxDate;
class DateTimeHelper {
  constructor(config) {
    this.config = config;
    this.minDateAbsoluteValue = this.dateToNumberFromZero(config.nullDate);
    this.maxDateValue = this.dateToNumber(maxDate);
    this.leapYear1900 = config.leapYear1900;
    // code below fixes epochYearStart while being leapYear1900 sensitive
    // if nullDate is earlier than fateful 28 Feb 1900 and 1900 is not supposed to be leap year, then we should
    // add two days (this is the config default)
    // otherwise only one day
    if (!this.leapYear1900 && 0 <= this.dateToNumber({
      year: 1900,
      month: 2,
      day: 28
    })) {
      this.epochYearZero = this.numberToSimpleDate(2).year;
    } else {
      this.epochYearZero = this.numberToSimpleDate(1).year;
    }
    this.parseDateTime = config.parseDateTime;
  }
  getWithinBounds(dayNumber) {
    return dayNumber <= this.maxDateValue && dayNumber >= 0 ? dayNumber : undefined;
  }
  dateStringToDateNumber(dateTimeString) {
    const {
      dateTime,
      dateFormat = '',
      timeFormat = ''
    } = this.parseDateTimeFromConfigFormats(dateTimeString);
    if (dateTime === undefined) {
      return undefined;
    }
    if (instanceOfSimpleTime(dateTime)) {
      if (instanceOfSimpleDate(dateTime)) {
        return new _InterpreterValue.DateTimeNumber(timeToNumber(dateTime) + this.dateToNumber(dateTime), dateFormat + ' ' + timeFormat);
      } else {
        return new _InterpreterValue.TimeNumber(timeToNumber(dateTime), timeFormat);
      }
    } else {
      if (instanceOfSimpleDate(dateTime)) {
        return new _InterpreterValue.DateNumber(this.dateToNumber(dateTime), dateFormat);
      } else {
        return 0;
      }
    }
  }
  parseDateTimeFromConfigFormats(dateTimeString) {
    return this.parseDateTimeFromFormats(dateTimeString, this.config.dateFormats, this.config.timeFormats);
  }
  getNullYear() {
    return this.config.nullYear;
  }
  getEpochYearZero() {
    return this.epochYearZero;
  }
  isValidDate(date) {
    if (isNaN(date.year) || isNaN(date.month) || isNaN(date.day)) {
      return false;
    } else if (date.day !== Math.round(date.day) || date.month !== Math.round(date.month) || date.year !== Math.round(date.year)) {
      return false;
    } else if (date.year < 1582) {
      // Gregorian calendar start
      return false;
    } else if (date.month < 1 || date.month > 12) {
      return false;
    } else if (date.day < 1) {
      return false;
    } else if (this.isLeapYear(date.year) && date.month === 2) {
      return date.day <= 29;
    } else {
      return date.day <= numDays[date.month - 1];
    }
  }
  dateToNumber(date) {
    return this.dateToNumberFromZero(date) - this.minDateAbsoluteValue;
  }
  relativeNumberToAbsoluteNumber(arg) {
    return arg + this.minDateAbsoluteValue - (this.leapYear1900 ? 1 : 0);
  }
  numberToSimpleDate(arg) {
    const dateNumber = Math.floor(arg) + this.minDateAbsoluteValue;
    let year = Math.floor(dateNumber / 365.2425);
    if (this.dateToNumberFromZero({
      year: year + 1,
      month: 1,
      day: 1
    }) <= dateNumber) {
      year++;
    } else if (this.dateToNumberFromZero({
      year: year - 1,
      month: 1,
      day: 1
    }) > dateNumber) {
      year--;
    }
    const dayOfYear = dateNumber - this.dateToNumberFromZero({
      year,
      month: 1,
      day: 1
    });
    const month = dayToMonth(dayOfYear - (this.isLeapYear(year) && dayOfYear >= 59 ? 1 : 0));
    const day = dayOfYear - prefSumDays[month] - (this.isLeapYear(year) && month > 1 ? 1 : 0);
    return {
      year,
      month: month + 1,
      day: day + 1
    };
  }
  numberToSimpleDateTime(arg) {
    const time = numberToSimpleTime(arg % 1);
    const carryDays = Math.floor(time.hours / HOURS_PER_DAY);
    time.hours = time.hours % HOURS_PER_DAY;
    const date = this.numberToSimpleDate(Math.floor(arg) + carryDays);
    return Object.assign(Object.assign({}, date), time);
  }
  leapYearsCount(year) {
    return Math.floor(year / 4) - Math.floor(year / 100) + Math.floor(year / 400) + (this.config.leapYear1900 && year >= 1900 ? 1 : 0);
  }
  daysInMonth(year, month) {
    if (this.isLeapYear(year) && month === 2) {
      return 29;
    } else {
      return numDays[month - 1];
    }
  }
  endOfMonth(date) {
    return {
      year: date.year,
      month: date.month,
      day: this.daysInMonth(date.year, date.month)
    };
  }
  toBasisUS(start, end) {
    if (start.day === 31) {
      start.day = 30;
    }
    if (start.day === 30 && end.day === 31) {
      end.day = 30;
    }
    if (start.month === 2 && start.day === this.daysInMonth(start.year, start.month)) {
      start.day = 30;
      if (end.month === 2 && end.day === this.daysInMonth(end.year, end.month)) {
        end.day = 30;
      }
    }
    return [start, end];
  }
  yearLengthForBasis(start, end) {
    if (start.year !== end.year) {
      if (start.year + 1 !== end.year || start.month < end.month || start.month === end.month && start.day < end.day) {
        // this is true IFF at least one year of gap between dates
        return (this.leapYearsCount(end.year) - this.leapYearsCount(start.year - 1)) / (end.year - start.year + 1) + 365;
      }
      if (this.countLeapDays(end) !== this.countLeapDays({
        year: start.year,
        month: start.month,
        day: start.day - 1
      })) {
        return 366;
      } else {
        return 365;
      }
    }
    if (this.isLeapYear(start.year)) {
      return 366;
    } else {
      return 365;
    }
  }
  parseSingleFormat(dateString, dateFormat, timeFormat) {
    const dateTime = this.parseDateTime(dateString, dateFormat, timeFormat);
    if (instanceOfSimpleDate(dateTime)) {
      if (dateTime.year >= 0 && dateTime.year < 100) {
        if (dateTime.year < this.getNullYear()) {
          dateTime.year += 2000;
        } else {
          dateTime.year += 1900;
        }
      }
      if (!this.isValidDate(dateTime)) {
        return undefined;
      }
    }
    return dateTime;
  }
  parseDateTimeFromFormats(dateTimeString, dateFormats, timeFormats) {
    const dateFormatsArray = dateFormats.length === 0 ? [undefined] : dateFormats;
    const timeFormatsArray = timeFormats.length === 0 ? [undefined] : timeFormats;
    for (const dateFormat of dateFormatsArray) {
      for (const timeFormat of timeFormatsArray) {
        const dateTime = this.parseSingleFormat(dateTimeString, dateFormat, timeFormat);
        if (dateTime !== undefined) {
          return {
            dateTime,
            timeFormat,
            dateFormat
          };
        }
      }
    }
    return {};
  }
  countLeapDays(date) {
    if (date.month > 2 || date.month === 2 && date.day >= 29) {
      return this.leapYearsCount(date.year);
    } else {
      return this.leapYearsCount(date.year - 1);
    }
  }
  dateToNumberFromZero(date) {
    return 365 * date.year + prefSumDays[date.month - 1] + date.day - 1 + (date.month <= 2 ? this.leapYearsCount(date.year - 1) : this.leapYearsCount(date.year));
  }
  isLeapYear(year) {
    if (year % 4) {
      return false;
    } else if (year % 100) {
      return true;
    } else if (year % 400) {
      return year === 1900 && this.config.leapYear1900;
    } else {
      return true;
    }
  }
}
exports.DateTimeHelper = DateTimeHelper;
function dayToMonth(dayOfYear) {
  let month = 0;
  if (prefSumDays[month + 6] <= dayOfYear) {
    month += 6;
  }
  if (prefSumDays[month + 3] <= dayOfYear) {
    month += 3;
  }
  if (prefSumDays[month + 2] <= dayOfYear) {
    month += 2;
  } else if (prefSumDays[month + 1] <= dayOfYear) {
    month += 1;
  }
  return month;
}
function offsetMonth(date, offset) {
  const totalM = 12 * date.year + date.month - 1 + offset;
  return {
    year: Math.floor(totalM / 12),
    month: totalM % 12 + 1,
    day: date.day
  };
}
function truncateDayInMonth(date) {
  return {
    year: date.year,
    month: date.month,
    day: Math.min(date.day, numDays[date.month - 1])
  };
}
function roundToNearestSecond(arg) {
  return Math.round(arg * 3600 * 24) / (3600 * 24);
}
function roundToEpsilon(arg, epsilon = 1) {
  return Math.round(arg * epsilon) / epsilon;
}
// Note: The result of this function might be { hours = 24, minutes = 0, seconds = 0 } if arg < 1 but arg ≈ 1
function numberToSimpleTime(arg) {
  const argAsSeconds = arg * HOURS_PER_DAY * MINUTES_PER_HOUR * SECONDS_PER_MINUTE;
  const seconds = roundToEpsilon(argAsSeconds % SECONDS_PER_MINUTE, 100000) % SECONDS_PER_MINUTE;
  const argAsMinutes = (argAsSeconds - seconds) / SECONDS_PER_MINUTE;
  const minutes = Math.round(argAsMinutes % MINUTES_PER_HOUR) % MINUTES_PER_HOUR;
  const argAsHours = (argAsMinutes - minutes) / MINUTES_PER_HOUR;
  const hours = Math.round(argAsHours);
  return {
    hours,
    minutes,
    seconds
  };
}
function timeToNumber(time) {
  return ((time.seconds / 60 + time.minutes) / 60 + time.hours) / 24;
}
function toBasisEU(date) {
  return {
    year: date.year,
    month: date.month,
    day: Math.min(30, date.day)
  };
}