/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */
import { CellError, movedSimpleCellAddress } from '../Cell';
import { AddRowsTransformer } from '../dependencyTransformers/AddRowsTransformer';
import { RemoveRowsTransformer } from '../dependencyTransformers/RemoveRowsTransformer';
import { forceNormalizeString } from '../interpreter/ArithmeticHelper';
import { EmptyValue, getRawValue } from '../interpreter/InterpreterValue';
import { SimpleRangeValue } from '../SimpleRangeValue';
import { StatType } from '../statistics';
import { ColumnBinarySearch } from './ColumnBinarySearch';
export class ColumnIndex {
  constructor(dependencyGraph, config, stats) {
    this.dependencyGraph = dependencyGraph;
    this.config = config;
    this.stats = stats;
    this.index = new Map();
    this.transformingService = this.dependencyGraph.lazilyTransformingAstService;
    this.binarySearchStrategy = new ColumnBinarySearch(dependencyGraph);
  }
  add(value, address) {
    if (value === EmptyValue || value instanceof CellError) {
      return;
    } else if (value instanceof SimpleRangeValue) {
      for (const [arrayValue, cellAddress] of value.entriesFromTopLeftCorner(address)) {
        this.addSingleCellValue(getRawValue(arrayValue), cellAddress);
      }
    } else {
      this.addSingleCellValue(value, address);
    }
  }
  remove(value, address) {
    if (value === undefined) {
      return;
    }
    if (value instanceof SimpleRangeValue) {
      for (const [arrayValue, cellAddress] of value.entriesFromTopLeftCorner(address)) {
        this.removeSingleValue(getRawValue(arrayValue), cellAddress);
      }
    } else {
      this.removeSingleValue(value, address);
    }
  }
  change(oldValue, newValue, address) {
    if (oldValue === newValue) {
      return;
    }
    this.remove(oldValue, address);
    this.add(newValue, address);
  }
  applyChanges(contentChanges) {
    for (const change of contentChanges) {
      if (change.oldValue !== undefined) {
        this.change(getRawValue(change.oldValue), getRawValue(change.value), change.address);
      }
    }
  }
  moveValues(sourceRange, toRight, toBottom, toSheet) {
    for (const [value, address] of sourceRange) {
      const targetAddress = movedSimpleCellAddress(address, toSheet, toRight, toBottom);
      this.remove(value, address);
      this.add(value, targetAddress);
    }
  }
  removeValues(range) {
    for (const [value, address] of range) {
      this.remove(value, address);
    }
  }
  /*
   * WARNING: Finding lower/upper bounds in unordered ranges is not supported. When ordering === 'none', assumes matchExactly === true
   */
  find(searchKey, rangeValue, {
    ordering,
    matchExactly
  }) {
    const handlingDuplicates = matchExactly === true ? 'findFirst' : 'findLast';
    const resultUsingColumnIndex = this.findUsingColumnIndex(searchKey, rangeValue, handlingDuplicates);
    return resultUsingColumnIndex !== undefined ? resultUsingColumnIndex : this.binarySearchStrategy.find(searchKey, rangeValue, {
      ordering,
      matchExactly
    });
  }
  findUsingColumnIndex(key, rangeValue, handlingDuplicates) {
    const range = rangeValue.range;
    if (range === undefined) {
      return undefined;
    }
    this.ensureRecentData(range.sheet, range.start.col, key);
    const columnMap = this.getColumnMap(range.sheet, range.start.col);
    if (!columnMap) {
      return -1;
    }
    const normalizedKey = typeof key === 'string' ? forceNormalizeString(key) : key;
    const valueIndexForTheKey = columnMap.get(normalizedKey);
    if (!valueIndexForTheKey || !valueIndexForTheKey.index || valueIndexForTheKey.index.length === 0) {
      return undefined;
    }
    const rowNumber = ColumnIndex.findRowBelongingToRange(valueIndexForTheKey, range, handlingDuplicates);
    return rowNumber !== undefined ? rowNumber - range.start.row : undefined;
  }
  static findRowBelongingToRange(valueIndex, range, handlingDuplicates) {
    const start = range.start.row;
    const end = range.end.row;
    const positionInIndex = handlingDuplicates === 'findFirst' ? findInOrderedArray(start, valueIndex.index, 'upperBound') : findInOrderedArray(end, valueIndex.index, 'lowerBound');
    if (positionInIndex === -1) {
      return undefined;
    }
    const rowNumber = valueIndex.index[positionInIndex];
    const isRowNumberBelongingToRange = rowNumber >= start && rowNumber <= end;
    return isRowNumberBelongingToRange ? rowNumber : undefined;
  }
  advancedFind(keyMatcher, range) {
    return this.binarySearchStrategy.advancedFind(keyMatcher, range);
  }
  addColumns(columnsSpan) {
    const sheetIndex = this.index.get(columnsSpan.sheet);
    if (!sheetIndex) {
      return;
    }
    sheetIndex.splice(columnsSpan.columnStart, 0, ...Array(columnsSpan.numberOfColumns));
  }
  removeColumns(columnsSpan) {
    const sheetIndex = this.index.get(columnsSpan.sheet);
    if (!sheetIndex) {
      return;
    }
    sheetIndex.splice(columnsSpan.columnStart, columnsSpan.numberOfColumns);
  }
  removeSheet(sheetId) {
    this.index.delete(sheetId);
  }
  getColumnMap(sheet, col) {
    if (!this.index.has(sheet)) {
      this.index.set(sheet, []);
    }
    const sheetMap = this.index.get(sheet); // eslint-disable-line @typescript-eslint/no-non-null-assertion
    let columnMap = sheetMap[col];
    if (!columnMap) {
      columnMap = new Map();
      sheetMap[col] = columnMap;
    }
    return columnMap;
  }
  getValueIndex(sheet, col, value) {
    const columnMap = this.getColumnMap(sheet, col);
    let index = this.getColumnMap(sheet, col).get(value);
    if (!index) {
      index = {
        version: this.transformingService.version(),
        index: []
      };
      columnMap.set(value, index);
    }
    return index;
  }
  ensureRecentData(sheet, col, value) {
    const valueIndex = this.getValueIndex(sheet, col, value);
    const actualVersion = this.transformingService.version();
    if (valueIndex.version === actualVersion) {
      return;
    }
    const relevantTransformations = this.transformingService.getTransformationsFrom(valueIndex.version, transformation => {
      return transformation.sheet === sheet && (transformation instanceof AddRowsTransformer || transformation instanceof RemoveRowsTransformer);
    });
    for (const transformation of relevantTransformations) {
      if (transformation instanceof AddRowsTransformer) {
        this.addRows(col, transformation.rowsSpan, value);
      } else if (transformation instanceof RemoveRowsTransformer) {
        this.removeRows(col, transformation.rowsSpan, value);
      }
    }
    valueIndex.version = actualVersion;
  }
  addSingleCellValue(value, address) {
    this.stats.measure(StatType.BUILD_COLUMN_INDEX, () => {
      this.ensureRecentData(address.sheet, address.col, value);
      if (typeof value === 'string') {
        value = forceNormalizeString(value);
      }
      const valueIndex = this.getValueIndex(address.sheet, address.col, value);
      ColumnIndex.addValue(valueIndex, address.row);
    });
  }
  removeSingleValue(value, address) {
    this.stats.measure(StatType.BUILD_COLUMN_INDEX, () => {
      this.ensureRecentData(address.sheet, address.col, value);
      const columnMap = this.getColumnMap(address.sheet, address.col);
      if (typeof value === 'string') {
        value = forceNormalizeString(value);
      }
      const valueIndex = columnMap.get(value);
      if (!valueIndex) {
        return;
      }
      const positionInIndex = findInOrderedArray(address.row, valueIndex.index);
      if (positionInIndex > -1) {
        valueIndex.index.splice(positionInIndex, 1);
      }
      if (valueIndex.index.length === 0) {
        columnMap.delete(value);
      }
      if (columnMap.size === 0) {
        delete this.index.get(address.sheet)[address.col]; // eslint-disable-line @typescript-eslint/no-non-null-assertion
      }
    });
  }

  addRows(col, rowsSpan, value) {
    const valueIndex = this.getValueIndex(rowsSpan.sheet, col, value);
    ColumnIndex.shiftRows(valueIndex, rowsSpan.rowStart, rowsSpan.numberOfRows);
  }
  removeRows(col, rowsSpan, value) {
    const valueIndex = this.getValueIndex(rowsSpan.sheet, col, value);
    ColumnIndex.removeRowsFromValues(valueIndex, rowsSpan);
    ColumnIndex.shiftRows(valueIndex, rowsSpan.rowEnd + 1, -rowsSpan.numberOfRows);
  }
  static addValue(valueIndex, rowNumber) {
    const rowIndex = findInOrderedArray(rowNumber, valueIndex.index, 'lowerBound');
    const isRowNumberAlreadyInIndex = valueIndex.index[rowIndex] === rowNumber;
    if (!isRowNumberAlreadyInIndex) {
      valueIndex.index.splice(rowIndex + 1, 0, rowNumber);
    }
  }
  static removeRowsFromValues(valueIndex, rowsSpan) {
    const start = findInOrderedArray(rowsSpan.rowStart, valueIndex.index, 'upperBound');
    const end = findInOrderedArray(rowsSpan.rowEnd, valueIndex.index, 'lowerBound');
    const isFoundSpanValid = start > -1 && end > -1 && start <= end && valueIndex.index[start] <= rowsSpan.rowEnd;
    if (isFoundSpanValid) {
      valueIndex.index.splice(start, end - start + 1);
    }
  }
  static shiftRows(valueIndex, afterRow, numberOfRows) {
    const positionInIndex = findInOrderedArray(afterRow, valueIndex.index, 'upperBound');
    if (positionInIndex === -1) {
      return;
    }
    for (let i = positionInIndex; i < valueIndex.index.length; ++i) {
      valueIndex.index[i] += numberOfRows;
    }
  }
}
/*
 * Returns:
 * - index of the key, if the key exists in the array,
 * - index of the lower/upper bound (depending on handlingMisses parameter) otherwise.
 * Assumption: The array is ordered ascending and contains no repetitions.
 */
export function findInOrderedArray(key, values, handlingMisses = 'upperBound') {
  let start = 0;
  let end = values.length - 1;
  while (start <= end) {
    const center = Math.floor((start + end) / 2);
    if (key > values[center]) {
      start = center + 1;
    } else if (key < values[center]) {
      end = center - 1;
    } else {
      return center;
    }
  }
  const foundIndex = handlingMisses === 'lowerBound' ? end : start;
  const isIndexInRange = foundIndex >= 0 && foundIndex <= values.length;
  return isIndexInRange ? foundIndex : -1;
}