"use strict";

exports.__esModule = true;
exports.configCheckIfParametersNotInConflict = configCheckIfParametersNotInConflict;
exports.configValueFromParam = configValueFromParam;
exports.configValueFromParamCheck = configValueFromParamCheck;
exports.validateArgToType = validateArgToType;
exports.validateNumberToBeAtLeast = validateNumberToBeAtLeast;
exports.validateNumberToBeAtMost = validateNumberToBeAtMost;
var _Config = require("./Config");
var _errors = require("./errors");
/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function configValueFromParam(inputValue, expectedType, paramName) {
  if (typeof inputValue === 'undefined') {
    return _Config.Config.defaultConfig[paramName];
  } else if (typeof expectedType === 'string') {
    if (typeof inputValue === expectedType) {
      return inputValue;
    } else {
      throw new _errors.ExpectedValueOfTypeError(expectedType, paramName);
    }
  } else {
    if (expectedType.includes(inputValue)) {
      return inputValue;
    } else {
      throw new _errors.ExpectedOneOfValuesError(expectedType.map(val => `'${val}'`).join(' '), paramName);
    }
  }
}
function validateNumberToBeAtLeast(value, paramName, minimum) {
  if (value < minimum) {
    throw new _errors.ConfigValueTooSmallError(paramName, minimum);
  }
}
function validateNumberToBeAtMost(value, paramName, maximum) {
  if (value > maximum) {
    throw new _errors.ConfigValueTooBigError(paramName, maximum);
  }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function configValueFromParamCheck(inputValue, typeCheck, expectedType, paramName) {
  if (typeCheck(inputValue)) {
    return inputValue;
  } else if (typeof inputValue === 'undefined') {
    return _Config.Config.defaultConfig[paramName];
  } else {
    throw new _errors.ExpectedValueOfTypeError(expectedType, paramName);
  }
}
function configCheckIfParametersNotInConflict(...params) {
  const valuesMap = new Map();
  params.forEach(param => {
    const names = valuesMap.get(param.value) || [];
    names.push(param.name);
    valuesMap.set(param.value, names);
  });
  const duplicates = [];
  for (const entry of valuesMap.values()) {
    if (entry.length > 1) {
      duplicates.push(entry);
    }
  }
  if (duplicates.length > 0) {
    duplicates.forEach(entry => entry.sort());
    const paramNames = duplicates.map(entry => `[${entry}]`).join('; ');
    throw new Error(`Config initialization failed. Parameters in conflict: ${paramNames}`);
  }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function validateArgToType(inputValue, expectedType, paramName) {
  if (typeof inputValue !== expectedType) {
    throw new _errors.ExpectedValueOfTypeError(expectedType, paramName);
  }
}