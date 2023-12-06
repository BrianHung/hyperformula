"use strict";

exports.__esModule = true;
exports.CrudOperations = void 0;
var _AbsoluteCellRange = require("./AbsoluteCellRange");
var _Cell = require("./Cell");
var _CellContentParser = require("./CellContentParser");
var _errors = require("./errors");
var _NamedExpressions = require("./NamedExpressions");
var _Operations = require("./Operations");
var _Sheet = require("./Sheet");
var _Span = require("./Span");
var _UndoRedo = require("./UndoRedo");
/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */

class CrudOperations {
  constructor(config, operations, undoRedo, clipboardOperations, dependencyGraph, columnSearch, parser, cellContentParser, lazilyTransformingAstService, namedExpressions) {
    this.operations = operations;
    this.undoRedo = undoRedo;
    this.clipboardOperations = clipboardOperations;
    this.dependencyGraph = dependencyGraph;
    this.columnSearch = columnSearch;
    this.parser = parser;
    this.cellContentParser = cellContentParser;
    this.lazilyTransformingAstService = lazilyTransformingAstService;
    this.namedExpressions = namedExpressions;
    this.maxRows = config.maxRows;
    this.maxColumns = config.maxColumns;
  }
  get sheetMapping() {
    return this.dependencyGraph.sheetMapping;
  }
  addRows(sheet, ...indexes) {
    const addRowsCommand = new _Operations.AddRowsCommand(sheet, indexes);
    this.ensureItIsPossibleToAddRows(sheet, ...indexes);
    this.undoRedo.clearRedoStack();
    this.clipboardOperations.abortCut();
    this.operations.addRows(addRowsCommand);
    this.undoRedo.saveOperation(new _UndoRedo.AddRowsUndoEntry(addRowsCommand));
  }
  removeRows(sheet, ...indexes) {
    const removeRowsCommand = new _Operations.RemoveRowsCommand(sheet, indexes);
    this.ensureItIsPossibleToRemoveRows(sheet, ...indexes);
    this.undoRedo.clearRedoStack();
    this.clipboardOperations.abortCut();
    const rowsRemovals = this.operations.removeRows(removeRowsCommand);
    this.undoRedo.saveOperation(new _UndoRedo.RemoveRowsUndoEntry(removeRowsCommand, rowsRemovals));
  }
  addColumns(sheet, ...indexes) {
    const addColumnsCommand = new _Operations.AddColumnsCommand(sheet, indexes);
    this.ensureItIsPossibleToAddColumns(sheet, ...indexes);
    this.undoRedo.clearRedoStack();
    this.clipboardOperations.abortCut();
    this.operations.addColumns(addColumnsCommand);
    this.undoRedo.saveOperation(new _UndoRedo.AddColumnsUndoEntry(addColumnsCommand));
  }
  removeColumns(sheet, ...indexes) {
    const removeColumnsCommand = new _Operations.RemoveColumnsCommand(sheet, indexes);
    this.ensureItIsPossibleToRemoveColumns(sheet, ...indexes);
    this.undoRedo.clearRedoStack();
    this.clipboardOperations.abortCut();
    const columnsRemovals = this.operations.removeColumns(removeColumnsCommand);
    this.undoRedo.saveOperation(new _UndoRedo.RemoveColumnsUndoEntry(removeColumnsCommand, columnsRemovals));
  }
  moveCells(sourceLeftCorner, width, height, destinationLeftCorner) {
    this.undoRedo.clearRedoStack();
    this.clipboardOperations.abortCut();
    const {
      version,
      overwrittenCellsData,
      addedGlobalNamedExpressions
    } = this.operations.moveCells(sourceLeftCorner, width, height, destinationLeftCorner);
    this.undoRedo.saveOperation(new _UndoRedo.MoveCellsUndoEntry(sourceLeftCorner, width, height, destinationLeftCorner, overwrittenCellsData, addedGlobalNamedExpressions, version));
  }
  moveRows(sheet, startRow, numberOfRows, targetRow) {
    this.ensureItIsPossibleToMoveRows(sheet, startRow, numberOfRows, targetRow);
    this.undoRedo.clearRedoStack();
    this.clipboardOperations.abortCut();
    const version = this.operations.moveRows(sheet, startRow, numberOfRows, targetRow);
    this.undoRedo.saveOperation(new _UndoRedo.MoveRowsUndoEntry(sheet, startRow, numberOfRows, targetRow, version));
  }
  moveColumns(sheet, startColumn, numberOfColumns, targetColumn) {
    this.ensureItIsPossibleToMoveColumns(sheet, startColumn, numberOfColumns, targetColumn);
    this.undoRedo.clearRedoStack();
    const version = this.operations.moveColumns(sheet, startColumn, numberOfColumns, targetColumn);
    this.undoRedo.saveOperation(new _UndoRedo.MoveColumnsUndoEntry(sheet, startColumn, numberOfColumns, targetColumn, version));
  }
  cut(sourceLeftCorner, width, height) {
    this.clipboardOperations.cut(sourceLeftCorner, width, height);
  }
  ensureItIsPossibleToCopy(sourceLeftCorner, width, height) {
    if (!isPositiveInteger(width)) {
      throw new _errors.InvalidArgumentsError('width to be positive integer.');
    }
    if (!isPositiveInteger(height)) {
      throw new _errors.InvalidArgumentsError('height to be positive integer.');
    }
  }
  copy(sourceLeftCorner, width, height) {
    this.ensureItIsPossibleToCopy(sourceLeftCorner, width, height);
    this.clipboardOperations.copy(sourceLeftCorner, width, height);
  }
  paste(targetLeftCorner) {
    const clipboard = this.clipboardOperations.clipboard;
    if (clipboard === undefined) {
      throw new _errors.NothingToPasteError();
    } else if (this.clipboardOperations.isCutClipboard()) {
      this.moveCells(clipboard.sourceLeftCorner, clipboard.width, clipboard.height, targetLeftCorner);
    } else if (this.clipboardOperations.isCopyClipboard()) {
      this.clipboardOperations.ensureItIsPossibleToCopyPaste(targetLeftCorner);
      const targetRange = _AbsoluteCellRange.AbsoluteCellRange.spanFrom(targetLeftCorner, clipboard.width, clipboard.height);
      const oldContent = this.operations.getRangeClipboardCells(targetRange);
      this.undoRedo.clearRedoStack();
      const addedGlobalNamedExpressions = this.operations.restoreClipboardCells(clipboard.sourceLeftCorner.sheet, clipboard.getContent(targetLeftCorner));
      this.undoRedo.saveOperation(new _UndoRedo.PasteUndoEntry(targetLeftCorner, oldContent, clipboard.content, addedGlobalNamedExpressions));
    }
  }
  beginUndoRedoBatchMode() {
    this.undoRedo.beginBatchMode();
  }
  commitUndoRedoBatchMode() {
    this.undoRedo.commitBatchMode();
  }
  isClipboardEmpty() {
    return this.clipboardOperations.clipboard === undefined;
  }
  clearClipboard() {
    this.clipboardOperations.clear();
  }
  addSheet(name) {
    if (name !== undefined) {
      this.ensureItIsPossibleToAddSheet(name);
    }
    this.undoRedo.clearRedoStack();
    const addedSheetName = this.operations.addSheet(name);
    this.undoRedo.saveOperation(new _UndoRedo.AddSheetUndoEntry(addedSheetName));
    return addedSheetName;
  }
  removeSheet(sheetId) {
    this.ensureScopeIdIsValid(sheetId);
    this.undoRedo.clearRedoStack();
    this.clipboardOperations.abortCut();
    const originalName = this.sheetMapping.fetchDisplayName(sheetId);
    const oldSheetContent = this.operations.getSheetClipboardCells(sheetId);
    const {
      version,
      scopedNamedExpressions
    } = this.operations.removeSheet(sheetId);
    this.undoRedo.saveOperation(new _UndoRedo.RemoveSheetUndoEntry(originalName, sheetId, oldSheetContent, scopedNamedExpressions, version));
  }
  renameSheet(sheetId, newName) {
    this.ensureItIsPossibleToRenameSheet(sheetId, newName);
    const oldName = this.operations.renameSheet(sheetId, newName);
    if (oldName !== undefined) {
      this.undoRedo.clearRedoStack();
      this.undoRedo.saveOperation(new _UndoRedo.RenameSheetUndoEntry(sheetId, oldName, newName));
    }
    return oldName;
  }
  clearSheet(sheetId) {
    this.ensureScopeIdIsValid(sheetId);
    this.undoRedo.clearRedoStack();
    this.clipboardOperations.abortCut();
    const oldSheetContent = this.operations.getSheetClipboardCells(sheetId);
    this.operations.clearSheet(sheetId);
    this.undoRedo.saveOperation(new _UndoRedo.ClearSheetUndoEntry(sheetId, oldSheetContent));
  }
  setCellContents(topLeftCornerAddress, cellContents) {
    if (!(cellContents instanceof Array)) {
      cellContents = [[cellContents]];
    } else {
      for (let i = 0; i < cellContents.length; i++) {
        if (!(cellContents[i] instanceof Array)) {
          throw new _errors.InvalidArgumentsError('an array of arrays or a raw cell value.');
        }
      }
    }
    this.ensureItIsPossibleToChangeCellContents(topLeftCornerAddress, cellContents);
    this.undoRedo.clearRedoStack();
    const oldContents = [];
    for (let i = 0; i < cellContents.length; i++) {
      for (let j = 0; j < cellContents[i].length; j++) {
        const address = {
          sheet: topLeftCornerAddress.sheet,
          row: topLeftCornerAddress.row + i,
          col: topLeftCornerAddress.col + j
        };
        const newContent = cellContents[i][j];
        this.clipboardOperations.abortCut();
        const oldContent = this.operations.setCellContent(address, newContent);
        oldContents.push({
          address,
          newContent,
          oldContent
        });
      }
    }
    this.undoRedo.saveOperation(new _UndoRedo.SetCellContentsUndoEntry(oldContents));
  }
  setSheetContent(sheetId, values) {
    this.ensureScopeIdIsValid(sheetId);
    this.ensureItIsPossibleToChangeSheetContents(sheetId, values);
    (0, _Sheet.validateAsSheet)(values);
    this.undoRedo.clearRedoStack();
    this.clipboardOperations.abortCut();
    const oldSheetContent = this.operations.getSheetClipboardCells(sheetId);
    this.operations.setSheetContent(sheetId, values);
    this.undoRedo.saveOperation(new _UndoRedo.SetSheetContentUndoEntry(sheetId, oldSheetContent, values));
  }
  setRowOrder(sheetId, rowMapping) {
    this.validateSwapRowIndexes(sheetId, rowMapping);
    this.testRowOrderForArrays(sheetId, rowMapping);
    this.undoRedo.clearRedoStack();
    this.clipboardOperations.abortCut();
    const oldContent = this.operations.setRowOrder(sheetId, rowMapping);
    this.undoRedo.saveOperation(new _UndoRedo.SetRowOrderUndoEntry(sheetId, rowMapping, oldContent));
  }
  validateSwapRowIndexes(sheetId, rowMapping) {
    if (!this.sheetMapping.hasSheetWithId(sheetId)) {
      throw new _errors.NoSheetWithIdError(sheetId);
    }
    this.validateRowOrColumnMapping(sheetId, rowMapping, 'row');
  }
  testColumnOrderForArrays(sheetId, columnMapping) {
    for (const [source, target] of columnMapping) {
      if (source !== target) {
        const rowRange = _AbsoluteCellRange.AbsoluteCellRange.spanFrom({
          sheet: sheetId,
          col: source,
          row: 0
        }, 1, Infinity);
        if (this.dependencyGraph.arrayMapping.isFormulaArrayInRange(rowRange)) {
          throw new _errors.SourceLocationHasArrayError();
        }
      }
    }
  }
  setColumnOrder(sheetId, columnMapping) {
    this.validateSwapColumnIndexes(sheetId, columnMapping);
    this.testColumnOrderForArrays(sheetId, columnMapping);
    this.undoRedo.clearRedoStack();
    this.clipboardOperations.abortCut();
    const oldContent = this.operations.setColumnOrder(sheetId, columnMapping);
    this.undoRedo.saveOperation(new _UndoRedo.SetColumnOrderUndoEntry(sheetId, columnMapping, oldContent));
  }
  validateSwapColumnIndexes(sheetId, columnMapping) {
    if (!this.sheetMapping.hasSheetWithId(sheetId)) {
      throw new _errors.NoSheetWithIdError(sheetId);
    }
    this.validateRowOrColumnMapping(sheetId, columnMapping, 'column');
  }
  testRowOrderForArrays(sheetId, rowMapping) {
    for (const [source, target] of rowMapping) {
      if (source !== target) {
        const rowRange = _AbsoluteCellRange.AbsoluteCellRange.spanFrom({
          sheet: sheetId,
          col: 0,
          row: source
        }, Infinity, 1);
        if (this.dependencyGraph.arrayMapping.isFormulaArrayInRange(rowRange)) {
          throw new _errors.SourceLocationHasArrayError();
        }
      }
    }
  }
  mappingFromOrder(sheetId, newOrder, rowOrColumn) {
    if (!this.sheetMapping.hasSheetWithId(sheetId)) {
      throw new _errors.NoSheetWithIdError(sheetId);
    }
    const limit = rowOrColumn === 'row' ? this.dependencyGraph.getSheetHeight(sheetId) : this.dependencyGraph.getSheetWidth(sheetId);
    if (newOrder.length !== limit) {
      throw new _errors.InvalidArgumentsError(`number of ${rowOrColumn}s provided to be sheet ${rowOrColumn === 'row' ? 'height' : 'width'}.`);
    }
    const ret = [];
    for (let i = 0; i < limit; i++) {
      if (newOrder[i] !== i) {
        ret.push([i, newOrder[i]]);
      }
    }
    return ret;
  }
  undo() {
    if (this.undoRedo.isUndoStackEmpty()) {
      throw new _errors.NoOperationToUndoError();
    }
    this.clipboardOperations.abortCut();
    this.undoRedo.undo();
  }
  redo() {
    if (this.undoRedo.isRedoStackEmpty()) {
      throw new _errors.NoOperationToRedoError();
    }
    this.clipboardOperations.abortCut();
    this.undoRedo.redo();
  }
  addNamedExpression(expressionName, expression, sheetId, options) {
    this.ensureItIsPossibleToAddNamedExpression(expressionName, expression, sheetId);
    this.operations.addNamedExpression(expressionName, expression, sheetId, options);
    this.undoRedo.clearRedoStack();
    this.clipboardOperations.abortCut();
    this.undoRedo.saveOperation(new _UndoRedo.AddNamedExpressionUndoEntry(expressionName, expression, sheetId, options));
  }
  changeNamedExpressionExpression(expressionName, sheetId, newExpression, options) {
    this.ensureItIsPossibleToChangeNamedExpression(expressionName, newExpression, sheetId);
    const [oldNamedExpression, content] = this.operations.changeNamedExpressionExpression(expressionName, newExpression, sheetId, options);
    this.undoRedo.clearRedoStack();
    this.clipboardOperations.abortCut();
    this.undoRedo.saveOperation(new _UndoRedo.ChangeNamedExpressionUndoEntry(oldNamedExpression, newExpression, content, sheetId, options));
  }
  removeNamedExpression(expressionName, sheetId) {
    this.ensureScopeIdIsValid(sheetId);
    const [namedExpression, content] = this.operations.removeNamedExpression(expressionName, sheetId);
    this.undoRedo.clearRedoStack();
    this.clipboardOperations.abortCut();
    this.undoRedo.saveOperation(new _UndoRedo.RemoveNamedExpressionUndoEntry(namedExpression, content, sheetId));
    return namedExpression;
  }
  ensureItIsPossibleToAddNamedExpression(expressionName, expression, sheetId) {
    this.ensureScopeIdIsValid(sheetId);
    this.ensureNamedExpressionNameIsValid(expressionName, sheetId);
    this.ensureNamedExpressionIsValid(expression);
  }
  ensureItIsPossibleToChangeNamedExpression(expressionName, expression, sheetId) {
    this.ensureScopeIdIsValid(sheetId);
    if (this.namedExpressions.namedExpressionForScope(expressionName, sheetId) === undefined) {
      throw new _errors.NamedExpressionDoesNotExistError(expressionName);
    }
    this.ensureNamedExpressionIsValid(expression);
  }
  isItPossibleToRemoveNamedExpression(expressionName, sheetId) {
    this.ensureScopeIdIsValid(sheetId);
    if (this.namedExpressions.namedExpressionForScope(expressionName, sheetId) === undefined) {
      throw new _errors.NamedExpressionDoesNotExistError(expressionName);
    }
  }
  ensureItIsPossibleToAddRows(sheet, ...indexes) {
    if (!this.sheetMapping.hasSheetWithId(sheet)) {
      throw new _errors.NoSheetWithIdError(sheet);
    }
    const sheetHeight = this.dependencyGraph.getSheetHeight(sheet);
    const newRowsCount = indexes.map(index => index[1]).reduce((a, b) => a + b, 0);
    if (sheetHeight + newRowsCount > this.maxRows) {
      throw new _errors.SheetSizeLimitExceededError();
    }
    for (const [row, numberOfRowsToAdd] of indexes) {
      if (!isNonnegativeInteger(row) || !isPositiveInteger(numberOfRowsToAdd)) {
        throw new _errors.InvalidArgumentsError('row number to be nonnegative and number of rows to add to be positive.');
      }
    }
  }
  ensureItIsPossibleToRemoveRows(sheet, ...indexes) {
    for (const [rowStart, numberOfRows] of indexes) {
      const rowEnd = rowStart + numberOfRows - 1;
      if (!isNonnegativeInteger(rowStart) || !isNonnegativeInteger(rowEnd)) {
        throw new _errors.InvalidArgumentsError('starting and ending row to be nonnegative.');
      }
      if (rowEnd < rowStart) {
        throw new _errors.InvalidArgumentsError('starting row to be smaller than the ending row.');
      }
      if (!this.sheetMapping.hasSheetWithId(sheet)) {
        throw new _errors.NoSheetWithIdError(sheet);
      }
    }
  }
  ensureItIsPossibleToAddColumns(sheet, ...indexes) {
    if (!this.sheetMapping.hasSheetWithId(sheet)) {
      throw new _errors.NoSheetWithIdError(sheet);
    }
    const sheetWidth = this.dependencyGraph.getSheetWidth(sheet);
    const newColumnsCount = indexes.map(index => index[1]).reduce((a, b) => a + b, 0);
    if (sheetWidth + newColumnsCount > this.maxColumns) {
      throw new _errors.SheetSizeLimitExceededError();
    }
    for (const [column, numberOfColumnsToAdd] of indexes) {
      if (!isNonnegativeInteger(column) || !isPositiveInteger(numberOfColumnsToAdd)) {
        throw new _errors.InvalidArgumentsError('column number to be nonnegative and number of columns to add to be positive.');
      }
    }
  }
  ensureItIsPossibleToRemoveColumns(sheet, ...indexes) {
    for (const [columnStart, numberOfColumns] of indexes) {
      const columnEnd = columnStart + numberOfColumns - 1;
      if (!isNonnegativeInteger(columnStart) || !isNonnegativeInteger(columnEnd)) {
        throw new _errors.InvalidArgumentsError('starting and ending column to be nonnegative.');
      }
      if (columnEnd < columnStart) {
        throw new _errors.InvalidArgumentsError('starting column to be smaller than the ending column.');
      }
      if (!this.sheetMapping.hasSheetWithId(sheet)) {
        throw new _errors.NoSheetWithIdError(sheet);
      }
    }
  }
  ensureItIsPossibleToMoveRows(sheet, startRow, numberOfRows, targetRow) {
    this.ensureItIsPossibleToAddRows(sheet, [targetRow, numberOfRows]);
    const sourceStart = (0, _Cell.simpleCellAddress)(sheet, 0, startRow);
    const targetStart = (0, _Cell.simpleCellAddress)(sheet, 0, targetRow);
    if (!this.sheetMapping.hasSheetWithId(sheet) || (0, _Cell.invalidSimpleCellAddress)(sourceStart) || (0, _Cell.invalidSimpleCellAddress)(targetStart) || !isPositiveInteger(numberOfRows) || targetRow <= startRow + numberOfRows && targetRow >= startRow) {
      throw new _errors.InvalidArgumentsError('a valid range of rows to move.');
    }
    const width = this.dependencyGraph.getSheetWidth(sheet);
    const sourceRange = _AbsoluteCellRange.AbsoluteCellRange.spanFrom(sourceStart, width, numberOfRows);
    if (this.dependencyGraph.arrayMapping.isFormulaArrayInRange(sourceRange)) {
      throw new _errors.SourceLocationHasArrayError();
    }
    if (targetRow > 0 && this.dependencyGraph.arrayMapping.isFormulaArrayInAllRows(_Span.RowsSpan.fromNumberOfRows(sheet, targetRow - 1, 2))) {
      throw new _errors.TargetLocationHasArrayError();
    }
  }
  ensureItIsPossibleToMoveColumns(sheet, startColumn, numberOfColumns, targetColumn) {
    this.ensureItIsPossibleToAddColumns(sheet, [targetColumn, numberOfColumns]);
    const sourceStart = (0, _Cell.simpleCellAddress)(sheet, startColumn, 0);
    const targetStart = (0, _Cell.simpleCellAddress)(sheet, targetColumn, 0);
    if (!this.sheetMapping.hasSheetWithId(sheet) || (0, _Cell.invalidSimpleCellAddress)(sourceStart) || (0, _Cell.invalidSimpleCellAddress)(targetStart) || !isPositiveInteger(numberOfColumns) || targetColumn <= startColumn + numberOfColumns && targetColumn >= startColumn) {
      throw new _errors.InvalidArgumentsError('a valid range of columns to move.');
    }
    const sheetHeight = this.dependencyGraph.getSheetHeight(sheet);
    const sourceRange = _AbsoluteCellRange.AbsoluteCellRange.spanFrom(sourceStart, numberOfColumns, sheetHeight);
    if (this.dependencyGraph.arrayMapping.isFormulaArrayInRange(sourceRange)) {
      throw new _errors.SourceLocationHasArrayError();
    }
    if (targetColumn > 0 && this.dependencyGraph.arrayMapping.isFormulaArrayInAllColumns(_Span.ColumnsSpan.fromNumberOfColumns(sheet, targetColumn - 1, 2))) {
      throw new _errors.TargetLocationHasArrayError();
    }
  }
  ensureItIsPossibleToAddSheet(name) {
    if (this.sheetMapping.hasSheetWithName(name)) {
      throw new _errors.SheetNameAlreadyTakenError(name);
    }
  }
  ensureItIsPossibleToRenameSheet(sheetId, name) {
    if (!this.sheetMapping.hasSheetWithId(sheetId)) {
      throw new _errors.NoSheetWithIdError(sheetId);
    }
    const existingSheetId = this.sheetMapping.get(name);
    if (existingSheetId !== undefined && existingSheetId !== sheetId) {
      throw new _errors.SheetNameAlreadyTakenError(name);
    }
  }
  ensureItIsPossibleToChangeContent(address) {
    if ((0, _Cell.invalidSimpleCellAddress)(address)) {
      throw new _errors.InvalidAddressError(address);
    }
    if (!this.sheetMapping.hasSheetWithId(address.sheet)) {
      throw new _errors.NoSheetWithIdError(address.sheet);
    }
  }
  ensureItIsPossibleToChangeCellContents(inputAddress, content) {
    const boundaries = (0, _Sheet.findBoundaries)(content);
    const targetRange = _AbsoluteCellRange.AbsoluteCellRange.spanFrom(inputAddress, boundaries.width, boundaries.height);
    this.ensureRangeInSizeLimits(targetRange);
    for (const address of targetRange.addresses(this.dependencyGraph)) {
      this.ensureItIsPossibleToChangeContent(address);
    }
  }
  ensureItIsPossibleToChangeSheetContents(sheetId, content) {
    const boundaries = (0, _Sheet.findBoundaries)(content);
    const targetRange = _AbsoluteCellRange.AbsoluteCellRange.spanFrom((0, _Cell.simpleCellAddress)(sheetId, 0, 0), boundaries.width, boundaries.height);
    this.ensureRangeInSizeLimits(targetRange);
  }
  ensureRangeInSizeLimits(range) {
    if (range.exceedsSheetSizeLimits(this.maxColumns, this.maxRows)) {
      throw new _errors.SheetSizeLimitExceededError();
    }
  }
  isThereSomethingToUndo() {
    return !this.undoRedo.isUndoStackEmpty();
  }
  isThereSomethingToRedo() {
    return !this.undoRedo.isRedoStackEmpty();
  }
  getAndClearContentChanges() {
    return this.operations.getAndClearContentChanges();
  }
  ensureScopeIdIsValid(scopeId) {
    if (scopeId !== undefined && !this.sheetMapping.hasSheetWithId(scopeId)) {
      throw new _errors.NoSheetWithIdError(scopeId);
    }
  }
  validateRowOrColumnMapping(sheetId, rowMapping, rowOrColumn) {
    const limit = rowOrColumn === 'row' ? this.dependencyGraph.getSheetHeight(sheetId) : this.dependencyGraph.getSheetWidth(sheetId);
    const sources = rowMapping.map(([a, _]) => a).sort((a, b) => a - b);
    const targets = rowMapping.map(([_, b]) => b).sort((a, b) => a - b);
    for (let i = 0; i < sources.length; i++) {
      if (!isNonnegativeInteger(sources[i]) || sources[i] >= limit) {
        throw new _errors.InvalidArgumentsError(`${rowOrColumn} numbers to be nonnegative integers and less than sheet ${rowOrColumn === 'row' ? 'height' : 'width'}.`);
      }
      if (sources[i] === sources[i + 1]) {
        throw new _errors.InvalidArgumentsError(`source ${rowOrColumn} numbers to be unique.`);
      }
      if (sources[i] !== targets[i]) {
        throw new _errors.InvalidArgumentsError(`target ${rowOrColumn} numbers to be permutation of source ${rowOrColumn} numbers.`);
      }
    }
  }
  ensureNamedExpressionNameIsValid(expressionName, sheetId) {
    if (!this.namedExpressions.isNameValid(expressionName)) {
      throw new _errors.NamedExpressionNameIsInvalidError(expressionName);
    }
    if (!this.namedExpressions.isNameAvailable(expressionName, sheetId)) {
      throw new _errors.NamedExpressionNameIsAlreadyTakenError(expressionName);
    }
  }
  ensureNamedExpressionIsValid(expression) {
    const parsedExpression = this.cellContentParser.parse(expression);
    if (parsedExpression instanceof _CellContentParser.CellContent.Formula) {
      const parsingResult = this.parser.parse(parsedExpression.formula, (0, _Cell.simpleCellAddress)(-1, 0, 0));
      if ((0, _NamedExpressions.doesContainRelativeReferences)(parsingResult.ast)) {
        throw new _errors.NoRelativeAddressesAllowedError();
      }
    }
  }
}
exports.CrudOperations = CrudOperations;
function isPositiveInteger(x) {
  return Number.isInteger(x) && x > 0;
}
function isNonnegativeInteger(x) {
  return Number.isInteger(x) && x >= 0;
}