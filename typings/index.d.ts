/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */
import { SimpleCellRange, AbsoluteCellRange, AbsoluteColumnRange, AbsoluteRowRange } from './AbsoluteCellRange';
import { ArraySize } from './ArraySize';
import { CellError, CellType, CellValueDetailedType, CellValueType, ErrorType, SimpleCellAddress, SimpleColumnAddress, SimpleRowAddress } from './Cell';
import { RawCellContent } from './CellContentParser';
import { CellValue, DetailedCellError, NoErrorCellValue } from './CellValue';
import { ConfigParams } from './Config';
import { ColumnRowIndex } from './CrudOperations';
import { AlwaysDense, AlwaysSparse, DenseSparseChooseBasedOnThreshold, ChooseAddressMapping } from './DependencyGraph/AddressMapping/ChooseAddressMappingPolicy';
import { ImmutableAddressMapping, ImmutableIdMapping, ImmutableReferenceMapping, AddressMapping, RangeMapping, RangeVertex, CellVertex } from './DependencyGraph';
import { ConfigValueTooBigError, ConfigValueTooSmallError, EvaluationSuspendedError, ExpectedOneOfValuesError, ExpectedValueOfTypeError, FunctionPluginValidationError, InvalidAddressError, InvalidArgumentsError, LanguageAlreadyRegisteredError, LanguageNotRegisteredError, MissingTranslationError, NamedExpressionDoesNotExistError, NamedExpressionNameIsAlreadyTakenError, NamedExpressionNameIsInvalidError, NoOperationToRedoError, NoOperationToUndoError, NoRelativeAddressesAllowedError, NoSheetWithIdError, NoSheetWithNameError, NotAFormulaError, NothingToPasteError, ProtectedFunctionTranslationError, SheetNameAlreadyTakenError, SheetSizeLimitExceededError, SourceLocationHasArrayError, TargetLocationHasArrayError, UnableToParseError } from './errors';
import { ExportedCellChange, ExportedChange, ExportedNamedExpressionChange } from './Exporter';
import { HyperFormula } from './HyperFormula';
import { RawTranslationPackage } from './i18n';
import { FunctionArgument, FunctionPlugin, FunctionPluginDefinition, FunctionArgumentType, ImplementedFunctions, FunctionMetadata, EmptyValue } from './interpreter';
import { FormatInfo } from './interpreter/InterpreterValue';
import { SimpleRangeValue } from './SimpleRangeValue';
import { NamedExpression, NamedExpressionOptions } from './NamedExpressions';
import { SerializedNamedExpression } from './Serialization';
import { Sheet, SheetDimensions, Sheets } from './Sheet';
/**
 * Aggregate class for default export
 */
declare class HyperFormulaNS extends HyperFormula {
    static HyperFormula: typeof HyperFormula;
    static ErrorType: typeof ErrorType;
    static CellError: typeof CellError;
    static CellType: typeof CellType;
    static CellValueType: {
        NUMBER: import("./Cell").CellValueJustNumber.NUMBER;
        EMPTY: import("./Cell").CellValueNoNumber.EMPTY;
        STRING: import("./Cell").CellValueNoNumber.STRING;
        BOOLEAN: import("./Cell").CellValueNoNumber.BOOLEAN;
        ERROR: import("./Cell").CellValueNoNumber.ERROR;
    };
    static CellValueDetailedType: {
        NUMBER_RAW: import("./interpreter/InterpreterValue").NumberType.NUMBER_RAW;
        NUMBER_DATE: import("./interpreter/InterpreterValue").NumberType.NUMBER_DATE;
        NUMBER_TIME: import("./interpreter/InterpreterValue").NumberType.NUMBER_TIME;
        NUMBER_DATETIME: import("./interpreter/InterpreterValue").NumberType.NUMBER_DATETIME;
        NUMBER_CURRENCY: import("./interpreter/InterpreterValue").NumberType.NUMBER_CURRENCY;
        NUMBER_PERCENT: import("./interpreter/InterpreterValue").NumberType.NUMBER_PERCENT;
        EMPTY: import("./Cell").CellValueNoNumber.EMPTY;
        NUMBER: import("./Cell").CellValueNoNumber.NUMBER;
        STRING: import("./Cell").CellValueNoNumber.STRING;
        BOOLEAN: import("./Cell").CellValueNoNumber.BOOLEAN;
        ERROR: import("./Cell").CellValueNoNumber.ERROR;
    };
    static DetailedCellError: typeof DetailedCellError;
    static ExportedCellChange: typeof ExportedCellChange;
    static ExportedNamedExpressionChange: typeof ExportedNamedExpressionChange;
    static ConfigValueTooBigError: typeof ConfigValueTooBigError;
    static ConfigValueTooSmallError: typeof ConfigValueTooSmallError;
    static EvaluationSuspendedError: typeof EvaluationSuspendedError;
    static ExpectedOneOfValuesError: typeof ExpectedOneOfValuesError;
    static ExpectedValueOfTypeError: typeof ExpectedValueOfTypeError;
    static ArraySize: typeof ArraySize;
    static SimpleRangeValue: typeof SimpleRangeValue;
    static EmptyValue: symbol;
    static FunctionPlugin: typeof FunctionPlugin;
    static FunctionArgumentType: typeof FunctionArgumentType;
    static FunctionPluginValidationError: typeof FunctionPluginValidationError;
    static InvalidAddressError: typeof InvalidAddressError;
    static InvalidArgumentsError: typeof InvalidArgumentsError;
    static LanguageNotRegisteredError: typeof LanguageNotRegisteredError;
    static LanguageAlreadyRegisteredError: typeof LanguageAlreadyRegisteredError;
    static MissingTranslationError: typeof MissingTranslationError;
    static NamedExpressionDoesNotExistError: typeof NamedExpressionDoesNotExistError;
    static NamedExpressionNameIsAlreadyTakenError: typeof NamedExpressionNameIsAlreadyTakenError;
    static NamedExpressionNameIsInvalidError: typeof NamedExpressionNameIsInvalidError;
    static NoOperationToRedoError: typeof NoOperationToRedoError;
    static NoOperationToUndoError: typeof NoOperationToUndoError;
    static NoRelativeAddressesAllowedError: typeof NoRelativeAddressesAllowedError;
    static NoSheetWithIdError: typeof NoSheetWithIdError;
    static NoSheetWithNameError: typeof NoSheetWithNameError;
    static NotAFormulaError: typeof NotAFormulaError;
    static NothingToPasteError: typeof NothingToPasteError;
    static ProtectedFunctionTranslationError: typeof ProtectedFunctionTranslationError;
    static SheetNameAlreadyTakenError: typeof SheetNameAlreadyTakenError;
    static SheetSizeLimitExceededError: typeof SheetSizeLimitExceededError;
    static SourceLocationHasArrayError: typeof SourceLocationHasArrayError;
    static TargetLocationHasArrayError: typeof TargetLocationHasArrayError;
    static UnableToParseError: typeof UnableToParseError;
}
export default HyperFormulaNS;
export { AlwaysDense, AlwaysSparse, DenseSparseChooseBasedOnThreshold, CellValue, NoErrorCellValue, ConfigParams, ExportedChange, RawCellContent, FormatInfo, Sheet, Sheets, SheetDimensions, SimpleCellAddress, SimpleCellRange, ColumnRowIndex, RawTranslationPackage, FunctionPluginDefinition, FunctionArgument, NamedExpression, NamedExpressionOptions, HyperFormula, CellType, CellValueType, CellValueDetailedType, ErrorType, ExportedCellChange, ExportedNamedExpressionChange, DetailedCellError, CellError, ConfigValueTooBigError, ConfigValueTooSmallError, EvaluationSuspendedError, ExpectedOneOfValuesError, ExpectedValueOfTypeError, ArraySize, FunctionPlugin, ImplementedFunctions, FunctionMetadata, FunctionArgumentType, FunctionPluginValidationError, InvalidAddressError, InvalidArgumentsError, LanguageAlreadyRegisteredError, LanguageNotRegisteredError, MissingTranslationError, NamedExpressionDoesNotExistError, NamedExpressionNameIsAlreadyTakenError, NamedExpressionNameIsInvalidError, NoOperationToRedoError, NoOperationToUndoError, NoRelativeAddressesAllowedError, NoSheetWithIdError, NoSheetWithNameError, NotAFormulaError, NothingToPasteError, ProtectedFunctionTranslationError, SimpleRangeValue, EmptyValue, SheetNameAlreadyTakenError, SheetSizeLimitExceededError, SourceLocationHasArrayError, TargetLocationHasArrayError, UnableToParseError, SerializedNamedExpression, ImmutableAddressMapping, ImmutableIdMapping, ImmutableReferenceMapping, AddressMapping, ChooseAddressMapping, RangeMapping, SimpleColumnAddress, SimpleRowAddress, AbsoluteCellRange, AbsoluteColumnRange, AbsoluteRowRange, RangeVertex, CellVertex, };