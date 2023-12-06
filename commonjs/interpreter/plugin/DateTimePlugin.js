"use strict";

exports.__esModule = true;
exports.DateTimePlugin = void 0;
var _Cell = require("../../Cell");
var _DateTimeHelper = require("../../DateTimeHelper");
var _errorMessage = require("../../error-message");
var _format = require("../../format/format");
var _InterpreterValue = require("../InterpreterValue");
var _FunctionPlugin = require("./FunctionPlugin");
/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */

/**
 * Interpreter plugin containing date-specific functions
 */
class DateTimePlugin extends _FunctionPlugin.FunctionPlugin {
  constructor() {
    super(...arguments);
    this.isoweeknumCore = day => {
      const absoluteDay = Math.floor(this.dateTimeHelper.relativeNumberToAbsoluteNumber(day));
      const date = this.dateTimeHelper.numberToSimpleDate(day);
      const yearStart = this.dateTimeHelper.dateToNumber({
        year: date.year,
        month: 1,
        day: 1
      });
      const yearStartAbsolute = this.dateTimeHelper.relativeNumberToAbsoluteNumber(yearStart);
      const firstThursdayAbs = yearStartAbsolute + ((4 - yearStartAbsolute) % 7 + 7) % 7;
      const ret = Math.floor((absoluteDay - 1) / 7) - Math.floor((firstThursdayAbs - 1) / 7) + 1;
      if (ret === 0) {
        return this.isoweeknumCore(day - 7) + 1;
      }
      return ret;
    };
    this.days360Core = (startDate, endDate, mode) => {
      const start = this.dateTimeHelper.numberToSimpleDate(startDate);
      const end = this.dateTimeHelper.numberToSimpleDate(endDate);
      let nStart, nEnd;
      if (mode) {
        nStart = (0, _DateTimeHelper.toBasisEU)(start);
        nEnd = (0, _DateTimeHelper.toBasisEU)(end);
      } else {
        [nStart, nEnd] = this.dateTimeHelper.toBasisUS(start, end);
      }
      return 360 * (nEnd.year - nStart.year) + 30 * (nEnd.month - nStart.month) + nEnd.day - nStart.day;
    };
  }
  /**
   * Corresponds to DATE(year, month, day)
   *
   * Converts a provided year, month and day into date
   *
   * @param ast
   * @param state
   */
  date(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('DATE'), (year, month, day) => {
      const d = Math.trunc(day);
      let m = Math.trunc(month);
      let y = Math.trunc(year);
      if (y < this.dateTimeHelper.getEpochYearZero()) {
        y += this.dateTimeHelper.getEpochYearZero();
      }
      const delta = Math.floor((m - 1) / 12);
      y += delta;
      m -= delta * 12;
      const date = {
        year: y,
        month: m,
        day: 1
      };
      if (this.dateTimeHelper.isValidDate(date)) {
        let ret = this.dateTimeHelper.dateToNumber(date) + (d - 1);
        ret = this.dateTimeHelper.getWithinBounds(ret);
        if (ret === undefined) {
          return new _Cell.CellError(_Cell.ErrorType.NUM, _errorMessage.ErrorMessage.DateBounds);
        }
        return ret;
      }
      return new _Cell.CellError(_Cell.ErrorType.VALUE, _errorMessage.ErrorMessage.InvalidDate);
    });
  }
  time(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('TIME'), (h, m, s) => {
      const ret = (0, _DateTimeHelper.timeToNumber)({
        hours: Math.trunc(h),
        minutes: Math.trunc(m),
        seconds: Math.trunc(s)
      });
      if (ret < 0) {
        return new _Cell.CellError(_Cell.ErrorType.NUM, _errorMessage.ErrorMessage.NegativeTime);
      }
      return ret % 1;
    });
  }
  /**
   * Implementation for the EOMONTH function
   */
  eomonth(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('EOMONTH'), (dateNumber, numberOfMonthsToShift) => {
      const date = this.dateTimeHelper.numberToSimpleDate(dateNumber);
      let ret = this.dateTimeHelper.dateToNumber(this.dateTimeHelper.endOfMonth((0, _DateTimeHelper.offsetMonth)(date, numberOfMonthsToShift)));
      ret = this.dateTimeHelper.getWithinBounds(ret);
      if (ret === undefined) {
        return new _Cell.CellError(_Cell.ErrorType.NUM, _errorMessage.ErrorMessage.DateBounds);
      }
      return ret;
    });
  }
  day(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('DAY'), dateNumber => this.dateTimeHelper.numberToSimpleDate(dateNumber).day);
  }
  days(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('DAYS'), (endDate, startDate) => Math.trunc(endDate) - Math.trunc(startDate));
  }
  /**
   * Corresponds to MONTH(date)
   *
   * Returns the month of the year specified by a given date
   *
   * @param ast
   * @param state
   */
  month(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('MONTH'), dateNumber => this.dateTimeHelper.numberToSimpleDate(dateNumber).month);
  }
  /**
   * Corresponds to YEAR(date)
   *
   * Returns the year specified by a given date
   *
   * @param ast
   * @param state
   */
  year(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('YEAR'), dateNumber => this.dateTimeHelper.numberToSimpleDate(dateNumber).year);
  }
  hour(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('HOUR'), timeNumber => (0, _DateTimeHelper.numberToSimpleTime)((0, _DateTimeHelper.roundToNearestSecond)(timeNumber) % 1).hours);
  }
  minute(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('MINUTE'), timeNumber => (0, _DateTimeHelper.numberToSimpleTime)((0, _DateTimeHelper.roundToNearestSecond)(timeNumber) % 1).minutes);
  }
  second(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('SECOND'), timeNumber => (0, _DateTimeHelper.numberToSimpleTime)((0, _DateTimeHelper.roundToNearestSecond)(timeNumber) % 1).seconds);
  }
  /**
   * Corresponds to TEXT(number, format)
   *
   * Tries to convert number to specified date format.
   *
   * @param ast
   * @param state
   */
  text(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('TEXT'), (numberRepresentation, formatArg) => (0, _format.format)(numberRepresentation, formatArg, this.config, this.dateTimeHelper));
  }
  weekday(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('WEEKDAY'), (day, type) => {
      const absoluteDay = Math.floor(this.dateTimeHelper.relativeNumberToAbsoluteNumber(day));
      if (type === 3) {
        return (absoluteDay - 1) % 7;
      }
      const offset = weekdayOffsets.get(type);
      if (offset === undefined) {
        return new _Cell.CellError(_Cell.ErrorType.NUM, _errorMessage.ErrorMessage.BadMode);
      }
      return (absoluteDay - offset) % 7 + 1;
    });
  }
  weeknum(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('WEEKNUM'), (day, type) => {
      const absoluteDay = Math.floor(this.dateTimeHelper.relativeNumberToAbsoluteNumber(day));
      const date = this.dateTimeHelper.numberToSimpleDate(day);
      const yearStart = this.dateTimeHelper.dateToNumber({
        year: date.year,
        month: 1,
        day: 1
      });
      const yearStartAbsolute = this.dateTimeHelper.relativeNumberToAbsoluteNumber(yearStart);
      if (type === 21) {
        return this.isoweeknumCore(day);
      }
      const offset = weekdayOffsets.get(type);
      if (offset === undefined) {
        return new _Cell.CellError(_Cell.ErrorType.NUM, _errorMessage.ErrorMessage.BadMode);
      }
      return Math.floor((absoluteDay - offset) / 7) - Math.floor((yearStartAbsolute - offset) / 7) + 1;
    });
  }
  isoweeknum(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('ISOWEEKNUM'), this.isoweeknumCore);
  }
  datevalue(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('DATEVALUE'), date => {
      const {
        dateTime
      } = this.dateTimeHelper.parseDateTimeFromConfigFormats(date);
      if (dateTime === undefined) {
        return new _Cell.CellError(_Cell.ErrorType.VALUE, _errorMessage.ErrorMessage.IncorrectDateTime);
      }
      if (!(0, _DateTimeHelper.instanceOfSimpleDate)(dateTime)) {
        return 0;
      }
      return ((0, _DateTimeHelper.instanceOfSimpleTime)(dateTime) ? Math.trunc((0, _DateTimeHelper.timeToNumber)(dateTime)) : 0) + this.dateTimeHelper.dateToNumber(dateTime);
    });
  }
  timevalue(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('TIMEVALUE'), date => {
      const dateNumber = this.dateTimeHelper.dateStringToDateNumber(date);
      if (dateNumber === undefined) {
        return new _Cell.CellError(_Cell.ErrorType.VALUE, _errorMessage.ErrorMessage.IncorrectDateTime);
      }
      return (0, _InterpreterValue.getRawValue)(dateNumber) % 1;
    });
  }
  now(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('NOW'), () => {
      const now = new Date(Date.now());
      return (0, _DateTimeHelper.timeToNumber)({
        hours: now.getHours(),
        minutes: now.getMinutes(),
        seconds: now.getSeconds()
      }) + this.dateTimeHelper.dateToNumber({
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        day: now.getDate()
      });
    });
  }
  today(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('TODAY'), () => {
      const now = new Date(Date.now());
      return this.dateTimeHelper.dateToNumber({
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        day: now.getDate()
      });
    });
  }
  edate(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('EDATE'), (dateNumber, delta) => {
      const date = this.dateTimeHelper.numberToSimpleDate(dateNumber);
      const newDate = (0, _DateTimeHelper.truncateDayInMonth)((0, _DateTimeHelper.offsetMonth)(date, delta));
      let ret = this.dateTimeHelper.dateToNumber(newDate);
      ret = this.dateTimeHelper.getWithinBounds(ret);
      if (ret === undefined) {
        return new _Cell.CellError(_Cell.ErrorType.NUM, _errorMessage.ErrorMessage.DateBounds);
      }
      return ret;
    });
  }
  datedif(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('DATEDIF'), (startDate, endDate, unit) => {
      if (startDate > endDate) {
        return new _Cell.CellError(_Cell.ErrorType.NUM, _errorMessage.ErrorMessage.StartEndDate);
      }
      if (unit === 'D') {
        return Math.floor(endDate) - Math.floor(startDate);
      }
      const start = this.dateTimeHelper.numberToSimpleDate(startDate);
      const end = this.dateTimeHelper.numberToSimpleDate(endDate);
      switch (unit) {
        case 'M':
          return (end.year - start.year) * 12 + (end.month - start.month) - (end.day < start.day ? 1 : 0);
        case 'YM':
          return (12 + (end.month - start.month) - (end.day < start.day ? 1 : 0)) % 12;
        case 'Y':
          if (end.month > start.month || end.month === start.month && end.day >= start.day) {
            return end.year - start.year;
          } else {
            return end.year - start.year - 1;
          }
        case 'MD':
          if (end.day >= start.day) {
            return end.day - start.day;
          } else {
            const m = end.month === 1 ? 12 : end.month - 1;
            const y = end.month === 1 ? end.year - 1 : end.year;
            return this.dateTimeHelper.daysInMonth(y, m) + end.day - start.day;
          }
        case 'YD':
          if (end.month > start.month || end.month === start.month && end.day >= start.day) {
            return Math.floor(endDate) - this.dateTimeHelper.dateToNumber({
              year: end.year,
              month: start.month,
              day: start.day
            });
          } else {
            return Math.floor(endDate) - Math.floor(startDate) - 365 * (end.year - start.year - 1) - this.dateTimeHelper.leapYearsCount(end.year - 1) + this.dateTimeHelper.leapYearsCount(start.year);
          }
        default:
          return new _Cell.CellError(_Cell.ErrorType.NUM, _errorMessage.ErrorMessage.BadMode);
      }
    });
  }
  days360(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('DAYS360'), this.days360Core);
  }
  yearfrac(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('YEARFRAC'), (startDate, endDate, mode) => {
      startDate = Math.trunc(startDate);
      endDate = Math.trunc(endDate);
      if (startDate > endDate) {
        [startDate, endDate] = [endDate, startDate];
      }
      switch (mode) {
        case 0:
          return this.days360Core(startDate, endDate, false) / 360;
        case 1:
          return (endDate - startDate) / this.dateTimeHelper.yearLengthForBasis(this.dateTimeHelper.numberToSimpleDate(startDate), this.dateTimeHelper.numberToSimpleDate(endDate));
        case 2:
          return (endDate - startDate) / 360;
        case 3:
          return (endDate - startDate) / 365;
        case 4:
          return this.days360Core(startDate, endDate, true) / 360;
      }
      throw new Error('Should not be reachable.');
    });
  }
  interval(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('INTERVAL'), arg => {
      arg = Math.trunc(arg);
      const second = arg % 60;
      arg = Math.trunc(arg / 60);
      const minute = arg % 60;
      arg = Math.trunc(arg / 60);
      const hour = arg % 24;
      arg = Math.trunc(arg / 24);
      const day = arg % 30;
      arg = Math.trunc(arg / 30);
      const month = arg % 12;
      const year = Math.trunc(arg / 12);
      return 'P' + (year > 0 ? `${year}Y` : '') + (month > 0 ? `${month}M` : '') + (day > 0 ? `${day}D` : '') + 'T' + (hour > 0 ? `${hour}H` : '') + (minute > 0 ? `${minute}M` : '') + (second > 0 ? `${second}S` : '');
    });
  }
  networkdays(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('NETWORKDAYS'), (start, end, holidays) => this.networkdayscore(start, end, 1, holidays));
  }
  networkdaysintl(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('NETWORKDAYS.INTL'), (start, end, weekend, holidays) => this.networkdayscore(start, end, weekend, holidays));
  }
  workday(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('WORKDAY'), (start, end, holidays) => this.workdaycore(start, end, 1, holidays));
  }
  workdayintl(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('WORKDAY.INTL'), (start, end, weekend, holidays) => this.workdaycore(start, end, weekend, holidays));
  }
  networkdayscore(start, end, weekend, holidays) {
    start = Math.trunc(start);
    end = Math.trunc(end);
    let multiplier = 1;
    if (start > end) {
      [start, end] = [end, start];
      multiplier = -1;
    }
    const weekendPattern = computeWeekendPattern(weekend);
    if (weekendPattern instanceof _Cell.CellError) {
      return weekendPattern;
    }
    const filteredHolidays = this.simpleRangeToFilteredHolidays(weekendPattern, holidays);
    if (filteredHolidays instanceof _Cell.CellError) {
      return filteredHolidays;
    }
    return multiplier * this.countWorkdays(start, end, weekendPattern, filteredHolidays);
  }
  workdaycore(start, delta, weekend, holidays) {
    start = Math.trunc(start);
    delta = Math.trunc(delta);
    const weekendPattern = computeWeekendPattern(weekend);
    if (weekendPattern instanceof _Cell.CellError) {
      return weekendPattern;
    }
    const filteredHolidays = this.simpleRangeToFilteredHolidays(weekendPattern, holidays);
    if (filteredHolidays instanceof _Cell.CellError) {
      return filteredHolidays;
    }
    if (delta > 0) {
      let upper = 1;
      while (this.countWorkdays(start + 1, start + upper, weekendPattern, filteredHolidays) < delta) {
        upper *= 2;
      }
      let lower = 1;
      while (lower + 1 < upper) {
        const mid = Math.trunc((lower + upper) / 2);
        if (this.countWorkdays(start + 1, start + mid, weekendPattern, filteredHolidays) < delta) {
          lower = mid;
        } else {
          upper = mid;
        }
      }
      return start + upper;
    } else if (delta < 0) {
      delta *= -1;
      let upper = 1;
      while (this.countWorkdays(start - upper, start - 1, weekendPattern, filteredHolidays) < delta) {
        upper *= 2;
      }
      let lower = 1;
      while (lower + 1 < upper) {
        const mid = Math.trunc((lower + upper) / 2);
        if (this.countWorkdays(start - mid, start - 1, weekendPattern, filteredHolidays) < delta) {
          lower = mid;
        } else {
          upper = mid;
        }
      }
      return start - upper;
    } else {
      return start;
    }
  }
  countWorkdays(start, end, weekendPattern, sortedHolidays) {
    const absoluteEnd = Math.floor(this.dateTimeHelper.relativeNumberToAbsoluteNumber(end));
    const absoluteStart = Math.floor(this.dateTimeHelper.relativeNumberToAbsoluteNumber(start));
    let ans = 0;
    for (let i = 0; i < 7; i++) {
      if (weekendPattern.charAt(i) === '0') {
        ans += Math.floor((absoluteEnd + 6 - i) / 7);
        ans -= Math.floor((absoluteStart - 1 + 6 - i) / 7);
      }
    }
    ans -= lowerBound(end + 1, sortedHolidays) - lowerBound(start, sortedHolidays);
    return ans;
  }
  simpleRangeToFilteredHolidays(weekendPattern, holidays) {
    var _a;
    const holidaysArr = (_a = holidays === null || holidays === void 0 ? void 0 : holidays.valuesFromTopLeftCorner()) !== null && _a !== void 0 ? _a : [];
    for (const val of holidaysArr) {
      if (val instanceof _Cell.CellError) {
        return val;
      }
    }
    const processedHolidays = [];
    for (const val of holidaysArr) {
      if (val === _InterpreterValue.EmptyValue) {
        continue;
      }
      if ((0, _InterpreterValue.isExtendedNumber)(val)) {
        processedHolidays.push(Math.trunc((0, _InterpreterValue.getRawValue)(val)));
      } else {
        return new _Cell.CellError(_Cell.ErrorType.VALUE, _errorMessage.ErrorMessage.WrongType);
      }
    }
    return [...new Set(processedHolidays)].sort((a, b) => a - b).filter(arg => {
      const val = this.dateTimeHelper.relativeNumberToAbsoluteNumber(arg);
      const i = (val - 1) % 7;
      return weekendPattern.charAt(i) === '0';
    });
  }
}
exports.DateTimePlugin = DateTimePlugin;
DateTimePlugin.implementedFunctions = {
  'DATE': {
    method: 'date',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }],
    returnNumberType: _InterpreterValue.NumberType.NUMBER_DATE
  },
  'TIME': {
    method: 'time',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }],
    returnNumberType: _InterpreterValue.NumberType.NUMBER_TIME
  },
  'MONTH': {
    method: 'month',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      minValue: 0
    }]
  },
  'YEAR': {
    method: 'year',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      minValue: 0
    }]
  },
  'HOUR': {
    method: 'hour',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      minValue: 0
    }]
  },
  'MINUTE': {
    method: 'minute',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      minValue: 0
    }]
  },
  'SECOND': {
    method: 'second',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      minValue: 0
    }]
  },
  'TEXT': {
    method: 'text',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.STRING
    }]
  },
  'EOMONTH': {
    method: 'eomonth',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      minValue: 0
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }],
    returnNumberType: _InterpreterValue.NumberType.NUMBER_DATE
  },
  'DAY': {
    method: 'day',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      minValue: 0
    }]
  },
  'DAYS': {
    method: 'days',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      minValue: 0
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      minValue: 0
    }]
  },
  'WEEKDAY': {
    method: 'weekday',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      minValue: 0
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      defaultValue: 1
    }]
  },
  'WEEKNUM': {
    method: 'weeknum',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      minValue: 0
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      defaultValue: 1
    }]
  },
  'ISOWEEKNUM': {
    method: 'isoweeknum',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      minValue: 0
    }]
  },
  'DATEVALUE': {
    method: 'datevalue',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.STRING
    }],
    returnNumberType: _InterpreterValue.NumberType.NUMBER_DATE
  },
  'TIMEVALUE': {
    method: 'timevalue',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.STRING
    }],
    returnNumberType: _InterpreterValue.NumberType.NUMBER_TIME
  },
  'NOW': {
    method: 'now',
    parameters: [],
    isVolatile: true,
    returnNumberType: _InterpreterValue.NumberType.NUMBER_DATETIME
  },
  'TODAY': {
    method: 'today',
    parameters: [],
    isVolatile: true,
    returnNumberType: _InterpreterValue.NumberType.NUMBER_DATE
  },
  'EDATE': {
    method: 'edate',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      minValue: 0
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }],
    returnNumberType: _InterpreterValue.NumberType.NUMBER_DATE
  },
  'DAYS360': {
    method: 'days360',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      minValue: 0
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      minValue: 0
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.BOOLEAN,
      defaultValue: false
    }]
  },
  'DATEDIF': {
    method: 'datedif',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      minValue: 0
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      minValue: 0
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.STRING
    }]
  },
  'YEARFRAC': {
    method: 'yearfrac',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      minValue: 0
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      minValue: 0
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.INTEGER,
      defaultValue: 0,
      minValue: 0,
      maxValue: 4
    }]
  },
  'INTERVAL': {
    method: 'interval',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      minValue: 0
    }]
  },
  'NETWORKDAYS': {
    method: 'networkdays',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      minValue: 0
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      minValue: 0
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.RANGE,
      optionalArg: true
    }]
  },
  'NETWORKDAYS.INTL': {
    method: 'networkdaysintl',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      minValue: 0
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      minValue: 0
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NOERROR,
      defaultValue: 1
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.RANGE,
      optionalArg: true
    }]
  },
  'WORKDAY': {
    method: 'workday',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      minValue: 0
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.RANGE,
      optionalArg: true
    }]
  },
  'WORKDAY.INTL': {
    method: 'workdayintl',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      minValue: 0
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NOERROR,
      defaultValue: 1
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.RANGE,
      optionalArg: true
    }]
  }
};
/**
 * Returns i such that:
 * sortedArray[i-1] < val <= sortedArray[i]
 *
 */
function lowerBound(val, sortedArray) {
  if (sortedArray.length === 0) {
    return 0;
  }
  if (val <= sortedArray[0]) {
    return 0;
  }
  if (sortedArray[sortedArray.length - 1] < val) {
    return sortedArray.length;
  }
  let lower = 0; //sortedArray[lower] < val
  let upper = sortedArray.length - 1; //sortedArray[upper] >= val
  while (lower + 1 < upper) {
    const mid = Math.floor((upper + lower) / 2);
    if (sortedArray[mid] >= val) {
      upper = mid;
    } else {
      lower = mid;
    }
  }
  return upper;
}
function computeWeekendPattern(weekend) {
  var _a;
  if (typeof weekend !== 'number' && typeof weekend !== 'string') {
    return new _Cell.CellError(_Cell.ErrorType.VALUE, _errorMessage.ErrorMessage.WrongType);
  }
  if (typeof weekend === 'string') {
    if (weekend.length !== 7 || !/^(0|1)*$/.test(weekend) || weekend === '1111111') {
      return new _Cell.CellError(_Cell.ErrorType.NUM, _errorMessage.ErrorMessage.WeekendString);
    } else {
      return weekend;
    }
  } else {
    return (_a = workdayPatterns.get(weekend)) !== null && _a !== void 0 ? _a : new _Cell.CellError(_Cell.ErrorType.NUM, _errorMessage.ErrorMessage.BadMode);
  }
}
const weekdayOffsets = new Map([[1, 0], [2, 1], [11, 1], [12, 2], [13, 3], [14, 4], [15, 5], [16, 6], [17, 0]]);
const workdayPatterns = new Map([[1, '0000011'], [2, '1000001'], [3, '1100000'], [4, '0110000'], [5, '0011000'], [6, '0001100'], [7, '0000110'], [11, '0000001'], [12, '1000000'], [13, '0100000'], [14, '0010000'], [15, '0001000'], [16, '0000100'], [17, '0000010']]);