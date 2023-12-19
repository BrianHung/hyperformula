"use strict";

exports.__esModule = true;
exports.HyperFormula = void 0;
var _AbsoluteCellRange = require("./AbsoluteCellRange");
var _ArgumentSanitization = require("./ArgumentSanitization");
var _BuildEngineFactory = require("./BuildEngineFactory");
var _Cell = require("./Cell");
var _CellContentParser = require("./CellContentParser");
var _Config = require("./Config");
var _DateTimeHelper = require("./DateTimeHelper");
var _Destroy = require("./Destroy");
var _Emitter = require("./Emitter");
var _errors = require("./errors");
var _i18n = require("./i18n");
var _FunctionRegistry = require("./interpreter/FunctionRegistry");
var _Operations = require("./Operations");
var _parser2 = require("./parser");
/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */

/**
 * This is a class for creating HyperFormula instance, all the following public methods
 * ale related to this class.
 *
 * The instance can be created only by calling one of the static methods
 * `buildFromArray`, `buildFromSheets` or `buildEmpty` and should be disposed of with the
 * `destroy` method when it's no longer needed to free the resources.
 *
 * The instance can be seen as a workbook where worksheets can be created and
 * manipulated. They are organized within a widely known structure of columns and rows
 * which can be manipulated as well. The smallest possible data unit are the cells, which
 * may contain simple values or formulas to be calculated.
 *
 * All CRUD methods are called directly on HyperFormula instance and will trigger
 * corresponding lifecycle events. The events are marked accordingly, as well as thrown
 * errors, so they can be correctly handled.
 */
class HyperFormula {
  /**
   * Constructor
   *
   * @internal
   */
  constructor(_config, _stats, _dependencyGraph, _columnSearch, _parser, _unparser, _cellContentParser, _evaluator, _lazilyTransformingAstService, _crudOperations, _exporter, _namedExpressions, _serialization, _functionRegistry) {
    this._config = _config;
    this._stats = _stats;
    this._dependencyGraph = _dependencyGraph;
    this._columnSearch = _columnSearch;
    this._parser = _parser;
    this._unparser = _unparser;
    this._cellContentParser = _cellContentParser;
    this._evaluator = _evaluator;
    this._lazilyTransformingAstService = _lazilyTransformingAstService;
    this._crudOperations = _crudOperations;
    this._exporter = _exporter;
    this._namedExpressions = _namedExpressions;
    this._serialization = _serialization;
    this._functionRegistry = _functionRegistry;
    this._emitter = new _Emitter.Emitter();
    this._evaluationSuspended = false;
  }
  /**
   * Returns all of HyperFormula's default [configuration options](../../guide/configuration-options.md).
   *
   * @example
   * ```js
   * // returns all default configuration options
   * const defaultConfig = HyperFormula.defaultConfig;
   * ```
   *
   * @category Static Accessors
   */
  static get defaultConfig() {
    return (0, _Config.getDefaultConfig)();
  }
  /**
   * Calls the `graph` method on the dependency graph.
   * Allows for executing `graph` directly, without a need to refer to `dependencyGraph`.
   *
   * @internal
   */
  get graph() {
    return this.dependencyGraph.graph;
  }
  /**
   * Calls the `rangeMapping` method on the dependency graph.
   * Allows for executing `rangeMapping` directly, without a need to refer to `dependencyGraph`.
   *
   * @internal
   */
  get rangeMapping() {
    return this.dependencyGraph.rangeMapping;
  }
  /**
   * Calls the `arrayMapping` method on the dependency graph.
   * Allows for executing `arrayMapping` directly, without a need to refer to `dependencyGraph`.
   *
   * @internal
   */
  get arrayMapping() {
    return this.dependencyGraph.arrayMapping;
  }
  /**
   * Calls the `sheetMapping` method on the dependency graph.
   * Allows for executing `sheetMapping` directly, without a need to refer to `dependencyGraph`.
   *
   * @internal
   */
  get sheetMapping() {
    return this.dependencyGraph.sheetMapping;
  }
  /**
   * Calls the `addressMapping` method on the dependency graph.
   * Allows for executing `addressMapping` directly, without a need to refer to `dependencyGraph`.
   *
   * @internal
   */
  get addressMapping() {
    return this.dependencyGraph.addressMapping;
  }
  /** @internal */
  get dependencyGraph() {
    return this._dependencyGraph;
  }
  /** @internal */
  get evaluator() {
    return this._evaluator;
  }
  /** @internal */
  get columnSearch() {
    return this._columnSearch;
  }
  /** @internal */
  get lazilyTransformingAstService() {
    return this._lazilyTransformingAstService;
  }
  /**
   * Returns state of the validity of the license key.
   *
   * @internal
   */
  get licenseKeyValidityState() {
    return this._config.licenseKeyValidityState;
  }
  /**
   * Builds the engine for a sheet from a two-dimensional array representation.
   * The engine is created with a single sheet.
   * Can be configured with the optional second parameter that represents a [[ConfigParams]].
   * If not specified, the engine will be built with the default configuration.
   *
   * @param {Sheet} sheet - two-dimensional array representation of sheet
   * @param {Partial<ConfigParams>} configInput - engine configuration
   * @param {SerializedNamedExpression[]} namedExpressions - starting named expressions
   *
   * @throws [[SheetSizeLimitExceededError]] when sheet size exceeds the limits
   * @throws [[InvalidArgumentsError]] when sheet is not an array of arrays
   * @throws [[FunctionPluginValidationError]] when plugin class definition is not consistent with metadata
   *
   * @example
   * ```js
   * // data represented as an array
   * const sheetData = [
   *  ['0', '=SUM(1, 2, 3)', '52'],
   *  ['=SUM(A1:C1)', '', '=A1'],
   *  ['2', '=SUM(A1:C1)', '91'],
   * ];
   *
   * // method with optional config parameter maxColumns
   * const hfInstance = HyperFormula.buildFromArray(sheetData, { maxColumns: 1000 });
   * ```
   *
   * @category Factories
   */
  static buildFromArray(sheet, configInput = {}, namedExpressions = []) {
    return this.buildFromEngineState(_BuildEngineFactory.BuildEngineFactory.buildFromSheet(sheet, configInput, namedExpressions));
  }
  /**
   * Builds the engine from an object containing multiple sheets with names.
   * The engine is created with one or more sheets.
   * Can be configured with the optional second parameter that represents a [[ConfigParams]].
   * If not specified the engine will be built with the default configuration.
   *
   * @param {Sheet} sheets - object with sheets definition
   * @param {Partial<ConfigParams>} configInput - engine configuration
   * @param {SerializedNamedExpression[]} namedExpressions - starting named expressions
   *
   * @throws [[SheetSizeLimitExceededError]] when sheet size exceeds the limits
   * @throws [[InvalidArgumentsError]] when any sheet is not an array of arrays
   * @throws [[FunctionPluginValidationError]] when plugin class definition is not consistent with metadata
   *
   * @example
   * ```js
   * // data represented as an object with sheets: Sheet1 and Sheet2
   * const sheetData = {
   *  'Sheet1': [
   *    ['1', '', '=Sheet2!$A1'],
   *    ['', '2', '=SUM(1, 2, 3)'],
   *    ['=Sheet2!$A2', '2', ''],
   *   ],
   *  'Sheet2': [
   *    ['', '4', '=Sheet1!$B1'],
   *    ['', '8', '=SUM(9, 3, 3)'],
   *    ['=Sheet1!$B1', '2', ''],
   *   ],
   * };
   *
   * // method with optional config parameter useColumnIndex
   * const hfInstance = HyperFormula.buildFromSheets(sheetData, { useColumnIndex: true });
   * ```
   *
   * @category Factories
   */
  static buildFromSheets(sheets, configInput = {}, namedExpressions = []) {
    return this.buildFromEngineState(_BuildEngineFactory.BuildEngineFactory.buildFromSheets(sheets, configInput, namedExpressions));
  }
  /**
   * Builds an empty engine instance.
   * Can be configured with the optional parameter that represents a [[ConfigParams]].
   * If not specified the engine will be built with the default configuration.
   *
   * @param {Partial<ConfigParams>} configInput - engine configuration
   * @param {SerializedNamedExpression[]} namedExpressions - starting named expressions
   *
   * @example
   * ```js
   * // build with no initial data and with optional config parameter maxColumns
   * const hfInstance = HyperFormula.buildEmpty({ maxColumns: 1000 });
   * ```
   *
   * @category Factories
   */
  static buildEmpty(configInput = {}, namedExpressions = []) {
    return this.buildFromEngineState(_BuildEngineFactory.BuildEngineFactory.buildEmpty(configInput, namedExpressions));
  }
  /**
   * Returns registered language from its code string.
   *
   * @param {string} languageCode - code string of the translation package
   *
   * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
   * @throws [[LanguageNotRegisteredError]] when trying to retrieve not registered language
   *
   * @example
   * ```js
   * // return registered language
   * const language = HyperFormula.getLanguage('enGB');
   * ```
   *
   * @category Static Methods
   */
  static getLanguage(languageCode) {
    (0, _ArgumentSanitization.validateArgToType)(languageCode, 'string', 'languageCode');
    const val = this.registeredLanguages.get(languageCode);
    if (val === undefined) {
      throw new _errors.LanguageNotRegisteredError();
    } else {
      return val;
    }
  }
  /**
   * Registers language under given code string.
   *
   * For more information, see the [Localizing functions guide](/guide/localizing-functions.md).
   *
   * @param {string} languageCode - code string of the translation package
   * @param {RawTranslationPackage} languagePackage - translation package to be registered
   *
   * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
   * @throws [[ProtectedFunctionTranslationError]] when trying to register translation for protected function
   * @throws [[LanguageAlreadyRegisteredError]] when given language is already registered
   *
   * @example
   * ```js
   * // return registered language
   * HyperFormula.registerLanguage('enUS', enUS);
   * const engine = HyperFormula.buildEmpty({language: 'enUS'});
   * ```
   *
   * @category Static Methods
   */
  static registerLanguage(languageCode, languagePackage) {
    (0, _ArgumentSanitization.validateArgToType)(languageCode, 'string', 'languageCode');
    if (this.registeredLanguages.has(languageCode)) {
      throw new _errors.LanguageAlreadyRegisteredError();
    } else {
      this.registeredLanguages.set(languageCode, (0, _i18n.buildTranslationPackage)(languagePackage));
    }
  }
  /**
   * Unregisters language that is registered under given code string.
   *
   * @param {string} languageCode - code string of the translation package
   *
   * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
   * @throws [[LanguageNotRegisteredError]] when given language is not registered
   *
   * @example
   * ```js
   * // register the language for the instance
   * HyperFormula.registerLanguage('plPL', plPL);
   *
   * // unregister plPL
   * HyperFormula.unregisterLanguage('plPL');
   * ```
   *
   * @category Static Methods
   */
  static unregisterLanguage(languageCode) {
    (0, _ArgumentSanitization.validateArgToType)(languageCode, 'string', 'languageCode');
    if (this.registeredLanguages.has(languageCode)) {
      this.registeredLanguages.delete(languageCode);
    } else {
      throw new _errors.LanguageNotRegisteredError();
    }
  }
  /**
   * Returns all registered languages codes.
   *
   * @example
   * ```js
   * // should return all registered language codes: ['enGB', 'plPL']
   * const registeredLanguages = HyperFormula.getRegisteredLanguagesCodes();
   * ```
   *
   * @category Static Methods
   */
  static getRegisteredLanguagesCodes() {
    return Array.from(this.registeredLanguages.keys());
  }
  /**
   * Registers all functions in a given plugin with optional translations.
   *
   * Note: FunctionPlugins must be registered prior to the creation of HyperFormula instances in which they are used.
   * HyperFormula instances created prior to the registration of a FunctionPlugin are unable to access the FunctionPlugin.
   * Registering a FunctionPlugin with [[custom-functions]] requires the translations parameter.
   *
   * @param {FunctionPluginDefinition} plugin - plugin class
   * @param {FunctionTranslationsPackage} translations - optional package of function names translations
   *
   * @throws [[FunctionPluginValidationError]] when plugin class definition is not consistent with metadata
   * @throws [[ProtectedFunctionTranslationError]] when trying to register translation for protected function
   *
   * @example
   * ```js
   * // import your own plugin
   * import { MyExamplePlugin } from './file_with_your_plugin';
   *
   * // register the plugin
   * HyperFormula.registerFunctionPlugin(MyExamplePlugin);
   * ```
   *
   * @category Static Methods
   */
  static registerFunctionPlugin(plugin, translations) {
    _FunctionRegistry.FunctionRegistry.registerFunctionPlugin(plugin, translations);
  }
  /**
   * Unregisters all functions defined in given plugin.
   *
   * Note: This method does not affect the existing HyperFormula instances.
   *
   * @param {FunctionPluginDefinition} plugin - plugin class
   *
   * @example
   * ```js
   * // get the class of a plugin
   * const registeredPluginClass = HyperFormula.getFunctionPlugin('EXAMPLE');
   *
   * // unregister all functions defined in a plugin of ID 'EXAMPLE'
   * HyperFormula.unregisterFunctionPlugin(registeredPluginClass);
   * ```
   *
   * @category Static Methods
   */
  static unregisterFunctionPlugin(plugin) {
    _FunctionRegistry.FunctionRegistry.unregisterFunctionPlugin(plugin);
  }
  /**
   * Registers a function with a given id if such exists in a plugin.
   *
   * Note: This method does not affect the existing HyperFormula instances.
   *
   * @param {string} functionId - function id, e.g. 'SUMIF'
   * @param {FunctionPluginDefinition} plugin - plugin class
   * @param {FunctionTranslationsPackage} translations - translations for the function name
   *
   * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
   * @throws [[FunctionPluginValidationError]] when function with a given id does not exist in plugin or plugin class definition is not consistent with metadata
   * @throws [[ProtectedFunctionTranslationError]] when trying to register translation for protected function
   *
   * @example
   * ```js
   * // import your own plugin
   * import { MyExamplePlugin } from './file_with_your_plugin';
   *
   * // register a function
   * HyperFormula.registerFunction('EXAMPLE', MyExamplePlugin);
   * ```
   *
   * @category Static Methods
   */
  static registerFunction(functionId, plugin, translations) {
    (0, _ArgumentSanitization.validateArgToType)(functionId, 'string', 'functionId');
    _FunctionRegistry.FunctionRegistry.registerFunction(functionId, plugin, translations);
  }
  /**
   * Unregisters a function with a given id.
   *
   * Note: This method does not affect the existing HyperFormula instances.
   *
   * @param {string} functionId - function id, e.g. 'SUMIF'
   *
   * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
   *
   * @example
   * ```js
   * // import your own plugin
   * import { MyExamplePlugin } from './file_with_your_plugin';
   *
   * // register a function
   * HyperFormula.registerFunction('EXAMPLE', MyExamplePlugin);
   *
   * // unregister a function
   * HyperFormula.unregisterFunction('EXAMPLE');
   * ```
   *
   * @category Static Methods
   */
  static unregisterFunction(functionId) {
    (0, _ArgumentSanitization.validateArgToType)(functionId, 'string', 'functionId');
    _FunctionRegistry.FunctionRegistry.unregisterFunction(functionId);
  }
  /**
   * Clears function registry.
   *
   * Note: This method does not affect the existing HyperFormula instances.
   *
   * @example
   * ```js
   * HyperFormula.unregisterAllFunctions();
   * ```
   *
   * @category Static Methods
   */
  static unregisterAllFunctions() {
    _FunctionRegistry.FunctionRegistry.unregisterAll();
  }
  /**
   * Returns translated names of all registered functions for a given language
   *
   * @param {string} code - language code
   *
   * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
   *
   * @example
   * ```js
   * // return a list of function names registered for enGB
   * const allNames = HyperFormula.getRegisteredFunctionNames('enGB');
   * ```
   *
   * @category Static Methods
   */
  static getRegisteredFunctionNames(code) {
    (0, _ArgumentSanitization.validateArgToType)(code, 'string', 'code');
    const functionIds = _FunctionRegistry.FunctionRegistry.getRegisteredFunctionIds();
    const language = this.getLanguage(code);
    return language.getFunctionTranslations(functionIds);
  }
  /**
   * Returns class of a plugin used by function with given id
   *
   * @param {string} functionId - id of a function, e.g. 'SUMIF'
   *
   * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
   *
   * @example
   * ```js
   * // import your own plugin
   * import { MyExamplePlugin } from './file_with_your_plugin';
   *
   * // register a plugin
   * HyperFormula.registerFunctionPlugin(MyExamplePlugin);
   *
   * // return the class of a given plugin
   * const myFunctionClass = HyperFormula.getFunctionPlugin('EXAMPLE');
   * ```
   *
   * @category Static Methods
   */
  static getFunctionPlugin(functionId) {
    (0, _ArgumentSanitization.validateArgToType)(functionId, 'string', 'functionId');
    return _FunctionRegistry.FunctionRegistry.getFunctionPlugin(functionId);
  }
  /**
   * Returns classes of all plugins registered in HyperFormula.
   *
   * @example
   * ```js
   * // return classes of all plugins
   * const allClasses = HyperFormula.getAllFunctionPlugins();
   * ```
   *
   * @category Static Methods
   */
  static getAllFunctionPlugins() {
    return _FunctionRegistry.FunctionRegistry.getPlugins();
  }
  static buildFromEngineState(engine) {
    return new HyperFormula(engine.config, engine.stats, engine.dependencyGraph, engine.columnSearch, engine.parser, engine.unparser, engine.cellContentParser, engine.evaluator, engine.lazilyTransformingAstService, engine.crudOperations, engine.exporter, engine.namedExpressions, engine.serialization, engine.functionRegistry);
  }
  /**
   * Returns the cell value of a given address.
   * Applies rounding and post-processing.
   *
   * @param {SimpleCellAddress} cellAddress - cell coordinates
   *
   * @throws [[ExpectedValueOfTypeError]] when cellAddress is of incorrect type
   * @throws [[NoSheetWithIdError]] when the given sheet ID does not exist
   * @throws [[EvaluationSuspendedError]] when the evaluation is suspended
   *
   * @example
   * ```js
   * const hfInstance = HyperFormula.buildFromArray([
   *  ['=SUM(1, 2, 3)', '2'],
   * ]);
   *
   * // get value of A1 cell, should be '6'
   * const A1Value = hfInstance.getCellValue({ sheet: 0, col: 0, row: 0 });
   *
   * // get value of B1 cell, should be '2'
   * const B1Value = hfInstance.getCellValue({ sheet: 0, col: 1, row: 0 });
   * ```
   *
   * @category Cells
   */
  getCellValue(cellAddress) {
    if (!(0, _Cell.isSimpleCellAddress)(cellAddress)) {
      throw new _errors.ExpectedValueOfTypeError('SimpleCellAddress', 'cellAddress');
    }
    this.ensureEvaluationIsNotSuspended();
    return this._serialization.getCellValue(cellAddress);
  }
  /**
   * Returns a normalized formula string from the cell of a given address or `undefined` for an address that does not exist and empty values.
   *
   * @param {SimpleCellAddress} cellAddress - cell coordinates
   *
   * @throws [[NoSheetWithIdError]] when the given sheet ID does not exist
   * @throws [[ExpectedValueOfTypeError]] when cellAddress is of incorrect type
   *
   * @example
   * ```js
   * const hfInstance = HyperFormula.buildFromArray([
   *  ['=SUM(1, 2, 3)', '0'],
   * ]);
   *
   * // should return a normalized A1 cell formula: '=SUM(1, 2, 3)'
   * const A1Formula = hfInstance.getCellFormula({ sheet: 0, col: 0, row: 0 });
   *
   * // should return a normalized B1 cell formula: 'undefined'
   * const B1Formula = hfInstance.getCellFormula({ sheet: 0, col: 1, row: 0 });
   * ```
   *
   * @category Cells
   */
  getCellFormula(cellAddress) {
    if (!(0, _Cell.isSimpleCellAddress)(cellAddress)) {
      throw new _errors.ExpectedValueOfTypeError('SimpleCellAddress', 'cellAddress');
    }
    return this._serialization.getCellFormula(cellAddress);
  }
  /**
   * Returns the `HYPERLINK` url for a cell of a given address or `undefined` for an address that does not exist or a cell that is not `HYPERLINK`
   *
   * @param {SimpleCellAddress} cellAddress - cell coordinates
   *
   * @throws [[NoSheetWithIdError]] when the given sheet ID does not exist
   * @throws [[ExpectedValueOfTypeError]] when cellAddress is of incorrect type
   *
   * @example
   * ```js
   * const hfInstance = HyperFormula.buildFromArray([
   *  ['=HYPERLINK("https://hyperformula.handsontable.com/", "HyperFormula")', '0'],
   * ]);
   *
   * // should return url of 'HYPERLINK': https://hyperformula.handsontable.com/
   * const A1Hyperlink = hfInstance.getCellHyperlink({ sheet: 0, col: 0, row: 0 });
   *
   * // should return 'undefined' for a cell that is not 'HYPERLINK'
   * const B1Hyperlink = hfInstance.getCellHyperlink({ sheet: 0, col: 1, row: 0 });
   * ```
   *
   * @category Cells
   */
  getCellHyperlink(cellAddress) {
    if (!(0, _Cell.isSimpleCellAddress)(cellAddress)) {
      throw new _errors.ExpectedValueOfTypeError('SimpleCellAddress', 'cellAddress');
    }
    this.ensureEvaluationIsNotSuspended();
    return this._serialization.getCellHyperlink(cellAddress);
  }
  /**
   * Returns [[RawCellContent]] with a serialized content of the cell of a given address: either a cell formula, an explicit value, or an error.
   *
   * @param {SimpleCellAddress} cellAddress - cell coordinates
   *
   * @throws [[NoSheetWithIdError]] when the given sheet ID does not exist
   * @throws [[EvaluationSuspendedError]] when the evaluation is suspended
   * @throws [[ExpectedValueOfTypeError]] when cellAddress is of incorrect type
   *
   * @example
   * ```js
   * const hfInstance = HyperFormula.buildFromArray([
   *  ['=SUM(1, 2, 3)', '0'],
   * ]);
   *
   * // should return serialized content of A1 cell: '=SUM(1, 2, 3)'
   * const cellA1Serialized = hfInstance.getCellSerialized({ sheet: 0, col: 0, row: 0 });
   *
   * // should return serialized content of B1 cell: '0'
   * const cellB1Serialized = hfInstance.getCellSerialized({ sheet: 0, col: 1, row: 0 });
   * ```
   *
   * @category Cells
   */
  getCellSerialized(cellAddress) {
    if (!(0, _Cell.isSimpleCellAddress)(cellAddress)) {
      throw new _errors.ExpectedValueOfTypeError('SimpleCellAddress', 'cellAddress');
    }
    this.ensureEvaluationIsNotSuspended();
    return this._serialization.getCellSerialized(cellAddress);
  }
  getCellSerializedImmutable(cellAddress) {
    if (!(0, _Cell.isSimpleCellAddress)(cellAddress)) {
      throw new _errors.ExpectedValueOfTypeError('SimpleCellAddress', 'cellAddress');
    }
    this.ensureEvaluationIsNotSuspended();
    return this._serialization.getCellSerializedImmutable(cellAddress);
  }
  /**
   * Returns an array of arrays of [[CellValue]] with values of all cells from [[Sheet]].
   * Applies rounding and post-processing.
   *
   * @param {number} sheetId - sheet ID number
   *
   * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
   * @throws [[NoSheetWithIdError]] when the given sheet ID does not exist
   * @throws [[EvaluationSuspendedError]] when the evaluation is suspended
   *
   * @example
   * ```js
   * const hfInstance = HyperFormula.buildFromArray([
   *  ['0', '=SUM(1, 2, 3)', '=A1'],
   *  ['1', '=TEXT(A2, "0.0%")', '=C1'],
   *  ['2', '=SUM(A1:C1)', '=C1'],
   * ]);
   *
   * // should return all values of a sheet: [[0, 6, 0], [1, '1.0%', 0], [2, 6, 0]]
   * const sheetValues = hfInstance.getSheetValues(0);
   * ```
   *
   * @category Sheets
   */
  getSheetValues(sheetId) {
    (0, _ArgumentSanitization.validateArgToType)(sheetId, 'number', 'sheetId');
    this.ensureEvaluationIsNotSuspended();
    return this._serialization.getSheetValues(sheetId);
  }
  /**
   * Returns an array with normalized formula strings from [[Sheet]] or `undefined` for a cells that have no value.
   *
   * @param {SimpleCellAddress} sheetId - sheet ID number
   *
   * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
   * @throws [[NoSheetWithIdError]] when the given sheet ID does not exist
   *
   * @example
   * ```js
   * const hfInstance = HyperFormula.buildFromArray([
   *  ['0', '=SUM(1, 2, 3)', '=A1'],
   *  ['1', '=TEXT(A2, "0.0%")', '=C1'],
   *  ['2', '=SUM(A1:C1)', '=C1'],
   * ]);
   *
   * // should return all formulas of a sheet:
   * // [
   * //  [undefined, '=SUM(1, 2, 3)', '=A1'],
   * //  [undefined, '=TEXT(A2, "0.0%")', '=C1'],
   * //  [undefined, '=SUM(A1:C1)', '=C1'],
   * // ];
   * const sheetFormulas = hfInstance.getSheetFormulas(0);
   * ```
   *
   * @category Sheets
   */
  getSheetFormulas(sheetId) {
    (0, _ArgumentSanitization.validateArgToType)(sheetId, 'number', 'sheetId');
    return this._serialization.getSheetFormulas(sheetId);
  }
  /**
   * Returns an array of arrays of [[RawCellContent]] with serialized content of cells from [[Sheet]], either a cell formula or an explicit value.
   *
   * @param {SimpleCellAddress} sheetId - sheet ID number
   *
   * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
   * @throws [[EvaluationSuspendedError]] when the evaluation is suspended
   * @throws [[NoSheetWithIdError]] when the given sheet ID does not exist
   *
   * @example
   * ```js
   * const hfInstance = HyperFormula.buildFromArray([
   *  ['0', '=SUM(1, 2, 3)', '=A1'],
   *  ['1', '=TEXT(A2, "0.0%")', '=C1'],
   *  ['2', '=SUM(A1:C1)', '=C1'],
   * ]);
   *
   * // should return:
   * // [
   * //  ['0', '=SUM(1, 2, 3)', '=A1'],
   * //  ['1', '=TEXT(A2, "0.0%")', '=C1'],
   * //  ['2', '=SUM(A1:C1)', '=C1'],
   * // ];
   * const serializedContent = hfInstance.getSheetSerialized(0);
   * ```
   *
   * @category Sheets
   */
  getSheetSerialized(sheetId) {
    (0, _ArgumentSanitization.validateArgToType)(sheetId, 'number', 'sheetId');
    this.ensureEvaluationIsNotSuspended();
    return this._serialization.getSheetSerialized(sheetId);
  }
  /**
   * Returns a map containing dimensions of all sheets for the engine instance represented as a key-value pairs where keys are sheet IDs and dimensions are returned as numbers, width and height respectively.
   *
   * @throws [[NoSheetWithIdError]] when the given sheet ID does not exist
   *
   * @example
   * ```js
   * const hfInstance = HyperFormula.buildFromSheets({
   *   Sheet1: [
   *    ['1', '2', '=Sheet2!$A1'],
   *   ],
   *   Sheet2: [
   *    ['3'],
   *    ['4'],
   *   ],
   * });
   *
   * // should return the dimensions of all sheets:
   * // { Sheet1: { width: 3, height: 1 }, Sheet2: { width: 1, height: 2 } }
   * const allSheetsDimensions = hfInstance.getAllSheetsDimensions();
   * ```
   *
   * @category Sheets
   */
  getAllSheetsDimensions() {
    return this._serialization.genericAllSheetsGetter(arg => this.getSheetDimensions(arg));
  }
  /**
   * Returns dimensions of a specified sheet.
   * The sheet dimensions is represented with numbers: width and height.
   *
   * @param {number} sheetId - sheet ID number
   *
   * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
   * @throws [[NoSheetWithIdError]] when the given sheet ID does not exist
   *
   * @example
   * ```js
   * const hfInstance = HyperFormula.buildFromArray([
   *    ['1', '2', '=Sheet2!$A1'],
   * ]);
   *
   * // should return provided sheet's dimensions: { width: 3, height: 1 }
   * const sheetDimensions = hfInstance.getSheetDimensions(0);
   * ```
   *
   * @category Sheets
   */
  getSheetDimensions(sheetId) {
    (0, _ArgumentSanitization.validateArgToType)(sheetId, 'number', 'sheetId');
    return {
      width: this.dependencyGraph.getSheetWidth(sheetId),
      height: this.dependencyGraph.getSheetHeight(sheetId)
    };
  }
  /**
   * Returns values of all sheets in a form of an object which property keys are strings and values are 2D arrays of [[CellValue]].
   *
   * @throws [[EvaluationSuspendedError]] when the evaluation is suspended
   *
   * @example
   * ```js
   * const hfInstance = HyperFormula.buildFromArray([
   *  ['1', '=A1+10', '3'],
   * ]);
   *
   * // should return all sheets values: { Sheet1: [ [ 1, 11, 3 ] ] }
   * const allSheetsValues = hfInstance.getAllSheetsValues();
   * ```
   *
   * @category Sheets
   */
  getAllSheetsValues() {
    this.ensureEvaluationIsNotSuspended();
    return this._serialization.getAllSheetsValues();
  }
  /**
   * Returns formulas of all sheets in a form of an object which property keys are strings and values are 2D arrays of strings or possibly `undefined` when the call does not contain a formula.
   *
   * @example
   * ```js
   * const hfInstance = HyperFormula.buildFromArray([
   *  ['1', '2', '=A1+10'],
   * ]);
   *
   * // should return only formulas: { Sheet1: [ [ undefined, undefined, '=A1+10' ] ] }
   * const allSheetsFormulas = hfInstance.getAllSheetsFormulas();
   * ```
   * @category Sheets
   */
  getAllSheetsFormulas() {
    return this._serialization.getAllSheetsFormulas();
  }
  /**
   * Returns formulas or values of all sheets in a form of an object which property keys are strings and values are 2D arrays of [[RawCellContent]].
   *
   * @throws [[EvaluationSuspendedError]] when the evaluation is suspended
   *
   * @example
   * ```js
   * const hfInstance = HyperFormula.buildFromArray([
   *  ['1', '2', '=A1+10'],
   * ]);
   *
   * // should return all sheets serialized content: { Sheet1: [ [ 1, 2, '=A1+10' ] ] }
   * const allSheetsSerialized = hfInstance.getAllSheetsSerialized();
   * ```
   *
   * @category Sheets
   */
  getAllSheetsSerialized() {
    this.ensureEvaluationIsNotSuspended();
    return this._serialization.getAllSheetsSerialized();
  }
  /**
   * Updates the config with given new metadata. It is an expensive operation, as it might trigger rebuilding the engine and recalculation of all formulas.
   *
   * @param {Partial<ConfigParams>} newParams configuration options to be updated or added
   *
   * @throws [[ExpectedValueOfTypeError]] when some parameters of config are of wrong type (e.g. currencySymbol)
   * @throws [[ConfigValueEmpty]] when some parameters of config are of invalid value (e.g. currencySymbol)
   *
   * @example
   * ```js
   * const hfInstance = HyperFormula.buildFromArray([
   *  ['1', '2'],
   * ]);
   *
   * // add a config param, for example maxColumns,
   * // you can check the configuration with getConfig method
   * hfInstance.updateConfig({ maxColumns: 1000 });
   * ```
   *
   * @category Instance
   */
  updateConfig(newParams) {
    const isNewConfigTheSame = Object.entries(newParams).every(([key, value]) => this._config[key] === value);
    if (isNewConfigTheSame) {
      return;
    }
    this.rebuildWithConfig(newParams);
  }
  /**
   * Returns current configuration of the engine instance.
   *
   * @example
   * ```js
   * // should return all config metadata including default and those which were added
   * const hfConfig = hfInstance.getConfig();
   * ```
   *
   * @category Instance
   */
  getConfig() {
    return this._config.getConfig();
  }
  /**
   * Rebuilds the HyperFormula instance preserving the current sheets data.
   *
   * @example
   * ```js
   * hfInstance.rebuildAndRecalculate();
   * ```
   *
   * @category Instance
   */
  rebuildAndRecalculate() {
    this.rebuildWithConfig({});
  }
  /**
   * Returns a snapshot of computation time statistics.
   * It returns a map with key-value pairs where keys are enums for stat type and time (number).
   *
   * @internal
   *
   * @category Instance
   */
  getStats() {
    return this._stats.snapshot();
  }
  /**
   * Undo the previous operation.
   *
   * Note that this method may trigger dependency graph recalculation.
   *
   * @fires [[valuesUpdated]] if recalculation was triggered by this change
   *
   * @throws [[NoOperationToUndoError]] when there is no operation running that can be undone
   *
   * @example
   * ```js
   * const hfInstance = HyperFormula.buildFromArray([
   *  ['1', '2'],
   *  ['3', ''],
   * ]);
   *
   * // perform CRUD operation, for example remove the second row
   * hfInstance.removeRows(0, [1, 1]);
   *
   * // undo the operation, it should return the changes
   * const changes = hfInstance.undo();
   * ```
   *
   * @category Undo and Redo
   */
  undo() {
    this._crudOperations.undo();
    return this.recomputeIfDependencyGraphNeedsIt();
  }
  /**
   * Re-do recently undone operation.
   *
   * Note that this method may trigger dependency graph recalculation.
   *
   * @fires [[valuesUpdated]] if recalculation was triggered by this change
   *
   * @throws [[NoOperationToRedoError]] when there is no operation running that can be re-done
   *
   * @example
   * ```js
   * const hfInstance = HyperFormula.buildFromArray([
   *  ['1'],
   *  ['2'],
   *  ['3'],
   * ]);
   *
   * // perform CRUD operation, for example remove the second row
   * hfInstance.removeRows(0, [1, 1]);
   *
   * // undo the operation, it should return previous values: [['1'], ['2'], ['3']]
   * hfInstance.undo();
   *
   * // do a redo, it should return the values after removing the second row: [['1'], ['3']]
   * const changes = hfInstance.redo();
   * ```
   *
   * @category Undo and Redo
   */
  redo() {
    this._crudOperations.redo();
    return this.recomputeIfDependencyGraphNeedsIt();
  }
  /**
   * Checks if there is at least one operation that can be undone.
   *
   * @example
   * ```js
   * const hfInstance = HyperFormula.buildFromArray([
   *  ['1'],
   *  ['2'],
   *  ['3'],
   * ]);
   *
   * // perform CRUD operation, for example remove the second row
   * hfInstance.removeRows(0, [1, 1]);
   *
   * // should return 'true', it is possible to undo last operation
   * // which is removing rows in this example
   * const isSomethingToUndo = hfInstance.isThereSomethingToUndo();
   * ```
   *
   * @category Undo and Redo
   */
  isThereSomethingToUndo() {
    return this._crudOperations.isThereSomethingToUndo();
  }
  /**
   * Checks if there is at least one operation that can be re-done.
   *
   * @example
   * ```js
   * hfInstance.undo();
   *
   * // when there is an action to redo, this returns 'true'
   * const isSomethingToRedo = hfInstance.isThereSomethingToRedo();
   * ```
   *
   * @category Undo and Redo
   */
  isThereSomethingToRedo() {
    return this._crudOperations.isThereSomethingToRedo();
  }
  /**
   * Returns information whether it is possible to change the content in a rectangular area bounded by the box.
   * If returns `true`, doing [[setCellContents]] operation won't throw any errors.
   * Returns `false` if the address is invalid or the sheet does not exist.
   *
   * @param {SimpleCellAddress | SimpleCellRange} address - single cell or block of cells to check
   *
   * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
   * @throws [[SheetsNotEqual]] if range provided has distinct sheet numbers for start and end
   *
   * @example
   * ```js
   * const hfInstance = HyperFormula.buildFromArray([
   *  ['1', '2'],
   * ]);
   *
   * // top left corner
   * const address1 = { col: 0, row: 0, sheet: 0 };
   * // bottom right corner
   * const address2 = { col: 1, row: 0, sheet: 0 };
   *
   * // should return 'true' for this example, it is possible to set content of
   * // width 2, height 1 in the first row and column of sheet 0
   * const isSettable = hfInstance.isItPossibleToSetCellContents({ start: address1, end: address2 });
   * ```
   *
   * @category Cells
   */
  isItPossibleToSetCellContents(address) {
    let range;
    if ((0, _Cell.isSimpleCellAddress)(address)) {
      range = new _AbsoluteCellRange.AbsoluteCellRange(address, address);
    } else if ((0, _AbsoluteCellRange.isSimpleCellRange)(address)) {
      range = new _AbsoluteCellRange.AbsoluteCellRange(address.start, address.end);
    } else {
      throw new _errors.ExpectedValueOfTypeError('SimpleCellAddress | SimpleCellRange', 'address');
    }
    try {
      this._crudOperations.ensureRangeInSizeLimits(range);
      for (const it of range.addresses(this._dependencyGraph)) {
        this._crudOperations.ensureItIsPossibleToChangeContent(it);
      }
    } catch (e) {
      return false;
    }
    return true;
  }
  /**
   * Sets the content for a block of cells of a given coordinates.
   *
   * Note that this method may trigger dependency graph recalculation.
   *
   * @param {SimpleCellAddress} topLeftCornerAddress - top left corner of block of cells
   * @param {(RawCellContent[][]|RawCellContent)} cellContents - array with content
   *
   * @fires [[valuesUpdated]] if recalculation was triggered by this change
   *
   * @throws [[NoSheetWithIdError]] when the given sheet ID does not exist
   * @throws [[InvalidArgumentsError]] when the value is not an array of arrays or a raw cell value
   * @throws [[SheetSizeLimitExceededError]] when performing this operation would result in sheet size limits exceeding
   * @throws [[ExpectedValueOfTypeError]] if topLeftCornerAddress argument is of wrong type
   *
   * @example
   * ```js
   * const hfInstance = HyperFormula.buildFromArray([
   *  ['1', '2', '=A1'],
   * ]);
   *
   * // should set the content, returns:
   * // [{
   * //   address: { sheet: 0, col: 3, row: 0 },
   * //   newValue: 2,
   * // }]
   * const changes = hfInstance.setCellContents({ col: 3, row: 0, sheet: 0 }, [['=B1']]);
   * ```
   *
   * @category Cells
   */
  setCellContents(topLeftCornerAddress, cellContents) {
    this._crudOperations.setCellContents(topLeftCornerAddress, cellContents);
    return this.recomputeIfDependencyGraphNeedsIt();
  }
  /**
   * Reorders rows of a sheet according to a source-target mapping.
   *
   * Note that this method may trigger dependency graph recalculation.
   *
   * @param {number} sheetId - ID of a sheet to operate on
   * @param {[number, number][]} rowMapping - array mapping original positions to final positions of rows
   *
   * @fires [[valuesUpdated]] if recalculation was triggered by this change
   *
   * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
   * @throws [[NoSheetWithIdError]] when the given sheet ID does not exist
   * @throws [[InvalidArgumentsError]] when rowMapping does not define correct row permutation for some subset of rows of the given sheet
   * @throws [[SourceLocationHasArrayError]] when the selected position has array inside
   *
   * @example
   * ```js
   * const hfInstance = HyperFormula.buildFromArray([
   *  [1],
   *  [2],
   *  [4, 5],
   * ]);
   *
   * // should set swap rows 0 and 2 in place, returns:
   * // [{
   * //   address: { sheet: 0, col: 0, row: 2 },
   * //   newValue: 1,
   * // },
   * // {
   * //   address: { sheet: 0, col: 1, row: 2 },
   * //   newValue: null,
   * // },
   * // {
   * //   address: { sheet: 0, col: 0, row: 0 },
   * //   newValue: 4,
   * // },
   * // {
   * //   address: { sheet: 0, col: 1, row: 0 },
   * //   newValue: 5,
   * // }]
   * const changes = hfInstance.swapRowIndexes(0, [[0, 2], [2, 0]]);
   * ```
   *
   * @category Rows
   */
  swapRowIndexes(sheetId, rowMapping) {
    (0, _ArgumentSanitization.validateArgToType)(sheetId, 'number', 'sheetId');
    this._crudOperations.setRowOrder(sheetId, rowMapping);
    return this.recomputeIfDependencyGraphNeedsIt();
  }
  /**
   * Checks if it is possible to reorder rows of a sheet according to a source-target mapping.
   *
   * @param {number} sheetId - ID of a sheet to operate on
   * @param {[number, number][]} rowMapping - array mapping original positions to final positions of rows
   *
   * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
   *
   * @example
   * ```js
   * const hfInstance = HyperFormula.buildFromArray([
   *  [1],
   *  [2],
   *  [4, 5],
   * ]);
   *
   * // returns true
   * const isSwappable = hfInstance.isItPossibleToSwapRowIndexes(0, [[0, 2], [2, 0]]);
   *
   * // returns false
   * const isSwappable = hfInstance.isItPossibleToSwapRowIndexes(0, [[0, 1]]);
   * ```
   *
   * @category Rows
   */
  isItPossibleToSwapRowIndexes(sheetId, rowMapping) {
    (0, _ArgumentSanitization.validateArgToType)(sheetId, 'number', 'sheetId');
    try {
      this._crudOperations.validateSwapRowIndexes(sheetId, rowMapping);
      this._crudOperations.testRowOrderForArrays(sheetId, rowMapping);
      return true;
    } catch (e) {
      return false;
    }
  }
  /**
   * Reorders rows of a sheet according to a permutation of 0-based indexes.
   * Parameter `newRowOrder` should have a form `[ newPositionForRow0, newPositionForRow1, newPositionForRow2, ... ]`.
   * This method might be used to [sort the rows of a sheet](../../guide/sorting-data.md).
   *
   * Note: This method may trigger dependency graph recalculation.
   *
   * @param {number} sheetId - ID of a sheet to operate on
   * @param {number[]} newRowOrder - permutation of rows
   *
   * @fires [[valuesUpdated]] if recalculation was triggered by this change
   *
   * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
   * @throws [[NoSheetWithIdError]] when the given sheet ID does not exist
   * @throws [[InvalidArgumentsError]] when rowMapping does not define correct row permutation for some subset of rows of the given sheet
   * @throws [[SourceLocationHasArrayError]] when the selected position has array inside
   *
   * @example
   * ```js
   * const hfInstance = HyperFormula.buildFromArray([
   *  ['A'],
   *  ['B'],
   *  ['C'],
   *  ['D']
   * ]);
   *
   * const newRowOrder = [0, 3, 2, 1]; // [ newPosForA, newPosForB, newPosForC, newPosForD ]
   *
   * const changes = hfInstance.setRowOrder(0, newRowOrder);
   *
   * // Sheet after this operation: [['A'], ['D'], ['C'], ['B']]
   * ```
   *
   * @category Rows
   */
  setRowOrder(sheetId, newRowOrder) {
    (0, _ArgumentSanitization.validateArgToType)(sheetId, 'number', 'sheetId');
    const mapping = this._crudOperations.mappingFromOrder(sheetId, newRowOrder, 'row');
    return this.swapRowIndexes(sheetId, mapping);
  }
  /**
   * Checks if it is possible to reorder rows of a sheet according to a permutation.
   *
   * @param {number} sheetId - ID of a sheet to operate on
   * @param {number[]} newRowOrder - permutation of rows
   *
   * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
   *
   * @example
   * ```js
   * const hfInstance = HyperFormula.buildFromArray([
   *  [1],
   *  [2],
   *  [4, 5],
   * ]);
   *
   * // returns true
   * hfInstance.isItPossibleToSetRowOrder(0, [2, 1, 0]);
   *
   * // returns false
   * hfInstance.isItPossibleToSetRowOrder(0, [2]);
   * ```
   *
   * @category Rows
   */
  isItPossibleToSetRowOrder(sheetId, newRowOrder) {
    (0, _ArgumentSanitization.validateArgToType)(sheetId, 'number', 'sheetId');
    try {
      const rowMapping = this._crudOperations.mappingFromOrder(sheetId, newRowOrder, 'row');
      this._crudOperations.validateSwapRowIndexes(sheetId, rowMapping);
      this._crudOperations.testRowOrderForArrays(sheetId, rowMapping);
      return true;
    } catch (e) {
      return false;
    }
  }
  /**
   * Reorders columns of a sheet according to a source-target mapping.
   *
   * Note that this method may trigger dependency graph recalculation.
   *
   * @param {number} sheetId - ID of a sheet to operate on
   * @param {[number, number][]} columnMapping - array mapping original positions to final positions of columns
   *
   * @fires [[valuesUpdated]] if recalculation was triggered by this change
   *
   * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
   * @throws [[NoSheetWithIdError]] when the given sheet ID does not exist
   * @throws [[InvalidArgumentsError]] when columnMapping does not define correct column permutation for some subset of columns of the given sheet
   * @throws [[SourceLocationHasArrayError]] when the selected position has array inside
   *
   * @example
   * ```js
   * const hfInstance = HyperFormula.buildFromArray([
   *  [1, 2, 4],
   *  [5]
   * ]);
   *
   * // should set swap columns 0 and 2 in place, returns:
   * // [{
   * //   address: { sheet: 0, col: 2, row: 0 },
   * //   newValue: 1,
   * // },
   * // {
   * //   address: { sheet: 0, col: 2, row: 1 },
   * //   newValue: 5,
   * // },
   * // {
   * //   address: { sheet: 0, col: 0, row: 0 },
   * //   newValue: 4,
   * // },
   * // {
   * //   address: { sheet: 0, col: 0, row: 1 },
   * //   newValue: null,
   * // }]
   * const changes = hfInstance.swapColumnIndexes(0, [[0, 2], [2, 0]]);
   * ```
   *
   * @category Columns
   */
  swapColumnIndexes(sheetId, columnMapping) {
    (0, _ArgumentSanitization.validateArgToType)(sheetId, 'number', 'sheetId');
    this._crudOperations.setColumnOrder(sheetId, columnMapping);
    return this.recomputeIfDependencyGraphNeedsIt();
  }
  /**
   * Checks if it is possible to reorder columns of a sheet according to a source-target mapping.
   *
   * @fires [[valuesUpdated]] if recalculation was triggered by this change
   *
   * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
   * @example
   * ```js
   * const hfInstance = HyperFormula.buildFromArray([
   *  [1, 2, 4],
   *  [5]
   * ]);
   *
   * // returns true
   * hfInstance.isItPossibleToSwapColumnIndexes(0, [[0, 2], [2, 0]]);
   *
   * // returns false
   * hfInstance.isItPossibleToSwapColumnIndexes(0, [[0, 1]]);
   * ```
   *
   * @category Columns
   */
  isItPossibleToSwapColumnIndexes(sheetId, columnMapping) {
    (0, _ArgumentSanitization.validateArgToType)(sheetId, 'number', 'sheetId');
    try {
      this._crudOperations.validateSwapColumnIndexes(sheetId, columnMapping);
      this._crudOperations.testColumnOrderForArrays(sheetId, columnMapping);
      return true;
    } catch (e) {
      return false;
    }
  }
  /**
   * Reorders columns of a sheet according to a permutation of 0-based indexes.
   * Parameter `newColumnOrder` should have a form `[ newPositionForColumn0, newPositionForColumn1, newPositionForColumn2, ... ]`.
   * This method might be used to [sort the columns of a sheet](../../guide/sorting-data.md).
   *
   * Note: This method may trigger dependency graph recalculation.
   *
   * @param {number} sheetId - ID of a sheet to operate on
   * @param {number[]} newColumnOrder - permutation of columns
   *
   * @fires [[valuesUpdated]] if recalculation was triggered by this change
   *
   * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
   * @throws [[NoSheetWithIdError]] when the given sheet ID does not exist
   * @throws [[InvalidArgumentsError]] when columnMapping does not define correct column permutation for some subset of columns of the given sheet
   * @throws [[SourceLocationHasArrayError]] when the selected position has array inside
   *
   * @example
   * ```js
   * const hfInstance = HyperFormula.buildFromArray([
   *   ['A', 'B', 'C', 'D']
   * ]);
   *
   * const newColumnOrder = [0, 3, 2, 1]; // [ newPosForA, newPosForB, newPosForC, newPosForD ]
   *
   * const changes = hfInstance.setColumnOrder(0, newColumnOrder);
   *
   * // Sheet after this operation: [['A', 'D', 'C', 'B']]
   * ```
   *
   * @category Columns
   */
  setColumnOrder(sheetId, newColumnOrder) {
    (0, _ArgumentSanitization.validateArgToType)(sheetId, 'number', 'sheetId');
    const mapping = this._crudOperations.mappingFromOrder(sheetId, newColumnOrder, 'column');
    return this.swapColumnIndexes(sheetId, mapping);
  }
  /**
   * Checks if it is possible to reorder columns of a sheet according to a permutation.
   *
   * @param {number} sheetId - ID of a sheet to operate on
   * @param {number[]} newColumnOrder - permutation of columns
   *
   * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
   *
   * @example
   * ```js
   * const hfInstance = HyperFormula.buildFromArray([
   *  [1, 2, 4],
   *  [5]
   * ]);
   *
   * // returns true
   * hfInstance.isItPossibleToSetColumnOrder(0, [2, 1, 0]);
   *
   * // returns false
   * hfInstance.isItPossibleToSetColumnOrder(0, [1]);
   * ```
   *
   * @category Columns
   */
  isItPossibleToSetColumnOrder(sheetId, newColumnOrder) {
    (0, _ArgumentSanitization.validateArgToType)(sheetId, 'number', 'sheetId');
    try {
      const columnMapping = this._crudOperations.mappingFromOrder(sheetId, newColumnOrder, 'column');
      this._crudOperations.validateSwapColumnIndexes(sheetId, columnMapping);
      this._crudOperations.testColumnOrderForArrays(sheetId, columnMapping);
      return true;
    } catch (e) {
      return false;
    }
  }
  /**
   * Returns information whether it is possible to add rows into a specified position in a given sheet.
   * Checks against particular rules to ascertain that addRows can be called.
   * If returns `true`, doing [[addRows]] operation won't throw any errors.
   * Returns `false` if adding rows would exceed the sheet size limit or given arguments are invalid.
   *
   * @param {number} sheetId - sheet ID in which rows will be added
   * @param {ColumnRowIndex[]} indexes - non-contiguous indexes with format [row, amount], where row is a row number above which the rows will be added
   *
   * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
   *
   * @example
   * ```js
   * const hfInstance = HyperFormula.buildFromArray([
   *  ['1', '2', '3'],
   * ]);
   *
   * // should return 'true' for this example,
   * // it is possible to add one row in the second row of sheet 0
   * const isAddable = hfInstance.isItPossibleToAddRows(0, [1, 1]);
   * ```
   *
   * @category Rows
   */
  isItPossibleToAddRows(sheetId, ...indexes) {
    (0, _ArgumentSanitization.validateArgToType)(sheetId, 'number', 'sheetId');
    const normalizedIndexes = (0, _Operations.normalizeAddedIndexes)(indexes);
    try {
      this._crudOperations.ensureItIsPossibleToAddRows(sheetId, ...normalizedIndexes);
      return true;
    } catch (e) {
      return false;
    }
  }
  /**
   * Adds multiple rows into a specified position in a given sheet.
   * Does nothing if rows are outside effective sheet size.
   *
   * Note that this method may trigger dependency graph recalculation.
   *
   * @param {number} sheetId - sheet ID in which rows will be added
   * @param {ColumnRowIndex[]} indexes - non-contiguous indexes with format [row, amount], where row is a row number above which the rows will be added
   *
   * @fires [[valuesUpdated]] if recalculation was triggered by this change
   *
   * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
   * @throws [[NoSheetWithIdError]] when the given sheet ID does not exist
   * @throws [[SheetSizeLimitExceededError]] when performing this operation would result in sheet size limits exceeding
   *
   * @example
   * ```js
   * const hfInstance = HyperFormula.buildFromArray([
   *  ['1'],
   *  ['2'],
   * ]);
   *
   * // should return a list of cells which values changed after the operation,
   * // their absolute addresses and new values
   * const changes = hfInstance.addRows(0, [0, 1]);
   * ```
   *
   * @category Rows
   */
  addRows(sheetId, ...indexes) {
    (0, _ArgumentSanitization.validateArgToType)(sheetId, 'number', 'sheetId');
    this._crudOperations.addRows(sheetId, ...indexes);
    return this.recomputeIfDependencyGraphNeedsIt();
  }
  /**
   * Returns information whether it is possible to remove rows from a specified position in a given sheet.
   * Checks against particular rules to ascertain that removeRows can be called.
   * If returns `true`, doing [[removeRows]] operation won't throw any errors.
   * Returns `false` if given arguments are invalid.
   *
   * @param {number} sheetId - sheet ID from which rows will be removed
   * @param {ColumnRowIndex[]} indexes - non-contiguous indexes with format: [row, amount]
   *
   * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
   *
   * @example
   * ```js
   * const hfInstance = HyperFormula.buildFromArray([
   *  ['1'],
   *  ['2'],
   * ]);
   *
   * // should return 'true' for this example
   * // it is possible to remove one row from row 1 of sheet 0
   * const isRemovable = hfInstance.isItPossibleToRemoveRows(0, [1, 1]);
   * ```
   *
   * @category Rows
   */
  isItPossibleToRemoveRows(sheetId, ...indexes) {
    (0, _ArgumentSanitization.validateArgToType)(sheetId, 'number', 'sheetId');
    const normalizedIndexes = (0, _Operations.normalizeRemovedIndexes)(indexes);
    try {
      this._crudOperations.ensureItIsPossibleToRemoveRows(sheetId, ...normalizedIndexes);
      return true;
    } catch (e) {
      return false;
    }
  }
  /**
   * Removes multiple rows from a specified position in a given sheet.
   * Does nothing if rows are outside the effective sheet size.
   *
   * Note that this method may trigger dependency graph recalculation.
   *
   * @param {number} sheetId - sheet ID from which rows will be removed
   * @param {ColumnRowIndex[]} indexes - non-contiguous indexes with format: [row, amount]
   *
   * @fires [[valuesUpdated]] if recalculation was triggered by this change
   *
   * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
   * @throws [[InvalidArgumentsError]] when the given arguments are invalid
   * @throws [[NoSheetWithIdError]] when the given sheet ID does not exist
   *
   * @example
   * ```js
   * const hfInstance = HyperFormula.buildFromArray([
   *  ['1'],
   *  ['2'],
   * ]);
   *
   * // should return: [{ sheet: 0, col: 1, row: 2, value: null }] for this example
   * const changes = hfInstance.removeRows(0, [1, 1]);
   * ```
   *
   * @category Rows
   */
  removeRows(sheetId, ...indexes) {
    (0, _ArgumentSanitization.validateArgToType)(sheetId, 'number', 'sheetId');
    this._crudOperations.removeRows(sheetId, ...indexes);
    return this.recomputeIfDependencyGraphNeedsIt();
  }
  /**
   * Returns information whether it is possible to add columns into a specified position in a given sheet.
   * Checks against particular rules to ascertain that addColumns can be called.
   * If returns `true`, doing [[addColumns]] operation won't throw any errors.
   * Returns `false` if adding columns would exceed the sheet size limit or given arguments are invalid.
   *
   * @param {number} sheetId - sheet ID in which columns will be added
   * @param {ColumnRowIndex[]} indexes - non-contiguous indexes with format: [column, amount], where column is a column number from which new columns will be added
   *
   * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
   *
   * @example
   * ```js
   * const hfInstance = HyperFormula.buildFromArray([
   *  ['1', '2'],
   * ]);
   *
   * // should return 'true' for this example,
   * // it is possible to add 1 column in sheet 0, at column 1
   * const isAddable = hfInstance.isItPossibleToAddColumns(0, [1, 1]);
   * ```
   *
   * @category Columns
   */
  isItPossibleToAddColumns(sheetId, ...indexes) {
    (0, _ArgumentSanitization.validateArgToType)(sheetId, 'number', 'sheetId');
    const normalizedIndexes = (0, _Operations.normalizeAddedIndexes)(indexes);
    try {
      this._crudOperations.ensureItIsPossibleToAddColumns(sheetId, ...normalizedIndexes);
      return true;
    } catch (e) {
      return false;
    }
  }
  /**
   * Adds multiple columns into a specified position in a given sheet.
   * Does nothing if the columns are outside the effective sheet size.
   *
   * Note that this method may trigger dependency graph recalculation.
   *
   * @param {number} sheetId - sheet ID in which columns will be added
   * @param {ColumnRowIndex[]} indexes - non-contiguous indexes with format: [column, amount], where column is a column number from which new columns will be added
   *
   * @fires [[valuesUpdated]] if recalculation was triggered by this change
   *
   * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
   * @throws [[NoSheetWithIdError]] when the given sheet ID does not exist
   * @throws [[InvalidArgumentsError]] when the given arguments are invalid
   * @throws [[SheetSizeLimitExceededError]] when performing this operation would result in sheet size limits exceeding
   *
   * @example
   * ```js
   * const hfInstance = HyperFormula.buildFromArray([
   *  ['=RAND()', '42'],
   * ]);
   *
   * // should return a list of cells which values changed after the operation,
   * // their absolute addresses and new values, for this example:
   * // [{
   * //   address: { sheet: 0, col: 1, row: 0 },
   * //   newValue: 0.92754862796338,
   * // }]
   * const changes = hfInstance.addColumns(0, [0, 1]);
   * ```
   *
   * @category Columns
   */
  addColumns(sheetId, ...indexes) {
    (0, _ArgumentSanitization.validateArgToType)(sheetId, 'number', 'sheetId');
    this._crudOperations.addColumns(sheetId, ...indexes);
    return this.recomputeIfDependencyGraphNeedsIt();
  }
  /**
   * Returns information whether it is possible to remove columns from a specified position in a given sheet.
   * Checks against particular rules to ascertain that removeColumns can be called.
   * If returns `true`, doing [[removeColumns]] operation won't throw any errors.
   * Returns `false` if given arguments are invalid.
   *
   * @param {number} sheetId - sheet ID from which columns will be removed
   * @param {ColumnRowIndex[]} indexes - non-contiguous indexes with format [column, amount]
   *
   * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
   *
   * @example
   * ```js
   * const hfInstance = HyperFormula.buildFromArray([
   *  ['1', '2'],
   * ]);
   *
   * // should return 'true' for this example
   * // it is possible to remove one column, in place of the second column of sheet 0
   * const isRemovable = hfInstance.isItPossibleToRemoveColumns(0, [1, 1]);
   * ```
   *
   * @category Columns
   */
  isItPossibleToRemoveColumns(sheetId, ...indexes) {
    (0, _ArgumentSanitization.validateArgToType)(sheetId, 'number', 'sheetId');
    const normalizedIndexes = (0, _Operations.normalizeRemovedIndexes)(indexes);
    try {
      this._crudOperations.ensureItIsPossibleToRemoveColumns(sheetId, ...normalizedIndexes);
      return true;
    } catch (e) {
      return false;
    }
  }
  /**
   * Removes multiple columns from a specified position in a given sheet.
   * Does nothing if columns are outside the effective sheet size.
   *
   * Note that this method may trigger dependency graph recalculation.
   *
   * @param {number} sheetId - sheet ID from which columns will be removed
   * @param {ColumnRowIndex[]} indexes - non-contiguous indexes with format: [column, amount]
   *
   * @fires [[valuesUpdated]] if recalculation was triggered by this change
   *
   * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
   * @throws [[NoSheetWithIdError]] when the given sheet ID does not exist
   * @throws [[InvalidArgumentsError]] when the given arguments are invalid
   *
   * @example
   * ```js
   * const hfInstance = HyperFormula.buildFromArray([
   *  ['0', '=SUM(1, 2, 3)', '=A1'],
   * ]);
   *
   * // should return a list of cells which values changed after the operation,
   * // their absolute addresses and new values, in this example it will return:
   * // [{
   * //   address: { sheet: 0, col: 1, row: 0 },
   * //   newValue: { error: [CellError], value: '#REF!' },
   * // }]
   * const changes = hfInstance.removeColumns(0, [0, 1]);
   * ```
   *
   * @category Columns
   */
  removeColumns(sheetId, ...indexes) {
    (0, _ArgumentSanitization.validateArgToType)(sheetId, 'number', 'sheetId');
    this._crudOperations.removeColumns(sheetId, ...indexes);
    return this.recomputeIfDependencyGraphNeedsIt();
  }
  /**
   * Returns information whether it is possible to move cells to a specified position in a given sheet.
   * Checks against particular rules to ascertain that moveCells can be called.
   * If returns `true`, doing [[moveCells]] operation won't throw any errors.
   * Returns `false` if the operation might be disrupted and causes side effects by the fact that there is an array inside the selected columns, the target location includes an array or the provided address is invalid.
   *
   * @param {SimpleCellRange} source - range for a moved block
   * @param {SimpleCellAddress} destinationLeftCorner - upper left address of the target cell block
   *
   * @throws [[ExpectedValueOfTypeError]] if destinationLeftCorner, source, or any of basic type arguments are of wrong type
   * @throws [[SheetsNotEqual]] if range provided has distinct sheet numbers for start and end
   *
   * @example
   * ```js
   * const hfInstance = HyperFormula.buildFromArray([
   *  ['1', '2'],
   * ]);
   *
   * // choose the coordinates and assign them to variables
   * const source = { sheet: 0, col: 1, row: 0 };
   * const destination = { sheet: 0, col: 3, row: 0 };
   *
   * // should return 'true' for this example
   * // it is possible to move a block of width 1 and height 1
   * // from the corner: column 1 and row 0 of sheet 0
   * // into destination corner: column 3, row 0 of sheet 0
   * const isMovable = hfInstance.isItPossibleToMoveCells({ start: source, end: source }, destination);
   * ```
   * @category Cells
   */
  isItPossibleToMoveCells(source, destinationLeftCorner) {
    if (!(0, _Cell.isSimpleCellAddress)(destinationLeftCorner)) {
      throw new _errors.ExpectedValueOfTypeError('SimpleCellAddress', 'destinationLeftCorner');
    }
    if (!(0, _AbsoluteCellRange.isSimpleCellRange)(source)) {
      throw new _errors.ExpectedValueOfTypeError('SimpleCellRange', 'source');
    }
    try {
      const range = new _AbsoluteCellRange.AbsoluteCellRange(source.start, source.end);
      this._crudOperations.operations.ensureItIsPossibleToMoveCells(range.start, range.width(), range.height(), destinationLeftCorner);
      return true;
    } catch (e) {
      return false;
    }
  }
  /**
   * Moves the content of a cell block from source to the target location.
   *
   * Note that this method may trigger dependency graph recalculation.
   *
   * @param {SimpleCellRange} source - range for a moved block
   * @param {SimpleCellAddress} destinationLeftCorner - upper left address of the target cell block
   *
   * @fires [[valuesUpdated]] if recalculation was triggered by this change
   *
   * @throws [[NoSheetWithIdError]] when the given sheet ID does not exist
   * @throws [[ExpectedValueOfTypeError]] if destinationLeftCorner or source are of wrong type
   * @throws [[InvalidArgumentsError]] when the given arguments are invalid
   * @throws [[SheetSizeLimitExceededError]] when performing this operation would result in sheet size limits exceeding
   * @throws [[SourceLocationHasArrayError]] when the source location has array inside - array cannot be moved
   * @throws [[TargetLocationHasArrayError]] when the target location has array inside - cells cannot be replaced by the array
   * @throws [[SheetsNotEqual]] if range provided has distinct sheet numbers for start and end
   *
   * @example
   * ```js
   * const hfInstance = HyperFormula.buildFromArray([
   *  ['=RAND()', '42'],
   * ]);
   *
   * // choose the coordinates and assign them to variables
   * const source = { sheet: 0, col: 1, row: 0 };
   * const destination = { sheet: 0, col: 3, row: 0 };
   *
   * // should return a list of cells which values changed after the operation,
   * // their absolute addresses and new values, for this example:
   * // [{
   * //   address: { sheet: 0, col: 0, row: 0 },
   * //   newValue: 0.93524248002062,
   * // }]
   * const changes = hfInstance.moveCells({ start: source, end: source }, destination);
   * ```
   *
   * @category Cells
   */
  moveCells(source, destinationLeftCorner) {
    if (!(0, _Cell.isSimpleCellAddress)(destinationLeftCorner)) {
      throw new _errors.ExpectedValueOfTypeError('SimpleCellAddress', 'destinationLeftCorner');
    }
    if (!(0, _AbsoluteCellRange.isSimpleCellRange)(source)) {
      throw new _errors.ExpectedValueOfTypeError('SimpleCellRange', 'source');
    }
    const range = new _AbsoluteCellRange.AbsoluteCellRange(source.start, source.end);
    this._crudOperations.moveCells(range.start, range.width(), range.height(), destinationLeftCorner);
    return this.recomputeIfDependencyGraphNeedsIt();
  }
  /**
   * Returns information whether it is possible to move a particular number of rows to a specified position in a given sheet.
   * Checks against particular rules to ascertain that moveRows can be called.
   * If returns `true`, doing [[moveRows]] operation won't throw any errors.
   * Returns `false` if the operation might be disrupted and causes side effects by the fact that there is an array inside the selected rows, the target location includes an array or the provided address is invalid.
   *
   * @param {number} sheetId - a sheet number in which the operation will be performed
   * @param {number} startRow - number of the first row to move
   * @param {number} numberOfRows - number of rows to move
   * @param {number} targetRow - row number before which rows will be moved
   *
   * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
   *
   * @example
   * ```js
   * const hfInstance = HyperFormula.buildFromArray([
   *  ['1'],
   *  ['2'],
   * ]);
   *
   * // should return 'true' for this example
   * // it is possible to move one row from row 0 into row 2
   * const isMovable = hfInstance.isItPossibleToMoveRows(0, 0, 1, 2);
   * ```
   *
   * @category Rows
   */
  isItPossibleToMoveRows(sheetId, startRow, numberOfRows, targetRow) {
    (0, _ArgumentSanitization.validateArgToType)(sheetId, 'number', 'sheetId');
    (0, _ArgumentSanitization.validateArgToType)(startRow, 'number', 'startRow');
    (0, _ArgumentSanitization.validateArgToType)(numberOfRows, 'number', 'numberOfRows');
    (0, _ArgumentSanitization.validateArgToType)(targetRow, 'number', 'targetRow');
    try {
      this._crudOperations.ensureItIsPossibleToMoveRows(sheetId, startRow, numberOfRows, targetRow);
      return true;
    } catch (e) {
      return false;
    }
  }
  /**
   * Moves a particular number of rows to a specified position in a given sheet.
   *
   * Note that this method may trigger dependency graph recalculation.
   *
   * @param {number} sheetId - a sheet number in which the operation will be performed
   * @param {number} startRow - number of the first row to move
   * @param {number} numberOfRows - number of rows to move
   * @param {number} targetRow - row number before which rows will be moved
   *
   * @fires [[valuesUpdated]] if recalculation was triggered by this change
   *
   * @throws [[NoSheetWithIdError]] when the given sheet ID does not exist
   * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
   * @throws [[InvalidArgumentsError]] when the given arguments are invalid
   * @throws [[SourceLocationHasArrayError]] when the source location has array inside - array cannot be moved
   * @throws [[TargetLocationHasArrayError]] when the target location has array inside - cells cannot be replaced by the array
   *
   * @example
   * ```js
   * const hfInstance = HyperFormula.buildFromArray([
   *  ['1'],
   *  ['2'],
   * ]);
   *
   * // should return a list of cells which values changed after the operation,
   * // their absolute addresses and new values
   * const changes = hfInstance.moveRows(0, 0, 1, 2);
   * ```
   *
   * @category Rows
   */
  moveRows(sheetId, startRow, numberOfRows, targetRow) {
    (0, _ArgumentSanitization.validateArgToType)(sheetId, 'number', 'sheetId');
    (0, _ArgumentSanitization.validateArgToType)(startRow, 'number', 'startRow');
    (0, _ArgumentSanitization.validateArgToType)(numberOfRows, 'number', 'numberOfRows');
    (0, _ArgumentSanitization.validateArgToType)(targetRow, 'number', 'targetRow');
    this._crudOperations.moveRows(sheetId, startRow, numberOfRows, targetRow);
    return this.recomputeIfDependencyGraphNeedsIt();
  }
  /**
   * Returns information whether it is possible to move a particular number of columns to a specified position in a given sheet.
   * Checks against particular rules to ascertain that moveColumns can be called.
   * If returns `true`, doing [[moveColumns]] operation won't throw any errors.
   * Returns `false` if the operation might be disrupted and causes side effects by the fact that there is an array inside the selected columns, the target location includes an array or the provided address is invalid.
   *
   * @param {number} sheetId - a sheet number in which the operation will be performed
   * @param {number} startColumn - number of the first column to move
   * @param {number} numberOfColumns - number of columns to move
   * @param {number} targetColumn - column number before which columns will be moved
   *
   * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
   *
   * @example
   * ```js
   * const hfInstance = HyperFormula.buildFromArray([
   *  ['1', '2'],
   * ]);
   *
   * // should return 'true' for this example
   * // it is possible to move one column from column 1 into column 2 of sheet 0
   * const isMovable = hfInstance.isItPossibleToMoveColumns(0, 1, 1, 2);
   * ```
   *
   * @category Columns
   */
  isItPossibleToMoveColumns(sheetId, startColumn, numberOfColumns, targetColumn) {
    (0, _ArgumentSanitization.validateArgToType)(sheetId, 'number', 'sheetId');
    (0, _ArgumentSanitization.validateArgToType)(startColumn, 'number', 'startColumn');
    (0, _ArgumentSanitization.validateArgToType)(numberOfColumns, 'number', 'numberOfColumns');
    (0, _ArgumentSanitization.validateArgToType)(targetColumn, 'number', 'targetColumn');
    try {
      this._crudOperations.ensureItIsPossibleToMoveColumns(sheetId, startColumn, numberOfColumns, targetColumn);
      return true;
    } catch (e) {
      return false;
    }
  }
  /**
   * Moves a particular number of columns to a specified position in a given sheet.
   *
   * Note that this method may trigger dependency graph recalculation.
   *
   * @param {number} sheetId - a sheet number in which the operation will be performed
   * @param {number} startColumn - number of the first column to move
   * @param {number} numberOfColumns - number of columns to move
   * @param {number} targetColumn - column number before which columns will be moved
   *
   * @fires [[valuesUpdated]] if recalculation was triggered by this change
   *
   * @throws [[NoSheetWithIdError]] when the given sheet ID does not exist
   * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
   * @throws [[InvalidArgumentsError]] when the given arguments are invalid
   * @throws [[SourceLocationHasArrayError]] when the source location has array inside - array cannot be moved
   * @throws [[TargetLocationHasArrayError]] when the target location has array inside - cells cannot be replaced by the array
   *
   * @example
   * ```js
   * const hfInstance = HyperFormula.buildFromArray([
   *  ['1', '2', '3', '=RAND()', '=SUM(A1:C1)'],
   * ]);
   *
   * // should return a list of cells which values changed after the operation,
   * // their absolute addresses and new values, for this example:
   * // [{
   * //   address: { sheet: 0, col: 1, row: 0 },
   * //   newValue: 0.16210054671639,
   * //  }, {
   * //   address: { sheet: 0, col: 4, row: 0 },
   * //   newValue: 6.16210054671639,
   * // }]
   * const changes = hfInstance.moveColumns(0, 1, 1, 2);
   * ```
   *
   * @category Columns
   */
  moveColumns(sheetId, startColumn, numberOfColumns, targetColumn) {
    (0, _ArgumentSanitization.validateArgToType)(sheetId, 'number', 'sheetId');
    (0, _ArgumentSanitization.validateArgToType)(startColumn, 'number', 'startColumn');
    (0, _ArgumentSanitization.validateArgToType)(numberOfColumns, 'number', 'numberOfColumns');
    (0, _ArgumentSanitization.validateArgToType)(targetColumn, 'number', 'targetColumn');
    this._crudOperations.moveColumns(sheetId, startColumn, numberOfColumns, targetColumn);
    return this.recomputeIfDependencyGraphNeedsIt();
  }
  /**
   * Stores a copy of the cell block in internal clipboard for the further paste.
   * Returns the copied values for use in external clipboard.
   *
   * @param {SimpleCellRange} source - rectangle range to copy
   *
   * @throws [[NoSheetWithIdError]] when the given sheet ID does not exist
   * @throws [[ExpectedValueOfTypeError]] if source is of wrong type
   * @throws [[SheetsNotEqual]] if range provided has distinct sheet numbers for start and end
   *
   * @example
   * ```js
   * const hfInstance = HyperFormula.buildFromArray([
   *   ['1', '2'],
   * ]);
   *
   * // it copies [ [ 2 ] ]
   * const clipboardContent = hfInstance.copy({
   *   start: { sheet: 0, col: 1, row: 0 },
   *   end: { sheet: 0, col: 1, row: 0 },
   * });
   * ```
   *
   * The usage of the internal clipboard is described thoroughly in the [Clipboard Operations guide](../../guide/clipboard-operations.md).
   *
   * @category Clipboard
   */
  copy(source) {
    if (!(0, _AbsoluteCellRange.isSimpleCellRange)(source)) {
      throw new _errors.ExpectedValueOfTypeError('SimpleCellRange', 'source');
    }
    const range = new _AbsoluteCellRange.AbsoluteCellRange(source.start, source.end);
    this._crudOperations.copy(range.start, range.width(), range.height());
    return this.getRangeValues(source);
  }
  /**
   * Stores information of the cell block in internal clipboard for further paste.
   * Calling [[paste]] right after this method is equivalent to call [[moveCells]].
   * Almost any CRUD operation called after this method will abort the cut operation.
   * Returns the cut values for use in external clipboard.
   *
   * @param {SimpleCellRange} source - rectangle range to cut
   *
   * @throws [[ExpectedValueOfTypeError]] if source is of wrong type
   * @throws [[SheetsNotEqual]] if range provided has distinct sheet numbers for start and end
   * @throws [[NoSheetWithIdError]] when the given sheet ID does not exist
   *
   * @example
   * ```js
   * const hfInstance = HyperFormula.buildFromArray([
   *   ['1', '2'],
   * ]);
   *
   * // returns the values that were cut: [ [ 1 ] ]
   * const clipboardContent = hfInstance.cut({
   *   start: { sheet: 0, col: 0, row: 0 },
   *   end: { sheet: 0, col: 0, row: 0 },
   * });
   * ```
   *
   * The usage of the internal clipboard is described thoroughly in the [Clipboard Operations guide](../../guide/clipboard-operations.md).
   *
   * @category Clipboard
   */
  cut(source) {
    if (!(0, _AbsoluteCellRange.isSimpleCellRange)(source)) {
      throw new _errors.ExpectedValueOfTypeError('SimpleCellRange', 'source');
    }
    const range = new _AbsoluteCellRange.AbsoluteCellRange(source.start, source.end);
    this._crudOperations.cut(range.start, range.width(), range.height());
    return this.getRangeValues(source);
  }
  /**
   * When called after [[copy]] it pastes copied values and formulas into a cell block.
   * When called after [[cut]] it performs [[moveCells]] operation into the cell block.
   * Does nothing if the clipboard is empty.
   *
   * Note that this method may trigger dependency graph recalculation.
   *
   * @param {SimpleCellAddress} targetLeftCorner - upper left address of the target cell block
   *
   * @fires [[valuesUpdated]] if recalculation was triggered by this change
   *
   * @throws [[NoSheetWithIdError]] when the given sheet ID does not exist
   * @throws [[EvaluationSuspendedError]] when the evaluation is suspended
   * @throws [[SheetSizeLimitExceededError]] when performing this operation would result in sheet size limits exceeding
   * @throws [[NothingToPasteError]] when clipboard is empty
   * @throws [[TargetLocationHasArrayError]] when the selected target area has array inside
   * @throws [[ExpectedValueOfTypeError]] if targetLeftCorner is of wrong type
   *
   * @example
   * ```js
   * const hfInstance = HyperFormula.buildFromArray([
   *   ['1', '2'],
   * ]);
   *
   * // [ [ 2 ] ] was copied
   * const clipboardContent = hfInstance.copy({
   *   start: { sheet: 0, col: 1, row: 0 },
   *   end: { sheet: 0, col: 1, row: 0 },
   * });
   *
   * // returns a list of modified cells: their absolute addresses and new values
   * const changes = hfInstance.paste({ sheet: 0, col: 1, row: 0 });
   * ```
   *
   * The usage of the internal clipboard is described thoroughly in the [Clipboard Operations guide](../../guide/clipboard-operations.md).
   *
   * @category Clipboard
   */
  paste(targetLeftCorner) {
    if (!(0, _Cell.isSimpleCellAddress)(targetLeftCorner)) {
      throw new _errors.ExpectedValueOfTypeError('SimpleCellAddress', 'targetLeftCorner');
    }
    this.ensureEvaluationIsNotSuspended();
    this._crudOperations.paste(targetLeftCorner);
    return this.recomputeIfDependencyGraphNeedsIt();
  }
  /**
   * Returns information whether there is something in the clipboard.
   *
   * @example
   * ```js
   * const hfInstance = HyperFormula.buildFromArray([
   *  ['1', '2'],
   * ]);
   *
   * // copy desired content
   * const clipboardContent = hfInstance.copy({
   *   start: { sheet: 0, col: 1, row: 0 },
   *   end: { sheet: 0, col: 1, row: 0 },
   * });
   *
   * // returns 'false', there is content in the clipboard
   * const isClipboardEmpty = hfInstance.isClipboardEmpty();
   * ```
   *
   * The usage of the internal clipboard is described thoroughly in the [Clipboard Operations guide](../../guide/clipboard-operations.md).
   *
   * @category Clipboard
   */
  isClipboardEmpty() {
    return this._crudOperations.isClipboardEmpty();
  }
  /**
   * Clears the clipboard content.
   *
   * @example
   * ```js
   * // clears the clipboard, isClipboardEmpty() should return true if called afterwards
   * hfInstance.clearClipboard();
   * ```
   *
   * The usage of the internal clipboard is described thoroughly in the [Clipboard Operations guide](../../guide/clipboard-operations.md).
   *
   * @category Clipboard
   */
  clearClipboard() {
    this._crudOperations.clearClipboard();
  }
  /**
   * Clears the redo stack in undoRedo history.
   *
   * @example
   * ```js
   * const hfInstance = HyperFormula.buildFromArray([
   *   ['1', '2', '3'],
   * ]);
   *
   * // do an operation, for example remove columns
   * hfInstance.removeColumns(0, [0, 1]);
   *
   * // undo the operation
   * hfInstance.undo();
   *
   * // redo the operation
   * hfInstance.redo();
   *
   * // clear the redo stack
   * hfInstance.clearRedoStack();
   * ```
   *
   * @category Undo and Redo
   */
  clearRedoStack() {
    this._crudOperations.undoRedo.clearRedoStack();
  }
  /**
   * Clears the undo stack in undoRedo history.
   *
   * @example
   * ```js
   * const hfInstance = HyperFormula.buildFromArray([
   *   ['1', '2', '3'],
   * ]);
   *
   * // do an operation, for example remove columns
   * hfInstance.removeColumns(0, [0, 1]);
   *
   * // undo the operation
   * hfInstance.undo();
   *
   * // clear the undo stack
   * hfInstance.clearUndoStack();
   * ```
   *
   * @category Undo and Redo
   */
  clearUndoStack() {
    this._crudOperations.undoRedo.clearUndoStack();
  }
  /**
   * Returns the cell content of a given range in a [[CellValue]][][] format.
   *
   * @param {SimpleCellRange} source - rectangular range
   *
   * @throws [[ExpectedValueOfTypeError]] if source is of wrong type
   * @throws [[SheetsNotEqual]] if range provided has distinct sheet numbers for start and end
   * @throws [[NoSheetWithIdError]] when the given sheet ID does not exist
   *
   * @example
   * ```js
   * const hfInstance = HyperFormula.buildFromArray([
   *  ['=SUM(1, 2)', '2', '10'],
   *  ['5', '6', '7'],
   *  ['40', '30', '20'],
   * ]);
   *
   *
   * // returns calculated cells content: [ [ 3, 2 ], [ 5, 6 ] ]
   * const rangeValues = hfInstance.getRangeValues({ start: { sheet: 0, col: 0, row: 0 }, end: { sheet: 0, col: 1, row: 1 } });
   * ```
   *
   * @category Ranges
   */
  getRangeValues(source) {
    if (!(0, _AbsoluteCellRange.isSimpleCellRange)(source)) {
      throw new _errors.ExpectedValueOfTypeError('SimpleCellRange', 'source');
    }
    const cellRange = new _AbsoluteCellRange.AbsoluteCellRange(source.start, source.end);
    return cellRange.arrayOfAddressesInRange().map(subarray => subarray.map(address => this.getCellValue(address)));
  }
  /**
   * Returns cell formulas in given range.
   *
   * @param {SimpleCellRange} source - rectangular range
   *
   * @throws [[ExpectedValueOfTypeError]] if source is of wrong type
   * @throws [[SheetsNotEqual]] if range provided has distinct sheet numbers for start and end
   * @throws [[NoSheetWithIdError]] when the given sheet ID does not exist
   *
   * @example
   * ```js
   * const hfInstance = HyperFormula.buildFromArray([
   *  ['=SUM(1, 2)', '2', '10'],
   *  ['5', '6', '7'],
   *  ['40', '30', '20'],
   * ]);
   *
   * // returns cell formulas of a given range only:
   * // [ [ '=SUM(1, 2)', undefined ], [ undefined, undefined ] ]
   * const rangeFormulas = hfInstance.getRangeFormulas({ start: { sheet: 0, col: 0, row: 0 }, end: { sheet: 0, col: 1, row: 1 } });
   * ```
   *
   * @category Ranges
   */
  getRangeFormulas(source) {
    if (!(0, _AbsoluteCellRange.isSimpleCellRange)(source)) {
      throw new _errors.ExpectedValueOfTypeError('SimpleCellRange', 'source');
    }
    const cellRange = new _AbsoluteCellRange.AbsoluteCellRange(source.start, source.end);
    return cellRange.arrayOfAddressesInRange().map(subarray => subarray.map(address => this.getCellFormula(address)));
  }
  /**
   * Returns serialized cells in given range.
   *
   * @param {SimpleCellRange} source - rectangular range
   *
   * @throws [[ExpectedValueOfTypeError]] if source is of wrong type
   * @throws [[SheetsNotEqual]] if range provided has distinct sheet numbers for start and end
   * @throws [[NoSheetWithIdError]] when the given sheet ID does not exist
   *
   * @example
   * ```js
   * const hfInstance = HyperFormula.buildFromArray([
   *  ['=SUM(1, 2)', '2', '10'],
   *  ['5', '6', '7'],
   *  ['40', '30', '20'],
   * ]);
   *
   * // should return serialized cell content for the given range:
   * // [ [ '=SUM(1, 2)', 2 ], [ 5, 6 ] ]
   * const rangeSerialized = hfInstance.getRangeSerialized({ start: { sheet: 0, col: 0, row: 0 }, end: { sheet: 0, col: 1, row: 1 } });
   * ```
   *
   * @category Ranges
   */
  getRangeSerialized(source) {
    if (!(0, _AbsoluteCellRange.isSimpleCellRange)(source)) {
      throw new _errors.ExpectedValueOfTypeError('SimpleCellRange', 'source');
    }
    const cellRange = new _AbsoluteCellRange.AbsoluteCellRange(source.start, source.end);
    return cellRange.arrayOfAddressesInRange().map(subarray => subarray.map(address => this.getCellSerialized(address)));
  }
  getRangeSerializedImmutable(source) {
    if (!(0, _AbsoluteCellRange.isSimpleCellRange)(source)) {
      throw new _errors.ExpectedValueOfTypeError('SimpleCellRange', 'source');
    }
    const cellRange = new _AbsoluteCellRange.AbsoluteCellRange(source.start, source.end);
    return cellRange.arrayOfAddressesInRange().map(subarray => subarray.map(address => this.getCellSerializedImmutable(address)));
  }
  /**
   * Returns values to fill target range using source range, with properly extending the range using wrap-around heuristic.
   *
   * @param {SimpleCellRange} source of data
   * @param {SimpleCellRange} target range where data is intended to be put
   * @param {boolean} offsetsFromTarget if true, offsets are computed from target corner, otherwise from source corner
   *
   * @throws [[EvaluationSuspendedError]] when the evaluation is suspended
   * @throws [[ExpectedValueOfTypeError]] if source or target are of wrong type
   * @throws [[SheetsNotEqual]] if range provided has distinct sheet numbers for start and end
   *
   * @example
   * ```js
   * const hfInstance = HyperFormula.buildFromArray([[1, '=A1'], ['=$A$1', '2']]);
   *
   * // should return [['2', '=$A$1', '2'], ['=A3', 1, '=C3'], ['2', '=$A$1', '2']]
   * hfInstance.getFillRangeData( {start: {sheet: 0, row: 0, col: 0}, end: {sheet: 0, row: 1, col: 1}},
   * {start: {sheet: 0, row: 1, col: 1}, end: {sheet: 0, row: 3, col: 3}});
   * ```
   *
   * @category Ranges
   */
  getFillRangeData(source, target, offsetsFromTarget = false) {
    if (!(0, _AbsoluteCellRange.isSimpleCellRange)(source)) {
      throw new _errors.ExpectedValueOfTypeError('SimpleCellRange', 'source');
    }
    if (!(0, _AbsoluteCellRange.isSimpleCellRange)(target)) {
      throw new _errors.ExpectedValueOfTypeError('SimpleCellRange', 'target');
    }
    const sourceRange = new _AbsoluteCellRange.AbsoluteCellRange(source.start, source.end);
    const targetRange = new _AbsoluteCellRange.AbsoluteCellRange(target.start, target.end);
    this.ensureEvaluationIsNotSuspended();
    return targetRange.arrayOfAddressesInRange().map(subarray => subarray.map(address => {
      const row = ((address.row - (offsetsFromTarget ? target : source).start.row) % sourceRange.height() + sourceRange.height()) % sourceRange.height() + source.start.row;
      const col = ((address.col - (offsetsFromTarget ? target : source).start.col) % sourceRange.width() + sourceRange.width()) % sourceRange.width() + source.start.col;
      return this._serialization.getCellSerialized({
        row,
        col,
        sheet: sourceRange.sheet
      }, address);
    }));
  }
  /**
   * Returns information whether it is possible to add a sheet to the engine.
   * Checks against particular rules to ascertain that addSheet can be called.
   * If returns `true`, doing [[addSheet]] operation won't throw any errors, and it is possible to add sheet with provided name.
   * Returns `false` if the chosen name is already used.
   *
   * @param {string} sheetName - sheet name, case-insensitive
   *
   * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
   *
   * @example
   * ```js
   * const hfInstance = HyperFormula.buildFromSheets({
   *   MySheet1: [ ['1'] ],
   *   MySheet2: [ ['10'] ],
   * });
   *
   * // should return 'false' because 'MySheet2' already exists
   * const isAddable = hfInstance.isItPossibleToAddSheet('MySheet2');
   * ```
   *
   * @category Sheets
   */
  isItPossibleToAddSheet(sheetName) {
    (0, _ArgumentSanitization.validateArgToType)(sheetName, 'string', 'sheetName');
    try {
      this._crudOperations.ensureItIsPossibleToAddSheet(sheetName);
      return true;
    } catch (e) {
      return false;
    }
  }
  /**
   * Adds a new sheet to the HyperFormula instance. Returns given or autogenerated name of a new sheet.
   *
   * @param {string} [sheetName] - if not specified, name is autogenerated
   *
   * @fires [[sheetAdded]] after the sheet was added
   *
   * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
   * @throws [[SheetNameAlreadyTakenError]] when sheet with a given name already exists
   *
   * @example
   * ```js
   * const hfInstance = HyperFormula.buildFromSheets({
   *  MySheet1: [ ['1'] ],
   *  MySheet2: [ ['10'] ],
   * });
   *
   * // should return 'MySheet3'
   * const nameProvided = hfInstance.addSheet('MySheet3');
   *
   * // should return autogenerated 'Sheet4'
   * // because no name was provided and 3 other ones already exist
   * const generatedName = hfInstance.addSheet();
   * ```
   *
   * @category Sheets
   */
  addSheet(sheetName) {
    if (sheetName !== undefined) {
      (0, _ArgumentSanitization.validateArgToType)(sheetName, 'string', 'sheetName');
    }
    const addedSheetName = this._crudOperations.addSheet(sheetName);
    this._emitter.emit(_Emitter.Events.SheetAdded, addedSheetName);
    return addedSheetName;
  }
  /**
   * Returns information whether it is possible to remove sheet for the engine.
   * Returns `true` if the provided sheet exists, and therefore it can be removed, doing [[removeSheet]] operation won't throw any errors.
   * Returns `false` otherwise
   *
   * @param {number} sheetId - sheet ID.
   *
   * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
   *
   * @example
   * ```js
   * const hfInstance = HyperFormula.buildFromSheets({
   *  MySheet1: [ ['1'] ],
   *  MySheet2: [ ['10'] ],
   * });
   *
   * // should return 'true' because sheet with ID 1 exists and is removable
   * const isRemovable = hfInstance.isItPossibleToRemoveSheet(1);
   * ```
   *
   * @category Sheets
   */
  isItPossibleToRemoveSheet(sheetId) {
    (0, _ArgumentSanitization.validateArgToType)(sheetId, 'number', 'sheetId');
    try {
      this._crudOperations.ensureScopeIdIsValid(sheetId);
      return true;
    } catch (e) {
      return false;
    }
  }
  /**
   * Removes a sheet
   *
   * Note that this method may trigger dependency graph recalculation.
   *
   * @param {number} sheetId - sheet ID.
   *
   * @fires [[sheetRemoved]] after the sheet was removed
   * @fires [[valuesUpdated]] if recalculation was triggered by this change
   *
   * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
   * @throws [[NoSheetWithIdError]] when the given sheet ID does not exist
   *
   * @example
   * ```js
   * const hfInstance = HyperFormula.buildFromSheets({
   *  MySheet1: [ ['=SUM(MySheet2!A1:A2)'] ],
   *  MySheet2: [ ['10'] ],
   * });
   *
   * // should return a list of cells which values changed after the operation,
   * // their absolute addresses and new values, in this example it will return:
   * // [{
   * //   address: { sheet: 0, col: 0, row: 0 },
   * //   newValue: { error: [CellError], value: '#REF!' },
   * // }]
   * const changes = hfInstance.removeSheet(1);
   * ```
   *
   * @category Sheets
   */
  removeSheet(sheetId) {
    (0, _ArgumentSanitization.validateArgToType)(sheetId, 'number', 'sheetId');
    const displayName = this.sheetMapping.getDisplayName(sheetId);
    this._crudOperations.removeSheet(sheetId);
    const changes = this.recomputeIfDependencyGraphNeedsIt();
    this._emitter.emit(_Emitter.Events.SheetRemoved, displayName, changes);
    return changes;
  }
  /**
   * Returns information whether it is possible to clear a specified sheet.
   * If returns `true`, doing [[clearSheet]] operation won't throw any errors, provided sheet exists and its content can be cleared.
   * Returns `false` otherwise
   *
   * @param {number} sheetId - sheet ID.
   *
   * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
   *
   * @example
   * ```js
   * const hfInstance = HyperFormula.buildFromSheets({
   *  MySheet1: [ ['1'] ],
   *  MySheet2: [ ['10'] ],
   * });
   *
   * // should return 'true' because 'MySheet2' exists and can be cleared
   * const isClearable = hfInstance.isItPossibleToClearSheet(1);
   * ```
   *
   * @category Sheets
   */
  isItPossibleToClearSheet(sheetId) {
    (0, _ArgumentSanitization.validateArgToType)(sheetId, 'number', 'sheetId');
    try {
      this._crudOperations.ensureScopeIdIsValid(sheetId);
      return true;
    } catch (e) {
      return false;
    }
  }
  /**
   * Clears the sheet content. Double-checks if the sheet exists.
   *
   * Note that this method may trigger dependency graph recalculation.
   *
   * @param {number} sheetId - sheet ID.
   *
   * @fires [[valuesUpdated]] if recalculation was triggered by this change
   *
   * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
   * @throws [[NoSheetWithIdError]] when the given sheet ID does not exist
   *
   * @example
   * ```js
   * const hfInstance = HyperFormula.buildFromSheets({
   *  MySheet1: [ ['=SUM(MySheet2!A1:A2)'] ],
   *  MySheet2: [ ['10'] ],
   * });
   *
   * // should return a list of cells which values changed after the operation,
   * // their absolute addresses and new values, in this example it will return:
   * // [{
   * //   address: { sheet: 0, col: 0, row: 0 },
   * //   newValue: 0,
   * // }]
   * const changes = hfInstance.clearSheet(0);
   * ```
   *
   * @category Sheets
   */
  clearSheet(sheetId) {
    (0, _ArgumentSanitization.validateArgToType)(sheetId, 'number', 'sheetId');
    this._crudOperations.clearSheet(sheetId);
    return this.recomputeIfDependencyGraphNeedsIt();
  }
  /**
   * Returns information whether it is possible to replace the sheet content.
   * If returns `true`, doing [[setSheetContent]] operation won't throw any errors, the provided sheet exists and then its content can be replaced.
   * Returns `false` otherwise
   *
   * @param {number} sheetId - sheet ID.
   * @param {RawCellContent[][]} values - array of new values
   *
   * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
   *
   * @example
   * ```js
   * const hfInstance = HyperFormula.buildFromSheets({
   *  MySheet1: [ ['1'] ],
   *  MySheet2: [ ['10'] ],
   * });
   *
   * // should return 'true' because sheet of ID 0 exists
   * // and the provided content can be placed in this sheet
   * const isReplaceable = hfInstance.isItPossibleToReplaceSheetContent(0, [['50'], ['60']]);
   * ```
   *
   * @category Sheets
   */
  isItPossibleToReplaceSheetContent(sheetId, values) {
    (0, _ArgumentSanitization.validateArgToType)(sheetId, 'number', 'sheetId');
    try {
      this._crudOperations.ensureScopeIdIsValid(sheetId);
      this._crudOperations.ensureItIsPossibleToChangeSheetContents(sheetId, values);
      return true;
    } catch (e) {
      return false;
    }
  }
  /**
   * Replaces the sheet content with new values.
   *
   * @param {number} sheetId - sheet ID.
   * @param {RawCellContent[][]} values - array of new values
   *
   * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
   * @throws [[NoSheetWithIdError]] when the given sheet ID does not exist
   * @throws [[InvalidArgumentsError]] when values argument is not an array of arrays
   *
   * @example
   * ```js
   * const hfInstance = HyperFormula.buildFromSheets({
   *  MySheet1: [ ['1'] ],
   *  MySheet2: [ ['10'] ],
   * });
   *
   * // should return a list of cells which values changed after the operation,
   * // their absolute addresses and new values
   * const changes = hfInstance.setSheetContent(0, [['50'], ['60']]);
   * ```
   *
   * @category Sheets
   */
  setSheetContent(sheetId, values) {
    (0, _ArgumentSanitization.validateArgToType)(sheetId, 'number', 'sheetId');
    this._crudOperations.setSheetContent(sheetId, values);
    return this.recomputeIfDependencyGraphNeedsIt();
  }
  /**
   * Computes simple (absolute) address of a cell address based on its string representation.
   * If sheet name is present in string representation but not present in the engine, returns `undefined`.
   *
   * @param {string} cellAddress - string representation of cell address in A1 notation
   * @param {number} sheetId - context used in case of missing sheet in the first argument
   *
   * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
   *
   * @example
   * ```js
   * const hfInstance = HyperFormula.buildEmpty();
   * hfInstance.addSheet('Sheet0'); //sheetId = 0
   *
   * // returns { sheet: 0, col: 0, row: 0 }
   * const simpleCellAddress = hfInstance.simpleCellAddressFromString('A1', 0);
   *
   * // returns { sheet: 0, col: 0, row: 5 }
   * const simpleCellAddressTwo = hfInstance.simpleCellAddressFromString('Sheet1!A6');
   *
   * // returns { sheet: 0, col: 0, row: 5 }
   * const simpleCellAddressTwo = hfInstance.simpleCellAddressFromString('Sheet1!$A$6');
   *
   * // returns 'undefined', as there's no 'Sheet 2' in the HyperFormula instance
   * const simpleCellAddressTwo = hfInstance.simpleCellAddressFromString('Sheet2!A6');
   * ```
   *
   * @category Helpers
   */
  simpleCellAddressFromString(cellAddress, sheetId) {
    (0, _ArgumentSanitization.validateArgToType)(cellAddress, 'string', 'cellAddress');
    (0, _ArgumentSanitization.validateArgToType)(sheetId, 'number', 'sheetId');
    return (0, _parser2.simpleCellAddressFromString)(this.sheetMapping.get, cellAddress, sheetId);
  }
  /**
   * Computes simple (absolute) address of a cell range based on its string representation.
   * If sheet name is present in string representation but not present in the engine, returns `undefined`.
   *
   * @param {string} cellRange - string representation of cell range in A1 notation
   * @param {number} sheetId - context used in case of missing sheet in the first argument
   *
   * @throws [[NoSheetWithIdError]] when the given sheet ID does not exist
   * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
   *
   * @example
   * ```js
   * const hfInstance = HyperFormula.buildEmpty();
   * hfInstance.addSheet('Sheet0'); //sheetId = 0
   *
   * // should return { start: { sheet: 0, col: 0, row: 0 }, end: { sheet: 0, col: 1, row: 0 } }
   * const simpleCellAddress = hfInstance.simpleCellRangeFromString('A1:A2', 0);
   * ```
   *
   * @category Helpers
   */
  simpleCellRangeFromString(cellRange, sheetId) {
    (0, _ArgumentSanitization.validateArgToType)(cellRange, 'string', 'cellRange');
    (0, _ArgumentSanitization.validateArgToType)(sheetId, 'number', 'sheetId');
    return (0, _parser2.simpleCellRangeFromString)(this.sheetMapping.get, cellRange, sheetId);
  }
  /**
   * Returns string representation of an absolute address in A1 notation or `undefined` if the sheet index is not present in the engine.
   *
   * @param {SimpleCellAddress} cellAddress - object representation of an absolute address
   * @param {number} sheetId - context used in case of missing sheet in the first argument
   *
   * @throws [[ExpectedValueOfTypeError]] if its arguments are of wrong type
   *
   * @example
   * ```js
   * const hfInstance = HyperFormula.buildEmpty();
   * hfInstance.addSheet('Sheet0'); //sheetId = 0
   *
   * // should return 'B2'
   * const A1Notation = hfInstance.simpleCellAddressToString({ sheet: 0, col: 1, row: 1 }, 0);
   * ```
   *
   * @category Helpers
   */
  simpleCellAddressToString(cellAddress, sheetId) {
    if (!(0, _Cell.isSimpleCellAddress)(cellAddress)) {
      throw new _errors.ExpectedValueOfTypeError('SimpleCellAddress', 'cellAddress');
    }
    (0, _ArgumentSanitization.validateArgToType)(sheetId, 'number', 'sheetId');
    return (0, _parser2.simpleCellAddressToString)(this.sheetMapping.fetchDisplayName, cellAddress, sheetId);
  }
  /**
   * Returns string representation of an absolute range in A1 notation or `undefined` if the sheet index is not present in the engine.
   *
   * @param {SimpleCellRange} cellRange - object representation of an absolute range
   * @param {number} sheetId - context used in case of missing sheet in the first argument
   *
   * @throws [[ExpectedValueOfTypeError]] if its arguments are of wrong type
   *
   * @example
   * ```js
   * const hfInstance = HyperFormula.buildEmpty();
   * hfInstance.addSheet('Sheet0'); //sheetId = 0
   * hfInstance.addSheet('Sheet1'); //sheetId = 1
   *
   * // should return 'B2:C2'
   * const A1Notation = hfInstance.simpleCellRangeToString({ start: { sheet: 0, col: 1, row: 1 }, end: { sheet: 0, col: 2, row: 1 } }, 0);
   *
   *  // should return 'Sheet1!B2:C2'
   * const another = hfInstance.simpleCellRangeToString({ start: { sheet: 1, col: 1, row: 1 }, end: { sheet: 1, col: 2, row: 1 } }, 0);
   * ```
   *
   * @category Helpers
   */
  simpleCellRangeToString(cellRange, sheetId) {
    if (!(0, _AbsoluteCellRange.isSimpleCellRange)(cellRange)) {
      throw new _errors.ExpectedValueOfTypeError('SimpleCellRange', 'cellRange');
    }
    (0, _ArgumentSanitization.validateArgToType)(sheetId, 'number', 'sheetId');
    return (0, _parser2.simpleCellRangeToString)(this.sheetMapping.fetchDisplayName, cellRange, sheetId);
  }
  /**
   * Returns all the out-neighbors in the [dependency graph](../../guide/dependency-graph.md) for a given cell address or range. Including:
   * - All cells with formulas that contain the given cell address or range
   * - Some of the ranges that contain the given cell address or range
   *
   * The exact result depends on the optimizations applied by the HyperFormula to the dependency graph, some of which are described in the section ["Optimizations for large ranges"](../../guide/dependency-graph.md#optimizations-for-large-ranges).
   *
   * @param {SimpleCellAddress | SimpleCellRange} address - object representation of an absolute address or range of addresses
   *
   * @throws [[ExpectedValueOfTypeError]] if address is not [[SimpleCellAddress]] or [[SimpleCellRange]]
   * @throws [[SheetsNotEqual]] if range provided has distinct sheet numbers for start and end
   * @throws [[NoSheetWithIdError]] when the given sheet ID does not exist
   *
   * @example
   * ```js
   * const hfInstance = HyperFormula.buildFromArray( [ ['1', '=A1', '=A1+B1'] ] );
   *
   * hfInstance.getCellDependents({ sheet: 0, col: 0, row: 0});
   * // returns [{ sheet: 0, col: 1, row: 0}, { sheet: 0, col: 2, row: 0}]
   * ```
   *
   * @category Helpers
   */
  getCellDependents(address) {
    let vertex;
    if ((0, _Cell.isSimpleCellAddress)(address)) {
      vertex = this._dependencyGraph.addressMapping.getCell(address);
    } else if ((0, _AbsoluteCellRange.isSimpleCellRange)(address)) {
      vertex = this._dependencyGraph.rangeMapping.getRange(address.start, address.end);
    } else {
      throw new _errors.ExpectedValueOfTypeError('SimpleCellAddress | SimpleCellRange', address);
    }
    if (vertex === undefined) {
      return [];
    }
    return this._dependencyGraph.getAdjacentNodesAddresses(vertex);
  }
  /**
   * Returns all the in-neighbors in the [dependency graph](../../guide/dependency-graph.md) for a given cell address or range. In particular:
   * - If the argument is a single cell, `getCellPrecedents()` returns all cells and ranges contained in that cell's formula.
   * - If the argument is a range of cells, `getCellPrecedents()` returns some of the cell addresses and smaller ranges contained in that range (but not all of them). The exact result depends on the optimizations applied by the HyperFormula to the dependency graph, some of which are described in the section ["Optimizations for large ranges"](../../guide/dependency-graph.md#optimizations-for-large-ranges).
   *
   * @param {SimpleCellAddress | SimpleCellRange} address - object representation of an absolute address or range of addresses
   *
   * @throws [[ExpectedValueOfTypeError]] if address is of wrong type
   *
   * @throws [[NoSheetWithIdError]] when the given sheet ID does not exist
   *
   * @example
   * ```js
   * const hfInstance = HyperFormula.buildFromArray( [ ['1', '=A1', '=A1+B1'] ] );
   *
   * hfInstance.getCellPrecedents({ sheet: 0, col: 2, row: 0});
   * // returns [{ sheet: 0, col: 0, row: 0}, { sheet: 0, col: 1, row: 0}]
   * ```
   *
   * @category Helpers
   */
  getCellPrecedents(address) {
    let vertex;
    if ((0, _Cell.isSimpleCellAddress)(address)) {
      vertex = this._dependencyGraph.addressMapping.getCell(address);
    } else if ((0, _AbsoluteCellRange.isSimpleCellRange)(address)) {
      vertex = this._dependencyGraph.rangeMapping.getRange(address.start, address.end);
    } else {
      throw new _errors.ExpectedValueOfTypeError('SimpleCellAddress | SimpleCellRange', address);
    }
    if (vertex === undefined) {
      return [];
    }
    return this._dependencyGraph.dependencyQueryAddresses(vertex);
  }
  /**
   * Returns a unique sheet name assigned to the sheet of a given ID or `undefined` if the there is no sheet with a given ID.
   *
   * @param {number} sheetId - ID of the sheet, for which we want to retrieve name
   *
   * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
   *
   * @example
   * ```js
   * const hfInstance = HyperFormula.buildFromSheets({
   *  MySheet1: [ ['1'] ],
   *  MySheet2: [ ['10'] ],
   * });
   *
   * // should return 'MySheet2' as this sheet is the second one
   * const sheetName = hfInstance.getSheetName(1);
   * ```
   *
   * @category Sheets
   */
  getSheetName(sheetId) {
    (0, _ArgumentSanitization.validateArgToType)(sheetId, 'number', 'sheetId');
    return this.sheetMapping.getDisplayName(sheetId);
  }
  /**
   * List all sheet names.
   * Returns an array of sheet names as strings.
   *
   * @example
   * ```js
   * const hfInstance = HyperFormula.buildFromSheets({
   *  MySheet1: [ ['1'] ],
   *  MySheet2: [ ['10'] ],
   * });
   *
   * // should return all sheets names: ['MySheet1', 'MySheet2']
   * const sheetNames = hfInstance.getSheetNames();
   * ```
   *
   * @category Sheets
   */
  getSheetNames() {
    return this.sheetMapping.sheetNames();
  }
  /**
   * Returns a unique sheet ID assigned to the sheet with a given name or `undefined` if the sheet does not exist.
   *
   * @param {string} sheetName - name of the sheet, for which we want to retrieve ID, case-insensitive.
   *
   * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
   *
   * @example
   * ```js
   * const hfInstance = HyperFormula.buildFromSheets({
   *   MySheet1: [ ['1'] ],
   *   MySheet2: [ ['10'] ],
   * });
   *
   * // should return '0' because 'MySheet1' is of ID '0'
   * const sheetID = hfInstance.getSheetId('MySheet1');
   * ```
   *
   * @category Sheets
   */
  getSheetId(sheetName) {
    (0, _ArgumentSanitization.validateArgToType)(sheetName, 'string', 'sheetName');
    return this.sheetMapping.get(sheetName);
  }
  /**
   * Returns `true` whether sheet with a given name exists. The method accepts sheet name to be checked.
   *
   * @param {string} sheetName - name of the sheet, case-insensitive.
   *
   * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
   *
   * @example
   * ```js
   * const hfInstance = HyperFormula.buildFromSheets({
   *   MySheet1: [ ['1'] ],
   *   MySheet2: [ ['10'] ],
   * });
   *
   * // should return 'true' since 'MySheet1' exists
   * const sheetExist = hfInstance.doesSheetExist('MySheet1');
   * ```
   *
   * @category Sheets
   */
  doesSheetExist(sheetName) {
    (0, _ArgumentSanitization.validateArgToType)(sheetName, 'string', 'sheetName');
    return this.sheetMapping.hasSheetWithName(sheetName);
  }
  /**
   * Returns the type of a cell at a given address.
   * The method accepts cell coordinates as object with column, row and sheet numbers.
   *
   * @param {SimpleCellAddress} cellAddress - cell coordinates
   *
   * @throws [[NoSheetWithIdError]] when the given sheet ID does not exist
   * @throws [[ExpectedValueOfTypeError]] if cellAddress is of wrong type
   *
   * @example
   * ```js
   * const hfInstance = HyperFormula.buildFromArray([
   *  ['=SUM(A2:A3)', '2'],
   * ]);
   *
   * // should return 'FORMULA', the cell of given coordinates is of this type
   * const cellA1Type = hfInstance.getCellType({ sheet: 0, col: 0, row: 0 });
   *
   * // should return 'VALUE', the cell of given coordinates is of this type
   * const cellB1Type = hfInstance.getCellType({ sheet: 0, col: 1, row: 0 });
   * ```
   *
   * @category Cells
   */
  getCellType(cellAddress) {
    if (!(0, _Cell.isSimpleCellAddress)(cellAddress)) {
      throw new _errors.ExpectedValueOfTypeError('SimpleCellAddress', 'cellAddress');
    }
    const vertex = this.dependencyGraph.getCell(cellAddress);
    return (0, _Cell.getCellType)(vertex, cellAddress);
  }
  /**
   * Returns `true` if the specified cell contains a simple value.
   * The method accepts cell coordinates as object with column, row and sheet numbers.
   *
   * @param {SimpleCellAddress} cellAddress - cell coordinates
   *
   * @throws [[NoSheetWithIdError]] when the given sheet ID does not exist
   * @throws [[ExpectedValueOfTypeError]] if cellAddress is of wrong type
   *
   * @example
   * ```js
   * const hfInstance = HyperFormula.buildFromArray([
   *  ['=SUM(A2:A3)', '2'],
   * ]);
   *
   * // should return 'true' since the selected cell contains a simple value
   * const isA1Simple = hfInstance.doesCellHaveSimpleValue({ sheet: 0, col: 0, row: 0 });
   *
   * // should return 'false' since the selected cell does not contain a simple value
   * const isB1Simple = hfInstance.doesCellHaveSimpleValue({ sheet: 0, col: 1, row: 0 });
   * ```
   *
   * @category Cells
   */
  doesCellHaveSimpleValue(cellAddress) {
    if (!(0, _Cell.isSimpleCellAddress)(cellAddress)) {
      throw new _errors.ExpectedValueOfTypeError('SimpleCellAddress', 'cellAddress');
    }
    return this.getCellType(cellAddress) === _Cell.CellType.VALUE;
  }
  /**
   * Returns `true` if the specified cell contains a formula.
   * The method accepts cell coordinates as object with column, row and sheet numbers.
   *
   * @param {SimpleCellAddress} cellAddress - cell coordinates
   *
   * @throws [[NoSheetWithIdError]] when the given sheet ID does not exist
   * @throws [[ExpectedValueOfTypeError]] if cellAddress is of wrong type
   *
   * @example
   * ```js
   * const hfInstance = HyperFormula.buildFromArray([
   *  ['=SUM(A2:A3)', '2'],
   * ]);
   *
   * // should return 'true' since the A1 cell contains a formula
   * const A1Formula = hfInstance.doesCellHaveFormula({ sheet: 0, col: 0, row: 0 });
   *
   * // should return 'false' since the B1 cell does not contain a formula
   * const B1NoFormula = hfInstance.doesCellHaveFormula({ sheet: 0, col: 1, row: 0 });
   * ```
   *
   * @category Cells
   */
  doesCellHaveFormula(cellAddress) {
    if (!(0, _Cell.isSimpleCellAddress)(cellAddress)) {
      throw new _errors.ExpectedValueOfTypeError('SimpleCellAddress', 'cellAddress');
    }
    const cellType = this.getCellType(cellAddress);
    return cellType === _Cell.CellType.FORMULA || cellType === _Cell.CellType.ARRAYFORMULA;
  }
  /**
   * Returns`true` if the specified cell is empty.
   * The method accepts cell coordinates as object with column, row and sheet numbers.
   *
   * @param {SimpleCellAddress} cellAddress - cell coordinates
   *
   * @throws [[NoSheetWithIdError]] when the given sheet ID does not exist
   * @throws [[ExpectedValueOfTypeError]] if cellAddress is of wrong type
   *
   * @example
   * ```js
   * const hfInstance = HyperFormula.buildFromArray([
   *   [null, '1'],
   * ]);
   *
   * // should return 'true', cell of provided coordinates is empty
   * const isEmpty = hfInstance.isCellEmpty({ sheet: 0, col: 0, row: 0 });
   *
   * // should return 'false', cell of provided coordinates is not empty
   * const isNotEmpty = hfInstance.isCellEmpty({ sheet: 0, col: 1, row: 0 });
   * ```
   *
   * @category Cells
   */
  isCellEmpty(cellAddress) {
    if (!(0, _Cell.isSimpleCellAddress)(cellAddress)) {
      throw new _errors.ExpectedValueOfTypeError('SimpleCellAddress', 'cellAddress');
    }
    return this.getCellType(cellAddress) === _Cell.CellType.EMPTY;
  }
  /**
   * Returns `true` if a given cell is a part of an array.
   * The method accepts cell coordinates as object with column, row and sheet numbers.
   *
   * @param {SimpleCellAddress} cellAddress - cell coordinates
   *
   * @throws [[NoSheetWithIdError]] when the given sheet ID does not exist
   * @throws [[ExpectedValueOfTypeError]] if cellAddress is of wrong type
   *
   * @example
   * ```js
   * const hfInstance = HyperFormula.buildFromArray([
   *    ['{=TRANSPOSE(B1:B1)}'],
   * ]);
   *
   * // should return 'true', cell of provided coordinates is a part of an array
   * const isPartOfArray = hfInstance.isCellPartOfArray({ sheet: 0, col: 0, row: 0 });
   * ```
   *
   * @category Cells
   */
  isCellPartOfArray(cellAddress) {
    if (!(0, _Cell.isSimpleCellAddress)(cellAddress)) {
      throw new _errors.ExpectedValueOfTypeError('SimpleCellAddress', 'cellAddress');
    }
    const cellType = this.getCellType(cellAddress);
    return cellType === _Cell.CellType.ARRAY || cellType === _Cell.CellType.ARRAYFORMULA;
  }
  /**
   * Returns type of the cell value of a given address.
   * The method accepts cell coordinates as object with column, row and sheet numbers.
   *
   * @param {SimpleCellAddress} cellAddress - cell coordinates
   *
   * @throws [[NoSheetWithIdError]] when the given sheet ID does not exist
   * @throws [[EvaluationSuspendedError]] when the evaluation is suspended
   * @throws [[ExpectedValueOfTypeError]] if cellAddress is of wrong type
   *
   * @example
   * ```js
   * const hfInstance = HyperFormula.buildFromArray([
   *  ['=SUM(1, 2, 3)', '2'],
   * ]);
   *
   * // should return 'NUMBER', cell value type of provided coordinates is a number
   * const cellValue = hfInstance.getCellValueType({ sheet: 0, col: 1, row: 0 });
   *
   * // should return 'NUMBER', cell value type of provided coordinates is a number
   * const cellValue = hfInstance.getCellValueType({ sheet: 0, col: 0, row: 0 });
   * ```
   *
   * @category Cells
   */
  getCellValueType(cellAddress) {
    if (!(0, _Cell.isSimpleCellAddress)(cellAddress)) {
      throw new _errors.ExpectedValueOfTypeError('SimpleCellAddress', 'cellAddress');
    }
    this.ensureEvaluationIsNotSuspended();
    const value = this.dependencyGraph.getCellValue(cellAddress);
    return (0, _Cell.getCellValueType)(value);
  }
  /**
   * Returns detailed type of the cell value of a given address.
   * The method accepts cell coordinates as object with column, row and sheet numbers.
   *
   * @param {SimpleCellAddress} cellAddress - cell coordinates
   *
   * @throws [[NoSheetWithIdError]] when the given sheet ID does not exist
   * @throws [[EvaluationSuspendedError]] when the evaluation is suspended
   * @throws [[ExpectedValueOfTypeError]] if cellAddress is of wrong type
   *
   * @example
   * ```js
   * const hfInstance = HyperFormula.buildFromArray([
   *  ['1%', '1$'],
   * ]);
   *
   * // should return 'NUMBER_PERCENT', cell value type of provided coordinates is a number with a format inference percent.
   * const cellType = hfInstance.getCellValueDetailedType({ sheet: 0, col: 0, row: 0 });
   *
   * // should return 'NUMBER_CURRENCY', cell value type of provided coordinates is a number with a format inference currency.
   * const cellType = hfInstance.getCellValueDetailedType({ sheet: 0, col: 1, row: 0 });
   * ```
   *
   * @category Cells
   */
  getCellValueDetailedType(cellAddress) {
    if (!(0, _Cell.isSimpleCellAddress)(cellAddress)) {
      throw new _errors.ExpectedValueOfTypeError('SimpleCellAddress', 'cellAddress');
    }
    this.ensureEvaluationIsNotSuspended();
    const value = this.dependencyGraph.getCellValue(cellAddress);
    return (0, _Cell.getCellValueDetailedType)(value);
  }
  /**
   * Returns auxiliary format information of the cell value of a given address.
   * The method accepts cell coordinates as object with column, row and sheet numbers.
   *
   * @param {SimpleCellAddress} cellAddress - cell coordinates
   *
   * @throws [[NoSheetWithIdError]] when the given sheet ID does not exist
   * @throws [[EvaluationSuspendedError]] when the evaluation is suspended
   * @throws [[ExpectedValueOfTypeError]] if cellAddress is of wrong type
   *
   * @example
   * ```js
   * const hfInstance = HyperFormula.buildFromArray([
   *  ['1$', '1'],
   * ]);
   *
   * // should return '$', cell value type of provided coordinates is a number with a format inference currency, parsed as using '$' as currency.
   * const cellFormat = hfInstance.getCellValueFormat({ sheet: 0, col: 0, row: 0 });
   *
   * // should return undefined, cell value type of provided coordinates is a number with no format information.
   * const cellFormat = hfInstance.getCellValueFormat({ sheet: 0, col: 1, row: 0 });
   * ```
   *
   * @category Cells
   */
  getCellValueFormat(cellAddress) {
    if (!(0, _Cell.isSimpleCellAddress)(cellAddress)) {
      throw new _errors.ExpectedValueOfTypeError('SimpleCellAddress', 'cellAddress');
    }
    this.ensureEvaluationIsNotSuspended();
    const value = this.dependencyGraph.getCellValue(cellAddress);
    return (0, _Cell.getCellValueFormat)(value);
  }
  /**
   * Returns the number of existing sheets.
   *
   * @example
   * ```js
   * const hfInstance = HyperFormula.buildFromArray([
   *  ['1', '2'],
   * ]);
   *
   * // should return the number of sheets which is '1'
   * const sheetsCount = hfInstance.countSheets();
   * ```
   *
   * @category Sheets
   */
  countSheets() {
    return this.sheetMapping.numberOfSheets();
  }
  /**
   * Returns information whether it is possible to rename sheet.
   * Returns `true` if the sheet with provided id exists and new name is available
   * Returns `false` if sheet cannot be renamed
   *
   * @param {number} sheetId - a sheet number
   * @param {string} newName - a name of the sheet to be given
   *
   * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
   *
   * @example
   * ```js
   * const hfInstance = HyperFormula.buildFromSheets({
   *   MySheet1: [ ['1'] ],
   *   MySheet2: [ ['10'] ],
   * });
   *
   * // returns true
   * hfInstance.isItPossibleToRenameSheet(0, 'MySheet0');
   * ```
   *
   * @category Sheets
   */
  isItPossibleToRenameSheet(sheetId, newName) {
    (0, _ArgumentSanitization.validateArgToType)(sheetId, 'number', 'sheetId');
    (0, _ArgumentSanitization.validateArgToType)(newName, 'string', 'newName');
    try {
      this._crudOperations.ensureItIsPossibleToRenameSheet(sheetId, newName);
      return true;
    } catch (e) {
      return false;
    }
  }
  /**
   * Renames a specified sheet.
   *
   * @param {number} sheetId - a sheet ID
   * @param {string} newName - a name of the sheet to be given, if is the same as the old one the method does nothing
   *
   * @fires [[sheetRenamed]] after the sheet was renamed
   *
   * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
   * @throws [[NoSheetWithIdError]] when the given sheet ID does not exist
   * @throws [[SheetNameAlreadyTakenError]] when the provided sheet name already exists
   *
   * @example
   * ```js
   * const hfInstance = HyperFormula.buildFromSheets({
   *   MySheet1: [ ['1'] ],
   *   MySheet2: [ ['10'] ],
   * });
   *
   * // renames the sheet 'MySheet1'
   * hfInstance.renameSheet(0, 'MySheet0');
   * ```
   *
   * @category Sheets
   */
  renameSheet(sheetId, newName) {
    (0, _ArgumentSanitization.validateArgToType)(sheetId, 'number', 'sheetId');
    (0, _ArgumentSanitization.validateArgToType)(newName, 'string', 'newName');
    const oldName = this._crudOperations.renameSheet(sheetId, newName);
    if (oldName !== undefined) {
      this._emitter.emit(_Emitter.Events.SheetRenamed, oldName, newName);
    }
  }
  /**
   * Runs multiple operations and recomputes formulas at the end.
   *
   * Note that this method may trigger dependency graph recalculation.
   *
   * @param {() => void} batchOperations - a function with operations to be performed
   *
   * @fires [[valuesUpdated]] if recalculation was triggered by this change
   * @fires [[evaluationSuspended]] always
   * @fires [[evaluationResumed]] after the recomputation of necessary values
   *
   * @example
   * ```js
   * const hfInstance = HyperFormula.buildFromSheets({
   *  MySheet1: [ ['1'] ],
   *  MySheet2: [ ['10'] ],
   * });
   *
   * // multiple operations in a single callback will trigger evaluation only once
   * // and only one set of changes is returned as a combined result of all
   * // the operations that were triggered within the callback
   * const changes = hfInstance.batch(() => {
   *  hfInstance.setCellContents({ col: 3, row: 0, sheet: 0 }, [['=B1']]);
   *  hfInstance.setCellContents({ col: 4, row: 0, sheet: 0 }, [['=A1']]);
   * });
   * ```
   *
   * @category Batch
   */
  batch(batchOperations) {
    this.suspendEvaluation();
    this._crudOperations.beginUndoRedoBatchMode();
    try {
      batchOperations();
    } catch (e) {
      this._crudOperations.commitUndoRedoBatchMode();
      this.resumeEvaluation();
      throw e;
    }
    this._crudOperations.commitUndoRedoBatchMode();
    return this.resumeEvaluation();
  }
  /**
   * Suspends the dependency graph recalculation.
   * It allows optimizing the performance.
   * With this method, multiple CRUD operations can be done without triggering recalculation after every operation.
   * Suspending evaluation should result in an overall faster calculation compared to recalculating after each operation separately.
   * To resume the evaluation use [[resumeEvaluation]].
   *
   * @fires [[evaluationSuspended]] always
   *
   * @example
   * ```js
   * const hfInstance = HyperFormula.buildFromSheets({
   *  MySheet1: [ ['1'] ],
   *  MySheet2: [ ['10'] ],
   * });
   *
   * // similar to batch() but operations are not within a callback,
   * // one method suspends the recalculation
   * // the second will resume calculations and return the changes
   *
   * // suspend the evaluation with this method
   * hfInstance.suspendEvaluation();
   *
   * // perform operations
   * hfInstance.setCellContents({ col: 3, row: 0, sheet: 0 }, [['=B1']]);
   * hfInstance.setSheetContent(1, [['50'], ['60']]);
   *
   * // use resumeEvaluation to resume
   * const changes = hfInstance.resumeEvaluation();
   * ```
   *
   * @category Batch
   */
  suspendEvaluation() {
    this._evaluationSuspended = true;
    this._emitter.emit(_Emitter.Events.EvaluationSuspended);
  }
  /**
   * Resumes the dependency graph recalculation that was suspended with [[suspendEvaluation]].
   * It also triggers the recalculation and returns changes that are a result of all batched operations.
   *
   * @fires [[valuesUpdated]] if recalculation was triggered by this change
   * @fires [[evaluationResumed]] after the recomputation of necessary values
   *
   * @example
   * ```js
   * const hfInstance = HyperFormula.buildFromSheets({
   *  MySheet1: [ ['1'] ],
   *  MySheet2: [ ['10'] ],
   * });
   *
   * // similar to batch() but operations are not within a callback,
   * // one method suspends the recalculation
   * // the second will resume calculations and return the changes
   *
   * // first, suspend the evaluation
   * hfInstance.suspendEvaluation();
   *
   * // perform operations
   * hfInstance.setCellContents({ col: 3, row: 0, sheet: 0 }, [['=B1']]);
   * hfInstance.setSheetContent(1, [['50'], ['60']]);
   *
   * // resume the evaluation
   * const changes = hfInstance.resumeEvaluation();
   * ```
   *
   * @category Batch
   */
  resumeEvaluation() {
    this._evaluationSuspended = false;
    const changes = this.recomputeIfDependencyGraphNeedsIt();
    this._emitter.emit(_Emitter.Events.EvaluationResumed, changes);
    return changes;
  }
  /**
   * Checks if the dependency graph recalculation process is suspended or not.
   *
   * @example
   * ```js
   * const hfInstance = HyperFormula.buildEmpty();
   *
   * // suspend the evaluation
   * hfInstance.suspendEvaluation();
   *
   * // between suspendEvaluation() and resumeEvaluation()
   * // or inside batch() callback it will return 'true', otherwise 'false'
   * const isEvaluationSuspended = hfInstance.isEvaluationSuspended();
   *
   * const changes = hfInstance.resumeEvaluation();
   * ```
   *
   * @category Batch
   */
  isEvaluationSuspended() {
    return this._evaluationSuspended;
  }
  /**
   * Returns information whether it is possible to add named expression into a specific scope.
   * Checks against particular rules to ascertain that addNamedExpression can be called.
   * If returns `true`, doing [[addNamedExpression]] operation won't throw any errors.
   * Returns `false` if the operation might be disrupted.
   *
   * @param {string} expressionName - a name of the expression to be added
   * @param {RawCellContent} expression - the expression
   * @param {number?} scope - scope definition, `sheetId` for local scope or `undefined` for global scope
   *
   * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
   *
   * @example
   * ```js
   * const hfInstance = HyperFormula.buildFromArray([
   *  ['42'],
   * ]);
   *
   * // should return 'true' for this example,
   * // it is possible to add named expression to global scope
   * const isAddable = hfInstance.isItPossibleToAddNamedExpression('prettyName', '=Sheet1!$A$1+100');
   * ```
   *
   * @category Named Expressions
   */
  isItPossibleToAddNamedExpression(expressionName, expression, scope) {
    (0, _ArgumentSanitization.validateArgToType)(expressionName, 'string', 'expressionName');
    if (scope !== undefined) {
      (0, _ArgumentSanitization.validateArgToType)(scope, 'number', 'scope');
    }
    try {
      this._crudOperations.ensureItIsPossibleToAddNamedExpression(expressionName, expression, scope);
      return true;
    } catch (e) {
      return false;
    }
  }
  /**
   * Adds a specified named expression.
   *
   * Note that this method may trigger dependency graph recalculation.
   *
   * @param {string} expressionName - a name of the expression to be added
   * @param {RawCellContent} expression - the expression
   * @param {number?} scope - scope definition, `sheetId` for local scope or `undefined` for global scope
   * @param {NamedExpressionOptions?} options - additional metadata related to named expression
   *
   * @fires [[namedExpressionAdded]] always, unless [[batch]] mode is used
   * @fires [[valuesUpdated]] if recalculation was triggered by this change
   *
   * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
   * @throws [[NamedExpressionNameIsAlreadyTakenError]] when the named-expression name is not available.
   * @throws [[NamedExpressionNameIsInvalidError]] when the named-expression name is not valid
   * @throws [[NoRelativeAddressesAllowedError]] when the named-expression formula contains relative references
   * @throws [[NoSheetWithIdError]] if no sheet with given sheetId exists
   *
   * @example
   * ```js
   * const hfInstance = HyperFormula.buildFromArray([
   *  ['42'],
   * ]);
   *
   * // add own expression, scope limited to 'Sheet1' (sheetId=0), the method should return a list of cells which values
   * // changed after the operation, their absolute addresses and new values
   * // for this example:
   * // [{
   * //   name: 'prettyName',
   * //   newValue: 142,
   * // }]
   * const changes = hfInstance.addNamedExpression('prettyName', '=Sheet1!$A$1+100', 0);
   * ```
   *
   * @category Named Expressions
   */
  addNamedExpression(expressionName, expression, scope, options) {
    (0, _ArgumentSanitization.validateArgToType)(expressionName, 'string', 'expressionName');
    if (scope !== undefined) {
      (0, _ArgumentSanitization.validateArgToType)(scope, 'number', 'scope');
    }
    this._crudOperations.addNamedExpression(expressionName, expression, scope, options);
    const changes = this.recomputeIfDependencyGraphNeedsIt();
    this._emitter.emit(_Emitter.Events.NamedExpressionAdded, expressionName, changes);
    return changes;
  }
  /**
   * Gets specified named expression value.
   * Returns a [[CellValue]] or undefined if the given named expression does not exist.
   *
   * @param {string} expressionName - expression name, case-insensitive.
   * @param {number?} scope - scope definition, `sheetId` for local scope or `undefined` for global scope
   *
   * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
   * @throws [[NoSheetWithIdError]] if no sheet with given sheetId exists
   *
   * @example
   * ```js
   * const hfInstance = HyperFormula.buildFromArray([
   *  ['42'],
   * ]);
   *
   * // add a named expression, only 'Sheet1' (sheetId=0) considered as it is the scope
   * hfInstance.addNamedExpression('prettyName', '=Sheet1!$A$1+100', 'Sheet1');
   *
   * // returns the calculated value of a passed named expression, '142' for this example
   * const myFormula = hfInstance.getNamedExpressionValue('prettyName', 'Sheet1');
   * ```
   *
   * @category Named Expressions
   */
  getNamedExpressionValue(expressionName, scope) {
    (0, _ArgumentSanitization.validateArgToType)(expressionName, 'string', 'expressionName');
    if (scope !== undefined) {
      (0, _ArgumentSanitization.validateArgToType)(scope, 'number', 'scope');
    }
    this.ensureEvaluationIsNotSuspended();
    this._crudOperations.ensureScopeIdIsValid(scope);
    const namedExpression = this._namedExpressions.namedExpressionForScope(expressionName, scope);
    if (namedExpression) {
      return this._serialization.getCellValue(namedExpression.address);
    } else {
      return undefined;
    }
  }
  /**
   * Returns a normalized formula string for given named expression, or `undefined` for a named expression that does not exist or does not hold a formula.
   *
   * @param {string} expressionName - expression name, case-insensitive.
   * @param {number?} scope - scope definition, `sheetId` for local scope or `undefined` for global scope
   *
   * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
   * @throws [[NoSheetWithIdError]] if no sheet with given sheetId exists
   *
   * @example
   * ```js
   * const hfInstance = HyperFormula.buildFromArray([
   *  ['42'],
   * ]);
   *
   * // add a named expression in 'Sheet1' (sheetId=0)
   * hfInstance.addNamedExpression('prettyName', '=Sheet1!$A$1+100', 0);
   *
   * // returns a normalized formula string corresponding to the passed name from 'Sheet1' (sheetId=0),
   * // '=Sheet1!A1+100' for this example
   * const myFormula = hfInstance.getNamedExpressionFormula('prettyName', 0);
   * ```
   *
   * @category Named Expressions
   */
  getNamedExpressionFormula(expressionName, scope) {
    (0, _ArgumentSanitization.validateArgToType)(expressionName, 'string', 'expressionName');
    if (scope !== undefined) {
      (0, _ArgumentSanitization.validateArgToType)(scope, 'number', 'scope');
    }
    this._crudOperations.ensureScopeIdIsValid(scope);
    const namedExpression = this._namedExpressions.namedExpressionForScope(expressionName, scope);
    if (namedExpression === undefined) {
      return undefined;
    } else {
      return this._serialization.getCellFormula(namedExpression.address);
    }
  }
  /**
   * Returns a named expression, or `undefined` for a named expression that does not exist or does not hold a formula.
   *
   * @param {string} expressionName - expression name, case-insensitive.
   * @param {number?} scope - scope definition, `sheetId` for local scope or `undefined` for global scope
   *
   * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
   * @throws [[NoSheetWithIdError]] if no sheet with given sheetId exists
   *
   * @example
   * ```js
   * const hfInstance = HyperFormula.buildFromArray([
   *  ['42'],
   * ]);
   *
   * // add a named expression in 'Sheet1' (sheetId=0)
   * hfInstance.addNamedExpression('prettyName', '=Sheet1!$A$1+100', 0);
   *
   * // returns a named expression that corresponds to the passed name from 'Sheet1' (sheetId=0)
   * // for this example, returns:
   * // {name: 'prettyName', expression: '=Sheet1!$A$1+100', options: undefined, scope: 0}
   * const myFormula = hfInstance.getNamedExpression('prettyName', 0);
   *
   * // for a named expression that doesn't exist, returns 'undefined':
   * const myFormulaTwo = hfInstance.getNamedExpression('uglyName', 0);
   * ```
   *
   * @category Named Expressions
   */
  getNamedExpression(expressionName, scope) {
    (0, _ArgumentSanitization.validateArgToType)(expressionName, 'string', 'expressionName');
    if (scope !== undefined) {
      (0, _ArgumentSanitization.validateArgToType)(scope, 'number', 'scope');
    }
    const namedExpression = this._namedExpressions.namedExpressionForScope(expressionName, scope);
    if (namedExpression === undefined) {
      return undefined;
    }
    const expression = this._serialization.getCellFormula(namedExpression.address);
    return {
      name: expressionName,
      scope: scope,
      expression: expression,
      options: namedExpression.options
    };
  }
  /**
   * Returns information whether it is possible to change named expression in a specific scope.
   * Checks against particular rules to ascertain that changeNamedExpression can be called.
   * If returns `true`, doing [[changeNamedExpression]] operation won't throw any errors.
   * Returns `false` if the operation might be disrupted.
   *
   * @param {string} expressionName - an expression name, case-insensitive.
   * @param {RawCellContent} newExpression - a new expression
   * @param {number?} scope - scope definition, `sheetId` for local scope or `undefined` for global scope
   *
   * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
   *
   * @example
   * ```js
   * const hfInstance = HyperFormula.buildFromArray([
   *  ['42'],
   * ]);
   *
   * // add a named expression
   * hfInstance.addNamedExpression('prettyName', '=Sheet1!$A$1+100');
   *
   * // should return 'true' for this example,
   * // it is possible to change named expression
   * const isAddable = hfInstance.isItPossibleToChangeNamedExpression('prettyName', '=Sheet1!$A$1+100');
   * ```
   *
   * @category Named Expressions
   */
  isItPossibleToChangeNamedExpression(expressionName, newExpression, scope) {
    (0, _ArgumentSanitization.validateArgToType)(expressionName, 'string', 'expressionName');
    if (scope !== undefined) {
      (0, _ArgumentSanitization.validateArgToType)(scope, 'number', 'scope');
    }
    try {
      this._crudOperations.ensureItIsPossibleToChangeNamedExpression(expressionName, newExpression, scope);
      return true;
    } catch (e) {
      return false;
    }
  }
  /**
   * Changes a given named expression to a specified formula.
   *
   * Note that this method may trigger dependency graph recalculation.
   *
   * @param {string} expressionName - an expression name, case-insensitive.
   * @param {RawCellContent} newExpression - a new expression
   * @param {number?} scope - scope definition, `sheetId` for local scope or `undefined` for global scope
   * @param {NamedExpressionOptions?} options - additional metadata related to named expression
   *
   * @fires [[valuesUpdated]] if recalculation was triggered by this change
   *
   * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
   * @throws [[NamedExpressionDoesNotExistError]] when the given expression does not exist.
   * @throws [[NoSheetWithIdError]] if no sheet with given sheetId exists
   * @throws [[ArrayFormulasNotSupportedError]] when the named expression formula is an array formula
   * @throws [[NoRelativeAddressesAllowedError]] when the named expression formula contains relative references
   *
   * @example
   * ```js
   * const hfInstance = HyperFormula.buildFromArray([
   *  ['42'],
   * ]);
   *
   * // add a named expression, scope limited to 'Sheet1' (sheetId=0)
   * hfInstance.addNamedExpression('prettyName', '=Sheet1!$A$1+100', 0);
   *
   * // change the named expression
   * const changes = hfInstance.changeNamedExpression('prettyName', '=Sheet1!$A$1+200');
   * ```
   *
   * @category Named Expressions
   */
  changeNamedExpression(expressionName, newExpression, scope, options) {
    (0, _ArgumentSanitization.validateArgToType)(expressionName, 'string', 'expressionName');
    if (scope !== undefined) {
      (0, _ArgumentSanitization.validateArgToType)(scope, 'number', 'scope');
    }
    this._crudOperations.changeNamedExpressionExpression(expressionName, scope, newExpression, options);
    return this.recomputeIfDependencyGraphNeedsIt();
  }
  /**
   * Returns information whether it is possible to remove named expression from a specific scope.
   * Checks against particular rules to ascertain that removeNamedExpression can be called.
   * If returns `true`, doing [[removeNamedExpression]] operation won't throw any errors.
   * Returns `false` if the operation might be disrupted.
   *
   * @param {string} expressionName - an expression name, case-insensitive.
   * @param {number?} scope - scope definition, `sheetId` for local scope or `undefined` for global scope
   *
   * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
   *
   * @example
   * ```js
   * const hfInstance = HyperFormula.buildFromArray([
   *  ['42'],
   * ]);
   *
   * // add a named expression
   * hfInstance.addNamedExpression('prettyName', '=Sheet1!$A$1+100');
   *
   * // should return 'true' for this example,
   * // it is possible to change named expression
   * const isAddable = hfInstance.isItPossibleToRemoveNamedExpression('prettyName');
   * ```
   *
   * @category Named Expressions
   */
  isItPossibleToRemoveNamedExpression(expressionName, scope) {
    (0, _ArgumentSanitization.validateArgToType)(expressionName, 'string', 'expressionName');
    if (scope !== undefined) {
      (0, _ArgumentSanitization.validateArgToType)(scope, 'number', 'scope');
    }
    try {
      this._crudOperations.isItPossibleToRemoveNamedExpression(expressionName, scope);
      return true;
    } catch (e) {
      return false;
    }
  }
  /**
   * Removes a named expression.
   *
   * Note that this method may trigger dependency graph recalculation.
   *
   * @param {string} expressionName - expression name, case-insensitive.
   * @param {number?} scope - scope definition, `sheetId` for local scope or `undefined` for global scope
   *
   * @fires [[namedExpressionRemoved]] after the expression was removed
   * @fires [[valuesUpdated]] if recalculation was triggered by this change
   *
   * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
   * @throws [[NamedExpressionDoesNotExistError]] when the given expression does not exist.
   * @throws [[NoSheetWithIdError]] if no sheet with given sheetId exists
   *
   * @example
   * ```js
   * const hfInstance = HyperFormula.buildFromArray([
   *  ['42'],
   * ]);
   *
   * // add a named expression
   * hfInstance.addNamedExpression('prettyName', '=Sheet1!$A$1+100', 0);
   *
   * // remove the named expression
   * const changes = hfInstance.removeNamedExpression('prettyName', 0);
   * ```
   *
   * @category Named Expressions
   */
  removeNamedExpression(expressionName, scope) {
    (0, _ArgumentSanitization.validateArgToType)(expressionName, 'string', 'expressionName');
    if (scope !== undefined) {
      (0, _ArgumentSanitization.validateArgToType)(scope, 'number', 'scope');
    }
    const removedNamedExpression = this._crudOperations.removeNamedExpression(expressionName, scope);
    if (removedNamedExpression) {
      const changes = this.recomputeIfDependencyGraphNeedsIt();
      this._emitter.emit(_Emitter.Events.NamedExpressionRemoved, removedNamedExpression.displayName, changes);
      return changes;
    } else {
      return []; // codecov note: this does not look possible - removeNamedExpression() will throw if the named expression cannot be found
    }
  }
  /**
   * Lists named expressions.
   * - If scope parameter is provided, returns an array of expression names defined for this scope.
   * - If scope parameter is undefined, returns an array of global expression names.
   *
   * @param {number?} scope - scope of the named expressions, `sheetId` for local scope or `undefined` for global scope
   *
   * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
   * @throws [[NoSheetWithIdError]] if no sheet with given sheetId exists
   *
   * @example
   * ```js
   * const hfInstance = HyperFormula.buildFromArray([
   *  ['42'],
   *  ['50'],
   *  ['60'],
   * ]);
   *
   * // add two named expressions and one scoped
   * hfInstance.addNamedExpression('prettyName', '=Sheet1!$A$1+100');
   * hfInstance.addNamedExpression('anotherPrettyName', '=Sheet1!$A$2+100');
   * hfInstance.addNamedExpression('alsoPrettyName', '=Sheet1!$A$3+100', 0);
   *
   * // list the expressions, should return: ['prettyName', 'anotherPrettyName'] for this example
   * const listOfExpressions = hfInstance.listNamedExpressions();
   *
   *  // list the expressions, should return: ['alsoPrettyName'] for this example
   * const listOfExpressions = hfInstance.listNamedExpressions(0);
   * ```
   *
   * @category Named Expressions
   */
  listNamedExpressions(scope) {
    if (scope !== undefined) {
      (0, _ArgumentSanitization.validateArgToType)(scope, 'number', 'scope');
    }
    this._crudOperations.ensureScopeIdIsValid(scope);
    return this._namedExpressions.getAllNamedExpressionsNamesInScope(scope);
  }
  /**
   * Returns all named expressions serialized.
   *
   * @example
   * ```js
   * const hfInstance = HyperFormula.buildFromArray([
   *  ['42'],
   *  ['50'],
   *  ['60'],
   * ]);
   *
   * // add two named expressions and one scoped
   * hfInstance.addNamedExpression('prettyName', '=Sheet1!$A$1+100');
   * hfInstance.addNamedExpression('anotherPrettyName', '=Sheet1!$A$2+100');
   * hfInstance.addNamedExpression('prettyName3', '=Sheet1!$A$3+100', 0);
   *
   * // get all expressions serialized
   * // should return:
   * // [
   * // {name: 'prettyName', expression: '=Sheet1!$A$1+100', options: undefined, scope: undefined},
   * // {name: 'anotherPrettyName', expression: '=Sheet1!$A$2+100', options: undefined, scope: undefined},
   * // {name: 'alsoPrettyName', expression: '=Sheet1!$A$3+100', options: undefined, scope: 0}
   * // ]
   * const allExpressions = hfInstance.getAllNamedExpressionsSerialized();
   * ```
   *
   * @category Named Expressions
   */
  getAllNamedExpressionsSerialized() {
    return this._serialization.getAllNamedExpressionsSerialized();
  }
  /**
   * Parses and then unparses a formula.
   * Returns a normalized formula (e.g. restores the original capitalization of sheet names, function names, cell addresses, and named expressions).
   *
   * @param {string} formulaString - a formula in a proper format - it must start with "="
   *
   * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
   * @throws [[NotAFormulaError]] when the provided string is not a valid formula, i.e. does not start with "="
   *
   * @example
   * ```js
   * const hfInstance = HyperFormula.buildFromArray([
   *  ['42'],
   *  ['50'],
   * ]);
   *
   * // returns '=Sheet1!$A$1+10'
   * const normalizedFormula = hfInstance.normalizeFormula('=SHEET1!$A$1+10');
   *
   * // returns '=3*$A$1'
   * const normalizedFormula = hfInstance.normalizeFormula('=3*$a$1');
   * ```
   *
   * @category Helpers
   */
  normalizeFormula(formulaString) {
    (0, _ArgumentSanitization.validateArgToType)(formulaString, 'string', 'formulaString');
    const {
      ast,
      address
    } = this.extractTemporaryFormula(formulaString);
    if (ast === undefined) {
      throw new _errors.NotAFormulaError();
    }
    return this._unparser.unparse(ast, address);
  }
  /**
   * Calculates fire-and-forget formula, returns the calculated value.
   *
   * @param {string} formulaString - A formula in a proper format, starting with `=`.
   * @param {number} sheetId - The ID of a sheet in context of which the formula gets evaluated.
   *
   * @throws [[ExpectedValueOfTypeError]] if any of its basic type arguments is of wrong type.
   * @throws [[NotAFormulaError]] when the provided string is not a valid formula (i.e. doesn't start with `=`).
   * @throws [[NoSheetWithIdError]] when the provided `sheetID` doesn't exist.
   *
   * @example
   * ```js
   * const hfInstance = HyperFormula.buildFromSheets({
   *  Sheet1: [['58']],
   *  Sheet2: [['1', '2', '3'], ['4', '5', '6']]
   * });
   *
   * // returns the calculated formula's value
   * // for this example, returns `68`
   * const calculatedFormula = hfInstance.calculateFormula('=A1+10', 0);
   *
   * // for this example, returns [['11', '12', '13'], ['14', '15', '16']]
   * const calculatedFormula = hfInstance.calculateFormula('=A1:B3+10', 1);
   * ```
   *
   * @category Helpers
   */
  calculateFormula(formulaString, sheetId) {
    (0, _ArgumentSanitization.validateArgToType)(formulaString, 'string', 'formulaString');
    (0, _ArgumentSanitization.validateArgToType)(sheetId, 'number', 'sheetId');
    this._crudOperations.ensureScopeIdIsValid(sheetId);
    const {
      ast,
      address,
      dependencies
    } = this.extractTemporaryFormula(formulaString, sheetId);
    if (ast === undefined) {
      throw new _errors.NotAFormulaError();
    }
    const internalCellValue = this.evaluator.runAndForget(ast, address, dependencies);
    return this._exporter.exportScalarOrRange(internalCellValue);
  }
  /**
   * Validates the formula.
   * If the provided string starts with "=" and is a parsable formula, the method returns `true`.
   * The validation is purely grammatical: the method doesn't verify if the formula can be calculated or not.
   *
   * @param {string} formulaString -  a formula in a proper format - it must start with "="
   *
   * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
   *
   * @example
   * ```js
   * // checks if the given string is a valid formula, should return 'true' for this example
   * const isFormula = hfInstance.validateFormula('=SUM(1, 2)');
   * ```
   *
   * @category Helpers
   */
  validateFormula(formulaString) {
    (0, _ArgumentSanitization.validateArgToType)(formulaString, 'string', 'formulaString');
    const {
      ast
    } = this.extractTemporaryFormula(formulaString);
    if (ast === undefined) {
      return false;
    }
    if (ast.type === _parser2.AstNodeType.ERROR && !ast.error) {
      return false; // codecov note: could not identify a formulaString that would cause this condition
    }

    return true;
  }
  /**
   * Returns translated names of all functions registered in this instance of HyperFormula
   * according to the language set in the configuration
   *
   * @example
   * ```js
   * const hfInstance = HyperFormula.buildEmpty();
   *
   * // return translated names of all functions, assign to a variable
   * const allNames = hfInstance.getRegisteredFunctionNames();
   * ```
   *
   * @category Custom Functions
   */
  getRegisteredFunctionNames() {
    const language = HyperFormula.getLanguage(this._config.language);
    return language.getFunctionTranslations(this._functionRegistry.getRegisteredFunctionIds());
  }
  /**
   * Returns class of a plugin used by function with given id
   *
   * @param {string} functionId - id of a function, e.g. 'SUMIF'
   *
   * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
   *
   * @example
   * ```js
   * // import your own plugin
   * import { MyExamplePlugin } from './file_with_your_plugin';
   *
   * const hfInstance = HyperFormula.buildEmpty();
   *
   * // register a plugin
   * HyperFormula.registerFunctionPlugin(MyExamplePlugin);
   *
   * // get the plugin
   * const myPlugin = hfInstance.getFunctionPlugin('EXAMPLE');
   * ```
   *
   * @category Custom Functions
   */
  getFunctionPlugin(functionId) {
    (0, _ArgumentSanitization.validateArgToType)(functionId, 'string', 'functionId');
    return this._functionRegistry.getFunctionPlugin(functionId);
  }
  /**
   * Returns classes of all plugins registered in this instance of HyperFormula
   *
   * @example
   * ```js
   * const hfInstance = HyperFormula.buildEmpty();
   *
   * // return classes of all plugins registered, assign to a variable
   * const allNames = hfInstance.getAllFunctionPlugins();
   * ```
   *
   * @category Custom Functions
   */
  getAllFunctionPlugins() {
    return this._functionRegistry.getPlugins();
  }
  /**
   * Interprets number as a date + time.
   *
   * @param {number} inputNumber - number of days since nullDate, should be non-negative, fractions are interpreted as hours/minutes/seconds.
   *
   * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
   *
   * @example
   * ```js
   * const hfInstance = HyperFormula.buildEmpty();
   *
   * // pass the number of days since nullDate
   * // the method should return formatted date and time, for this example:
   * // {year: 2020, month: 1, day: 15, hours: 2, minutes: 24, seconds: 0}
   * const dateTimeFromNumber = hfInstance.numberToDateTime(43845.1);
   *
   * ```
   *
   * @category Helpers
   */
  numberToDateTime(inputNumber) {
    (0, _ArgumentSanitization.validateArgToType)(inputNumber, 'number', 'val');
    return this._evaluator.interpreter.dateTimeHelper.numberToSimpleDateTime(inputNumber);
  }
  /**
   * Interprets number as a date.
   *
   * @param {number} inputNumber - number of days since nullDate, should be non-negative, fractions are ignored.
   *
   * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
   *
   * @example
   * ```js
   * const hfInstance = HyperFormula.buildEmpty();
   *
   * // pass the number of days since nullDate
   * // the method should return formatted date, for this example:
   * // {year: 2020, month: 1, day: 15}
   * const dateFromNumber = hfInstance.numberToDate(43845);
   * ```
   *
   * @category Helpers
   */
  numberToDate(inputNumber) {
    (0, _ArgumentSanitization.validateArgToType)(inputNumber, 'number', 'val');
    return this._evaluator.interpreter.dateTimeHelper.numberToSimpleDate(inputNumber);
  }
  /**
   * Interprets number as a time (hours/minutes/seconds).
   *
   * @param {number} inputNumber - time in 24h units.
   *
   * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
   *
   * @example
   * ```js
   * const hfInstance = HyperFormula.buildEmpty();
   *
   * // pass a number to be interpreted as a time
   * // should return {hours: 26, minutes: 24} for this example
   * const timeFromNumber = hfInstance.numberToTime(1.1);
   * ```
   *
   * @category Helpers
   */
  numberToTime(inputNumber) {
    (0, _ArgumentSanitization.validateArgToType)(inputNumber, 'number', 'val');
    return (0, _DateTimeHelper.numberToSimpleTime)(inputNumber);
  }
  /**
   * Subscribes to an event.
   * For the list of all available events, see [[Listeners]].
   *
   * @param {Event} event the name of the event to subscribe to
   * @param {Listener} listener to be called when event is emitted
   *
   * @example
   * ```js
   * const hfInstance = HyperFormula.buildEmpty();
   *
   * // subscribe to a 'sheetAdded', pass a simple handler
   * hfInstance.on('sheetAdded', ( ) => { console.log('foo') });
   *
   * // add a sheet to trigger an event,
   * // console should print 'foo' after each time sheet is added in this example
   * hfInstance.addSheet('FooBar');
   * ```
   *
   * @category Events
   */
  on(event, listener) {
    this._emitter.on(event, listener);
  }
  /**
   * Subscribes to an event once.
   * For the list of all available events, see [[Listeners]].
   *
   * @param {Event} event the name of the event to subscribe to
   * @param {Listener} listener to be called when event is emitted
   *
   * @example
   * ```js
   * const hfInstance = HyperFormula.buildEmpty();
   *
   * // subscribe to a 'sheetAdded', pass a simple handler
   * hfInstance.once('sheetAdded', ( ) => { console.log('foo') });
   *
   * // call addSheet twice,
   * // console should print 'foo' only once when the sheet is added in this example
   * hfInstance.addSheet('FooBar');
   * hfInstance.addSheet('FooBaz');
   * ```
   *
   * @category Events
   */
  once(event, listener) {
    this._emitter.once(event, listener);
  }
  /**
   * Unsubscribes from an event or from all events.
   * For the list of all available events, see [[Listeners]].
   *
   * @param {Event} event the name of the event to subscribe to
   * @param {Listener} listener to be called when event is emitted
   *
   * @example
   * ```js
   * const hfInstance = HyperFormula.buildEmpty();
   *
   * // define a simple function to be called upon emitting an event
   * const handler = ( ) => { console.log('baz') }
   *
   * // subscribe to a 'sheetAdded', pass the handler
   * hfInstance.on('sheetAdded', handler);
   *
   * // add a sheet to trigger an event,
   * // console should print 'baz' each time a sheet is added
   * hfInstance.addSheet('FooBar');
   *
   * // unsubscribe from a 'sheetAdded'
   * hfInstance.off('sheetAdded', handler);
   *
   * // add a sheet, the console should not print anything
   * hfInstance.addSheet('FooBaz');
   * ```
   *
   * @category Events
   */
  off(event, listener) {
    this._emitter.off(event, listener);
  }
  /**
   * Destroys instance of HyperFormula.
   *
   * @example
   * ```js
   * // destroys the instance
   * hfInstance.destroy();
   * ```
   *
   * @category Instance
   */
  destroy() {
    (0, _Destroy.objectDestroy)(this);
  }
  ensureEvaluationIsNotSuspended() {
    if (this._evaluationSuspended) {
      throw new _errors.EvaluationSuspendedError();
    }
  }
  extractTemporaryFormula(formulaString, sheetId = 1) {
    const parsedCellContent = this._cellContentParser.parse(formulaString);
    const address = {
      sheet: sheetId,
      col: 0,
      row: 0
    };
    if (!(parsedCellContent instanceof _CellContentParser.CellContent.Formula)) {
      return {
        address,
        dependencies: []
      };
    }
    const {
      ast,
      errors,
      dependencies
    } = this._parser.parse(parsedCellContent.formula, address);
    if (errors.length > 0) {
      return {
        address,
        dependencies: []
      };
    }
    return {
      ast,
      address,
      dependencies
    };
  }
  /**
   * Rebuilds the engine with new configuration.
   */
  rebuildWithConfig(newParams) {
    const newConfig = this._config.mergeConfig(newParams);
    const configNewLanguage = this._config.mergeConfig({
      language: newParams.language
    });
    const serializedSheets = this._serialization.withNewConfig(configNewLanguage, this._namedExpressions).getAllSheetsSerialized();
    const serializedNamedExpressions = this._serialization.getAllNamedExpressionsSerialized();
    const newEngine = _BuildEngineFactory.BuildEngineFactory.rebuildWithConfig(newConfig, serializedSheets, serializedNamedExpressions, this._stats);
    this._config = newEngine.config;
    this._stats = newEngine.stats;
    this._dependencyGraph = newEngine.dependencyGraph;
    this._columnSearch = newEngine.columnSearch;
    this._parser = newEngine.parser;
    this._unparser = newEngine.unparser;
    this._cellContentParser = newEngine.cellContentParser;
    this._evaluator = newEngine.evaluator;
    this._lazilyTransformingAstService = newEngine.lazilyTransformingAstService;
    this._crudOperations = newEngine.crudOperations;
    this._exporter = newEngine.exporter;
    this._namedExpressions = newEngine.namedExpressions;
    this._serialization = newEngine.serialization;
    this._functionRegistry = newEngine.functionRegistry;
  }
  /**
   * Runs a recomputation starting from recently changed vertices.
   *
   * Note that this method may trigger dependency graph recalculation.
   *
   * @fires [[valuesUpdated]] if recalculation was triggered by this change
   */
  recomputeIfDependencyGraphNeedsIt() {
    if (!this._evaluationSuspended) {
      const changes = this._crudOperations.getAndClearContentChanges();
      const verticesToRecomputeFrom = this.dependencyGraph.verticesToRecompute();
      this.dependencyGraph.clearDirtyVertices();
      if (verticesToRecomputeFrom.length > 0) {
        changes.addAll(this.evaluator.partialRun(verticesToRecomputeFrom));
      }
      const exportedChanges = changes.exportChanges(this._exporter);
      if (!changes.isEmpty()) {
        this._emitter.emit(_Emitter.Events.ValuesUpdated, exportedChanges);
      }
      return exportedChanges;
    } else {
      return [];
    }
  }
}
/**
 * Version of the HyperFormula.
 *
 * @category Static Properties
 */
exports.HyperFormula = HyperFormula;
HyperFormula.version = "2.6.0";
/**
 * Latest build date.
 *
 * @category Static Properties
 */
HyperFormula.buildDate = "18/12/2023 21:35:46";
/**
 * A release date.
 *
 * @category Static Properties
 */
HyperFormula.releaseDate = "19/09/2023";
/**
 * Contains all available languages to use in registerLanguage.
 *
 * @category Static Properties
 */
HyperFormula.languages = {};
HyperFormula.registeredLanguages = new Map();