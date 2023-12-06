"use strict";

exports.__esModule = true;
exports.RemoveRowsTransformer = void 0;
var _Cell = require("../Cell");
var _Transformer = require("./Transformer");
/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */

class RemoveRowsTransformer extends _Transformer.Transformer {
  constructor(rowsSpan) {
    super();
    this.rowsSpan = rowsSpan;
  }
  get sheet() {
    return this.rowsSpan.sheet;
  }
  isIrreversible() {
    return true;
  }
  transformColumnRangeAst(ast, _formulaAddress) {
    return ast;
  }
  transformCellAddress(dependencyAddress, formulaAddress) {
    const absoluteDependencySheet = (0, _Cell.absoluteSheetReference)(dependencyAddress, formulaAddress);
    // Case 4
    if (this.rowsSpan.sheet !== formulaAddress.sheet && this.rowsSpan.sheet !== absoluteDependencySheet) {
      return false;
    }
    // Case 3 -- removed row in same sheet where dependency is but formula in different
    if (this.rowsSpan.sheet !== formulaAddress.sheet && this.rowsSpan.sheet === absoluteDependencySheet) {
      const absoluteDependencyAddress = dependencyAddress.toSimpleRowAddress(formulaAddress);
      if (absoluteDependencyAddress.row < this.rowsSpan.rowStart) {
        // 3.ARa
        return false;
      } else if (absoluteDependencyAddress.row > this.rowsSpan.rowEnd) {
        // 3.ARb
        return dependencyAddress.shiftedByRows(-this.rowsSpan.numberOfRows);
      }
    }
    // Case 2 -- removed row in same sheet where formula but dependency in different sheet
    if (this.rowsSpan.sheet === formulaAddress.sheet && this.rowsSpan.sheet !== absoluteDependencySheet) {
      if (dependencyAddress.isRowAbsolute()) {
        // 2.A
        return false;
      } else {
        if (formulaAddress.row < this.rowsSpan.rowStart) {
          // 2.Ra
          return false;
        } else if (formulaAddress.row > this.rowsSpan.rowEnd) {
          // 2.Rb
          return dependencyAddress.shiftedByRows(this.rowsSpan.numberOfRows);
        }
      }
    }
    // Case 1 -- same sheet
    if (this.rowsSpan.sheet === formulaAddress.sheet && this.rowsSpan.sheet === absoluteDependencySheet) {
      if (dependencyAddress.isRowAbsolute()) {
        if (dependencyAddress.row < this.rowsSpan.rowStart) {
          // 1.Aa
          return false;
        } else if (dependencyAddress.row > this.rowsSpan.rowEnd) {
          // 1.Ab
          return dependencyAddress.shiftedByRows(-this.rowsSpan.numberOfRows);
        }
      } else {
        const absoluteDependencyAddress = dependencyAddress.toSimpleRowAddress(formulaAddress);
        if (absoluteDependencyAddress.row < this.rowsSpan.rowStart) {
          if (formulaAddress.row < this.rowsSpan.rowStart) {
            // 1.Raa
            return false;
          } else if (formulaAddress.row > this.rowsSpan.rowEnd) {
            // 1.Rab
            return dependencyAddress.shiftedByRows(this.rowsSpan.numberOfRows);
          }
        } else if (absoluteDependencyAddress.row > this.rowsSpan.rowEnd) {
          if (formulaAddress.row < this.rowsSpan.rowStart) {
            // 1.Rba
            return dependencyAddress.shiftedByRows(-this.rowsSpan.numberOfRows);
          } else if (formulaAddress.row > this.rowsSpan.rowEnd) {
            // 1.Rbb
            return false;
          }
        }
      }
    }
    // 1.Ac, 1.Rca, 1.Rcb, 3.Ac, 3.Rca, 3.Rcb
    return _Cell.ErrorType.REF;
  }
  transformCellRange(start, end, formulaAddress) {
    return this.transformRange(start, end, formulaAddress);
  }
  transformRowRange(start, end, formulaAddress) {
    return this.transformRange(start, end, formulaAddress);
  }
  transformColumnRange(_start, _end, _formulaAddress) {
    throw Error('Not implemented');
  }
  fixNodeAddress(address) {
    if (this.rowsSpan.sheet === address.sheet && this.rowsSpan.rowStart <= address.row) {
      return Object.assign(Object.assign({}, address), {
        row: address.row - this.rowsSpan.numberOfRows
      });
    } else {
      return address;
    }
  }
  transformRange(start, end, formulaAddress) {
    const startSheet = (0, _Cell.absoluteSheetReference)(start, formulaAddress);
    let actualStart = start;
    let actualEnd = end;
    if (this.rowsSpan.sheet === startSheet) {
      const startSCA = start.toSimpleRowAddress(formulaAddress);
      const endSCA = end.toSimpleRowAddress(formulaAddress);
      if (this.rowsSpan.rowStart <= startSCA.row && this.rowsSpan.rowEnd >= endSCA.row) {
        return _Cell.ErrorType.REF;
      }
      if (startSCA.row >= this.rowsSpan.rowStart && startSCA.row <= this.rowsSpan.rowEnd) {
        actualStart = start.shiftedByRows(this.rowsSpan.rowEnd - startSCA.row + 1);
      }
      if (endSCA.row >= this.rowsSpan.rowStart && endSCA.row <= this.rowsSpan.rowEnd) {
        actualEnd = end.shiftedByRows(-(endSCA.row - this.rowsSpan.rowStart + 1));
      }
    }
    const newStart = this.transformCellAddress(actualStart, formulaAddress);
    const newEnd = this.transformCellAddress(actualEnd, formulaAddress);
    if (newStart === false && newEnd === false) {
      return [actualStart, actualEnd];
    } else if (newStart === _Cell.ErrorType.REF || newEnd === _Cell.ErrorType.REF) {
      return _Cell.ErrorType.REF;
    } else {
      return [newStart || actualStart, newEnd || actualEnd];
    }
  }
}
exports.RemoveRowsTransformer = RemoveRowsTransformer;