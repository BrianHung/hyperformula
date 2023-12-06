"use strict";

exports.__esModule = true;
exports.ColumnBinarySearch = void 0;
var _AdvancedFind = require("./AdvancedFind");
/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */

class ColumnBinarySearch extends _AdvancedFind.AdvancedFind {
  constructor(dependencyGraph) {
    super(dependencyGraph);
    this.dependencyGraph = dependencyGraph;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars 
  add(value, address) {}
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  remove(value, address) {}
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  change(oldValue, newValue, address) {}
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  applyChanges(contentChanges) {}
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  addColumns(columnsSpan) {}
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  removeColumns(columnsSpan) {}
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  removeSheet(sheetId) {}
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  moveValues(sourceRange, toRight, toBottom, toSheet) {}
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  removeValues(range) {}
  /*
   * WARNING: Finding lower/upper bounds in unordered ranges is not supported. When ordering === 'none', assumes matchExactly === true
   */
  find(searchKey, rangeValue, searchOptions) {
    return this.basicFind(searchKey, rangeValue, 'row', searchOptions);
  }
}
exports.ColumnBinarySearch = ColumnBinarySearch;