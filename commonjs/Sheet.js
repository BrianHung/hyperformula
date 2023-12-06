"use strict";

exports.__esModule = true;
exports.findBoundaries = findBoundaries;
exports.validateAsSheet = validateAsSheet;
var _errors = require("./errors");
/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */

function validateAsSheet(sheet) {
  if (!Array.isArray(sheet)) {
    throw new _errors.InvalidArgumentsError('an array of arrays.');
  }
  for (let i = 0; i < sheet.length; i++) {
    if (!Array.isArray(sheet[i])) {
      throw new _errors.InvalidArgumentsError('an array of arrays.');
    }
  }
}
/**
 * Returns actual width, height and fill ratio of a sheet
 *
 * @param sheet - two-dimmensional array sheet representation
 */
function findBoundaries(sheet) {
  let width = 0;
  let height = 0;
  let cellsCount = 0;
  for (let currentRow = 0; currentRow < sheet.length; currentRow++) {
    let currentRowWidth = 0;
    for (let currentCol = 0; currentCol < sheet[currentRow].length; currentCol++) {
      const currentValue = sheet[currentRow][currentCol];
      if (currentValue === undefined || currentValue === null) {
        continue;
      }
      currentRowWidth = currentCol + 1;
      ++cellsCount;
    }
    width = Math.max(width, currentRowWidth);
    if (currentRowWidth > 0) {
      height = currentRow + 1;
    }
  }
  const sheetSize = width * height;
  return {
    height: height,
    width: width,
    fill: sheetSize === 0 ? 0 : cellsCount / sheetSize
  };
}