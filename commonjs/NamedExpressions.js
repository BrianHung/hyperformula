"use strict";

exports.__esModule = true;
exports.doesContainRelativeReferences = exports.NamedExpressions = exports.InternalNamedExpression = void 0;
var _Cell = require("./Cell");
var _parser = require("./parser");
var _parserConsts = require("./parser/parser-consts");
/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */

class InternalNamedExpression {
  constructor(displayName, address, added, options) {
    this.displayName = displayName;
    this.address = address;
    this.added = added;
    this.options = options;
  }
  normalizeExpressionName() {
    return this.displayName.toLowerCase();
  }
  copy() {
    return new InternalNamedExpression(this.displayName, this.address, this.added, this.options);
  }
}
exports.InternalNamedExpression = InternalNamedExpression;
class WorkbookStore {
  constructor() {
    this.mapping = new Map();
  }
  has(expressionName) {
    return this.mapping.has(this.normalizeExpressionName(expressionName));
  }
  isNameAvailable(expressionName) {
    const normalizedExpressionName = this.normalizeExpressionName(expressionName);
    const namedExpression = this.mapping.get(normalizedExpressionName);
    return !(namedExpression && namedExpression.added);
  }
  add(namedExpression) {
    this.mapping.set(namedExpression.normalizeExpressionName(), namedExpression);
  }
  get(expressionName) {
    return this.mapping.get(this.normalizeExpressionName(expressionName));
  }
  getExisting(expressionName) {
    const namedExpression = this.mapping.get(this.normalizeExpressionName(expressionName));
    if (namedExpression && namedExpression.added) {
      return namedExpression;
    } else {
      return undefined;
    }
  }
  remove(expressionName) {
    const normalizedExpressionName = this.normalizeExpressionName(expressionName);
    const namedExpression = this.mapping.get(normalizedExpressionName);
    if (namedExpression) {
      namedExpression.added = false;
    }
  }
  getAllNamedExpressions() {
    return Array.from(this.mapping.values()).filter(ne => ne.added);
  }
  normalizeExpressionName(expressionName) {
    return expressionName.toLowerCase();
  }
}
class WorksheetStore {
  constructor() {
    this.mapping = new Map();
  }
  add(namedExpression) {
    this.mapping.set(this.normalizeExpressionName(namedExpression.displayName), namedExpression);
  }
  get(expressionName) {
    return this.mapping.get(this.normalizeExpressionName(expressionName));
  }
  has(expressionName) {
    return this.mapping.has(this.normalizeExpressionName(expressionName));
  }
  getAllNamedExpressions() {
    return Array.from(this.mapping.values()).filter(ne => ne.added);
  }
  isNameAvailable(expressionName) {
    const normalizedExpressionName = this.normalizeExpressionName(expressionName);
    return !this.mapping.has(normalizedExpressionName);
  }
  remove(expressionName) {
    const normalizedExpressionName = this.normalizeExpressionName(expressionName);
    const namedExpression = this.mapping.get(normalizedExpressionName);
    if (namedExpression) {
      this.mapping.delete(normalizedExpressionName);
    }
  }
  normalizeExpressionName(expressionName) {
    return expressionName.toLowerCase();
  }
}
class NamedExpressions {
  constructor() {
    this.nextNamedExpressionRow = 0;
    this.workbookStore = new WorkbookStore();
    this.worksheetStores = new Map();
    this.addressCache = new Map();
  }
  isNameAvailable(expressionName, sheetId) {
    var _a, _b;
    if (sheetId === undefined) {
      return this.workbookStore.isNameAvailable(expressionName);
    } else {
      return (_b = (_a = this.worksheetStore(sheetId)) === null || _a === void 0 ? void 0 : _a.isNameAvailable(expressionName)) !== null && _b !== void 0 ? _b : true;
    }
  }
  namedExpressionInAddress(row) {
    const namedExpression = this.addressCache.get(row);
    if (namedExpression && namedExpression.added) {
      return namedExpression;
    } else {
      return undefined;
    }
  }
  namedExpressionForScope(expressionName, sheetId) {
    var _a;
    if (sheetId === undefined) {
      return this.workbookStore.getExisting(expressionName);
    } else {
      return (_a = this.worksheetStore(sheetId)) === null || _a === void 0 ? void 0 : _a.get(expressionName);
    }
  }
  nearestNamedExpression(expressionName, sheetId) {
    var _a, _b;
    return (_b = (_a = this.worksheetStore(sheetId)) === null || _a === void 0 ? void 0 : _a.get(expressionName)) !== null && _b !== void 0 ? _b : this.workbookStore.getExisting(expressionName);
  }
  isExpressionInScope(expressionName, sheetId) {
    var _a, _b;
    return (_b = (_a = this.worksheetStore(sheetId)) === null || _a === void 0 ? void 0 : _a.has(expressionName)) !== null && _b !== void 0 ? _b : false;
  }
  /**
   * Checks the validity of a named-expression's name.
   *
   * The name:
   * - Must start with a Unicode letter or with an underscore (`_`).
   * - Can contain only Unicode letters, numbers, underscores, and periods (`.`).
   * - Can't be the same as any possible reference in the A1 notation (`[A-Za-z]+[0-9]+`).
   * - Can't be the same as any possible reference in the R1C1 notation (`[rR][0-9]*[cC][0-9]*`).
   *
   * The naming rules follow the [OpenDocument](https://docs.oasis-open.org/office/OpenDocument/v1.3/os/part4-formula/OpenDocument-v1.3-os-part4-formula.html#__RefHeading__1017964_715980110) standard.
   */
  isNameValid(expressionName) {
    const a1CellRefRegexp = new RegExp(`^${_parserConsts.CELL_REFERENCE_PATTERN}$`);
    const r1c1CellRefRegexp = new RegExp(`^${_parserConsts.R1C1_CELL_REFERENCE_PATTERN}$`);
    const namedExpRegexp = new RegExp(`^${_parserConsts.NAMED_EXPRESSION_PATTERN}$`);
    if (a1CellRefRegexp.test(expressionName) || r1c1CellRefRegexp.test(expressionName)) {
      return false;
    }
    return namedExpRegexp.test(expressionName);
  }
  addNamedExpression(expressionName, sheetId, options) {
    const store = sheetId === undefined ? this.workbookStore : this.worksheetStoreOrCreate(sheetId);
    let namedExpression = store.get(expressionName);
    if (namedExpression !== undefined) {
      namedExpression.added = true;
      namedExpression.displayName = expressionName;
      namedExpression.options = options;
    } else {
      namedExpression = new InternalNamedExpression(expressionName, this.nextAddress(), true, options);
      store.add(namedExpression);
    }
    this.addressCache.set(namedExpression.address.row, namedExpression);
    return namedExpression;
  }
  restoreNamedExpression(namedExpression, sheetId) {
    const store = sheetId === undefined ? this.workbookStore : this.worksheetStoreOrCreate(sheetId);
    namedExpression.added = true;
    store.add(namedExpression);
    this.addressCache.set(namedExpression.address.row, namedExpression);
    return namedExpression;
  }
  namedExpressionOrPlaceholder(expressionName, sheetId) {
    var _a;
    return (_a = this.worksheetStoreOrCreate(sheetId).get(expressionName)) !== null && _a !== void 0 ? _a : this.workbookNamedExpressionOrPlaceholder(expressionName);
  }
  workbookNamedExpressionOrPlaceholder(expressionName) {
    let namedExpression = this.workbookStore.get(expressionName);
    if (namedExpression === undefined) {
      namedExpression = new InternalNamedExpression(expressionName, this.nextAddress(), false);
      this.workbookStore.add(namedExpression);
    }
    return namedExpression;
  }
  remove(expressionName, sheetId) {
    let store;
    if (sheetId === undefined) {
      store = this.workbookStore;
    } else {
      store = this.worksheetStore(sheetId);
    }
    const namedExpression = store === null || store === void 0 ? void 0 : store.get(expressionName);
    if (store === undefined || namedExpression === undefined || !namedExpression.added) {
      throw Error('Named expression does not exist');
    }
    store.remove(expressionName);
    if (store instanceof WorksheetStore && store.mapping.size === 0) {
      this.worksheetStores.delete(sheetId);
    }
    this.addressCache.delete(namedExpression.address.row);
  }
  getAllNamedExpressionsNamesInScope(sheetId) {
    return this.getAllNamedExpressions().filter(({
      scope
    }) => scope === sheetId).map(ne => ne.expression.displayName);
  }
  getAllNamedExpressionsNames() {
    return this.getAllNamedExpressions().map(ne => ne.expression.displayName);
  }
  getAllNamedExpressions() {
    const storedNamedExpressions = [];
    this.workbookStore.getAllNamedExpressions().forEach(expr => {
      storedNamedExpressions.push({
        expression: expr,
        scope: undefined
      });
    });
    this.worksheetStores.forEach((store, sheetNum) => {
      store.getAllNamedExpressions().forEach(expr => {
        storedNamedExpressions.push({
          expression: expr,
          scope: sheetNum
        });
      });
    });
    return storedNamedExpressions;
  }
  getAllNamedExpressionsForScope(scope) {
    var _a, _b;
    if (scope === undefined) {
      return this.workbookStore.getAllNamedExpressions();
    } else {
      return (_b = (_a = this.worksheetStores.get(scope)) === null || _a === void 0 ? void 0 : _a.getAllNamedExpressions()) !== null && _b !== void 0 ? _b : [];
    }
  }
  worksheetStoreOrCreate(sheetId) {
    let store = this.worksheetStores.get(sheetId);
    if (!store) {
      store = new WorksheetStore();
      this.worksheetStores.set(sheetId, store);
    }
    return store;
  }
  worksheetStore(sheetId) {
    return this.worksheetStores.get(sheetId);
  }
  nextAddress() {
    return (0, _Cell.simpleCellAddress)(NamedExpressions.SHEET_FOR_WORKBOOK_EXPRESSIONS, 0, this.nextNamedExpressionRow++);
  }
}
exports.NamedExpressions = NamedExpressions;
NamedExpressions.SHEET_FOR_WORKBOOK_EXPRESSIONS = -1;
const doesContainRelativeReferences = ast => {
  switch (ast.type) {
    case _parser.AstNodeType.EMPTY:
    case _parser.AstNodeType.NUMBER:
    case _parser.AstNodeType.STRING:
    case _parser.AstNodeType.ERROR:
    case _parser.AstNodeType.ERROR_WITH_RAW_INPUT:
      return false;
    case _parser.AstNodeType.CELL_REFERENCE:
      return !ast.reference.isAbsolute();
    case _parser.AstNodeType.CELL_RANGE:
    case _parser.AstNodeType.COLUMN_RANGE:
    case _parser.AstNodeType.ROW_RANGE:
      return !ast.start.isAbsolute();
    case _parser.AstNodeType.NAMED_EXPRESSION:
      return false;
    case _parser.AstNodeType.PERCENT_OP:
    case _parser.AstNodeType.PLUS_UNARY_OP:
    case _parser.AstNodeType.MINUS_UNARY_OP:
      {
        return doesContainRelativeReferences(ast.value);
      }
    case _parser.AstNodeType.CONCATENATE_OP:
    case _parser.AstNodeType.EQUALS_OP:
    case _parser.AstNodeType.NOT_EQUAL_OP:
    case _parser.AstNodeType.LESS_THAN_OP:
    case _parser.AstNodeType.GREATER_THAN_OP:
    case _parser.AstNodeType.LESS_THAN_OR_EQUAL_OP:
    case _parser.AstNodeType.GREATER_THAN_OR_EQUAL_OP:
    case _parser.AstNodeType.MINUS_OP:
    case _parser.AstNodeType.PLUS_OP:
    case _parser.AstNodeType.TIMES_OP:
    case _parser.AstNodeType.DIV_OP:
    case _parser.AstNodeType.POWER_OP:
      return doesContainRelativeReferences(ast.left) || doesContainRelativeReferences(ast.right);
    case _parser.AstNodeType.PARENTHESIS:
      return doesContainRelativeReferences(ast.expression);
    case _parser.AstNodeType.FUNCTION_CALL:
      {
        return ast.args.some(arg => doesContainRelativeReferences(arg));
      }
    case _parser.AstNodeType.ARRAY:
      {
        return ast.args.some(row => row.some(arg => doesContainRelativeReferences(arg)));
      }
  }
};
exports.doesContainRelativeReferences = doesContainRelativeReferences;