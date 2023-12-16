"use strict";

exports.__esModule = true;
exports.Config = void 0;
exports.getDefaultConfig = getDefaultConfig;
var _ArgumentSanitization = require("./ArgumentSanitization");
var _DateTimeDefault = require("./DateTimeDefault");
var _DateTimeHelper = require("./DateTimeHelper");
var _ChooseAddressMappingPolicy = require("./DependencyGraph/AddressMapping/ChooseAddressMappingPolicy");
var _errors = require("./errors");
var _format = require("./format/format");
var _licenseKeyValidator = require("./helpers/licenseKeyValidator");
var _HyperFormula = require("./HyperFormula");
/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */

const privatePool = new WeakMap();
class Config {
  constructor(options = {}, showDeprecatedWarns = true) {
    const {
      accentSensitive,
      addressMapping,
      binarySearchThreshold,
      caseSensitive,
      caseFirst,
      chooseAddressMappingPolicy,
      currencySymbol,
      dateFormats,
      decimalSeparator,
      evaluateNullToZero,
      functionArgSeparator,
      functionPlugins,
      ignorePunctuation,
      leapYear1900,
      localeLang,
      language,
      ignoreWhiteSpace,
      licenseKey,
      matchWholeCell,
      arrayColumnSeparator,
      arrayRowSeparator,
      maxRows,
      maxColumns,
      nullYear,
      nullDate,
      parseDateTime,
      precisionEpsilon,
      precisionRounding,
      rangeMapping,
      stringifyDateTime,
      stringifyDuration,
      smartRounding,
      timeFormats,
      thousandSeparator,
      useArrayArithmetic,
      useStats,
      undoLimit,
      useColumnIndex,
      useRegularExpressions,
      useWildcards
    } = options;
    if (showDeprecatedWarns) {
      Config.warnDeprecatedOptions(options);
    }
    this.useArrayArithmetic = (0, _ArgumentSanitization.configValueFromParam)(useArrayArithmetic, 'boolean', 'useArrayArithmetic');
    this.accentSensitive = (0, _ArgumentSanitization.configValueFromParam)(accentSensitive, 'boolean', 'accentSensitive');
    this.addressMapping = addressMapping;
    this.rangeMapping = rangeMapping;
    this.caseSensitive = (0, _ArgumentSanitization.configValueFromParam)(caseSensitive, 'boolean', 'caseSensitive');
    this.caseFirst = (0, _ArgumentSanitization.configValueFromParam)(caseFirst, ['upper', 'lower', 'false'], 'caseFirst');
    this.ignorePunctuation = (0, _ArgumentSanitization.configValueFromParam)(ignorePunctuation, 'boolean', 'ignorePunctuation');
    this.chooseAddressMappingPolicy = chooseAddressMappingPolicy !== null && chooseAddressMappingPolicy !== void 0 ? chooseAddressMappingPolicy : Config.defaultConfig.chooseAddressMappingPolicy;
    this.dateFormats = [...(0, _ArgumentSanitization.configValueFromParamCheck)(dateFormats, Array.isArray, 'array', 'dateFormats')];
    this.timeFormats = [...(0, _ArgumentSanitization.configValueFromParamCheck)(timeFormats, Array.isArray, 'array', 'timeFormats')];
    this.functionArgSeparator = (0, _ArgumentSanitization.configValueFromParam)(functionArgSeparator, 'string', 'functionArgSeparator');
    this.decimalSeparator = (0, _ArgumentSanitization.configValueFromParam)(decimalSeparator, ['.', ','], 'decimalSeparator');
    this.language = (0, _ArgumentSanitization.configValueFromParam)(language, 'string', 'language');
    this.ignoreWhiteSpace = (0, _ArgumentSanitization.configValueFromParam)(ignoreWhiteSpace, ['standard', 'any'], 'ignoreWhiteSpace');
    this.licenseKey = (0, _ArgumentSanitization.configValueFromParam)(licenseKey, 'string', 'licenseKey');
    this.thousandSeparator = (0, _ArgumentSanitization.configValueFromParam)(thousandSeparator, ['', ',', ' ', '.'], 'thousandSeparator');
    this.arrayColumnSeparator = (0, _ArgumentSanitization.configValueFromParam)(arrayColumnSeparator, [',', ';'], 'arrayColumnSeparator');
    this.arrayRowSeparator = (0, _ArgumentSanitization.configValueFromParam)(arrayRowSeparator, [';', '|'], 'arrayRowSeparator');
    this.localeLang = (0, _ArgumentSanitization.configValueFromParam)(localeLang, 'string', 'localeLang');
    this.functionPlugins = [...(functionPlugins !== null && functionPlugins !== void 0 ? functionPlugins : Config.defaultConfig.functionPlugins)];
    this.smartRounding = (0, _ArgumentSanitization.configValueFromParam)(smartRounding, 'boolean', 'smartRounding');
    this.evaluateNullToZero = (0, _ArgumentSanitization.configValueFromParam)(evaluateNullToZero, 'boolean', 'evaluateNullToZero');
    this.nullYear = (0, _ArgumentSanitization.configValueFromParam)(nullYear, 'number', 'nullYear');
    (0, _ArgumentSanitization.validateNumberToBeAtLeast)(this.nullYear, 'nullYear', 0);
    (0, _ArgumentSanitization.validateNumberToBeAtMost)(this.nullYear, 'nullYear', 100);
    this.precisionRounding = (0, _ArgumentSanitization.configValueFromParam)(precisionRounding, 'number', 'precisionRounding');
    (0, _ArgumentSanitization.validateNumberToBeAtLeast)(this.precisionRounding, 'precisionRounding', 0);
    this.precisionEpsilon = (0, _ArgumentSanitization.configValueFromParam)(precisionEpsilon, 'number', 'precisionEpsilon');
    (0, _ArgumentSanitization.validateNumberToBeAtLeast)(this.precisionEpsilon, 'precisionEpsilon', 0);
    this.useColumnIndex = (0, _ArgumentSanitization.configValueFromParam)(useColumnIndex, 'boolean', 'useColumnIndex');
    this.useStats = (0, _ArgumentSanitization.configValueFromParam)(useStats, 'boolean', 'useStats');
    this.binarySearchThreshold = binarySearchThreshold !== null && binarySearchThreshold !== void 0 ? binarySearchThreshold : Config.defaultConfig.binarySearchThreshold;
    this.parseDateTime = (0, _ArgumentSanitization.configValueFromParam)(parseDateTime, 'function', 'parseDateTime');
    this.stringifyDateTime = (0, _ArgumentSanitization.configValueFromParam)(stringifyDateTime, 'function', 'stringifyDateTime');
    this.stringifyDuration = (0, _ArgumentSanitization.configValueFromParam)(stringifyDuration, 'function', 'stringifyDuration');
    this.translationPackage = _HyperFormula.HyperFormula.getLanguage(this.language);
    this.errorMapping = this.translationPackage.buildErrorMapping();
    this.nullDate = (0, _ArgumentSanitization.configValueFromParamCheck)(nullDate, _DateTimeHelper.instanceOfSimpleDate, 'IDate', 'nullDate');
    this.leapYear1900 = (0, _ArgumentSanitization.configValueFromParam)(leapYear1900, 'boolean', 'leapYear1900');
    this.undoLimit = (0, _ArgumentSanitization.configValueFromParam)(undoLimit, 'number', 'undoLimit');
    this.useRegularExpressions = (0, _ArgumentSanitization.configValueFromParam)(useRegularExpressions, 'boolean', 'useRegularExpressions');
    this.useWildcards = (0, _ArgumentSanitization.configValueFromParam)(useWildcards, 'boolean', 'useWildcards');
    this.matchWholeCell = (0, _ArgumentSanitization.configValueFromParam)(matchWholeCell, 'boolean', 'matchWholeCell');
    (0, _ArgumentSanitization.validateNumberToBeAtLeast)(this.undoLimit, 'undoLimit', 0);
    this.maxRows = (0, _ArgumentSanitization.configValueFromParam)(maxRows, 'number', 'maxRows');
    (0, _ArgumentSanitization.validateNumberToBeAtLeast)(this.maxRows, 'maxRows', 1);
    this.maxColumns = (0, _ArgumentSanitization.configValueFromParam)(maxColumns, 'number', 'maxColumns');
    this.currencySymbol = this.setupCurrencySymbol(currencySymbol);
    (0, _ArgumentSanitization.validateNumberToBeAtLeast)(this.maxColumns, 'maxColumns', 1);
    privatePool.set(this, {
      licenseKeyValidityState: (0, _licenseKeyValidator.checkLicenseKeyValidity)(this.licenseKey)
    });
    (0, _ArgumentSanitization.configCheckIfParametersNotInConflict)({
      value: this.decimalSeparator,
      name: 'decimalSeparator'
    }, {
      value: this.functionArgSeparator,
      name: 'functionArgSeparator'
    }, {
      value: this.thousandSeparator,
      name: 'thousandSeparator'
    });
    (0, _ArgumentSanitization.configCheckIfParametersNotInConflict)({
      value: this.arrayRowSeparator,
      name: 'arrayRowSeparator'
    }, {
      value: this.arrayColumnSeparator,
      name: 'arrayColumnSeparator'
    });
  }
  setupCurrencySymbol(currencySymbol) {
    const valueAfterCheck = [...(0, _ArgumentSanitization.configValueFromParamCheck)(currencySymbol, Array.isArray, 'array', 'currencySymbol')];
    valueAfterCheck.forEach(val => {
      if (typeof val !== 'string') {
        throw new _errors.ExpectedValueOfTypeError('string[]', 'currencySymbol');
      }
      if (val === '') {
        throw new _errors.ConfigValueEmpty('currencySymbol');
      }
    });
    return valueAfterCheck;
  }
  /**
   * Proxied property to its private counterpart. This makes the property
   * as accessible as the other Config options but without ability to change the value.
   *
   * @internal
   */
  get licenseKeyValidityState() {
    return privatePool.get(this).licenseKeyValidityState;
  }
  getConfig() {
    return getFullConfigFromPartial(this);
  }
  mergeConfig(init) {
    const mergedConfig = Object.assign({}, this.getConfig(), init);
    Config.warnDeprecatedOptions(init);
    return new Config(mergedConfig, false);
  }
  static warnDeprecatedOptions(options) {
    Config.warnDeprecatedIfUsed(options.binarySearchThreshold, 'binarySearchThreshold', '1.1');
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static warnDeprecatedIfUsed(inputValue, paramName, fromVersion, replacementName) {
    if (inputValue !== undefined) {
      if (replacementName === undefined) {
        console.warn(`${paramName} option is deprecated since ${fromVersion}`);
      } else {
        console.warn(`${paramName} option is deprecated since ${fromVersion}, please use ${replacementName}`);
      }
    }
  }
}
exports.Config = Config;
Config.defaultConfig = {
  accentSensitive: false,
  binarySearchThreshold: 20,
  currencySymbol: ['$'],
  caseSensitive: false,
  caseFirst: 'lower',
  chooseAddressMappingPolicy: new _ChooseAddressMappingPolicy.AlwaysDense(),
  dateFormats: ['DD/MM/YYYY', 'DD/MM/YY'],
  decimalSeparator: '.',
  evaluateNullToZero: false,
  functionArgSeparator: ',',
  functionPlugins: [],
  ignorePunctuation: false,
  language: 'enGB',
  ignoreWhiteSpace: 'standard',
  licenseKey: '',
  leapYear1900: false,
  localeLang: 'en',
  matchWholeCell: true,
  arrayColumnSeparator: ',',
  arrayRowSeparator: ';',
  maxRows: 40000,
  maxColumns: 18278,
  nullYear: 30,
  nullDate: {
    year: 1899,
    month: 12,
    day: 30
  },
  parseDateTime: _DateTimeDefault.defaultParseToDateTime,
  precisionEpsilon: 1e-13,
  precisionRounding: 14,
  smartRounding: true,
  stringifyDateTime: _format.defaultStringifyDateTime,
  stringifyDuration: _format.defaultStringifyDuration,
  timeFormats: ['hh:mm', 'hh:mm:ss.sss'],
  thousandSeparator: '',
  undoLimit: 20,
  useRegularExpressions: false,
  useWildcards: true,
  useColumnIndex: false,
  useStats: false,
  useArrayArithmetic: false
};
function getFullConfigFromPartial(partialConfig) {
  var _a;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ret = {};
  for (const key in Config.defaultConfig) {
    const val = (_a = partialConfig[key]) !== null && _a !== void 0 ? _a : Config.defaultConfig[key];
    if (Array.isArray(val)) {
      ret[key] = [...val];
    } else {
      ret[key] = val;
    }
  }
  return ret;
}
function getDefaultConfig() {
  return getFullConfigFromPartial({});
}