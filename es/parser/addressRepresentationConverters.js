/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */
import { simpleCellRange } from '../AbsoluteCellRange';
import { simpleCellAddress } from '../Cell';
import { CellAddress } from './CellAddress';
import { ColumnAddress } from './ColumnAddress';
import { ABSOLUTE_OPERATOR, RANGE_OPERATOR, SHEET_NAME_PATTERN, UNQUOTED_SHEET_NAME_PATTERN, IMMUTABLE_CELL_REFERENCE_PATTERN, IMMUTABLE_COL_REFERENCE_PATTERN, IMMUTABLE_ROW_REFERENCE_PATTERN } from './parser-consts';
import { RowAddress } from './RowAddress';
const addressRegex = new RegExp(`^(${SHEET_NAME_PATTERN})?(\\${ABSOLUTE_OPERATOR}?)([A-Za-z]+)(\\${ABSOLUTE_OPERATOR}?)([0-9]+)$`);
const columnRegex = new RegExp(`^(${SHEET_NAME_PATTERN})?(\\${ABSOLUTE_OPERATOR}?)([A-Za-z]+)$`);
const rowRegex = new RegExp(`^(${SHEET_NAME_PATTERN})?(\\${ABSOLUTE_OPERATOR}?)([0-9]+)$`);
const simpleSheetNameRegex = new RegExp(`^${UNQUOTED_SHEET_NAME_PATTERN}$`);
const immutableCellRegex = new RegExp(IMMUTABLE_CELL_REFERENCE_PATTERN);
const immutableColRegex = new RegExp(IMMUTABLE_COL_REFERENCE_PATTERN);
const immutableRowRegex = new RegExp(IMMUTABLE_ROW_REFERENCE_PATTERN);
/**
 * Computes R0C0 representation of cell address based on it's string representation and base address.
 *
 * @param sheetMapping - mapping function needed to change name of a sheet to index
 * @param stringAddress - string representation of cell address, e.g. 'C64'
 * @param baseAddress - base address for R0C0 conversion
 * @returns object representation of address
 */
export const cellAddressFromString = (sheetMapping, stringAddress, baseAddress) => {
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
  if (result[5] === ABSOLUTE_OPERATOR && result[7] === ABSOLUTE_OPERATOR) {
    return CellAddress.absolute(col, row, sheet);
  } else if (result[5] === ABSOLUTE_OPERATOR) {
    return CellAddress.absoluteCol(col, row - baseAddress.row, sheet);
  } else if (result[7] === ABSOLUTE_OPERATOR) {
    return CellAddress.absoluteRow(col - baseAddress.col, row, sheet);
  } else {
    return CellAddress.relative(col - baseAddress.col, row - baseAddress.row, sheet);
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
export const cellAddressFromImmutableReference = (immutableReferenceMapping, stringAddress, baseAddress) => {
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
    return CellAddress.absolute(col, row, sheet);
  } else if (absoluteCol === 'true') {
    return CellAddress.absoluteCol(col, row - baseAddress.row, sheet);
  } else if (absoluteRow === 'true') {
    return CellAddress.absoluteRow(col - baseAddress.col, row, sheet);
  } else {
    return CellAddress.relative(col - baseAddress.col, 0 - baseAddress.row, sheet);
  }
};
export const columnAddressFromString = (sheetMapping, stringAddress, baseAddress) => {
  const result = columnRegex.exec(stringAddress);
  let sheet = extractSheetNumber(result, sheetMapping);
  if (sheet === undefined) {
    return undefined;
  }
  if (sheet === null) {
    sheet = undefined;
  }
  const col = columnLabelToIndex(result[6]);
  if (result[5] === ABSOLUTE_OPERATOR) {
    return ColumnAddress.absolute(col, sheet);
  } else {
    return ColumnAddress.relative(col - baseAddress.col, sheet);
  }
};
export const colAddressFromImmutableReference = (immutableReferenceMapping, stringAddress, baseAddress) => {
  const result = immutableColRegex.exec(stringAddress);
  const [match, colId, absoluteCol, showSheet] = result;
  const address = immutableReferenceMapping.getColIndex(colId);
  if (address === undefined) return undefined;
  const col = address.col;
  let sheet = address.sheet;
  if (sheet === baseAddress.sheet && showSheet !== 'true') {
    sheet = undefined;
  }
  if (absoluteCol === 'true') {
    return ColumnAddress.absolute(col, sheet);
  } else {
    return ColumnAddress.relative(col - baseAddress.col, sheet);
  }
};
export const rowAddressFromString = (sheetMapping, stringAddress, baseAddress) => {
  const result = rowRegex.exec(stringAddress);
  let sheet = extractSheetNumber(result, sheetMapping);
  if (sheet === undefined) {
    return undefined;
  }
  if (sheet === null) {
    sheet = undefined;
  }
  const row = Number(result[6]) - 1;
  if (result[5] === ABSOLUTE_OPERATOR) {
    return RowAddress.absolute(row, sheet);
  } else {
    return RowAddress.relative(row - baseAddress.row, sheet);
  }
};
export const rowAddressFromImmutableReference = (immutableReferenceMapping, stringAddress, baseAddress) => {
  const result = immutableRowRegex.exec(stringAddress);
  const [match, rowId, absoluteRow, showSheet] = result;
  const address = immutableReferenceMapping.getRowIndex(rowId);
  if (address === undefined) return undefined;
  const row = address.row;
  let sheet = address.sheet;
  if (sheet === baseAddress.sheet && showSheet !== 'true') {
    sheet = undefined;
  }
  if (absoluteRow === 'true') {
    return RowAddress.absolute(row, sheet);
  } else {
    return RowAddress.relative(row - baseAddress.row, sheet);
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
export const simpleCellAddressFromString = (sheetMapping, stringAddress, sheetContext) => {
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
  return simpleCellAddress(sheet, col, row);
};
export const simpleCellRangeFromString = (sheetMapping, stringAddress, sheetContext) => {
  const split = stringAddress.split(RANGE_OPERATOR);
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
  return simpleCellRange(start, end);
};
/**
 * Returns string representation of absolute address
 * If sheet index is not present in sheet mapping, returns undefined
 *
 * @param sheetIndexMapping - mapping function needed to change sheet index to sheet name
 * @param address - object representation of absolute address
 * @param sheetIndex - if is not equal with address sheet index, string representation will contain sheet name
 */
export const simpleCellAddressToString = (sheetIndexMapping, address, sheetIndex) => {
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
export const simpleCellRangeToString = (sheetIndexMapping, address, sheetIndex) => {
  const startString = simpleCellAddressToString(sheetIndexMapping, address.start, sheetIndex);
  const endString = simpleCellAddressToString(sheetIndexMapping, address.end, address.start.sheet);
  if (startString === undefined || endString === undefined) {
    return undefined;
  } else {
    return `${startString}${RANGE_OPERATOR}${endString}`;
  }
};
/**
 * Convert column label to index
 *
 * @param columnStringRepresentation - column label (e.g. 'AAB')
 * @returns column index
 */
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
export function columnIndexToLabel(column) {
  let result = '';
  while (column >= 0) {
    result = String.fromCharCode(column % 26 + 97) + result;
    column = Math.floor(column / 26) - 1;
  }
  return result.toUpperCase();
}
export function sheetIndexToString(sheetId, sheetMappingFn) {
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