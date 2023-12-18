"use strict";

exports.__esModule = true;
exports.default = void 0;
var _AbsoluteCellRange = require("./AbsoluteCellRange");
exports.AbsoluteCellRange = _AbsoluteCellRange.AbsoluteCellRange;
exports.AbsoluteColumnRange = _AbsoluteCellRange.AbsoluteColumnRange;
exports.AbsoluteRowRange = _AbsoluteCellRange.AbsoluteRowRange;
var _ArraySize = require("./ArraySize");
exports.ArraySize = _ArraySize.ArraySize;
var _Cell = require("./Cell");
exports.CellError = _Cell.CellError;
exports.CellType = _Cell.CellType;
exports.CellValueDetailedType = _Cell.CellValueDetailedType;
exports.CellValueType = _Cell.CellValueType;
exports.ErrorType = _Cell.ErrorType;
var _CellValue = require("./CellValue");
exports.DetailedCellError = _CellValue.DetailedCellError;
var _Config = require("./Config");
var _ChooseAddressMappingPolicy = require("./DependencyGraph/AddressMapping/ChooseAddressMappingPolicy");
exports.AlwaysDense = _ChooseAddressMappingPolicy.AlwaysDense;
exports.AlwaysSparse = _ChooseAddressMappingPolicy.AlwaysSparse;
exports.DenseSparseChooseBasedOnThreshold = _ChooseAddressMappingPolicy.DenseSparseChooseBasedOnThreshold;
var _DependencyGraph = require("./DependencyGraph");
exports.ImmutableAddressMapping = _DependencyGraph.ImmutableAddressMapping;
exports.AddressMapping = _DependencyGraph.AddressMapping;
exports.RangeMapping = _DependencyGraph.RangeMapping;
exports.RangeVertex = _DependencyGraph.RangeVertex;
var _errors = require("./errors");
exports.ConfigValueTooBigError = _errors.ConfigValueTooBigError;
exports.ConfigValueTooSmallError = _errors.ConfigValueTooSmallError;
exports.EvaluationSuspendedError = _errors.EvaluationSuspendedError;
exports.ExpectedOneOfValuesError = _errors.ExpectedOneOfValuesError;
exports.ExpectedValueOfTypeError = _errors.ExpectedValueOfTypeError;
exports.FunctionPluginValidationError = _errors.FunctionPluginValidationError;
exports.InvalidAddressError = _errors.InvalidAddressError;
exports.InvalidArgumentsError = _errors.InvalidArgumentsError;
exports.LanguageAlreadyRegisteredError = _errors.LanguageAlreadyRegisteredError;
exports.LanguageNotRegisteredError = _errors.LanguageNotRegisteredError;
exports.MissingTranslationError = _errors.MissingTranslationError;
exports.NamedExpressionDoesNotExistError = _errors.NamedExpressionDoesNotExistError;
exports.NamedExpressionNameIsAlreadyTakenError = _errors.NamedExpressionNameIsAlreadyTakenError;
exports.NamedExpressionNameIsInvalidError = _errors.NamedExpressionNameIsInvalidError;
exports.NoOperationToRedoError = _errors.NoOperationToRedoError;
exports.NoOperationToUndoError = _errors.NoOperationToUndoError;
exports.NoRelativeAddressesAllowedError = _errors.NoRelativeAddressesAllowedError;
exports.NoSheetWithIdError = _errors.NoSheetWithIdError;
exports.NoSheetWithNameError = _errors.NoSheetWithNameError;
exports.NotAFormulaError = _errors.NotAFormulaError;
exports.NothingToPasteError = _errors.NothingToPasteError;
exports.ProtectedFunctionTranslationError = _errors.ProtectedFunctionTranslationError;
exports.SheetNameAlreadyTakenError = _errors.SheetNameAlreadyTakenError;
exports.SheetSizeLimitExceededError = _errors.SheetSizeLimitExceededError;
exports.SourceLocationHasArrayError = _errors.SourceLocationHasArrayError;
exports.TargetLocationHasArrayError = _errors.TargetLocationHasArrayError;
exports.UnableToParseError = _errors.UnableToParseError;
var _Exporter = require("./Exporter");
exports.ExportedCellChange = _Exporter.ExportedCellChange;
exports.ExportedNamedExpressionChange = _Exporter.ExportedNamedExpressionChange;
var _HyperFormula = require("./HyperFormula");
exports.HyperFormula = _HyperFormula.HyperFormula;
var _enGB = _interopRequireDefault(require("./i18n/languages/enGB"));
var _interpreter = require("./interpreter");
exports.FunctionPlugin = _interpreter.FunctionPlugin;
exports.FunctionArgumentType = _interpreter.FunctionArgumentType;
exports.EmptyValue = _interpreter.EmptyValue;
var plugins = _interopRequireWildcard(require("./interpreter/plugin"));
var _SimpleRangeValue = require("./SimpleRangeValue");
exports.SimpleRangeValue = _SimpleRangeValue.SimpleRangeValue;
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */

/**
 * Aggregate class for default export
 */
class HyperFormulaNS extends _HyperFormula.HyperFormula {}
HyperFormulaNS.HyperFormula = _HyperFormula.HyperFormula;
HyperFormulaNS.ErrorType = _Cell.ErrorType;
HyperFormulaNS.CellError = _Cell.CellError;
HyperFormulaNS.CellType = _Cell.CellType;
HyperFormulaNS.CellValueType = _Cell.CellValueType;
HyperFormulaNS.CellValueDetailedType = _Cell.CellValueDetailedType;
HyperFormulaNS.DetailedCellError = _CellValue.DetailedCellError;
HyperFormulaNS.ExportedCellChange = _Exporter.ExportedCellChange;
HyperFormulaNS.ExportedNamedExpressionChange = _Exporter.ExportedNamedExpressionChange;
HyperFormulaNS.ConfigValueTooBigError = _errors.ConfigValueTooBigError;
HyperFormulaNS.ConfigValueTooSmallError = _errors.ConfigValueTooSmallError;
HyperFormulaNS.EvaluationSuspendedError = _errors.EvaluationSuspendedError;
HyperFormulaNS.ExpectedOneOfValuesError = _errors.ExpectedOneOfValuesError;
HyperFormulaNS.ExpectedValueOfTypeError = _errors.ExpectedValueOfTypeError;
HyperFormulaNS.ArraySize = _ArraySize.ArraySize;
HyperFormulaNS.SimpleRangeValue = _SimpleRangeValue.SimpleRangeValue;
HyperFormulaNS.EmptyValue = _interpreter.EmptyValue;
HyperFormulaNS.FunctionPlugin = _interpreter.FunctionPlugin;
HyperFormulaNS.FunctionArgumentType = _interpreter.FunctionArgumentType;
HyperFormulaNS.FunctionPluginValidationError = _errors.FunctionPluginValidationError;
HyperFormulaNS.InvalidAddressError = _errors.InvalidAddressError;
HyperFormulaNS.InvalidArgumentsError = _errors.InvalidArgumentsError;
HyperFormulaNS.LanguageNotRegisteredError = _errors.LanguageNotRegisteredError;
HyperFormulaNS.LanguageAlreadyRegisteredError = _errors.LanguageAlreadyRegisteredError;
HyperFormulaNS.MissingTranslationError = _errors.MissingTranslationError;
HyperFormulaNS.NamedExpressionDoesNotExistError = _errors.NamedExpressionDoesNotExistError;
HyperFormulaNS.NamedExpressionNameIsAlreadyTakenError = _errors.NamedExpressionNameIsAlreadyTakenError;
HyperFormulaNS.NamedExpressionNameIsInvalidError = _errors.NamedExpressionNameIsInvalidError;
HyperFormulaNS.NoOperationToRedoError = _errors.NoOperationToRedoError;
HyperFormulaNS.NoOperationToUndoError = _errors.NoOperationToUndoError;
HyperFormulaNS.NoRelativeAddressesAllowedError = _errors.NoRelativeAddressesAllowedError;
HyperFormulaNS.NoSheetWithIdError = _errors.NoSheetWithIdError;
HyperFormulaNS.NoSheetWithNameError = _errors.NoSheetWithNameError;
HyperFormulaNS.NotAFormulaError = _errors.NotAFormulaError;
HyperFormulaNS.NothingToPasteError = _errors.NothingToPasteError;
HyperFormulaNS.ProtectedFunctionTranslationError = _errors.ProtectedFunctionTranslationError;
HyperFormulaNS.SheetNameAlreadyTakenError = _errors.SheetNameAlreadyTakenError;
HyperFormulaNS.SheetSizeLimitExceededError = _errors.SheetSizeLimitExceededError;
HyperFormulaNS.SourceLocationHasArrayError = _errors.SourceLocationHasArrayError;
HyperFormulaNS.TargetLocationHasArrayError = _errors.TargetLocationHasArrayError;
HyperFormulaNS.UnableToParseError = _errors.UnableToParseError;
const defaultLanguage = _Config.Config.defaultConfig.language;
_HyperFormula.HyperFormula.registerLanguage(defaultLanguage, _enGB.default);
_HyperFormula.HyperFormula.languages[_enGB.default.langCode] = _enGB.default;
for (const pluginName of Object.getOwnPropertyNames(plugins)) {
  if (!pluginName.startsWith('_')) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    _HyperFormula.HyperFormula.registerFunctionPlugin(plugins[pluginName]);
  }
}
var _default = HyperFormulaNS;
exports.default = _default;