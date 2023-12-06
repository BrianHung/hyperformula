"use strict";

exports.__esModule = true;
exports.BuildEngineFactory = void 0;
var _ArraySize = require("./ArraySize");
var _CellContentParser = require("./CellContentParser");
var _ClipboardOperations = require("./ClipboardOperations");
var _Config = require("./Config");
var _CrudOperations = require("./CrudOperations");
var _DateTimeHelper = require("./DateTimeHelper");
var _DependencyGraph = require("./DependencyGraph");
var _errors = require("./errors");
var _Evaluator = require("./Evaluator");
var _Exporter = require("./Exporter");
var _GraphBuilder = require("./GraphBuilder");
var _i18n = require("./i18n");
var _ArithmeticHelper = require("./interpreter/ArithmeticHelper");
var _FunctionRegistry = require("./interpreter/FunctionRegistry");
var _Interpreter = require("./interpreter/Interpreter");
var _LazilyTransformingAstService = require("./LazilyTransformingAstService");
var _SearchStrategy = require("./Lookup/SearchStrategy");
var _NamedExpressions = require("./NamedExpressions");
var _NumberLiteralHelper = require("./NumberLiteralHelper");
var _Operations = require("./Operations");
var _parser = require("./parser");
var _Serialization = require("./Serialization");
var _Sheet = require("./Sheet");
var _statistics = require("./statistics");
var _UndoRedo = require("./UndoRedo");
/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */

class BuildEngineFactory {
  static buildFromSheets(sheets, configInput = {}, namedExpressions = []) {
    const config = new _Config.Config(configInput);
    return this.buildEngine(config, sheets, namedExpressions);
  }
  static buildFromSheet(sheet, configInput = {}, namedExpressions = []) {
    const config = new _Config.Config(configInput);
    const newsheetprefix = config.translationPackage.getUITranslation(_i18n.UIElement.NEW_SHEET_PREFIX) + '1';
    return this.buildEngine(config, {
      [newsheetprefix]: sheet
    }, namedExpressions);
  }
  static buildEmpty(configInput = {}, namedExpressions = []) {
    return this.buildEngine(new _Config.Config(configInput), {}, namedExpressions);
  }
  static rebuildWithConfig(config, sheets, namedExpressions, stats) {
    return this.buildEngine(config, sheets, namedExpressions, stats);
  }
  static buildEngine(config, sheets = {}, inputNamedExpressions = [], stats = config.useStats ? new _statistics.Statistics() : new _statistics.EmptyStatistics()) {
    stats.start(_statistics.StatType.BUILD_ENGINE_TOTAL);
    const namedExpressions = new _NamedExpressions.NamedExpressions();
    const functionRegistry = new _FunctionRegistry.FunctionRegistry(config);
    const lazilyTransformingAstService = new _LazilyTransformingAstService.LazilyTransformingAstService(stats);
    const dependencyGraph = _DependencyGraph.DependencyGraph.buildEmpty(lazilyTransformingAstService, config, functionRegistry, namedExpressions, stats);
    const columnSearch = (0, _SearchStrategy.buildColumnSearchStrategy)(dependencyGraph, config, stats);
    const sheetMapping = dependencyGraph.sheetMapping;
    const addressMapping = dependencyGraph.addressMapping;
    for (const sheetName in sheets) {
      if (Object.prototype.hasOwnProperty.call(sheets, sheetName)) {
        const sheet = sheets[sheetName];
        (0, _Sheet.validateAsSheet)(sheet);
        const boundaries = (0, _Sheet.findBoundaries)(sheet);
        if (boundaries.height > config.maxRows || boundaries.width > config.maxColumns) {
          throw new _errors.SheetSizeLimitExceededError();
        }
        const sheetId = sheetMapping.addSheet(sheetName);
        addressMapping.autoAddSheet(sheetId, boundaries);
      }
    }
    const parser = new _parser.ParserWithCaching(config, functionRegistry, sheetMapping.get, addressMapping.immutableReferenceMapping);
    lazilyTransformingAstService.parser = parser;
    const unparser = new _parser.Unparser(config, (0, _parser.buildLexerConfig)(config), sheetMapping.fetchDisplayName, namedExpressions, addressMapping);
    const dateTimeHelper = new _DateTimeHelper.DateTimeHelper(config);
    const numberLiteralHelper = new _NumberLiteralHelper.NumberLiteralHelper(config);
    const arithmeticHelper = new _ArithmeticHelper.ArithmeticHelper(config, dateTimeHelper, numberLiteralHelper);
    const cellContentParser = new _CellContentParser.CellContentParser(config, dateTimeHelper, numberLiteralHelper);
    const arraySizePredictor = new _ArraySize.ArraySizePredictor(config, functionRegistry);
    const operations = new _Operations.Operations(config, dependencyGraph, columnSearch, cellContentParser, parser, stats, lazilyTransformingAstService, namedExpressions, arraySizePredictor);
    const undoRedo = new _UndoRedo.UndoRedo(config, operations);
    lazilyTransformingAstService.undoRedo = undoRedo;
    const clipboardOperations = new _ClipboardOperations.ClipboardOperations(config, dependencyGraph, operations);
    const crudOperations = new _CrudOperations.CrudOperations(config, operations, undoRedo, clipboardOperations, dependencyGraph, columnSearch, parser, cellContentParser, lazilyTransformingAstService, namedExpressions);
    inputNamedExpressions.forEach(entry => {
      crudOperations.ensureItIsPossibleToAddNamedExpression(entry.name, entry.expression, entry.scope);
      crudOperations.operations.addNamedExpression(entry.name, entry.expression, entry.scope, entry.options);
    });
    const exporter = new _Exporter.Exporter(config, namedExpressions, sheetMapping.fetchDisplayName, lazilyTransformingAstService);
    const serialization = new _Serialization.Serialization(dependencyGraph, unparser, exporter);
    const interpreter = new _Interpreter.Interpreter(config, dependencyGraph, columnSearch, stats, arithmeticHelper, functionRegistry, namedExpressions, serialization, arraySizePredictor, dateTimeHelper);
    stats.measure(_statistics.StatType.GRAPH_BUILD, () => {
      const graphBuilder = new _GraphBuilder.GraphBuilder(dependencyGraph, columnSearch, parser, cellContentParser, stats, arraySizePredictor);
      graphBuilder.buildGraph(sheets, stats);
    });
    const evaluator = new _Evaluator.Evaluator(config, stats, interpreter, lazilyTransformingAstService, dependencyGraph, columnSearch);
    evaluator.run();
    stats.end(_statistics.StatType.BUILD_ENGINE_TOTAL);
    return {
      config,
      stats,
      dependencyGraph,
      columnSearch,
      parser,
      unparser,
      cellContentParser,
      evaluator,
      lazilyTransformingAstService,
      crudOperations,
      exporter,
      namedExpressions,
      serialization,
      functionRegistry
    };
  }
}
exports.BuildEngineFactory = BuildEngineFactory;