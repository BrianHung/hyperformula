"use strict";

exports.__esModule = true;
exports.Evaluator = void 0;
var _AbsoluteCellRange = require("./AbsoluteCellRange");
var _absolutizeDependencies = require("./absolutizeDependencies");
var _Cell = require("./Cell");
var _ContentChanges = require("./ContentChanges");
var _DependencyGraph = require("./DependencyGraph");
var _FormulaCellVertex = require("./DependencyGraph/FormulaCellVertex");
var _InterpreterState = require("./interpreter/InterpreterState");
var _InterpreterValue = require("./interpreter/InterpreterValue");
var _SimpleRangeValue = require("./SimpleRangeValue");
var _statistics = require("./statistics");
/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */

class Evaluator {
  constructor(config, stats, interpreter, lazilyTransformingAstService, dependencyGraph, columnSearch) {
    this.config = config;
    this.stats = stats;
    this.interpreter = interpreter;
    this.lazilyTransformingAstService = lazilyTransformingAstService;
    this.dependencyGraph = dependencyGraph;
    this.columnSearch = columnSearch;
  }
  run() {
    this.stats.start(_statistics.StatType.TOP_SORT);
    const {
      sorted,
      cycled
    } = this.dependencyGraph.topSortWithScc();
    this.stats.end(_statistics.StatType.TOP_SORT);
    this.stats.measure(_statistics.StatType.EVALUATION, () => {
      this.recomputeFormulas(cycled, sorted);
    });
  }
  partialRun(vertices) {
    const changes = _ContentChanges.ContentChanges.empty();
    this.stats.measure(_statistics.StatType.EVALUATION, () => {
      this.dependencyGraph.graph.getTopSortedWithSccSubgraphFrom(vertices, vertex => {
        if (vertex instanceof _FormulaCellVertex.FormulaVertex) {
          const currentValue = vertex.isComputed() ? vertex.getCellValue() : undefined;
          const newCellValue = this.recomputeFormulaVertexValue(vertex);
          if (newCellValue !== currentValue) {
            const address = vertex.getAddress(this.lazilyTransformingAstService);
            changes.addChange(newCellValue, address);
            this.columnSearch.change((0, _InterpreterValue.getRawValue)(currentValue), (0, _InterpreterValue.getRawValue)(newCellValue), address);
            return true;
          }
          return false;
        } else if (vertex instanceof _DependencyGraph.RangeVertex) {
          vertex.clearCache();
          return true;
        } else {
          return true;
        }
      }, vertex => {
        if (vertex instanceof _DependencyGraph.RangeVertex) {
          vertex.clearCache();
        } else if (vertex instanceof _FormulaCellVertex.FormulaVertex) {
          const address = vertex.getAddress(this.lazilyTransformingAstService);
          this.columnSearch.remove((0, _InterpreterValue.getRawValue)(vertex.valueOrUndef()), address);
          const error = new _Cell.CellError(_Cell.ErrorType.CYCLE, undefined, vertex);
          vertex.setCellValue(error);
          changes.addChange(error, address);
        }
      });
    });
    return changes;
  }
  runAndForget(ast, address, dependencies) {
    const tmpRanges = [];
    for (const dep of (0, _absolutizeDependencies.absolutizeDependencies)(dependencies, address)) {
      if (dep instanceof _AbsoluteCellRange.AbsoluteCellRange) {
        const range = dep;
        if (this.dependencyGraph.getRange(range.start, range.end) === undefined) {
          const rangeVertex = new _DependencyGraph.RangeVertex(range);
          this.dependencyGraph.rangeMapping.setRange(rangeVertex);
          tmpRanges.push(rangeVertex);
        }
      }
    }
    const ret = this.evaluateAstToCellValue(ast, new _InterpreterState.InterpreterState(address, this.config.useArrayArithmetic));
    tmpRanges.forEach(rangeVertex => {
      this.dependencyGraph.rangeMapping.removeRange(rangeVertex);
    });
    return ret;
  }
  /**
   * Recalculates formulas in the topological sort order
   */
  recomputeFormulas(cycled, sorted) {
    cycled.forEach(vertex => {
      if (vertex instanceof _FormulaCellVertex.FormulaVertex) {
        vertex.setCellValue(new _Cell.CellError(_Cell.ErrorType.CYCLE, undefined, vertex));
      }
    });
    sorted.forEach(vertex => {
      if (vertex instanceof _FormulaCellVertex.FormulaVertex) {
        const newCellValue = this.recomputeFormulaVertexValue(vertex);
        const address = vertex.getAddress(this.lazilyTransformingAstService);
        this.columnSearch.add((0, _InterpreterValue.getRawValue)(newCellValue), address);
      } else if (vertex instanceof _DependencyGraph.RangeVertex) {
        vertex.clearCache();
      }
    });
  }
  recomputeFormulaVertexValue(vertex) {
    const address = vertex.getAddress(this.lazilyTransformingAstService);
    if (vertex instanceof _DependencyGraph.ArrayVertex && (vertex.array.size.isRef || !this.dependencyGraph.isThereSpaceForArray(vertex))) {
      return vertex.setNoSpace();
    } else {
      const formula = vertex.getFormula(this.lazilyTransformingAstService);
      const newCellValue = this.evaluateAstToCellValue(formula, new _InterpreterState.InterpreterState(address, this.config.useArrayArithmetic, vertex));
      return vertex.setCellValue(newCellValue);
    }
  }
  evaluateAstToCellValue(ast, state) {
    const interpreterValue = this.interpreter.evaluateAst(ast, state);
    if (interpreterValue instanceof _SimpleRangeValue.SimpleRangeValue) {
      return interpreterValue;
    } else if (interpreterValue === _InterpreterValue.EmptyValue && this.config.evaluateNullToZero) {
      return 0;
    } else {
      return interpreterValue;
    }
  }
}
exports.Evaluator = Evaluator;