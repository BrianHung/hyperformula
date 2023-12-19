"use strict";

exports.__esModule = true;
exports.UnableToParseError = exports.TargetLocationHasArrayError = exports.SourceLocationHasArrayError = exports.SheetsNotEqual = exports.SheetSizeLimitExceededError = exports.SheetNameAlreadyTakenError = exports.ProtectedFunctionTranslationError = exports.ProtectedFunctionError = exports.NothingToPasteError = exports.NotAFormulaError = exports.NoSheetWithNameError = exports.NoSheetWithIdError = exports.NoRelativeAddressesAllowedError = exports.NoOperationToUndoError = exports.NoOperationToRedoError = exports.NamedExpressionNameIsInvalidError = exports.NamedExpressionNameIsAlreadyTakenError = exports.NamedExpressionDoesNotExistError = exports.MissingTranslationError = exports.LanguageNotRegisteredError = exports.LanguageAlreadyRegisteredError = exports.InvalidArgumentsError = exports.InvalidAddressError = exports.FunctionPluginValidationError = exports.ExpectedValueOfTypeError = exports.ExpectedOneOfValuesError = exports.EvaluationSuspendedError = exports.ConfigValueTooSmallError = exports.ConfigValueTooBigError = exports.ConfigValueEmpty = exports.AliasAlreadyExisting = void 0;
/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */
/**
 * Error thrown when the sheet of a given ID does not exist.
 */
class NoSheetWithIdError extends Error {
  constructor(sheetId) {
    super(`There's no sheet with id = ${sheetId}`);
  }
}
/**
 * Error thrown when the sheet of a given name does not exist.
 */
exports.NoSheetWithIdError = NoSheetWithIdError;
class NoSheetWithNameError extends Error {
  constructor(sheetName) {
    super(`There's no sheet with name '${sheetName}'`);
  }
}
/**
 * Error thrown when the sheet of a given name already exists.
 */
exports.NoSheetWithNameError = NoSheetWithNameError;
class SheetNameAlreadyTakenError extends Error {
  constructor(sheetName) {
    super(`Sheet with name ${sheetName} already exists`);
  }
}
/**
 * Error thrown when loaded sheet size exceeds configured limits.
 */
exports.SheetNameAlreadyTakenError = SheetNameAlreadyTakenError;
class SheetSizeLimitExceededError extends Error {
  constructor() {
    super('Sheet size limit exceeded');
  }
}
/**
 * Error thrown when the the provided string is not a valid formula, i.e does not start with "="
 */
exports.SheetSizeLimitExceededError = SheetSizeLimitExceededError;
class NotAFormulaError extends Error {
  constructor() {
    super('This is not a formula');
  }
}
/**
 * Error thrown when the given address is invalid.
 */
exports.NotAFormulaError = NotAFormulaError;
class InvalidAddressError extends Error {
  constructor(address) {
    super(`Address (row = ${address.row}, col = ${address.col}) is invalid`);
  }
}
/**
 * Error thrown when the given arguments are invalid
 */
exports.InvalidAddressError = InvalidAddressError;
class InvalidArgumentsError extends Error {
  constructor(expectedArguments) {
    super(`Invalid arguments, expected ${expectedArguments}`);
  }
}
/**
 * Error thrown when the given sheets are not equal.
 */
exports.InvalidArgumentsError = InvalidArgumentsError;
class SheetsNotEqual extends Error {
  constructor(sheet1, sheet2) {
    super(`Sheets ${sheet1} and ${sheet2} are not equal.`);
  }
}
/**
 * Error thrown when the given named expression already exists in the workbook and therefore it cannot be added.
 */
exports.SheetsNotEqual = SheetsNotEqual;
class NamedExpressionNameIsAlreadyTakenError extends Error {
  constructor(expressionName) {
    super(`Name of Named Expression '${expressionName}' is already present`);
  }
}
/**
 * Error thrown when the name given for the named expression is invalid.
 */
exports.NamedExpressionNameIsAlreadyTakenError = NamedExpressionNameIsAlreadyTakenError;
class NamedExpressionNameIsInvalidError extends Error {
  constructor(expressionName) {
    super(`Name of Named Expression '${expressionName}' is invalid`);
  }
}
/**
 * Error thrown when the given named expression does not exist.
 */
exports.NamedExpressionNameIsInvalidError = NamedExpressionNameIsInvalidError;
class NamedExpressionDoesNotExistError extends Error {
  constructor(expressionName) {
    super(`Named Expression '${expressionName}' does not exist`);
  }
}
/**
 * Error thrown when there are no operations to be undone by the [[undo]] method.
 */
exports.NamedExpressionDoesNotExistError = NamedExpressionDoesNotExistError;
class NoOperationToUndoError extends Error {
  constructor() {
    super('There is no operation to undo');
  }
}
/**
 * Error thrown when there are no operations to redo by the [[redo]] method.
 */
exports.NoOperationToUndoError = NoOperationToUndoError;
class NoOperationToRedoError extends Error {
  constructor() {
    super('There is no operation to redo');
  }
}
/**
 * Error thrown when there is nothing to paste by the [[paste]] method.
 */
exports.NoOperationToRedoError = NoOperationToRedoError;
class NothingToPasteError extends Error {
  constructor() {
    super('There is nothing to paste');
  }
}
exports.NothingToPasteError = NothingToPasteError;
function replacer(key, val) {
  switch (typeof val) {
    case 'function':
    case 'symbol':
      return val.toString();
    case 'bigint':
      return 'BigInt(' + val.toString() + ')';
    default:
      {
        if (val instanceof RegExp) {
          return 'RegExp(' + val.toString() + ')';
        } else {
          return val;
        }
      }
  }
}
/**
 * Error thrown when the given value cannot be parsed.
 *
 * Checks against the validity in:
 *
 * @see [[buildFromArray]]
 * @see [[buildFromSheets]]
 * @see [[setCellsContents]]
 */
class UnableToParseError extends Error {
  constructor(value) {
    super(`Unable to parse value: ${JSON.stringify(value, replacer, 4)}`);
  }
}
/**
 * Error thrown when the expected value type differs from the given value type.
 * It also displays the expected type.
 * This error might be thrown while setting or updating the [[ConfigParams]].
 * The following methods accept [[ConfigParams]] as a parameter:
 *
 * @see [[buildEmpty]]
 * @see [[buildFromArray]]
 * @see [[buildFromSheets]]
 * @see [[updateConfig]]
 */
exports.UnableToParseError = UnableToParseError;
class ExpectedValueOfTypeError extends Error {
  constructor(expectedType, paramName) {
    super(`Expected value of type: ${expectedType} for config parameter: ${paramName}`);
  }
}
/**
 * Error thrown when supplied config parameter value is an empty string.
 * This error might be thrown while setting or updating the [[ConfigParams]].
 * The following methods accept [[ConfigParams]] as a parameter:
 *
 * @see [[buildEmpty]]
 * @see [[buildFromArray]]
 * @see [[buildFromSheets]]
 * @see [[updateConfig]]
 */
exports.ExpectedValueOfTypeError = ExpectedValueOfTypeError;
class ConfigValueEmpty extends Error {
  constructor(paramName) {
    super(`Config parameter ${paramName} cannot be empty.`);
  }
}
/**
 * Error thrown when supplied config parameter value is too small.
 * This error might be thrown while setting or updating the [[ConfigParams]].
 * The following methods accept [[ConfigParams]] as a parameter:
 *
 * @see [[buildEmpty]]
 * @see [[buildFromArray]]
 * @see [[buildFromSheets]]
 * @see [[updateConfig]]
 */
exports.ConfigValueEmpty = ConfigValueEmpty;
class ConfigValueTooSmallError extends Error {
  constructor(paramName, minimum) {
    super(`Config parameter ${paramName} should be at least ${minimum}`);
  }
}
/**
 * Error thrown when supplied config parameter value is too big.
 * This error might be thrown while setting or updating the [[ConfigParams]].
 * The following methods accept [[ConfigParams]] as a parameter:
 *
 * @see [[buildEmpty]]
 * @see [[buildFromArray]]
 * @see [[buildFromSheets]]
 * @see [[updateConfig]]
 */
exports.ConfigValueTooSmallError = ConfigValueTooSmallError;
class ConfigValueTooBigError extends Error {
  constructor(paramName, maximum) {
    super(`Config parameter ${paramName} should be at most ${maximum}`);
  }
}
/**
 * Error thrown when the value was expected to be set for a config parameter.
 * It also displays the expected value.
 * This error might be thrown while setting or updating the [[ConfigParams]].
 * The following methods accept [[ConfigParams]] as a parameter:
 *
 * @see [[buildEmpty]]
 * @see [[buildFromArray]]
 * @see [[buildFromSheets]]
 * @see [[updateConfig]]
 */
exports.ConfigValueTooBigError = ConfigValueTooBigError;
class ExpectedOneOfValuesError extends Error {
  constructor(values, paramName) {
    super(`Expected one of ${values} for config parameter: ${paramName}`);
  }
}
/**
 * Error thrown when computations become suspended.
 * To perform any other action wait for the batch to complete or resume the evaluation.
 * Relates to:
 *
 * @see [[batch]]
 * @see [[suspendEvaluation]]
 * @see [[resumeEvaluation]]
 */
exports.ExpectedOneOfValuesError = ExpectedOneOfValuesError;
class EvaluationSuspendedError extends Error {
  constructor() {
    super('Computations are suspended');
  }
}
/**
 * Error thrown when translation is missing in translation package.
 */
exports.EvaluationSuspendedError = EvaluationSuspendedError;
class MissingTranslationError extends Error {
  constructor(key) {
    super(`Translation for ${key} is missing in the translation package you're using.`);
  }
}
/**
 * Error thrown when trying to override protected translation.
 *
 * @see [[registerLanguage]]
 * @see [[registerFunction]]
 * @see [[registerFunctionPlugin]]
 */
exports.MissingTranslationError = MissingTranslationError;
class ProtectedFunctionTranslationError extends Error {
  constructor(key) {
    super(`Cannot register translation for function with id: ${key}`);
  }
}
/**
 * Error thrown when trying to retrieve not registered language
 *
 * @see [[getLanguage]]
 * @see [[unregisterLanguage]]
 */
exports.ProtectedFunctionTranslationError = ProtectedFunctionTranslationError;
class LanguageNotRegisteredError extends Error {
  constructor() {
    super('Language not registered.');
  }
}
/**
 * Error thrown when trying to register already registered language
 *
 * @see [[registerLanguage]]
 */
exports.LanguageNotRegisteredError = LanguageNotRegisteredError;
class LanguageAlreadyRegisteredError extends Error {
  constructor() {
    super('Language already registered.');
  }
}
/**
 * Error thrown when function plugin is invalid.
 *
 * @see [[registerFunction]]
 * @see [[registerFunctionPlugin]]
 * @see [[buildFromArray]]
 * @see [[buildFromSheets]]
 */
exports.LanguageAlreadyRegisteredError = LanguageAlreadyRegisteredError;
class FunctionPluginValidationError extends Error {
  static functionNotDeclaredInPlugin(functionId, pluginName) {
    return new FunctionPluginValidationError(`Function with id ${functionId} not declared in plugin ${pluginName}`);
  }
  static functionMethodNotFound(functionName, pluginName) {
    return new FunctionPluginValidationError(`Function method ${functionName} not found in plugin ${pluginName}`);
  }
}
/**
 * Error thrown when trying to register, override or remove function with reserved id.
 *
 * @see [[registerFunctionPlugin]]
 * @see [[registerFunction]]
 * @see [[unregisterFunction]]
 */
exports.FunctionPluginValidationError = FunctionPluginValidationError;
class ProtectedFunctionError extends Error {
  static cannotRegisterFunctionWithId(functionId) {
    return new ProtectedFunctionError(`Cannot register function with id ${functionId}`);
  }
  static cannotUnregisterFunctionWithId(functionId) {
    return new ProtectedFunctionError(`Cannot unregister function with id ${functionId}`);
  }
  static cannotUnregisterProtectedPlugin() {
    return new ProtectedFunctionError('Cannot unregister protected plugin');
  }
}
/**
 * Error thrown when selected source location has an array.
 */
exports.ProtectedFunctionError = ProtectedFunctionError;
class SourceLocationHasArrayError extends Error {
  constructor() {
    super('Cannot perform this operation, source location has an array inside.');
  }
}
/**
 * Error thrown when selected target location has an array.
 *
 * @see [[addRows]]
 * @see [[addColumns]]
 * @see [[moveCells]]
 * @see [[moveRows]]
 * @see [[moveColumns]]
 * @see [[paste]]
 */
exports.SourceLocationHasArrayError = SourceLocationHasArrayError;
class TargetLocationHasArrayError extends Error {
  constructor() {
    super('Cannot perform this operation, target location has an array inside.');
  }
}
/**
 * Error thrown when named expression contains relative addresses.
 *
 * @see [[addNamedExpression]]
 * @see [[changeNamedExpression]]
 */
exports.TargetLocationHasArrayError = TargetLocationHasArrayError;
class NoRelativeAddressesAllowedError extends Error {
  constructor() {
    super('Relative addresses not allowed in named expressions.');
  }
}
/**
 * Error thrown when alias to a function is already defined.
 *
 * @see [[registerFunctionPlugin]]
 * @see [[registerFunction]]
 */
exports.NoRelativeAddressesAllowedError = NoRelativeAddressesAllowedError;
class AliasAlreadyExisting extends Error {
  constructor(name, pluginName) {
    super(`Alias id ${name} in plugin ${pluginName} already defined as a function or alias.`);
  }
}
exports.AliasAlreadyExisting = AliasAlreadyExisting;