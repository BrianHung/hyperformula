"use strict";

exports.__esModule = true;
exports.RemoveRowsCommand = exports.RemoveColumnsCommand = exports.Operations = exports.AddRowsCommand = exports.AddColumnsCommand = void 0;
exports.normalizeAddedIndexes = normalizeAddedIndexes;
exports.normalizeRemovedIndexes = normalizeRemovedIndexes;
var _AbsoluteCellRange = require("./AbsoluteCellRange");
var _absolutizeDependencies = require("./absolutizeDependencies");
var _ArraySize = require("./ArraySize");
var _Cell = require("./Cell");
var _CellContentParser = require("./CellContentParser");
var _ClipboardOperations = require("./ClipboardOperations");
var _ContentChanges = require("./ContentChanges");
var _DependencyGraph = require("./DependencyGraph");
var _FormulaCellVertex = require("./DependencyGraph/FormulaCellVertex");
var _AddColumnsTransformer = require("./dependencyTransformers/AddColumnsTransformer");
var _AddRowsTransformer = require("./dependencyTransformers/AddRowsTransformer");
var _CleanOutOfScopeDependenciesTransformer = require("./dependencyTransformers/CleanOutOfScopeDependenciesTransformer");
var _MoveCellsTransformer = require("./dependencyTransformers/MoveCellsTransformer");
var _RemoveColumnsTransformer = require("./dependencyTransformers/RemoveColumnsTransformer");
var _RemoveRowsTransformer = require("./dependencyTransformers/RemoveRowsTransformer");
var _RemoveSheetTransformer = require("./dependencyTransformers/RemoveSheetTransformer");
var _errors = require("./errors");
var _InterpreterValue = require("./interpreter/InterpreterValue");
var _NamedExpressions = require("./NamedExpressions");
var _parser = require("./parser");
var _Sheet = require("./Sheet");
var _Span = require("./Span");
var _statistics = require("./statistics");
/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */

class RemoveRowsCommand {
  constructor(sheet, indexes) {
    this.sheet = sheet;
    this.indexes = indexes;
  }
  normalizedIndexes() {
    return normalizeRemovedIndexes(this.indexes);
  }
  rowsSpans() {
    return this.normalizedIndexes().map(normalizedIndex => _Span.RowsSpan.fromNumberOfRows(this.sheet, normalizedIndex[0], normalizedIndex[1]));
  }
}
exports.RemoveRowsCommand = RemoveRowsCommand;
class AddRowsCommand {
  constructor(sheet, indexes) {
    this.sheet = sheet;
    this.indexes = indexes;
  }
  normalizedIndexes() {
    return normalizeAddedIndexes(this.indexes);
  }
  rowsSpans() {
    return this.normalizedIndexes().map(normalizedIndex => _Span.RowsSpan.fromNumberOfRows(this.sheet, normalizedIndex[0], normalizedIndex[1]));
  }
}
exports.AddRowsCommand = AddRowsCommand;
class AddColumnsCommand {
  constructor(sheet, indexes) {
    this.sheet = sheet;
    this.indexes = indexes;
  }
  normalizedIndexes() {
    return normalizeAddedIndexes(this.indexes);
  }
  columnsSpans() {
    return this.normalizedIndexes().map(normalizedIndex => _Span.ColumnsSpan.fromNumberOfColumns(this.sheet, normalizedIndex[0], normalizedIndex[1]));
  }
}
exports.AddColumnsCommand = AddColumnsCommand;
class RemoveColumnsCommand {
  constructor(sheet, indexes) {
    this.sheet = sheet;
    this.indexes = indexes;
  }
  normalizedIndexes() {
    return normalizeRemovedIndexes(this.indexes);
  }
  columnsSpans() {
    return this.normalizedIndexes().map(normalizedIndex => _Span.ColumnsSpan.fromNumberOfColumns(this.sheet, normalizedIndex[0], normalizedIndex[1]));
  }
}
exports.RemoveColumnsCommand = RemoveColumnsCommand;
class Operations {
  constructor(config, dependencyGraph, columnSearch, cellContentParser, parser, stats, lazilyTransformingAstService, namedExpressions, arraySizePredictor) {
    this.dependencyGraph = dependencyGraph;
    this.columnSearch = columnSearch;
    this.cellContentParser = cellContentParser;
    this.parser = parser;
    this.stats = stats;
    this.lazilyTransformingAstService = lazilyTransformingAstService;
    this.namedExpressions = namedExpressions;
    this.arraySizePredictor = arraySizePredictor;
    this.changes = _ContentChanges.ContentChanges.empty();
    this.allocateNamedExpressionAddressSpace();
    this.maxColumns = config.maxColumns;
    this.maxRows = config.maxRows;
  }
  get sheetMapping() {
    return this.dependencyGraph.sheetMapping;
  }
  get addressMapping() {
    return this.dependencyGraph.addressMapping;
  }
  removeRows(cmd) {
    const rowsRemovals = [];
    for (const rowsToRemove of cmd.rowsSpans()) {
      const rowsRemoval = this.doRemoveRows(rowsToRemove);
      if (rowsRemoval) {
        rowsRemovals.push(rowsRemoval);
      }
    }
    return rowsRemovals;
  }
  addRows(cmd) {
    for (const addedRows of cmd.rowsSpans()) {
      this.doAddRows(addedRows);
    }
  }
  addColumns(cmd) {
    for (const addedColumns of cmd.columnsSpans()) {
      this.doAddColumns(addedColumns);
    }
  }
  removeColumns(cmd) {
    const columnsRemovals = [];
    for (const columnsToRemove of cmd.columnsSpans()) {
      const columnsRemoval = this.doRemoveColumns(columnsToRemove);
      if (columnsRemoval) {
        columnsRemovals.push(columnsRemoval);
      }
    }
    return columnsRemovals;
  }
  removeSheet(sheetId) {
    this.dependencyGraph.removeSheet(sheetId);
    let version;
    this.stats.measure(_statistics.StatType.TRANSFORM_ASTS, () => {
      const transformation = new _RemoveSheetTransformer.RemoveSheetTransformer(sheetId);
      transformation.performEagerTransformations(this.dependencyGraph, this.parser);
      version = this.lazilyTransformingAstService.addTransformation(transformation);
    });
    this.sheetMapping.removeSheet(sheetId);
    this.columnSearch.removeSheet(sheetId);
    const scopedNamedExpressions = this.namedExpressions.getAllNamedExpressionsForScope(sheetId).map(namedexpression => this.removeNamedExpression(namedexpression.normalizeExpressionName(), sheetId));
    return {
      version: version,
      scopedNamedExpressions
    };
  }
  removeSheetByName(sheetName) {
    const sheetId = this.sheetMapping.fetch(sheetName);
    return this.removeSheet(sheetId);
  }
  clearSheet(sheetId) {
    this.dependencyGraph.clearSheet(sheetId);
    this.columnSearch.removeSheet(sheetId);
  }
  addSheet(name) {
    const sheetId = this.sheetMapping.addSheet(name);
    const sheet = [];
    this.dependencyGraph.addressMapping.autoAddSheet(sheetId, (0, _Sheet.findBoundaries)(sheet));
    return this.sheetMapping.fetchDisplayName(sheetId);
  }
  renameSheet(sheetId, newName) {
    return this.sheetMapping.renameSheet(sheetId, newName);
  }
  moveRows(sheet, startRow, numberOfRows, targetRow) {
    const rowsToAdd = _Span.RowsSpan.fromNumberOfRows(sheet, targetRow, numberOfRows);
    this.lazilyTransformingAstService.beginCombinedMode(sheet);
    this.doAddRows(rowsToAdd);
    if (targetRow < startRow) {
      startRow += numberOfRows;
    }
    const startAddress = (0, _Cell.simpleCellAddress)(sheet, 0, startRow);
    const targetAddress = (0, _Cell.simpleCellAddress)(sheet, 0, targetRow);
    this.moveCells(startAddress, Number.POSITIVE_INFINITY, numberOfRows, targetAddress);
    const rowsToRemove = _Span.RowsSpan.fromNumberOfRows(sheet, startRow, numberOfRows);
    this.doRemoveRows(rowsToRemove);
    return this.lazilyTransformingAstService.commitCombinedMode();
  }
  moveColumns(sheet, startColumn, numberOfColumns, targetColumn) {
    const columnsToAdd = _Span.ColumnsSpan.fromNumberOfColumns(sheet, targetColumn, numberOfColumns);
    this.lazilyTransformingAstService.beginCombinedMode(sheet);
    this.doAddColumns(columnsToAdd);
    if (targetColumn < startColumn) {
      startColumn += numberOfColumns;
    }
    const startAddress = (0, _Cell.simpleCellAddress)(sheet, startColumn, 0);
    const targetAddress = (0, _Cell.simpleCellAddress)(sheet, targetColumn, 0);
    this.moveCells(startAddress, numberOfColumns, Number.POSITIVE_INFINITY, targetAddress);
    const columnsToRemove = _Span.ColumnsSpan.fromNumberOfColumns(sheet, startColumn, numberOfColumns);
    this.doRemoveColumns(columnsToRemove);
    return this.lazilyTransformingAstService.commitCombinedMode();
  }
  moveCells(sourceLeftCorner, width, height, destinationLeftCorner) {
    this.ensureItIsPossibleToMoveCells(sourceLeftCorner, width, height, destinationLeftCorner);
    const sourceRange = _AbsoluteCellRange.AbsoluteCellRange.spanFrom(sourceLeftCorner, width, height);
    const targetRange = _AbsoluteCellRange.AbsoluteCellRange.spanFrom(destinationLeftCorner, width, height);
    const toRight = destinationLeftCorner.col - sourceLeftCorner.col;
    const toBottom = destinationLeftCorner.row - sourceLeftCorner.row;
    const toSheet = destinationLeftCorner.sheet;
    const currentDataAtTarget = this.getRangeClipboardCells(targetRange);
    const valuesToRemove = this.dependencyGraph.rawValuesFromRange(targetRange);
    this.columnSearch.removeValues(valuesToRemove);
    const valuesToMove = this.dependencyGraph.rawValuesFromRange(sourceRange);
    this.columnSearch.moveValues(valuesToMove, toRight, toBottom, toSheet);
    let version;
    this.stats.measure(_statistics.StatType.TRANSFORM_ASTS, () => {
      const transformation = new _MoveCellsTransformer.MoveCellsTransformer(sourceRange, toRight, toBottom, toSheet);
      transformation.performEagerTransformations(this.dependencyGraph, this.parser);
      version = this.lazilyTransformingAstService.addTransformation(transformation);
    });
    this.dependencyGraph.moveCells(sourceRange, toRight, toBottom, toSheet);
    const addedGlobalNamedExpressions = this.updateNamedExpressionsForMovedCells(sourceLeftCorner, width, height, destinationLeftCorner);
    return {
      version: version,
      overwrittenCellsData: currentDataAtTarget,
      addedGlobalNamedExpressions: addedGlobalNamedExpressions
    };
  }
  setRowOrder(sheetId, rowMapping) {
    const buffer = [];
    let oldContent = [];
    for (const [source, target] of rowMapping) {
      if (source !== target) {
        const rowRange = _AbsoluteCellRange.AbsoluteCellRange.spanFrom({
          sheet: sheetId,
          col: 0,
          row: source
        }, Infinity, 1);
        const row = this.getRangeClipboardCells(rowRange);
        oldContent = oldContent.concat(row);
        buffer.push(row.map(([{
          sheet,
          col
        }, cell]) => [{
          sheet,
          col,
          row: target
        }, cell]));
      }
    }
    buffer.forEach(row => this.restoreClipboardCells(sheetId, row.values()));
    return oldContent;
  }
  setColumnOrder(sheetId, columnMapping) {
    const buffer = [];
    let oldContent = [];
    for (const [source, target] of columnMapping) {
      if (source !== target) {
        const rowRange = _AbsoluteCellRange.AbsoluteCellRange.spanFrom({
          sheet: sheetId,
          col: source,
          row: 0
        }, 1, Infinity);
        const column = this.getRangeClipboardCells(rowRange);
        oldContent = oldContent.concat(column);
        buffer.push(column.map(([{
          sheet,
          col: _col,
          row
        }, cell]) => [{
          sheet,
          col: target,
          row
        }, cell]));
      }
    }
    buffer.forEach(column => this.restoreClipboardCells(sheetId, column.values()));
    return oldContent;
  }
  addNamedExpression(expressionName, expression, sheetId, options) {
    const namedExpression = this.namedExpressions.addNamedExpression(expressionName, sheetId, options);
    this.storeNamedExpressionInCell(namedExpression.address, expression);
    this.adjustNamedExpressionEdges(namedExpression, expressionName, sheetId);
  }
  restoreNamedExpression(namedExpression, content, sheetId) {
    const expressionName = namedExpression.displayName;
    this.restoreCell(namedExpression.address, content);
    const restoredNamedExpression = this.namedExpressions.restoreNamedExpression(namedExpression, sheetId);
    this.adjustNamedExpressionEdges(restoredNamedExpression, expressionName, sheetId);
  }
  changeNamedExpressionExpression(expressionName, newExpression, sheetId, options) {
    const namedExpression = this.namedExpressions.namedExpressionForScope(expressionName, sheetId);
    if (!namedExpression) {
      throw new _errors.NamedExpressionDoesNotExistError(expressionName);
    }
    const oldNamedExpression = namedExpression.copy();
    namedExpression.options = options;
    const content = this.getClipboardCell(namedExpression.address);
    this.storeNamedExpressionInCell(namedExpression.address, newExpression);
    return [oldNamedExpression, content];
  }
  removeNamedExpression(expressionName, sheetId) {
    const namedExpression = this.namedExpressions.namedExpressionForScope(expressionName, sheetId);
    if (!namedExpression) {
      throw new _errors.NamedExpressionDoesNotExistError(expressionName);
    }
    this.namedExpressions.remove(namedExpression.displayName, sheetId);
    const content = this.getClipboardCell(namedExpression.address);
    if (sheetId !== undefined) {
      const globalNamedExpression = this.namedExpressions.workbookNamedExpressionOrPlaceholder(expressionName);
      this.dependencyGraph.exchangeNode(namedExpression.address, globalNamedExpression.address);
    } else {
      this.dependencyGraph.setCellEmpty(namedExpression.address);
    }
    return [namedExpression, content];
  }
  ensureItIsPossibleToMoveCells(sourceLeftCorner, width, height, destinationLeftCorner) {
    if ((0, _Cell.invalidSimpleCellAddress)(sourceLeftCorner) || !(isPositiveInteger(width) && isPositiveInteger(height) || isRowOrColumnRange(sourceLeftCorner, width, height)) || (0, _Cell.invalidSimpleCellAddress)(destinationLeftCorner) || !this.sheetMapping.hasSheetWithId(sourceLeftCorner.sheet) || !this.sheetMapping.hasSheetWithId(destinationLeftCorner.sheet)) {
      throw new _errors.InvalidArgumentsError('a valid range of cells to move.');
    }
    const sourceRange = _AbsoluteCellRange.AbsoluteCellRange.spanFrom(sourceLeftCorner, width, height);
    const targetRange = _AbsoluteCellRange.AbsoluteCellRange.spanFrom(destinationLeftCorner, width, height);
    if (targetRange.exceedsSheetSizeLimits(this.maxColumns, this.maxRows)) {
      throw new _errors.SheetSizeLimitExceededError();
    }
    if (this.dependencyGraph.arrayMapping.isFormulaArrayInRange(sourceRange)) {
      throw new _errors.SourceLocationHasArrayError();
    }
    if (this.dependencyGraph.arrayMapping.isFormulaArrayInRange(targetRange)) {
      throw new _errors.TargetLocationHasArrayError();
    }
  }
  restoreClipboardCells(sourceSheetId, cells) {
    const addedNamedExpressions = [];
    for (const [address, clipboardCell] of cells) {
      this.restoreCell(address, clipboardCell);
      if (clipboardCell.type === _ClipboardOperations.ClipboardCellType.FORMULA) {
        const {
          dependencies
        } = this.parser.fetchCachedResult(clipboardCell.hash);
        addedNamedExpressions.push(...this.updateNamedExpressionsForTargetAddress(sourceSheetId, address, dependencies));
      }
    }
    return addedNamedExpressions;
  }
  restoreCell(address, clipboardCell) {
    switch (clipboardCell.type) {
      case _ClipboardOperations.ClipboardCellType.VALUE:
        {
          this.setValueToCell(clipboardCell, address);
          break;
        }
      case _ClipboardOperations.ClipboardCellType.FORMULA:
        {
          this.setFormulaToCellFromCache(clipboardCell.hash, address);
          break;
        }
      case _ClipboardOperations.ClipboardCellType.EMPTY:
        {
          this.setCellEmpty(address);
          break;
        }
      case _ClipboardOperations.ClipboardCellType.PARSING_ERROR:
        {
          this.setParsingErrorToCell(clipboardCell.rawInput, clipboardCell.errors, address);
          break;
        }
    }
  }
  getOldContent(address) {
    const vertex = this.dependencyGraph.getCell(address);
    if (vertex === undefined || vertex instanceof _DependencyGraph.EmptyCellVertex) {
      return [address, {
        type: _ClipboardOperations.ClipboardCellType.EMPTY
      }];
    } else if (vertex instanceof _DependencyGraph.ValueCellVertex) {
      return [address, Object.assign({
        type: _ClipboardOperations.ClipboardCellType.VALUE
      }, vertex.getValues())];
    } else if (vertex instanceof _FormulaCellVertex.FormulaVertex) {
      return [vertex.getAddress(this.lazilyTransformingAstService), {
        type: _ClipboardOperations.ClipboardCellType.FORMULA,
        hash: this.parser.computeHashFromAst(vertex.getFormula(this.lazilyTransformingAstService))
      }];
    } else if (vertex instanceof _DependencyGraph.ParsingErrorVertex) {
      return [address, {
        type: _ClipboardOperations.ClipboardCellType.PARSING_ERROR,
        rawInput: vertex.rawInput,
        errors: vertex.errors
      }];
    }
    throw Error('Trying to copy unsupported type');
  }
  getClipboardCell(address) {
    const vertex = this.dependencyGraph.getCell(address);
    if (vertex === undefined || vertex instanceof _DependencyGraph.EmptyCellVertex) {
      return {
        type: _ClipboardOperations.ClipboardCellType.EMPTY
      };
    } else if (vertex instanceof _DependencyGraph.ValueCellVertex) {
      return Object.assign({
        type: _ClipboardOperations.ClipboardCellType.VALUE
      }, vertex.getValues());
    } else if (vertex instanceof _DependencyGraph.ArrayVertex) {
      const val = vertex.getArrayCellValue(address);
      if (val === _InterpreterValue.EmptyValue) {
        return {
          type: _ClipboardOperations.ClipboardCellType.EMPTY
        };
      }
      return {
        type: _ClipboardOperations.ClipboardCellType.VALUE,
        parsedValue: val,
        rawValue: vertex.getArrayCellRawValue(address)
      };
    } else if (vertex instanceof _DependencyGraph.FormulaCellVertex) {
      return {
        type: _ClipboardOperations.ClipboardCellType.FORMULA,
        hash: this.parser.computeHashFromAst(vertex.getFormula(this.lazilyTransformingAstService))
      };
    } else if (vertex instanceof _DependencyGraph.ParsingErrorVertex) {
      return {
        type: _ClipboardOperations.ClipboardCellType.PARSING_ERROR,
        rawInput: vertex.rawInput,
        errors: vertex.errors
      };
    }
    throw Error('Trying to copy unsupported type');
  }
  getSheetClipboardCells(sheet) {
    const sheetHeight = this.dependencyGraph.getSheetHeight(sheet);
    const sheetWidth = this.dependencyGraph.getSheetWidth(sheet);
    const arr = new Array(sheetHeight);
    for (let i = 0; i < sheetHeight; i++) {
      arr[i] = new Array(sheetWidth);
      for (let j = 0; j < sheetWidth; j++) {
        const address = (0, _Cell.simpleCellAddress)(sheet, j, i);
        arr[i][j] = this.getClipboardCell(address);
      }
    }
    return arr;
  }
  getRangeClipboardCells(range) {
    const result = [];
    for (const address of range.addresses(this.dependencyGraph)) {
      result.push([address, this.getClipboardCell(address)]);
    }
    return result;
  }
  setCellContent(address, newCellContent) {
    const parsedCellContent = this.cellContentParser.parse(newCellContent);
    const oldContent = this.getOldContent(address);
    if (parsedCellContent instanceof _CellContentParser.CellContent.Formula) {
      const parserResult = this.parser.parse(parsedCellContent.formula, address);
      const {
        ast,
        errors
      } = parserResult;
      if (errors.length > 0) {
        this.setParsingErrorToCell(parsedCellContent.formula, errors, address);
      } else {
        const size = this.arraySizePredictor.checkArraySize(ast, address);
        this.setFormulaToCell(address, size, parserResult);
      }
    } else if (parsedCellContent instanceof _CellContentParser.CellContent.Empty) {
      this.setCellEmpty(address);
    } else {
      this.setValueToCell({
        parsedValue: parsedCellContent.value,
        rawValue: newCellContent
      }, address);
    }
    return oldContent;
  }
  setSheetContent(sheetId, newSheetContent) {
    this.clearSheet(sheetId);
    for (let i = 0; i < newSheetContent.length; i++) {
      for (let j = 0; j < newSheetContent[i].length; j++) {
        const address = (0, _Cell.simpleCellAddress)(sheetId, j, i);
        this.setCellContent(address, newSheetContent[i][j]);
      }
    }
  }
  setParsingErrorToCell(rawInput, errors, address) {
    const oldValue = this.dependencyGraph.getCellValue(address);
    const vertex = new _DependencyGraph.ParsingErrorVertex(errors, rawInput);
    const arrayChanges = this.dependencyGraph.setParsingErrorToCell(address, vertex);
    this.columnSearch.remove((0, _InterpreterValue.getRawValue)(oldValue), address);
    this.columnSearch.applyChanges(arrayChanges.getChanges());
    this.changes.addAll(arrayChanges);
    this.changes.addChange(vertex.getCellValue(), address);
  }
  setFormulaToCell(address, size, {
    ast,
    hasVolatileFunction,
    hasStructuralChangeFunction,
    dependencies
  }) {
    const oldValue = this.dependencyGraph.getCellValue(address);
    const arrayChanges = this.dependencyGraph.setFormulaToCell(address, ast, (0, _absolutizeDependencies.absolutizeDependencies)(dependencies, address), size, hasVolatileFunction, hasStructuralChangeFunction);
    this.columnSearch.remove((0, _InterpreterValue.getRawValue)(oldValue), address);
    this.columnSearch.applyChanges(arrayChanges.getChanges());
    this.changes.addAll(arrayChanges);
  }
  setValueToCell(value, address) {
    const oldValue = this.dependencyGraph.getCellValue(address);
    const arrayChanges = this.dependencyGraph.setValueToCell(address, value);
    this.columnSearch.change((0, _InterpreterValue.getRawValue)(oldValue), (0, _InterpreterValue.getRawValue)(value.parsedValue), address);
    this.columnSearch.applyChanges(arrayChanges.getChanges().filter(change => !(0, _Cell.equalSimpleCellAddress)(change.address, address)));
    this.changes.addAll(arrayChanges);
    this.changes.addChange(value.parsedValue, address);
  }
  setCellEmpty(address) {
    if (this.dependencyGraph.isArrayInternalCell(address)) {
      return;
    }
    const oldValue = this.dependencyGraph.getCellValue(address);
    const arrayChanges = this.dependencyGraph.setCellEmpty(address);
    this.columnSearch.remove((0, _InterpreterValue.getRawValue)(oldValue), address);
    this.columnSearch.applyChanges(arrayChanges.getChanges());
    this.changes.addAll(arrayChanges);
    this.changes.addChange(_InterpreterValue.EmptyValue, address);
  }
  setFormulaToCellFromCache(formulaHash, address) {
    const {
      ast,
      hasVolatileFunction,
      hasStructuralChangeFunction,
      dependencies
    } = this.parser.fetchCachedResult(formulaHash);
    const absoluteDependencies = (0, _absolutizeDependencies.absolutizeDependencies)(dependencies, address);
    const [cleanedAst] = new _CleanOutOfScopeDependenciesTransformer.CleanOutOfScopeDependenciesTransformer(address.sheet).transformSingleAst(ast, address);
    this.parser.rememberNewAst(cleanedAst);
    const cleanedDependencies = (0, _absolutizeDependencies.filterDependenciesOutOfScope)(absoluteDependencies);
    const size = this.arraySizePredictor.checkArraySize(ast, address);
    this.dependencyGraph.setFormulaToCell(address, cleanedAst, cleanedDependencies, size, hasVolatileFunction, hasStructuralChangeFunction);
  }
  /**
   * Returns true if row number is outside of given sheet.
   *
   * @param row - row number
   * @param sheet - sheet id number
   */
  rowEffectivelyNotInSheet(row, sheet) {
    const height = this.dependencyGraph.addressMapping.getHeight(sheet);
    return row >= height;
  }
  getAndClearContentChanges() {
    const changes = this.changes;
    this.changes = _ContentChanges.ContentChanges.empty();
    return changes;
  }
  forceApplyPostponedTransformations() {
    this.dependencyGraph.forceApplyPostponedTransformations();
  }
  /**
   * Removes multiple rows from sheet. </br>
   * Does nothing if rows are outside of effective sheet size.
   *
   * @param sheet - sheet id from which rows will be removed
   * @param rowStart - number of the first row to be deleted
   * @param rowEnd - number of the last row to be deleted
   */
  doRemoveRows(rowsToRemove) {
    if (this.rowEffectivelyNotInSheet(rowsToRemove.rowStart, rowsToRemove.sheet)) {
      return;
    }
    const removedCells = [];
    for (const [address] of this.dependencyGraph.entriesFromRowsSpan(rowsToRemove)) {
      removedCells.push({
        address,
        cellType: this.getClipboardCell(address)
      });
    }
    const {
      affectedArrays,
      contentChanges
    } = this.dependencyGraph.removeRows(rowsToRemove);
    this.columnSearch.applyChanges(contentChanges.getChanges());
    let version;
    this.stats.measure(_statistics.StatType.TRANSFORM_ASTS, () => {
      const transformation = new _RemoveRowsTransformer.RemoveRowsTransformer(rowsToRemove);
      transformation.performEagerTransformations(this.dependencyGraph, this.parser);
      version = this.lazilyTransformingAstService.addTransformation(transformation);
    });
    this.rewriteAffectedArrays(affectedArrays);
    return {
      version: version,
      removedCells,
      rowFrom: rowsToRemove.rowStart,
      rowCount: rowsToRemove.numberOfRows
    };
  }
  /**
   * Removes multiple columns from sheet. </br>
   * Does nothing if columns are outside of effective sheet size.
   *
   * @param sheet - sheet id from which columns will be removed
   * @param columnStart - number of the first column to be deleted
   * @param columnEnd - number of the last row to be deleted
   */
  doRemoveColumns(columnsToRemove) {
    if (this.columnEffectivelyNotInSheet(columnsToRemove.columnStart, columnsToRemove.sheet)) {
      return;
    }
    const removedCells = [];
    for (const [address] of this.dependencyGraph.entriesFromColumnsSpan(columnsToRemove)) {
      removedCells.push({
        address,
        cellType: this.getClipboardCell(address)
      });
    }
    const {
      affectedArrays,
      contentChanges
    } = this.dependencyGraph.removeColumns(columnsToRemove);
    this.columnSearch.applyChanges(contentChanges.getChanges());
    this.columnSearch.removeColumns(columnsToRemove);
    let version;
    this.stats.measure(_statistics.StatType.TRANSFORM_ASTS, () => {
      const transformation = new _RemoveColumnsTransformer.RemoveColumnsTransformer(columnsToRemove);
      transformation.performEagerTransformations(this.dependencyGraph, this.parser);
      version = this.lazilyTransformingAstService.addTransformation(transformation);
    });
    this.rewriteAffectedArrays(affectedArrays);
    return {
      version: version,
      removedCells,
      columnFrom: columnsToRemove.columnStart,
      columnCount: columnsToRemove.numberOfColumns
    };
  }
  /**
   * Add multiple rows to sheet. </br>
   * Does nothing if rows are outside of effective sheet size.
   *
   * @param sheet - sheet id in which rows will be added
   * @param row - row number above which the rows will be added
   * @param numberOfRowsToAdd - number of rows to add
   */
  doAddRows(addedRows) {
    if (this.rowEffectivelyNotInSheet(addedRows.rowStart, addedRows.sheet)) {
      return;
    }
    const {
      affectedArrays
    } = this.dependencyGraph.addRows(addedRows);
    this.stats.measure(_statistics.StatType.TRANSFORM_ASTS, () => {
      const transformation = new _AddRowsTransformer.AddRowsTransformer(addedRows);
      transformation.performEagerTransformations(this.dependencyGraph, this.parser);
      this.lazilyTransformingAstService.addTransformation(transformation);
    });
    this.rewriteAffectedArrays(affectedArrays);
  }
  rewriteAffectedArrays(affectedArrays) {
    for (const arrayVertex of affectedArrays.values()) {
      if (arrayVertex.array.size.isRef) {
        continue;
      }
      const ast = arrayVertex.getFormula(this.lazilyTransformingAstService);
      const address = arrayVertex.getAddress(this.lazilyTransformingAstService);
      const hash = this.parser.computeHashFromAst(ast);
      this.setFormulaToCellFromCache(hash, address);
    }
  }
  /**
   * Add multiple columns to sheet </br>
   * Does nothing if columns are outside of effective sheet size
   *
   * @param sheet - sheet id in which columns will be added
   * @param column - column number above which the columns will be added
   * @param numberOfColumns - number of columns to add
   */
  doAddColumns(addedColumns) {
    if (this.columnEffectivelyNotInSheet(addedColumns.columnStart, addedColumns.sheet)) {
      return;
    }
    const {
      affectedArrays,
      contentChanges
    } = this.dependencyGraph.addColumns(addedColumns);
    this.columnSearch.addColumns(addedColumns);
    this.columnSearch.applyChanges(contentChanges.getChanges());
    this.stats.measure(_statistics.StatType.TRANSFORM_ASTS, () => {
      const transformation = new _AddColumnsTransformer.AddColumnsTransformer(addedColumns);
      transformation.performEagerTransformations(this.dependencyGraph, this.parser);
      this.lazilyTransformingAstService.addTransformation(transformation);
    });
    this.rewriteAffectedArrays(affectedArrays);
  }
  /**
   * Returns true if row number is outside of given sheet.
   *
   * @param column - row number
   * @param sheet - sheet id number
   */
  columnEffectivelyNotInSheet(column, sheet) {
    const width = this.dependencyGraph.addressMapping.getWidth(sheet);
    return column >= width;
  }
  adjustNamedExpressionEdges(namedExpression, expressionName, sheetId) {
    if (sheetId === undefined) {
      return;
    }
    const {
      vertex: localVertex,
      id: maybeLocalVertexId
    } = this.dependencyGraph.fetchCellOrCreateEmpty(namedExpression.address);
    const localVertexId = maybeLocalVertexId !== null && maybeLocalVertexId !== void 0 ? maybeLocalVertexId : this.dependencyGraph.graph.getNodeId(localVertex);
    const globalNamedExpression = this.namedExpressions.workbookNamedExpressionOrPlaceholder(expressionName);
    const {
      vertex: globalVertex,
      id: maybeGlobalVertexId
    } = this.dependencyGraph.fetchCellOrCreateEmpty(globalNamedExpression.address);
    const globalVertexId = maybeGlobalVertexId !== null && maybeGlobalVertexId !== void 0 ? maybeGlobalVertexId : this.dependencyGraph.graph.getNodeId(globalVertex);
    for (const adjacentNode of this.dependencyGraph.graph.adjacentNodes(globalVertex)) {
      if (adjacentNode instanceof _DependencyGraph.FormulaCellVertex && adjacentNode.getAddress(this.lazilyTransformingAstService).sheet === sheetId) {
        const ast = adjacentNode.getFormula(this.lazilyTransformingAstService);
        const formulaAddress = adjacentNode.getAddress(this.lazilyTransformingAstService);
        const {
          dependencies
        } = this.parser.fetchCachedResultForAst(ast);
        for (const dependency of (0, _absolutizeDependencies.absolutizeDependencies)(dependencies, formulaAddress)) {
          if (dependency instanceof _parser.NamedExpressionDependency && dependency.name.toLowerCase() === namedExpression.displayName.toLowerCase()) {
            this.dependencyGraph.graph.removeEdge(globalVertexId, adjacentNode);
            this.dependencyGraph.graph.addEdge(localVertexId, adjacentNode);
          }
        }
      }
    }
  }
  storeNamedExpressionInCell(address, expression) {
    const parsedCellContent = this.cellContentParser.parse(expression);
    if (parsedCellContent instanceof _CellContentParser.CellContent.Formula) {
      const parsingResult = this.parser.parse(parsedCellContent.formula, (0, _Cell.simpleCellAddress)(-1, 0, 0));
      if ((0, _NamedExpressions.doesContainRelativeReferences)(parsingResult.ast)) {
        throw new _errors.NoRelativeAddressesAllowedError();
      }
      const {
        ast,
        hasVolatileFunction,
        hasStructuralChangeFunction,
        dependencies
      } = parsingResult;
      this.dependencyGraph.setFormulaToCell(address, ast, (0, _absolutizeDependencies.absolutizeDependencies)(dependencies, address), _ArraySize.ArraySize.scalar(), hasVolatileFunction, hasStructuralChangeFunction);
    } else if (parsedCellContent instanceof _CellContentParser.CellContent.Empty) {
      this.setCellEmpty(address);
    } else {
      this.setValueToCell({
        parsedValue: parsedCellContent.value,
        rawValue: expression
      }, address);
    }
  }
  updateNamedExpressionsForMovedCells(sourceLeftCorner, width, height, destinationLeftCorner) {
    if (sourceLeftCorner.sheet === destinationLeftCorner.sheet) {
      return [];
    }
    const addedGlobalNamedExpressions = [];
    const targetRange = _AbsoluteCellRange.AbsoluteCellRange.spanFrom(destinationLeftCorner, width, height);
    for (const formulaAddress of targetRange.addresses(this.dependencyGraph)) {
      const vertex = this.addressMapping.fetchCell(formulaAddress);
      if (vertex instanceof _DependencyGraph.FormulaCellVertex && formulaAddress.sheet !== sourceLeftCorner.sheet) {
        const ast = vertex.getFormula(this.lazilyTransformingAstService);
        const {
          dependencies
        } = this.parser.fetchCachedResultForAst(ast);
        addedGlobalNamedExpressions.push(...this.updateNamedExpressionsForTargetAddress(sourceLeftCorner.sheet, formulaAddress, dependencies));
      }
    }
    return addedGlobalNamedExpressions;
  }
  updateNamedExpressionsForTargetAddress(sourceSheet, targetAddress, dependencies) {
    if (sourceSheet === targetAddress.sheet) {
      return [];
    }
    const addedGlobalNamedExpressions = [];
    const vertex = this.addressMapping.fetchCell(targetAddress);
    for (const namedExpressionDependency of (0, _absolutizeDependencies.absolutizeDependencies)(dependencies, targetAddress)) {
      if (!(namedExpressionDependency instanceof _parser.NamedExpressionDependency)) {
        continue;
      }
      const expressionName = namedExpressionDependency.name;
      const sourceVertex = this.dependencyGraph.fetchNamedExpressionVertex(expressionName, sourceSheet).vertex;
      const namedExpressionInTargetScope = this.namedExpressions.isExpressionInScope(expressionName, targetAddress.sheet);
      const targetScopeExpressionVertex = namedExpressionInTargetScope ? this.dependencyGraph.fetchNamedExpressionVertex(expressionName, targetAddress.sheet).vertex : this.copyOrFetchGlobalNamedExpressionVertex(expressionName, sourceVertex, addedGlobalNamedExpressions);
      if (targetScopeExpressionVertex !== sourceVertex) {
        this.dependencyGraph.graph.removeEdgeIfExists(sourceVertex, vertex);
        this.dependencyGraph.graph.addEdge(targetScopeExpressionVertex, vertex);
      }
    }
    return addedGlobalNamedExpressions;
  }
  allocateNamedExpressionAddressSpace() {
    this.dependencyGraph.addressMapping.addSheet(_NamedExpressions.NamedExpressions.SHEET_FOR_WORKBOOK_EXPRESSIONS, new _DependencyGraph.SparseStrategy(0, 0));
  }
  copyOrFetchGlobalNamedExpressionVertex(expressionName, sourceVertex, addedNamedExpressions) {
    let expression = this.namedExpressions.namedExpressionForScope(expressionName);
    if (expression === undefined) {
      expression = this.namedExpressions.addNamedExpression(expressionName);
      addedNamedExpressions.push(expression.normalizeExpressionName());
      if (sourceVertex instanceof _DependencyGraph.FormulaCellVertex) {
        const parsingResult = this.parser.fetchCachedResultForAst(sourceVertex.getFormula(this.lazilyTransformingAstService));
        const {
          ast,
          hasVolatileFunction,
          hasStructuralChangeFunction,
          dependencies
        } = parsingResult;
        this.dependencyGraph.setFormulaToCell(expression.address, ast, (0, _absolutizeDependencies.absolutizeDependencies)(dependencies, expression.address), _ArraySize.ArraySize.scalar(), hasVolatileFunction, hasStructuralChangeFunction);
      } else if (sourceVertex instanceof _DependencyGraph.EmptyCellVertex) {
        this.setCellEmpty(expression.address);
      } else if (sourceVertex instanceof _DependencyGraph.ValueCellVertex) {
        this.setValueToCell(sourceVertex.getValues(), expression.address);
      }
    }
    return this.dependencyGraph.fetchCellOrCreateEmpty(expression.address).vertex;
  }
}
exports.Operations = Operations;
function normalizeRemovedIndexes(indexes) {
  if (indexes.length <= 1) {
    return indexes;
  }
  const sorted = [...indexes].sort(([a], [b]) => a - b);
  /* merge overlapping and adjacent indexes */
  const merged = sorted.reduce((acc, [startIndex, amount]) => {
    const previous = acc[acc.length - 1];
    const lastIndex = previous[0] + previous[1];
    if (startIndex <= lastIndex) {
      previous[1] += Math.max(0, amount - (lastIndex - startIndex));
    } else {
      acc.push([startIndex, amount]);
    }
    return acc;
  }, [sorted[0]]);
  /* shift further indexes */
  let shift = 0;
  for (let i = 0; i < merged.length; ++i) {
    merged[i][0] -= shift;
    shift += merged[i][1];
  }
  return merged;
}
function normalizeAddedIndexes(indexes) {
  if (indexes.length <= 1) {
    return indexes;
  }
  const sorted = [...indexes].sort(([a], [b]) => a - b);
  /* merge indexes with same start */
  const merged = sorted.reduce((acc, [startIndex, amount]) => {
    const previous = acc[acc.length - 1];
    if (startIndex === previous[0]) {
      previous[1] = Math.max(previous[1], amount);
    } else {
      acc.push([startIndex, amount]);
    }
    return acc;
  }, [sorted[0]]);
  /* shift further indexes */
  let shift = 0;
  for (let i = 0; i < merged.length; ++i) {
    merged[i][0] += shift;
    shift += merged[i][1];
  }
  return merged;
}
function isPositiveInteger(x) {
  return Number.isInteger(x) && x > 0;
}
function isRowOrColumnRange(leftCorner, width, height) {
  return leftCorner.row === 0 && isPositiveInteger(width) && height === Number.POSITIVE_INFINITY || leftCorner.col === 0 && isPositiveInteger(height) && width === Number.POSITIVE_INFINITY;
}