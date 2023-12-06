"use strict";

exports.__esModule = true;
exports.columnAddressFromString = exports.colAddressFromImmutableReference = exports.cellAddressFromString = exports.cellAddressFromImmutableReference = void 0;
exports.columnIndexToLabel = columnIndexToLabel;
exports.rowAddressFromString = exports.rowAddressFromImmutableReference = void 0;
exports.sheetIndexToString = sheetIndexToString;
exports.simpleCellRangeToString = exports.simpleCellRangeFromString = exports.simpleCellAddressToString = exports.simpleCellAddressFromString = void 0;
var _AbsoluteCellRange = require("../AbsoluteCellRange");
var _Cell = require("../Cell");
var _CellAddress = require("./CellAddress");
var _ColumnAddress = require("./ColumnAddress");
var _parserConsts = require("./parser-consts");
var _RowAddress = require("./RowAddress");
/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */

const addressRegex = new RegExp(`^(${_parserConsts.SHEET_NAME_PATTERN})?(\\${_parserConsts.ABSOLUTE_OPERATOR}?)([A-Za-z]+)(\\${_parserConsts.ABSOLUTE_OPERATOR}?)([0-9]+)$`);
const columnRegex = new RegExp(`^(${_parserConsts.SHEET_NAME_PATTERN})?(\\${_parserConsts.ABSOLUTE_OPERATOR}?)([A-Za-z]+)$`);
const rowRegex = new RegExp(`^(${_parserConsts.SHEET_NAME_PATTERN})?(\\${_parserConsts.ABSOLUTE_OPERATOR}?)([0-9]+)$`);
const simpleSheetNameRegex = new RegExp(`^${_parserConsts.UNQUOTED_SHEET_NAME_PATTERN}$`);
const immutableCellRegex = new RegExp(_parserConsts.IMMUTABLE_CELL_REFERENCE_PATTERN);
const immutableColRegex = new RegExp(_parserConsts.IMMUTABLE_COL_REFERENCE_PATTERN);
const immutableRowRegex = new RegExp(_parserConsts.IMMUTABLE_ROW_REFERENCE_PATTERN);
/**
 * Computes R0C0 representation of cell address based on it's string representation and base address.
 *
 * @param sheetMapping - mapping function needed to change name of a sheet to index
 * @param stringAddress - string representation of cell address, e.g. 'C64'
 * @param baseAddress - base address for R0C0 conversion
 * @returns object representation of address
 */
const cellAddressFromString = (sheetMapping, stringAddress, baseAddress) => {
  const result = addressRegex.exec(stringAddress);
  const col = columnLabelToIndex(result[6]);
  let sheet = extractSheetNumber(result, sheetMapping);
  if (sheet === undefined) {
    return undefined;
  }
  if (sheet === null) {
    sheet = undefined;
  }
  const row = Number(result[8]) - 1;
  if (result[5] === _parserConsts.ABSOLUTE_OPERATOR && result[7] === _parserConsts.ABSOLUTE_OPERATOR) {
    return _CellAddress.CellAddress.absolute(col, row, sheet);
  } else if (result[5] === _parserConsts.ABSOLUTE_OPERATOR) {
    return _CellAddress.CellAddress.absoluteCol(col, row - baseAddress.row, sheet);
  } else if (result[7] === _parserConsts.ABSOLUTE_OPERATOR) {
    return _CellAddress.CellAddress.absoluteRow(col - baseAddress.col, row, sheet);
  } else {
    return _CellAddress.CellAddress.relative(col - baseAddress.col, row - baseAddress.row, sheet);
  }
};
/**
 * Computes R0C0 representation of cell address based on it's string representation and base address.
 *
 * @param sheetMapping
 * @param stringAddress
 * @param baseAddress
 * @returns
 */
exports.cellAddressFromString = cellAddressFromString;
const cellAddressFromImmutableReference = (immutableReferenceMapping, stringAddress, baseAddress) => {
  const result = immutableCellRegex.exec(stringAddress);
  const [match, cellId, absoluteCol, absoluteRow, showSheet] = result;
  const address = immutableReferenceMapping.getCellAddress(cellId);
  if (address === undefined) return undefined;
  const {
    col,
    row
  } = address;
  let sheet = address.sheet;
  if (sheet === baseAddress.sheet && showSheet !== 'true') {
    sheet = undefined;
  }
  if (absoluteCol === 'true' && absoluteRow === 'true') {
    return _CellAddress.CellAddress.absolute(col, row, sheet);
  } else if (absoluteCol === 'true') {
    return _CellAddress.CellAddress.absoluteCol(col, row - baseAddress.row, sheet);
  } else if (absoluteRow === 'true') {
    return _CellAddress.CellAddress.absoluteRow(col - baseAddress.col, row, sheet);
  } else {
    return _CellAddress.CellAddress.relative(col - baseAddress.col, 0 - baseAddress.row, sheet);
  }
};
exports.cellAddressFromImmutableReference = cellAddressFromImmutableReference;
const columnAddressFromString = (sheetMapping, stringAddress, baseAddress) => {
  const result = columnRegex.exec(stringAddress);
  let sheet = extractSheetNumber(result, sheetMapping);
  if (sheet === undefined) {
    return undefined;
  }
  if (sheet === null) {
    sheet = undefined;
  }
  const col = columnLabelToIndex(result[6]);
  if (result[5] === _parserConsts.ABSOLUTE_OPERATOR) {
    return _ColumnAddress.ColumnAddress.absolute(col, sheet);
  } else {
    return _ColumnAddress.ColumnAddress.relative(col - baseAddress.col, sheet);
  }
};
exports.columnAddressFromString = columnAddressFromString;
const colAddressFromImmutableReference = (immutableReferenceMapping, stringAddress, baseAddress) => {
  const result = immutableColRegex.exec(stringAddress);
  const [match, colId, absoluteCol, showSheet] = result;
  const address = immutableReferenceMapping.getColIndex(colId);
  if (address === undefined) return undefined;
  const col = address.index;
  let sheet = address.sheet;
  if (sheet === baseAddress.sheet && showSheet !== 'true') {
    sheet = undefined;
  }
  if (absoluteCol === 'true') {
    return _ColumnAddress.ColumnAddress.absolute(col, sheet);
  } else {
    return _ColumnAddress.ColumnAddress.relative(col - baseAddress.col, sheet);
  }
};
exports.colAddressFromImmutableReference = colAddressFromImmutableReference;
const rowAddressFromString = (sheetMapping, stringAddress, baseAddress) => {
  const result = rowRegex.exec(stringAddress);
  let sheet = extractSheetNumber(result, sheetMapping);
  if (sheet === undefined) {
    return undefined;
  }
  if (sheet === null) {
    sheet = undefined;
  }
  const row = Number(result[6]) - 1;
  if (result[5] === _parserConsts.ABSOLUTE_OPERATOR) {
    return _RowAddress.RowAddress.absolute(row, sheet);
  } else {
    return _RowAddress.RowAddress.relative(row - baseAddress.row, sheet);
  }
};
exports.rowAddressFromString = rowAddressFromString;
const rowAddressFromImmutableReference = (immutableReferenceMapping, stringAddress, baseAddress) => {
  const result = immutableRowRegex.exec(stringAddress);
  const [match, rowId, absoluteRow, showSheet] = result;
  const address = immutableReferenceMapping.getColIndex(rowId);
  if (address === undefined) return undefined;
  const row = address.index;
  let sheet = address.sheet;
  if (sheet === baseAddress.sheet && showSheet !== 'true') {
    sheet = undefined;
  }
  if (absoluteRow === 'true') {
    return _RowAddress.RowAddress.absolute(row, sheet);
  } else {
    return _RowAddress.RowAddress.relative(row - baseAddress.row, sheet);
  }
};
/**
 * Computes simple (absolute) address of a cell address based on its string representation.
 * If sheet name present in string representation but is not present in sheet mapping, returns undefined.
 * If sheet name is not present in string representation, returns {@param sheetContext} as sheet number
 *
 * @param sheetMapping - mapping function needed to change name of a sheet to index
 * @param stringAddress - string representation of cell address, e.g. 'C64'
 * @param sheetContext - sheet in context of which we should parse the address
 * @returns absolute representation of address, e.g. { sheet: 0, col: 1, row: 1 }
 */
exports.rowAddressFromImmutableReference = rowAddressFromImmutableReference;
const simpleCellAddressFromString = (sheetMapping, stringAddress, sheetContext) => {
  const result = addressRegex.exec(stringAddress);
  const col = columnLabelToIndex(result[6]);
  let sheet = extractSheetNumber(result, sheetMapping);
  if (sheet === undefined) {
    return undefined;
  }
  if (sheet === null) {
    sheet = sheetContext;
  }
  const row = Number(result[8]) - 1;
  return (0, _Cell.simpleCellAddress)(sheet, col, row);
};
exports.simpleCellAddressFromString = simpleCellAddressFromString;
const simpleCellRangeFromString = (sheetMapping, stringAddress, sheetContext) => {
  const split = stringAddress.split(_parserConsts.RANGE_OPERATOR);
  if (split.length !== 2) {
    return undefined;
  }
  const [startString, endString] = split;
  const start = simpleCellAddressFromString(sheetMapping, startString, sheetContext);
  if (start === undefined) {
    return undefined;
  }
  const end = simpleCellAddressFromString(sheetMapping, endString, start.sheet);
  if (end === undefined) {
    return undefined;
  }
  if (start.sheet !== end.sheet) {
    return undefined;
  }
  return (0, _AbsoluteCellRange.simpleCellRange)(start, end);
};
/**
 * Returns string representation of absolute address
 * If sheet index is not present in sheet mapping, returns undefined
 *
 * @param sheetIndexMapping - mapping function needed to change sheet index to sheet name
 * @param address - object representation of absolute address
 * @param sheetIndex - if is not equal with address sheet index, string representation will contain sheet name
 */
exports.simpleCellRangeFromString = simpleCellRangeFromString;
const simpleCellAddressToString = (sheetIndexMapping, address, sheetIndex) => {
  const column = columnIndexToLabel(address.col);
  const sheetName = sheetIndexToString(address.sheet, sheetIndexMapping);
  if (sheetName === undefined) {
    return undefined;
  }
  if (sheetIndex !== address.sheet) {
    return `${sheetName}!${column}${address.row + 1}`;
  } else {
    return `${column}${address.row + 1}`;
  }
};
exports.simpleCellAddressToString = simpleCellAddressToString;
const simpleCellRangeToString = (sheetIndexMapping, address, sheetIndex) => {
  const startString = simpleCellAddressToString(sheetIndexMapping, address.start, sheetIndex);
  const endString = simpleCellAddressToString(sheetIndexMapping, address.end, address.start.sheet);
  if (startString === undefined || endString === undefined) {
    return undefined;
  } else {
    return `${startString}${_parserConsts.RANGE_OPERATOR}${endString}`;
  }
};
/**
 * Convert column label to index
 *
 * @param columnStringRepresentation - column label (e.g. 'AAB')
 * @returns column index
 */
exports.simpleCellRangeToString = simpleCellRangeToString;
function columnLabelToIndex(columnStringRepresentation) {
  if (columnStringRepresentation.length === 1) {
    return columnStringRepresentation.toUpperCase().charCodeAt(0) - 65;
  } else {
    return columnStringRepresentation.split('').reduce((currentColumn, nextLetter) => {
      return currentColumn * 26 + (nextLetter.toUpperCase().charCodeAt(0) - 64);
    }, 0) - 1;
  }
}
/**
 * Converts column index to label
 *
 * @param column - address to convert
 * @returns string representation, e.g. 'AAB'
 */
function columnIndexToLabel(column) {
  let result = '';
  while (column >= 0) {
    result = String.fromCharCode(column % 26 + 97) + result;
    column = Math.floor(column / 26) - 1;
  }
  return result.toUpperCase();
}
function sheetIndexToString(sheetId, sheetMappingFn) {
  let sheetName = sheetMappingFn(sheetId);
  if (sheetName === undefined) {
    return undefined;
  }
  if (simpleSheetNameRegex.test(sheetName)) {
    return sheetName;
  } else {
    sheetName = sheetName.replace(/'/g, "''");
    return `'${sheetName}'`;
  }
}
function extractSheetNumber(regexResult, sheetMapping) {
  var _a;
  let maybeSheetName = (_a = regexResult[3]) !== null && _a !== void 0 ? _a : regexResult[2];
  if (maybeSheetName) {
    maybeSheetName = maybeSheetName.replace(/''/g, "'");
    return sheetMapping(maybeSheetName);
  } else {
    return null;
  }
}