"use strict";

exports.__esModule = true;
exports.SimpleStrategy = exports.GraphBuilder = void 0;
var _absolutizeDependencies = require("./absolutizeDependencies");
var _ArraySize = require("./ArraySize");
var _Cell = require("./Cell");
var _CellContentParser = require("./CellContentParser");
var _DependencyGraph = require("./DependencyGraph");
var _InterpreterValue = require("./interpreter/InterpreterValue");
var _statistics = require("./statistics");
/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */

/**
 * Service building the graph and mappings.
 */
class GraphBuilder {
  /**
   * Configures the building service.
   */
  constructor(dependencyGraph, columnSearch, parser, cellContentParser, stats, arraySizePredictor) {
    this.dependencyGraph = dependencyGraph;
    this.columnSearch = columnSearch;
    this.parser = parser;
    this.cellContentParser = cellContentParser;
    this.stats = stats;
    this.arraySizePredictor = arraySizePredictor;
    this.buildStrategy = new SimpleStrategy(dependencyGraph, columnSearch, parser, stats, cellContentParser, arraySizePredictor);
  }
  /**
   * Builds graph.
   */
  buildGraph(sheets, stats) {
    const dependencies = stats.measure(_statistics.StatType.COLLECT_DEPENDENCIES, () => this.buildStrategy.run(sheets));
    this.dependencyGraph.getAndClearContentChanges();
    stats.measure(_statistics.StatType.PROCESS_DEPENDENCIES, () => this.processDependencies(dependencies));
  }
  processDependencies(dependencies) {
    dependencies.forEach((cellDependencies, endVertex) => {
      this.dependencyGraph.processCellDependencies(cellDependencies, endVertex);
    });
  }
}
exports.GraphBuilder = GraphBuilder;
class SimpleStrategy {
  constructor(dependencyGraph, columnIndex, parser, stats, cellContentParser, arraySizePredictor) {
    this.dependencyGraph = dependencyGraph;
    this.columnIndex = columnIndex;
    this.parser = parser;
    this.stats = stats;
    this.cellContentParser = cellContentParser;
    this.arraySizePredictor = arraySizePredictor;
  }
  run(sheets) {
    const dependencies = new Map();
    for (const sheetName in sheets) {
      const sheetId = this.dependencyGraph.getSheetId(sheetName);
      const sheet = sheets[sheetName];
      for (let i = 0; i < sheet.length; ++i) {
        const row = sheet[i];
        for (let j = 0; j < row.length; ++j) {
          const cellContent = row[j];
          const address = (0, _Cell.simpleCellAddress)(sheetId, j, i);
          const parsedCellContent = this.cellContentParser.parse(cellContent);
          if (parsedCellContent instanceof _CellContentParser.CellContent.Formula) {
            const parseResult = this.stats.measure(_statistics.StatType.PARSER, () => this.parser.parse(parsedCellContent.formula, address));
            if (parseResult.errors.length > 0) {
              this.shrinkArrayIfNeeded(address);
              const vertex = new _DependencyGraph.ParsingErrorVertex(parseResult.errors, parsedCellContent.formula);
              this.dependencyGraph.addVertex(address, vertex);
            } else {
              this.shrinkArrayIfNeeded(address);
              const size = this.arraySizePredictor.checkArraySize(parseResult.ast, address);
              if (size.isScalar()) {
                const vertex = new _DependencyGraph.FormulaCellVertex(parseResult.ast, address, 0);
                dependencies.set(vertex, (0, _absolutizeDependencies.absolutizeDependencies)(parseResult.dependencies, address));
                this.dependencyGraph.addVertex(address, vertex);
                if (parseResult.hasVolatileFunction) {
                  this.dependencyGraph.markAsVolatile(vertex);
                }
                if (parseResult.hasStructuralChangeFunction) {
                  this.dependencyGraph.markAsDependentOnStructureChange(vertex);
                }
              } else {
                const vertex = new _DependencyGraph.ArrayVertex(parseResult.ast, address, new _ArraySize.ArraySize(size.width, size.height));
                dependencies.set(vertex, (0, _absolutizeDependencies.absolutizeDependencies)(parseResult.dependencies, address));
                this.dependencyGraph.addArrayVertex(address, vertex);
              }
            }
          } else if (parsedCellContent instanceof _CellContentParser.CellContent.Empty) {
            /* we don't care about empty cells here */
          } else {
            this.shrinkArrayIfNeeded(address);
            const vertex = new _DependencyGraph.ValueCellVertex(parsedCellContent.value, cellContent);
            this.columnIndex.add((0, _InterpreterValue.getRawValue)(parsedCellContent.value), address);
            this.dependencyGraph.addVertex(address, vertex);
          }
        }
      }
    }
    return dependencies;
  }
  shrinkArrayIfNeeded(address) {
    const vertex = this.dependencyGraph.getCell(address);
    if (vertex instanceof _DependencyGraph.ArrayVertex) {
      this.dependencyGraph.shrinkArrayToCorner(vertex);
    }
  }
}
exports.SimpleStrategy = SimpleStrategy;