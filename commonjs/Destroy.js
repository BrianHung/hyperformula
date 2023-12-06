"use strict";

exports.__esModule = true;
exports.objectDestroy = objectDestroy;
/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */
function objectDestroy(object) {
  for (const [key, value] of Object.entries(object)) {
    if (value instanceof Function) {
      object[key] = postMortem(value);
    } else {
      delete object[key];
    }
  }
}
function postMortem(method) {
  return () => {
    throw new Error(`The "${method}" method cannot be called because this HyperFormula instance has been destroyed`);
  };
}