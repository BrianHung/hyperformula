/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */
import { AbsoluteCellRange } from '../../AbsoluteCellRange';
import { CellError, ErrorType } from '../../Cell';
import { ErrorMessage } from '../../error-message';
import { AstNodeType } from '../../parser';
import { coerceRangeToScalar, coerceScalarToBoolean, coerceScalarToString, coerceToRange } from '../ArithmeticHelper';
import { getRawValue, isExtendedNumber } from '../InterpreterValue';
import { SimpleRangeValue } from '../../SimpleRangeValue';
export var FunctionArgumentType;
(function (FunctionArgumentType) {
  /**
   * String type.
   */
  FunctionArgumentType["STRING"] = "STRING";
  /**
   * Floating point type.
   */
  FunctionArgumentType["NUMBER"] = "NUMBER";
  /**
   * Boolean type.
   */
  FunctionArgumentType["BOOLEAN"] = "BOOLEAN";
  /**
   * Any non-range value.
   */
  FunctionArgumentType["SCALAR"] = "SCALAR";
  /**
   * Any non-range, no-error type.
   */
  FunctionArgumentType["NOERROR"] = "NOERROR";
  /**
   * Range type.
   */
  FunctionArgumentType["RANGE"] = "RANGE";
  /**
   * Integer type.
   */
  FunctionArgumentType["INTEGER"] = "INTEGER";
  /**
   * String representing complex number.
   */
  FunctionArgumentType["COMPLEX"] = "COMPLEX";
  /**
   * Range or scalar.
   */
  FunctionArgumentType["ANY"] = "ANY";
})(FunctionArgumentType || (FunctionArgumentType = {}));
/**
 * Abstract class representing interpreter function plugin.
 * Plugin may contain multiple functions. Each function should be of type {@link PluginFunctionType} and needs to be
 * included in {@link implementedFunctions}
 */
export class FunctionPlugin {
  constructor(interpreter) {
    this.coerceScalarToNumberOrError = arg => this.arithmeticHelper.coerceScalarToNumberOrError(arg);
    /**
     * A method that should wrap the logic of every built-in function and custom function. It:
     * - Evaluates the function's arguments.
     * - Validates the number of arguments against the [`parameters` array](#function-options).
     * - Coerces the argument values to types set in the [`parameters` array](#argument-validation-options).
     * - Handles optional arguments and default values according to options set in the [`parameters` array](#argument-validation-options).
     * - Validates the function's arguments against the [argument validation options](#argument-validation-options).
     * - Duplicates the arguments according to the [`repeatLastArgs` option](#function-options).
     * - Handles the [array arithmetic mode](arrays.md#array-arithmetic-mode).
     * - Performs [function vectorization](arrays.md#passing-arrays-to-scalar-functions-vectorization).
     * - Performs [argument broadcasting](arrays.md#broadcasting).
     */
    this.runFunction = (args, state, metadata, functionImplementation) => {
      const evaluatedArguments = this.evaluateArguments(args, state, metadata);
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      const argumentValues = evaluatedArguments.map(([value, _]) => value);
      const argumentIgnorableFlags = evaluatedArguments.map(([_, ignorable]) => ignorable);
      const argumentMetadata = this.buildMetadataForEachArgumentValue(argumentValues.length, metadata);
      const isVectorizationOn = state.arraysFlag && !metadata.vectorizationForbidden;
      if (!this.isNumberOfArgumentValuesValid(argumentMetadata, argumentValues.length)) {
        return new CellError(ErrorType.NA, ErrorMessage.WrongArgNumber);
      }
      const [resultArrayHeight, resultArrayWidth] = isVectorizationOn ? this.calculateSizeOfVectorizedResultArray(argumentValues, argumentMetadata) : [1, 1];
      if (resultArrayHeight === 1 && resultArrayWidth === 1) {
        const vectorizedArguments = this.vectorizeAndBroadcastArgumentsIfNecessary(isVectorizationOn, argumentValues, argumentMetadata, 0, 0);
        return this.calculateSingleCellOfResultArray(state, vectorizedArguments, argumentMetadata, argumentIgnorableFlags, functionImplementation, metadata.returnNumberType);
      }
      const resultArray = [...Array(resultArrayHeight).keys()].map(row => [...Array(resultArrayWidth).keys()].map(col => {
        const vectorizedArguments = this.vectorizeAndBroadcastArgumentsIfNecessary(isVectorizationOn, argumentValues, argumentMetadata, row, col);
        const result = this.calculateSingleCellOfResultArray(state, vectorizedArguments, argumentMetadata, argumentIgnorableFlags, functionImplementation, metadata.returnNumberType);
        if (result instanceof SimpleRangeValue) {
          throw new Error('Function returning array cannot be vectorized.');
        }
        return result;
      }));
      return SimpleRangeValue.onlyValues(resultArray);
    };
    this.runFunctionWithReferenceArgument = (args, state, metadata, noArgCallback, referenceCallback, nonReferenceCallback = () => new CellError(ErrorType.NA, ErrorMessage.CellRefExpected)) => {
      if (args.length === 0) {
        return this.returnNumberWrapper(noArgCallback(), metadata.returnNumberType);
      } else if (args.length > 1) {
        return new CellError(ErrorType.NA, ErrorMessage.WrongArgNumber);
      }
      let arg = args[0];
      while (arg.type === AstNodeType.PARENTHESIS) {
        arg = arg.expression;
      }
      let cellReference;
      if (arg.type === AstNodeType.CELL_REFERENCE) {
        cellReference = arg.reference.toSimpleCellAddress(state.formulaAddress);
      } else if (arg.type === AstNodeType.CELL_RANGE || arg.type === AstNodeType.COLUMN_RANGE || arg.type === AstNodeType.ROW_RANGE) {
        try {
          cellReference = AbsoluteCellRange.fromAst(arg, state.formulaAddress).start;
        } catch (e) {
          return new CellError(ErrorType.REF, ErrorMessage.CellRefExpected);
        }
      }
      if (cellReference !== undefined) {
        return this.returnNumberWrapper(referenceCallback(cellReference), metadata.returnNumberType);
      }
      return this.runFunction(args, state, metadata, nonReferenceCallback);
    };
    this.interpreter = interpreter;
    this.dependencyGraph = interpreter.dependencyGraph;
    this.columnSearch = interpreter.columnSearch;
    this.config = interpreter.config;
    this.serialization = interpreter.serialization;
    this.arraySizePredictor = interpreter.arraySizePredictor;
    this.dateTimeHelper = interpreter.dateTimeHelper;
    this.arithmeticHelper = interpreter.arithmeticHelper;
  }
  evaluateAst(ast, state) {
    return this.interpreter.evaluateAst(ast, state);
  }
  arraySizeForAst(ast, state) {
    return this.arraySizePredictor.checkArraySizeForAst(ast, state);
  }
  listOfScalarValues(asts, state) {
    const ret = [];
    for (const argAst of asts) {
      const value = this.evaluateAst(argAst, state);
      if (value instanceof SimpleRangeValue) {
        for (const scalarValue of value.valuesFromTopLeftCorner()) {
          ret.push([scalarValue, true]);
        }
      } else {
        ret.push([value, false]);
      }
    }
    return ret;
  }
  coerceToType(arg, coercedType, state) {
    let ret;
    if (arg instanceof SimpleRangeValue) {
      switch (coercedType.argumentType) {
        case FunctionArgumentType.RANGE:
        case FunctionArgumentType.ANY:
          ret = arg;
          break;
        default:
          {
            const coerce = coerceRangeToScalar(arg, state);
            if (coerce === undefined) {
              return undefined;
            }
            arg = coerce;
          }
      }
    }
    if (!(arg instanceof SimpleRangeValue)) {
      switch (coercedType.argumentType) {
        case FunctionArgumentType.INTEGER:
        case FunctionArgumentType.NUMBER:
          // eslint-disable-next-line no-case-declarations
          const coerced = this.coerceScalarToNumberOrError(arg);
          if (!isExtendedNumber(coerced)) {
            ret = coerced;
            break;
          }
          // eslint-disable-next-line no-case-declarations
          const value = getRawValue(coerced);
          if (coercedType.maxValue !== undefined && value > coercedType.maxValue) {
            return new CellError(ErrorType.NUM, ErrorMessage.ValueLarge);
          }
          if (coercedType.minValue !== undefined && value < coercedType.minValue) {
            return new CellError(ErrorType.NUM, ErrorMessage.ValueSmall);
          }
          if (coercedType.lessThan !== undefined && value >= coercedType.lessThan) {
            return new CellError(ErrorType.NUM, ErrorMessage.ValueLarge);
          }
          if (coercedType.greaterThan !== undefined && value <= coercedType.greaterThan) {
            return new CellError(ErrorType.NUM, ErrorMessage.ValueSmall);
          }
          if (coercedType.argumentType === FunctionArgumentType.INTEGER && !Number.isInteger(value)) {
            return new CellError(ErrorType.NUM, ErrorMessage.IntegerExpected);
          }
          ret = coerced;
          break;
        case FunctionArgumentType.STRING:
          ret = coerceScalarToString(arg);
          break;
        case FunctionArgumentType.BOOLEAN:
          ret = coerceScalarToBoolean(arg);
          break;
        case FunctionArgumentType.SCALAR:
        case FunctionArgumentType.NOERROR:
        case FunctionArgumentType.ANY:
          ret = arg;
          break;
        case FunctionArgumentType.RANGE:
          if (arg instanceof CellError) {
            return arg;
          }
          ret = coerceToRange(arg);
          break;
        case FunctionArgumentType.COMPLEX:
          return this.arithmeticHelper.coerceScalarToComplex(getRawValue(arg));
      }
    }
    if (coercedType.passSubtype || ret === undefined) {
      return ret;
    } else {
      return getRawValue(ret);
    }
  }
  calculateSingleCellOfResultArray(state, vectorizedArguments, argumentsMetadata, argumentIgnorableFlags, functionImplementation, returnNumberType) {
    const coercedArguments = this.coerceArgumentsToRequiredTypes(state, vectorizedArguments, argumentsMetadata, argumentIgnorableFlags);
    if (coercedArguments instanceof CellError) {
      return coercedArguments;
    }
    const functionCalculationResult = functionImplementation(...coercedArguments);
    return this.returnNumberWrapper(functionCalculationResult, returnNumberType);
  }
  coerceArgumentsToRequiredTypes(state, vectorizedArguments, argumentsMetadata, argumentIgnorableFlags) {
    const coercedArguments = [];
    for (let i = 0; i < argumentsMetadata.length; i++) {
      const argumentMetadata = argumentsMetadata[i];
      const argumentValue = vectorizedArguments[i] !== undefined ? vectorizedArguments[i] : argumentMetadata === null || argumentMetadata === void 0 ? void 0 : argumentMetadata.defaultValue;
      if (argumentValue === undefined) {
        coercedArguments.push(undefined);
        continue;
      }
      const coercedValue = this.coerceToType(argumentValue, argumentMetadata, state);
      if (coercedValue === undefined && !argumentIgnorableFlags[i]) {
        return new CellError(ErrorType.VALUE, ErrorMessage.WrongType);
      }
      if (coercedValue instanceof CellError && argumentMetadata.argumentType !== FunctionArgumentType.SCALAR) {
        return coercedValue;
      }
      coercedArguments.push(coercedValue);
    }
    return coercedArguments;
  }
  vectorizeAndBroadcastArgumentsIfNecessary(isVectorizationOn, argumentValues, argumentMetadata, row, col) {
    return argumentValues.map((value, i) => isVectorizationOn && this.isRangePassedAsAScalarArgument(value, argumentMetadata[i]) ? this.vectorizeAndBroadcastRangeArgument(value, row, col) : value);
  }
  vectorizeAndBroadcastRangeArgument(argumentValue, rowNum, colNum) {
    var _a;
    const targetRowNum = argumentValue.height() === 1 ? 0 : rowNum;
    const targetColNum = argumentValue.width() === 1 ? 0 : colNum;
    return (_a = argumentValue.data[targetRowNum]) === null || _a === void 0 ? void 0 : _a[targetColNum];
  }
  evaluateArguments(args, state, metadata) {
    return metadata.expandRanges ? this.listOfScalarValues(args, state) : args.map(ast => [this.evaluateAst(ast, state), false]);
  }
  buildMetadataForEachArgumentValue(numberOfArgumentValuesPassed, metadata) {
    const argumentsMetadata = metadata.parameters ? [...metadata.parameters] : [];
    const isRepeatLastArgsValid = metadata.repeatLastArgs !== undefined && Number.isInteger(metadata.repeatLastArgs) && metadata.repeatLastArgs > 0;
    if (isRepeatLastArgsValid) {
      while (numberOfArgumentValuesPassed > argumentsMetadata.length) {
        argumentsMetadata.push(...argumentsMetadata.slice(argumentsMetadata.length - metadata.repeatLastArgs));
      }
    }
    return argumentsMetadata;
  }
  isNumberOfArgumentValuesValid(argumentsMetadata, numberOfArgumentValuesPassed) {
    if (numberOfArgumentValuesPassed > argumentsMetadata.length) {
      return false;
    }
    if (numberOfArgumentValuesPassed < argumentsMetadata.length) {
      const metadataForMissingArguments = argumentsMetadata.slice(numberOfArgumentValuesPassed);
      const areMissingArgumentsOptional = metadataForMissingArguments.every(argMetadata => (argMetadata === null || argMetadata === void 0 ? void 0 : argMetadata.optionalArg) || (argMetadata === null || argMetadata === void 0 ? void 0 : argMetadata.defaultValue) !== undefined);
      return areMissingArgumentsOptional;
    }
    return true;
  }
  calculateSizeOfVectorizedResultArray(argumentValues, argumentMetadata) {
    const argumentsThatRequireVectorization = argumentValues.filter((value, i) => this.isRangePassedAsAScalarArgument(value, argumentMetadata[i]));
    const height = Math.max(1, ...argumentsThatRequireVectorization.map(val => val.height()));
    const width = Math.max(1, ...argumentsThatRequireVectorization.map(val => val.width()));
    return [height, width];
  }
  isRangePassedAsAScalarArgument(argumentValue, argumentMetadata) {
    if (argumentValue == null || argumentMetadata == null) {
      return false;
    }
    return argumentValue instanceof SimpleRangeValue && ![FunctionArgumentType.RANGE, FunctionArgumentType.ANY].includes(argumentMetadata.argumentType);
  }
  metadata(name) {
    const params = this.constructor.implementedFunctions[name];
    if (params !== undefined) {
      return params;
    }
    throw new Error(`No metadata for function ${name}.`);
  }
  returnNumberWrapper(val, type, format) {
    if (type !== undefined && isExtendedNumber(val)) {
      return this.arithmeticHelper.ExtendedNumberFactory(getRawValue(val), {
        type,
        format
      });
    } else {
      return val;
    }
  }
}