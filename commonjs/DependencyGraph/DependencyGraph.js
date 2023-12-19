"use strict";

exports.__esModule = true;
exports.DependencyGraph = void 0;
var _AbsoluteCellRange = require("../AbsoluteCellRange");
var _absolutizeDependencies = require("../absolutizeDependencies");
var _Cell = require("../Cell");
var _ContentChanges = require("../ContentChanges");
var _errorMessage = require("../error-message");
var _InterpreterValue = require("../interpreter/InterpreterValue");
var _SimpleRangeValue = require("../SimpleRangeValue");
var _parser = require("../parser");
var _Span = require("../Span");
var _statistics = require("../statistics");
var _2 = require("./");
var _AddressMapping = require("./AddressMapping/AddressMapping");
var _ArrayMapping = require("./ArrayMapping");
var _collectAddressesDependentToRange = require("./collectAddressesDependentToRange");
var _FormulaCellVertex = require("./FormulaCellVertex");
var _Graph = require("./Graph");
var _RangeMapping = require("./RangeMapping");
var _SheetMapping = require("./SheetMapping");
/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */

class DependencyGraph {
  constructor(addressMapping, rangeMapping, sheetMapping, arrayMapping, stats, lazilyTransformingAstService, functionRegistry, namedExpressions) {
    this.addressMapping = addressMapping;
    this.rangeMapping = rangeMapping;
    this.sheetMapping = sheetMapping;
    this.arrayMapping = arrayMapping;
    this.stats = stats;
    this.lazilyTransformingAstService = lazilyTransformingAstService;
    this.functionRegistry = functionRegistry;
    this.namedExpressions = namedExpressions;
    this.changes = _ContentChanges.ContentChanges.empty();
    this.dependencyQueryAddresses = vertex => {
      if (vertex instanceof _2.RangeVertex) {
        return this.rangeDependencyQuery(vertex).map(([address, _]) => address);
      } else {
        const dependenciesResult = this.formulaDependencyQuery(vertex);
        if (dependenciesResult !== undefined) {
          const [address, dependencies] = dependenciesResult;
          return dependencies.map(dependency => {
            if (dependency instanceof _parser.NamedExpressionDependency) {
              return this.namedExpressions.namedExpressionOrPlaceholder(dependency.name, address.sheet).address;
            } else if ((0, _Cell.isSimpleCellAddress)(dependency)) {
              return dependency;
            } else {
              return (0, _AbsoluteCellRange.simpleCellRange)(dependency.start, dependency.end);
            }
          });
        } else {
          return [];
        }
      }
    };
    this.dependencyQueryVertices = vertex => {
      if (vertex instanceof _2.RangeVertex) {
        return this.rangeDependencyQuery(vertex);
      } else {
        const dependenciesResult = this.formulaDependencyQuery(vertex);
        if (dependenciesResult !== undefined) {
          const [address, dependencies] = dependenciesResult;
          return dependencies.map(dependency => {
            if (dependency instanceof _AbsoluteCellRange.AbsoluteCellRange) {
              return [dependency.start, this.rangeMapping.fetchRange(dependency.start, dependency.end)];
            } else if (dependency instanceof _parser.NamedExpressionDependency) {
              const namedExpression = this.namedExpressions.namedExpressionOrPlaceholder(dependency.name, address.sheet);
              return [namedExpression.address, this.addressMapping.fetchCell(namedExpression.address)];
            } else {
              return [dependency, this.addressMapping.fetchCell(dependency)];
            }
          });
        } else {
          return [];
        }
      }
    };
    this.rangeDependencyQuery = vertex => {
      const allDeps = [];
      const {
        smallerRangeVertex,
        restRange
      } = this.rangeMapping.findSmallerRange(vertex.range); //checking whether this range was splitted by bruteForce or not
      let range;
      if (smallerRangeVertex !== undefined && this.graph.adjacentNodes(smallerRangeVertex).has(vertex)) {
        range = restRange;
        allDeps.push([new _AbsoluteCellRange.AbsoluteCellRange(smallerRangeVertex.start, smallerRangeVertex.end), smallerRangeVertex]);
      } else {
        //did we ever need to use full range
        range = vertex.range;
      }
      for (const address of range.addresses(this)) {
        const cell = this.addressMapping.getCell(address);
        if (cell !== undefined) {
          allDeps.push([address, cell]);
        }
      }
      return allDeps;
    };
    this.formulaDependencyQuery = vertex => {
      let formula;
      let address;
      if (vertex instanceof _FormulaCellVertex.FormulaVertex) {
        address = vertex.getAddress(this.lazilyTransformingAstService);
        formula = vertex.getFormula(this.lazilyTransformingAstService);
      } else {
        return undefined;
      }
      const deps = (0, _parser.collectDependencies)(formula, this.functionRegistry);
      return [address, (0, _absolutizeDependencies.absolutizeDependencies)(deps, address)];
    };
    this.graph = new _Graph.Graph(this.dependencyQueryVertices);
  }
  /**
   * Invariants:
   * - empty cell has associated EmptyCellVertex if and only if it is a dependency (possibly indirect, through range) to some formula
   */
  static buildEmpty(lazilyTransformingAstService, config, functionRegistry, namedExpressions, stats) {
    var _a, _b;
    return new DependencyGraph((_a = config.addressMapping) !== null && _a !== void 0 ? _a : new _AddressMapping.AddressMapping(config.chooseAddressMappingPolicy), (_b = config.rangeMapping) !== null && _b !== void 0 ? _b : new _RangeMapping.RangeMapping(), new _SheetMapping.SheetMapping(config.translationPackage), new _ArrayMapping.ArrayMapping(), stats, lazilyTransformingAstService, functionRegistry, namedExpressions);
  }
  setFormulaToCell(address, ast, dependencies, size, hasVolatileFunction, hasStructuralChangeFunction) {
    const newVertex = _FormulaCellVertex.FormulaVertex.fromAst(ast, address, size, this.lazilyTransformingAstService.version());
    this.exchangeOrAddFormulaVertex(newVertex);
    this.processCellDependencies(dependencies, newVertex);
    this.graph.markNodeAsDirty(newVertex);
    if (hasVolatileFunction) {
      this.markAsVolatile(newVertex);
    }
    if (hasStructuralChangeFunction) {
      this.markAsDependentOnStructureChange(newVertex);
    }
    this.correctInfiniteRangesDependency(address);
    return this.getAndClearContentChanges();
  }
  setParsingErrorToCell(address, errorVertex) {
    const vertex = this.shrinkPossibleArrayAndGetCell(address);
    this.exchangeOrAddGraphNode(vertex, errorVertex);
    this.addressMapping.setCell(address, errorVertex);
    this.graph.markNodeAsDirty(errorVertex);
    this.correctInfiniteRangesDependency(address);
    return this.getAndClearContentChanges();
  }
  setValueToCell(address, value) {
    const vertex = this.shrinkPossibleArrayAndGetCell(address);
    if (vertex instanceof _2.ArrayVertex) {
      this.arrayMapping.removeArray(vertex.getRange());
    }
    if (vertex instanceof _2.ValueCellVertex) {
      const oldValues = vertex.getValues();
      if (oldValues.rawValue !== value.rawValue) {
        vertex.setValues(value);
        this.graph.markNodeAsDirty(vertex);
      }
    } else {
      const newVertex = new _2.ValueCellVertex(value.parsedValue, value.rawValue);
      this.exchangeOrAddGraphNode(vertex, newVertex);
      this.addressMapping.setCell(address, newVertex);
      this.graph.markNodeAsDirty(newVertex);
    }
    this.correctInfiniteRangesDependency(address);
    return this.getAndClearContentChanges();
  }
  setCellEmpty(address) {
    const vertex = this.shrinkPossibleArrayAndGetCell(address);
    if (vertex === undefined) {
      return _ContentChanges.ContentChanges.empty();
    }
    if (this.graph.adjacentNodes(vertex).size > 0) {
      const emptyVertex = new _2.EmptyCellVertex();
      this.exchangeGraphNode(vertex, emptyVertex);
      if (this.graph.adjacentNodesCount(emptyVertex) === 0) {
        this.removeVertex(emptyVertex);
        this.addressMapping.removeCell(address);
      } else {
        this.graph.markNodeAsDirty(emptyVertex);
        this.addressMapping.setCell(address, emptyVertex);
      }
    } else {
      this.removeVertex(vertex);
      this.addressMapping.removeCell(address);
    }
    return this.getAndClearContentChanges();
  }
  ensureThatVertexIsNonArrayCellVertex(vertex) {
    if (vertex instanceof _2.ArrayVertex) {
      throw new Error('Illegal operation');
    }
  }
  clearDirtyVertices() {
    this.graph.clearDirtyNodes();
  }
  verticesToRecompute() {
    return this.graph.getDirtyAndVolatileNodes();
  }
  processCellDependencies(cellDependencies, endVertex) {
    const endVertexId = this.graph.getNodeId(endVertex);
    cellDependencies.forEach(dep => {
      if (dep instanceof _AbsoluteCellRange.AbsoluteCellRange) {
        const range = dep;
        let rangeVertex = this.getRange(range.start, range.end);
        if (rangeVertex === undefined) {
          rangeVertex = new _2.RangeVertex(range);
          this.rangeMapping.setRange(rangeVertex);
        }
        this.graph.addNodeAndReturnId(rangeVertex);
        const rangeVertexId = this.graph.getNodeId(rangeVertex);
        if (!range.isFinite()) {
          this.graph.markNodeAsInfiniteRange(rangeVertexId);
        }
        const {
          smallerRangeVertex,
          restRange
        } = this.rangeMapping.findSmallerRange(range);
        if (smallerRangeVertex !== undefined) {
          this.graph.addEdge(smallerRangeVertex, rangeVertexId);
          if (rangeVertex.bruteForce) {
            rangeVertex.bruteForce = false;
            for (const cellFromRange of range.addresses(this)) {
              //if we ever switch heuristic to processing by sorted sizes, this would be unnecessary
              this.graph.removeEdge(this.fetchCell(cellFromRange), rangeVertexId);
            }
          }
        } else {
          rangeVertex.bruteForce = true;
        }
        const array = this.arrayMapping.getArray(restRange);
        if (array !== undefined) {
          this.graph.addEdge(array, rangeVertexId);
        } else {
          for (const cellFromRange of restRange.addresses(this)) {
            const {
              vertex,
              id
            } = this.fetchCellOrCreateEmpty(cellFromRange);
            this.graph.addEdge(id !== null && id !== void 0 ? id : vertex, rangeVertexId);
          }
        }
        this.graph.addEdge(rangeVertexId, endVertexId);
        if (range.isFinite()) {
          this.correctInfiniteRangesDependenciesByRangeVertex(rangeVertex);
        }
      } else if (dep instanceof _parser.NamedExpressionDependency) {
        const sheetOfVertex = endVertex.getAddress(this.lazilyTransformingAstService).sheet;
        const {
          vertex,
          id
        } = this.fetchNamedExpressionVertex(dep.name, sheetOfVertex);
        this.graph.addEdge(id !== null && id !== void 0 ? id : vertex, endVertexId);
      } else {
        const {
          vertex,
          id
        } = this.fetchCellOrCreateEmpty(dep);
        this.graph.addEdge(id !== null && id !== void 0 ? id : vertex, endVertexId);
      }
    });
  }
  fetchNamedExpressionVertex(expressionName, sheetId) {
    const namedExpression = this.namedExpressions.namedExpressionOrPlaceholder(expressionName, sheetId);
    return this.fetchCellOrCreateEmpty(namedExpression.address);
  }
  exchangeNode(addressFrom, addressTo) {
    const vertexFrom = this.fetchCellOrCreateEmpty(addressFrom).vertex;
    const vertexTo = this.fetchCellOrCreateEmpty(addressTo).vertex;
    this.addressMapping.removeCell(addressFrom);
    this.exchangeGraphNode(vertexFrom, vertexTo);
  }
  correctInfiniteRangesDependency(address) {
    const relevantInfiniteRanges = this.graph.getInfiniteRanges().filter(({
      node
    }) => node.range.addressInRange(address));
    if (relevantInfiniteRanges.length <= 0) {
      return;
    }
    const {
      vertex,
      id: maybeVertexId
    } = this.fetchCellOrCreateEmpty(address);
    const vertexId = maybeVertexId !== null && maybeVertexId !== void 0 ? maybeVertexId : this.graph.getNodeId(vertex);
    relevantInfiniteRanges.forEach(({
      id
    }) => {
      this.graph.addEdge(vertexId, id);
    });
  }
  fetchCellOrCreateEmpty(address) {
    const existingVertex = this.addressMapping.getCell(address);
    if (existingVertex !== undefined) {
      return {
        vertex: existingVertex,
        id: undefined
      };
    }
    const newVertex = new _2.EmptyCellVertex();
    const newVertexId = this.graph.addNodeAndReturnId(newVertex);
    this.addressMapping.setCell(address, newVertex);
    return {
      vertex: newVertex,
      id: newVertexId
    };
  }
  removeRows(removedRows) {
    this.stats.measure(_statistics.StatType.ADJUSTING_GRAPH, () => {
      for (const [address, vertex] of this.addressMapping.entriesFromRowsSpan(removedRows)) {
        for (const adjacentNode of this.graph.adjacentNodes(vertex)) {
          this.graph.markNodeAsDirty(adjacentNode);
        }
        if (vertex instanceof _2.ArrayVertex) {
          if (vertex.isLeftCorner(address)) {
            this.shrinkArrayToCorner(vertex);
            this.arrayMapping.removeArray(vertex.getRange());
          } else {
            continue;
          }
        }
        this.removeVertex(vertex);
      }
    });
    this.stats.measure(_statistics.StatType.ADJUSTING_ADDRESS_MAPPING, () => {
      this.addressMapping.removeRows(removedRows);
    });
    const affectedArrays = this.stats.measure(_statistics.StatType.ADJUSTING_RANGES, () => {
      const affectedRanges = this.truncateRanges(removedRows, address => address.row);
      return this.getArrayVerticesRelatedToRanges(affectedRanges);
    });
    this.stats.measure(_statistics.StatType.ADJUSTING_ARRAY_MAPPING, () => {
      this.fixArraysAfterRemovingRows(removedRows.sheet, removedRows.rowStart, removedRows.numberOfRows);
    });
    this.addStructuralNodesToChangeSet();
    return {
      affectedArrays,
      contentChanges: this.getAndClearContentChanges()
    };
  }
  removeSheet(removedSheetId) {
    this.clearSheet(removedSheetId);
    for (const [adr, vertex] of this.addressMapping.sheetEntries(removedSheetId)) {
      for (const adjacentNode of this.graph.adjacentNodes(vertex)) {
        this.graph.markNodeAsDirty(adjacentNode);
      }
      this.removeVertex(vertex);
      this.addressMapping.removeCell(adr);
    }
    this.stats.measure(_statistics.StatType.ADJUSTING_RANGES, () => {
      const rangesToRemove = this.rangeMapping.removeRangesInSheet(removedSheetId);
      for (const range of rangesToRemove) {
        this.removeVertex(range);
      }
      this.stats.measure(_statistics.StatType.ADJUSTING_ADDRESS_MAPPING, () => {
        this.addressMapping.removeSheet(removedSheetId);
      });
    });
  }
  clearSheet(sheetId) {
    const arrays = new Set();
    for (const [address, vertex] of this.addressMapping.sheetEntries(sheetId)) {
      if (vertex instanceof _2.ArrayVertex) {
        arrays.add(vertex);
      } else {
        this.setCellEmpty(address);
      }
    }
    for (const array of arrays.values()) {
      this.setArrayEmpty(array);
    }
    this.addStructuralNodesToChangeSet();
  }
  removeColumns(removedColumns) {
    this.stats.measure(_statistics.StatType.ADJUSTING_GRAPH, () => {
      for (const [address, vertex] of this.addressMapping.entriesFromColumnsSpan(removedColumns)) {
        for (const adjacentNode of this.graph.adjacentNodes(vertex)) {
          this.graph.markNodeAsDirty(adjacentNode);
        }
        if (vertex instanceof _2.ArrayVertex) {
          if (vertex.isLeftCorner(address)) {
            this.shrinkArrayToCorner(vertex);
            this.arrayMapping.removeArray(vertex.getRange());
          } else {
            continue;
          }
        }
        this.removeVertex(vertex);
      }
    });
    this.stats.measure(_statistics.StatType.ADJUSTING_ADDRESS_MAPPING, () => {
      this.addressMapping.removeColumns(removedColumns);
    });
    const affectedArrays = this.stats.measure(_statistics.StatType.ADJUSTING_RANGES, () => {
      const affectedRanges = this.truncateRanges(removedColumns, address => address.col);
      return this.getArrayVerticesRelatedToRanges(affectedRanges);
    });
    this.stats.measure(_statistics.StatType.ADJUSTING_ARRAY_MAPPING, () => {
      return this.fixArraysAfterRemovingColumns(removedColumns.sheet, removedColumns.columnStart, removedColumns.numberOfColumns);
    });
    this.addStructuralNodesToChangeSet();
    return {
      affectedArrays,
      contentChanges: this.getAndClearContentChanges()
    };
  }
  addRows(addedRows) {
    this.stats.measure(_statistics.StatType.ADJUSTING_ADDRESS_MAPPING, () => {
      this.addressMapping.addRows(addedRows.sheet, addedRows.rowStart, addedRows.numberOfRows);
    });
    const affectedArrays = this.stats.measure(_statistics.StatType.ADJUSTING_RANGES, () => {
      const result = this.rangeMapping.moveAllRangesInSheetAfterRowByRows(addedRows.sheet, addedRows.rowStart, addedRows.numberOfRows);
      this.fixRangesWhenAddingRows(addedRows.sheet, addedRows.rowStart, addedRows.numberOfRows);
      return this.getArrayVerticesRelatedToRanges(result.verticesWithChangedSize);
    });
    this.stats.measure(_statistics.StatType.ADJUSTING_ARRAY_MAPPING, () => {
      this.fixArraysAfterAddingRow(addedRows.sheet, addedRows.rowStart, addedRows.numberOfRows);
    });
    for (const vertex of this.addressMapping.verticesFromRowsSpan(addedRows)) {
      this.graph.markNodeAsDirty(vertex);
    }
    this.addStructuralNodesToChangeSet();
    return {
      affectedArrays
    };
  }
  addColumns(addedColumns) {
    this.stats.measure(_statistics.StatType.ADJUSTING_ADDRESS_MAPPING, () => {
      this.addressMapping.addColumns(addedColumns.sheet, addedColumns.columnStart, addedColumns.numberOfColumns);
    });
    const affectedArrays = this.stats.measure(_statistics.StatType.ADJUSTING_RANGES, () => {
      const result = this.rangeMapping.moveAllRangesInSheetAfterColumnByColumns(addedColumns.sheet, addedColumns.columnStart, addedColumns.numberOfColumns);
      this.fixRangesWhenAddingColumns(addedColumns.sheet, addedColumns.columnStart, addedColumns.numberOfColumns);
      return this.getArrayVerticesRelatedToRanges(result.verticesWithChangedSize);
    });
    this.stats.measure(_statistics.StatType.ADJUSTING_ARRAY_MAPPING, () => {
      return this.fixArraysAfterAddingColumn(addedColumns.sheet, addedColumns.columnStart, addedColumns.numberOfColumns);
    });
    for (const vertex of this.addressMapping.verticesFromColumnsSpan(addedColumns)) {
      this.graph.markNodeAsDirty(vertex);
    }
    this.addStructuralNodesToChangeSet();
    return {
      affectedArrays,
      contentChanges: this.getAndClearContentChanges()
    };
  }
  ensureNoArrayInRange(range) {
    if (this.arrayMapping.isFormulaArrayInRange(range)) {
      throw Error('It is not possible to move / replace cells with array');
    }
  }
  isThereSpaceForArray(arrayVertex) {
    const range = arrayVertex.getRangeOrUndef();
    if (range === undefined) {
      return false;
    }
    for (const address of range.addresses(this)) {
      const vertexUnderAddress = this.addressMapping.getCell(address);
      if (vertexUnderAddress !== undefined && !(vertexUnderAddress instanceof _2.EmptyCellVertex) && vertexUnderAddress !== arrayVertex) {
        return false;
      }
    }
    return true;
  }
  moveCells(sourceRange, toRight, toBottom, toSheet) {
    for (const sourceAddress of sourceRange.addressesWithDirection(toRight, toBottom, this)) {
      const targetAddress = (0, _Cell.simpleCellAddress)(toSheet, sourceAddress.col + toRight, sourceAddress.row + toBottom);
      let sourceVertex = this.addressMapping.getCell(sourceAddress);
      const targetVertex = this.addressMapping.getCell(targetAddress);
      this.addressMapping.removeCell(sourceAddress);
      if (sourceVertex !== undefined) {
        this.graph.markNodeAsDirty(sourceVertex);
        this.addressMapping.setCell(targetAddress, sourceVertex);
        let emptyVertex = undefined;
        for (const adjacentNode of this.graph.adjacentNodes(sourceVertex)) {
          if (adjacentNode instanceof _2.RangeVertex && !sourceRange.containsRange(adjacentNode.range)) {
            emptyVertex = emptyVertex !== null && emptyVertex !== void 0 ? emptyVertex : this.fetchCellOrCreateEmpty(sourceAddress).vertex;
            this.graph.addEdge(emptyVertex, adjacentNode);
            this.graph.removeEdge(sourceVertex, adjacentNode);
          }
        }
        if (emptyVertex) {
          this.graph.markNodeAsDirty(emptyVertex);
          this.addressMapping.setCell(sourceAddress, emptyVertex);
        }
      }
      if (targetVertex !== undefined) {
        if (sourceVertex === undefined) {
          this.addressMapping.removeCell(targetAddress);
        }
        for (const adjacentNode of this.graph.adjacentNodes(targetVertex)) {
          sourceVertex = sourceVertex !== null && sourceVertex !== void 0 ? sourceVertex : this.fetchCellOrCreateEmpty(targetAddress).vertex;
          this.graph.addEdge(sourceVertex, adjacentNode);
          this.graph.markNodeAsDirty(sourceVertex);
        }
        this.removeVertex(targetVertex);
      }
    }
    for (const rangeVertex of this.rangeMapping.rangeVerticesContainedInRange(sourceRange)) {
      for (const adjacentNode of this.graph.adjacentNodes(rangeVertex)) {
        if (adjacentNode instanceof _2.RangeVertex && !sourceRange.containsRange(adjacentNode.range)) {
          this.graph.removeEdge(rangeVertex, adjacentNode);
          for (const address of rangeVertex.range.addresses(this)) {
            const {
              vertex,
              id
            } = this.fetchCellOrCreateEmpty(address);
            this.graph.addEdge(id !== null && id !== void 0 ? id : vertex, adjacentNode);
            this.addressMapping.setCell(address, vertex);
            this.graph.markNodeAsDirty(vertex);
          }
        }
      }
    }
    this.rangeMapping.moveRangesInsideSourceRange(sourceRange, toRight, toBottom, toSheet);
  }
  setArrayEmpty(arrayVertex) {
    const arrayRange = _AbsoluteCellRange.AbsoluteCellRange.spanFrom(arrayVertex.getAddress(this.lazilyTransformingAstService), arrayVertex.width, arrayVertex.height);
    const adjacentNodes = this.graph.adjacentNodes(arrayVertex);
    for (const address of arrayRange.addresses(this)) {
      this.addressMapping.removeCell(address);
    }
    for (const adjacentNode of adjacentNodes.values()) {
      const nodeDependencies = (0, _collectAddressesDependentToRange.collectAddressesDependentToRange)(this.functionRegistry, adjacentNode, arrayVertex.getRange(), this.lazilyTransformingAstService, this);
      for (const address of nodeDependencies) {
        const {
          vertex,
          id
        } = this.fetchCellOrCreateEmpty(address);
        this.graph.addEdge(id !== null && id !== void 0 ? id : vertex, adjacentNode);
      }
      if (nodeDependencies.length > 0) {
        this.graph.markNodeAsDirty(adjacentNode);
      }
    }
    this.removeVertex(arrayVertex);
    this.arrayMapping.removeArray(arrayVertex.getRange());
  }
  addVertex(address, vertex) {
    this.graph.addNodeAndReturnId(vertex);
    this.addressMapping.setCell(address, vertex);
  }
  addArrayVertex(address, vertex) {
    this.graph.addNodeAndReturnId(vertex);
    this.setAddressMappingForArrayVertex(vertex, address);
  }
  *arrayFormulaNodes() {
    for (const vertex of this.graph.getNodes()) {
      if (vertex instanceof _2.ArrayVertex) {
        yield vertex;
      }
    }
  }
  *entriesFromRowsSpan(rowsSpan) {
    yield* this.addressMapping.entriesFromRowsSpan(rowsSpan);
  }
  *entriesFromColumnsSpan(columnsSpan) {
    yield* this.addressMapping.entriesFromColumnsSpan(columnsSpan);
  }
  existsVertex(address) {
    return this.addressMapping.has(address);
  }
  fetchCell(address) {
    return this.addressMapping.fetchCell(address);
  }
  getCell(address) {
    return this.addressMapping.getCell(address);
  }
  getCellValue(address) {
    return this.addressMapping.getCellValue(address);
  }
  getRawValue(address) {
    return this.addressMapping.getRawValue(address);
  }
  getScalarValue(address) {
    const value = this.addressMapping.getCellValue(address);
    if (value instanceof _SimpleRangeValue.SimpleRangeValue) {
      return new _Cell.CellError(_Cell.ErrorType.VALUE, _errorMessage.ErrorMessage.ScalarExpected);
    }
    return value;
  }
  existsEdge(fromNode, toNode) {
    return this.graph.existsEdge(fromNode, toNode);
  }
  getSheetId(sheetName) {
    return this.sheetMapping.fetch(sheetName);
  }
  getSheetHeight(sheet) {
    return this.addressMapping.getHeight(sheet);
  }
  getSheetWidth(sheet) {
    return this.addressMapping.getWidth(sheet);
  }
  getArray(range) {
    return this.arrayMapping.getArray(range);
  }
  setArray(range, vertex) {
    this.arrayMapping.setArray(range, vertex);
  }
  getRange(start, end) {
    return this.rangeMapping.getRange(start, end);
  }
  topSortWithScc() {
    return this.graph.topSortWithScc();
  }
  markAsVolatile(vertex) {
    this.graph.markNodeAsVolatile(vertex);
  }
  markAsDependentOnStructureChange(vertex) {
    this.graph.markNodeAsChangingWithStructure(vertex);
  }
  forceApplyPostponedTransformations() {
    for (const vertex of this.graph.getNodes()) {
      if (vertex instanceof _2.FormulaCellVertex) {
        vertex.ensureRecentData(this.lazilyTransformingAstService);
      }
    }
  }
  getArrayVerticesRelatedToRanges(ranges) {
    const arrayVertices = ranges.map(range => {
      if (this.graph.hasNode(range)) {
        return Array.from(this.graph.adjacentNodes(range)).filter(node => node instanceof _2.ArrayVertex);
      } else {
        return [];
      }
    });
    return new Set(...arrayVertices);
  }
  *rawValuesFromRange(range) {
    for (const address of range.addresses(this)) {
      const value = this.getScalarValue(address);
      if (value !== _InterpreterValue.EmptyValue) {
        yield [(0, _InterpreterValue.getRawValue)(value), address];
      }
    }
  }
  *entriesFromRange(range) {
    for (const address of range.addresses(this)) {
      yield [address, this.getCell(address)];
    }
  }
  exchangeGraphNode(oldNode, newNode) {
    this.graph.addNodeAndReturnId(newNode);
    const adjNodesStored = this.graph.adjacentNodes(oldNode);
    this.removeVertex(oldNode);
    adjNodesStored.forEach(adjacentNode => {
      if (this.graph.hasNode(adjacentNode)) {
        this.graph.addEdge(newNode, adjacentNode);
      }
    });
  }
  exchangeOrAddGraphNode(oldNode, newNode) {
    if (oldNode) {
      this.exchangeGraphNode(oldNode, newNode);
    } else {
      this.graph.addNodeAndReturnId(newNode);
    }
  }
  computeListOfValuesInRange(range) {
    const values = [];
    for (const cellFromRange of range.addresses(this)) {
      const value = this.getScalarValue(cellFromRange);
      values.push(value);
    }
    return values;
  }
  shrinkArrayToCorner(array) {
    this.cleanAddressMappingUnderArray(array);
    for (const adjacentVertex of this.adjacentArrayVertices(array)) {
      let relevantDependencies;
      if (adjacentVertex instanceof _FormulaCellVertex.FormulaVertex) {
        relevantDependencies = this.formulaDirectDependenciesToArray(adjacentVertex, array);
      } else {
        relevantDependencies = this.rangeDirectDependenciesToArray(adjacentVertex, array);
      }
      let dependentToCorner = false;
      for (const [address, vertex] of relevantDependencies) {
        if (array.isLeftCorner(address)) {
          dependentToCorner = true;
        }
        this.graph.addEdge(vertex, adjacentVertex);
        this.graph.markNodeAsDirty(vertex);
      }
      if (!dependentToCorner) {
        this.graph.removeEdge(array, adjacentVertex);
      }
    }
    this.graph.markNodeAsDirty(array);
  }
  isArrayInternalCell(address) {
    const vertex = this.getCell(address);
    return vertex instanceof _2.ArrayVertex && !vertex.isLeftCorner(address);
  }
  getAndClearContentChanges() {
    const changes = this.changes;
    this.changes = _ContentChanges.ContentChanges.empty();
    return changes;
  }
  getAdjacentNodesAddresses(inputVertex) {
    const deps = this.graph.adjacentNodes(inputVertex);
    const ret = [];
    deps.forEach(vertex => {
      const castVertex = vertex;
      if (castVertex instanceof _2.RangeVertex) {
        ret.push((0, _AbsoluteCellRange.simpleCellRange)(castVertex.start, castVertex.end));
      } else {
        ret.push(castVertex.getAddress(this.lazilyTransformingAstService));
      }
    });
    return ret;
  }
  correctInfiniteRangesDependenciesByRangeVertex(vertex) {
    this.graph.getInfiniteRanges().forEach(({
      id: infiniteRangeVertexId,
      node: infiniteRangeVertex
    }) => {
      const intersection = vertex.range.intersectionWith(infiniteRangeVertex.range);
      if (intersection === undefined) {
        return;
      }
      intersection.addresses(this).forEach(address => {
        const {
          vertex,
          id
        } = this.fetchCellOrCreateEmpty(address);
        this.graph.addEdge(id !== null && id !== void 0 ? id : vertex, infiniteRangeVertexId);
      });
    });
  }
  cleanAddressMappingUnderArray(vertex) {
    const arrayRange = vertex.getRange();
    for (const address of arrayRange.addresses(this)) {
      const oldValue = vertex.getArrayCellValue(address);
      if (this.getCell(address) === vertex) {
        if (vertex.isLeftCorner(address)) {
          this.changes.addChange(new _Cell.CellError(_Cell.ErrorType.REF), address, oldValue);
        } else {
          this.addressMapping.removeCell(address);
          this.changes.addChange(_InterpreterValue.EmptyValue, address, oldValue);
        }
      } else {
        this.changes.addChange(_InterpreterValue.EmptyValue, address, oldValue);
      }
    }
  }
  *formulaDirectDependenciesToArray(vertex, array) {
    var _a;
    const [, formulaDependencies] = (_a = this.formulaDependencyQuery(vertex)) !== null && _a !== void 0 ? _a : [];
    if (formulaDependencies === undefined) {
      return;
    }
    for (const dependency of formulaDependencies) {
      if (dependency instanceof _parser.NamedExpressionDependency || dependency instanceof _AbsoluteCellRange.AbsoluteCellRange) {
        continue;
      }
      if (array.getRange().addressInRange(dependency)) {
        const vertex = this.fetchCellOrCreateEmpty(dependency).vertex;
        yield [dependency, vertex];
      }
    }
  }
  *rangeDirectDependenciesToArray(vertex, array) {
    const {
      restRange: range
    } = this.rangeMapping.findSmallerRange(vertex.range);
    for (const address of range.addresses(this)) {
      if (array.getRange().addressInRange(address)) {
        const cell = this.fetchCellOrCreateEmpty(address).vertex;
        yield [address, cell];
      }
    }
  }
  *adjacentArrayVertices(vertex) {
    const adjacentNodes = this.graph.adjacentNodes(vertex);
    for (const item of adjacentNodes) {
      if (item instanceof _FormulaCellVertex.FormulaVertex || item instanceof _2.RangeVertex) {
        yield item;
      }
    }
  }
  addStructuralNodesToChangeSet() {
    this.graph.markChangingWithStructureNodesAsDirty();
  }
  fixRangesWhenAddingRows(sheet, row, numberOfRows) {
    const originalValues = Array.from(this.rangeMapping.rangesInSheet(sheet));
    for (const rangeVertex of originalValues) {
      if (rangeVertex.range.includesRow(row + numberOfRows)) {
        if (rangeVertex.bruteForce) {
          const addedSubrangeInThatRange = rangeVertex.range.rangeWithSameWidth(row, numberOfRows);
          for (const address of addedSubrangeInThatRange.addresses(this)) {
            const {
              vertex,
              id
            } = this.fetchCellOrCreateEmpty(address);
            this.graph.addEdge(id !== null && id !== void 0 ? id : vertex, rangeVertex);
          }
        } else {
          let currentRangeVertex = rangeVertex;
          let find = this.rangeMapping.findSmallerRange(currentRangeVertex.range);
          if (find.smallerRangeVertex !== undefined) {
            continue;
          }
          while (find.smallerRangeVertex === undefined) {
            const newRangeVertex = new _2.RangeVertex(_AbsoluteCellRange.AbsoluteCellRange.spanFrom(currentRangeVertex.range.start, currentRangeVertex.range.width(), currentRangeVertex.range.height() - 1));
            this.rangeMapping.setRange(newRangeVertex);
            this.graph.addNodeAndReturnId(newRangeVertex);
            const restRange = new _AbsoluteCellRange.AbsoluteCellRange((0, _Cell.simpleCellAddress)(currentRangeVertex.range.start.sheet, currentRangeVertex.range.start.col, currentRangeVertex.range.end.row), currentRangeVertex.range.end);
            this.addAllFromRange(restRange, currentRangeVertex);
            this.graph.addEdge(newRangeVertex, currentRangeVertex);
            currentRangeVertex = newRangeVertex;
            find = this.rangeMapping.findSmallerRange(currentRangeVertex.range);
          }
          this.graph.addEdge(find.smallerRangeVertex, currentRangeVertex);
          this.addAllFromRange(find.restRange, currentRangeVertex);
          this.graph.removeEdge(find.smallerRangeVertex, rangeVertex);
        }
      }
    }
  }
  addAllFromRange(range, rangeVertex) {
    for (const address of range.addresses(this)) {
      const {
        vertex,
        id
      } = this.fetchCellOrCreateEmpty(address);
      this.graph.addEdge(id !== null && id !== void 0 ? id : vertex, rangeVertex);
    }
  }
  fixRangesWhenAddingColumns(sheet, column, numberOfColumns) {
    for (const rangeVertex of this.rangeMapping.rangesInSheet(sheet)) {
      if (rangeVertex.range.includesColumn(column + numberOfColumns)) {
        let subrange;
        if (rangeVertex.bruteForce) {
          subrange = rangeVertex.range.rangeWithSameHeight(column, numberOfColumns);
        } else {
          subrange = _AbsoluteCellRange.AbsoluteCellRange.spanFrom((0, _Cell.simpleCellAddress)(sheet, column, rangeVertex.range.end.row), numberOfColumns, 1);
        }
        for (const address of subrange.addresses(this)) {
          const {
            vertex,
            id
          } = this.fetchCellOrCreateEmpty(address);
          this.graph.addEdge(id !== null && id !== void 0 ? id : vertex, rangeVertex);
        }
      }
    }
  }
  exchangeOrAddFormulaVertex(vertex) {
    const address = vertex.getAddress(this.lazilyTransformingAstService);
    const range = _AbsoluteCellRange.AbsoluteCellRange.spanFrom(address, vertex.width, vertex.height);
    const oldNode = this.shrinkPossibleArrayAndGetCell(address);
    if (vertex instanceof _2.ArrayVertex) {
      this.setArray(range, vertex);
    }
    this.exchangeOrAddGraphNode(oldNode, vertex);
    this.addressMapping.setCell(address, vertex);
    if (vertex instanceof _2.ArrayVertex) {
      if (!this.isThereSpaceForArray(vertex)) {
        return;
      }
      for (const cellAddress of range.addresses(this)) {
        if (vertex.isLeftCorner(cellAddress)) {
          continue;
        }
        const old = this.getCell(cellAddress);
        this.exchangeOrAddGraphNode(old, vertex);
      }
    }
    for (const cellAddress of range.addresses(this)) {
      this.addressMapping.setCell(cellAddress, vertex);
    }
  }
  setAddressMappingForArrayVertex(vertex, formulaAddress) {
    this.addressMapping.setCell(formulaAddress, vertex);
    if (!(vertex instanceof _2.ArrayVertex)) {
      return;
    }
    const range = _AbsoluteCellRange.AbsoluteCellRange.spanFromOrUndef(formulaAddress, vertex.width, vertex.height);
    if (range === undefined) {
      return;
    }
    this.setArray(range, vertex);
    if (!this.isThereSpaceForArray(vertex)) {
      return;
    }
    for (const address of range.addresses(this)) {
      this.addressMapping.setCell(address, vertex);
    }
  }
  truncateRanges(span, coordinate) {
    const {
      verticesToRemove,
      verticesToMerge,
      verticesWithChangedSize
    } = this.rangeMapping.truncateRanges(span, coordinate);
    for (const [existingVertex, mergedVertex] of verticesToMerge) {
      this.mergeRangeVertices(existingVertex, mergedVertex);
    }
    for (const rangeVertex of verticesToRemove) {
      this.removeVertexAndCleanupDependencies(rangeVertex);
    }
    return verticesWithChangedSize;
  }
  fixArraysAfterAddingRow(sheet, rowStart, numberOfRows) {
    this.arrayMapping.moveArrayVerticesAfterRowByRows(sheet, rowStart, numberOfRows);
    if (rowStart <= 0) {
      return;
    }
    for (const [, array] of this.arrayMapping.arraysInRows(_Span.RowsSpan.fromRowStartAndEnd(sheet, rowStart - 1, rowStart - 1))) {
      const arrayRange = array.getRange();
      for (let col = arrayRange.start.col; col <= arrayRange.end.col; ++col) {
        for (let row = rowStart; row <= arrayRange.end.row; ++row) {
          const destination = (0, _Cell.simpleCellAddress)(sheet, col, row);
          const source = (0, _Cell.simpleCellAddress)(sheet, col, row + numberOfRows);
          const value = array.getArrayCellValue(destination);
          this.addressMapping.moveCell(source, destination);
          this.changes.addChange(_InterpreterValue.EmptyValue, source, value);
        }
      }
    }
  }
  fixArraysAfterRemovingRows(sheet, rowStart, numberOfRows) {
    this.arrayMapping.moveArrayVerticesAfterRowByRows(sheet, rowStart, -numberOfRows);
    if (rowStart <= 0) {
      return;
    }
    for (const [, array] of this.arrayMapping.arraysInRows(_Span.RowsSpan.fromRowStartAndEnd(sheet, rowStart - 1, rowStart - 1))) {
      if (this.isThereSpaceForArray(array)) {
        for (const address of array.getRange().addresses(this)) {
          this.addressMapping.setCell(address, array);
        }
      } else {
        this.setNoSpaceIfArray(array);
      }
    }
  }
  fixArraysAfterAddingColumn(sheet, columnStart, numberOfColumns) {
    this.arrayMapping.moveArrayVerticesAfterColumnByColumns(sheet, columnStart, numberOfColumns);
    if (columnStart <= 0) {
      return;
    }
    for (const [, array] of this.arrayMapping.arraysInCols(_Span.ColumnsSpan.fromColumnStartAndEnd(sheet, columnStart - 1, columnStart - 1))) {
      const arrayRange = array.getRange();
      for (let row = arrayRange.start.row; row <= arrayRange.end.row; ++row) {
        for (let col = columnStart; col <= arrayRange.end.col; ++col) {
          const destination = (0, _Cell.simpleCellAddress)(sheet, col, row);
          const source = (0, _Cell.simpleCellAddress)(sheet, col + numberOfColumns, row);
          const value = array.getArrayCellValue(destination);
          this.addressMapping.moveCell(source, destination);
          this.changes.addChange(_InterpreterValue.EmptyValue, source, value);
        }
      }
    }
  }
  fixArraysAfterRemovingColumns(sheet, columnStart, numberOfColumns) {
    this.arrayMapping.moveArrayVerticesAfterColumnByColumns(sheet, columnStart, -numberOfColumns);
    if (columnStart <= 0) {
      return;
    }
    for (const [, array] of this.arrayMapping.arraysInCols(_Span.ColumnsSpan.fromColumnStartAndEnd(sheet, columnStart - 1, columnStart - 1))) {
      if (this.isThereSpaceForArray(array)) {
        for (const address of array.getRange().addresses(this)) {
          this.addressMapping.setCell(address, array);
        }
      } else {
        this.setNoSpaceIfArray(array);
      }
    }
  }
  shrinkPossibleArrayAndGetCell(address) {
    const vertex = this.getCell(address);
    if (!(vertex instanceof _2.ArrayVertex)) {
      return vertex;
    }
    this.setNoSpaceIfArray(vertex);
    return this.getCell(address);
  }
  setNoSpaceIfArray(vertex) {
    if (vertex instanceof _2.ArrayVertex) {
      this.shrinkArrayToCorner(vertex);
      vertex.setNoSpace();
    }
  }
  removeVertex(vertex) {
    this.removeVertexAndCleanupDependencies(vertex);
    if (vertex instanceof _2.RangeVertex) {
      this.rangeMapping.removeRange(vertex);
    }
  }
  mergeRangeVertices(existingVertex, newVertex) {
    const adjNodesStored = this.graph.adjacentNodes(newVertex);
    this.removeVertexAndCleanupDependencies(newVertex);
    this.graph.removeEdgeIfExists(existingVertex, newVertex);
    adjNodesStored.forEach(adjacentNode => {
      if (this.graph.hasNode(adjacentNode)) {
        this.graph.addEdge(existingVertex, adjacentNode);
      }
    });
  }
  removeVertexAndCleanupDependencies(inputVertex) {
    const dependencies = new Set(this.graph.removeNode(inputVertex));
    while (dependencies.size > 0) {
      const dependency = dependencies.values().next().value;
      dependencies.delete(dependency);
      const [address, vertex] = dependency;
      if (this.graph.hasNode(vertex) && this.graph.adjacentNodesCount(vertex) === 0) {
        if (vertex instanceof _2.RangeVertex || vertex instanceof _2.EmptyCellVertex) {
          this.graph.removeNode(vertex).forEach(candidate => dependencies.add(candidate));
        }
        if (vertex instanceof _2.RangeVertex) {
          this.rangeMapping.removeRange(vertex);
        } else if (vertex instanceof _2.EmptyCellVertex) {
          this.addressMapping.removeCell(address);
        }
      }
    }
  }
}
exports.DependencyGraph = DependencyGraph;