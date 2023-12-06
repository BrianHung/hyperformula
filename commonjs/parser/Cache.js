"use strict";

exports.__esModule = true;
exports.doesContainFunctions = exports.Cache = void 0;
var _ = require("./");
/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */

const buildCacheEntry = (ast, relativeDependencies, hasVolatileFunction, hasStructuralChangeFunction) => ({
  ast,
  relativeDependencies,
  hasVolatileFunction,
  hasStructuralChangeFunction
});
class Cache {
  constructor(functionRegistry) {
    this.functionRegistry = functionRegistry;
    this.cache = new Map();
  }
  set(hash, ast) {
    const astRelativeDependencies = (0, _.collectDependencies)(ast, this.functionRegistry);
    const cacheEntry = buildCacheEntry(ast, astRelativeDependencies, doesContainFunctions(ast, this.functionRegistry.isFunctionVolatile), doesContainFunctions(ast, this.functionRegistry.isFunctionDependentOnSheetStructureChange));
    this.cache.set(hash, cacheEntry);
    return cacheEntry;
  }
  get(hash) {
    return this.cache.get(hash);
  }
  maybeSetAndThenGet(hash, ast) {
    const entryFromCache = this.cache.get(hash);
    if (entryFromCache !== undefined) {
      return entryFromCache.ast;
    } else {
      this.set(hash, ast);
      return ast;
    }
  }
}
exports.Cache = Cache;
const doesContainFunctions = (ast, functionCriterion) => {
  switch (ast.type) {
    case _.AstNodeType.EMPTY:
    case _.AstNodeType.NUMBER:
    case _.AstNodeType.STRING:
    case _.AstNodeType.ERROR:
    case _.AstNodeType.ERROR_WITH_RAW_INPUT:
    case _.AstNodeType.CELL_REFERENCE:
    case _.AstNodeType.CELL_RANGE:
    case _.AstNodeType.COLUMN_RANGE:
    case _.AstNodeType.ROW_RANGE:
    case _.AstNodeType.NAMED_EXPRESSION:
      return false;
    case _.AstNodeType.PERCENT_OP:
    case _.AstNodeType.PLUS_UNARY_OP:
    case _.AstNodeType.MINUS_UNARY_OP:
      {
        return doesContainFunctions(ast.value, functionCriterion);
      }
    case _.AstNodeType.CONCATENATE_OP:
    case _.AstNodeType.EQUALS_OP:
    case _.AstNodeType.NOT_EQUAL_OP:
    case _.AstNodeType.LESS_THAN_OP:
    case _.AstNodeType.GREATER_THAN_OP:
    case _.AstNodeType.LESS_THAN_OR_EQUAL_OP:
    case _.AstNodeType.GREATER_THAN_OR_EQUAL_OP:
    case _.AstNodeType.MINUS_OP:
    case _.AstNodeType.PLUS_OP:
    case _.AstNodeType.TIMES_OP:
    case _.AstNodeType.DIV_OP:
    case _.AstNodeType.POWER_OP:
      return doesContainFunctions(ast.left, functionCriterion) || doesContainFunctions(ast.right, functionCriterion);
    case _.AstNodeType.PARENTHESIS:
      return doesContainFunctions(ast.expression, functionCriterion);
    case _.AstNodeType.FUNCTION_CALL:
      {
        if (functionCriterion(ast.procedureName)) {
          return true;
        }
        return ast.args.some(arg => doesContainFunctions(arg, functionCriterion));
      }
    case _.AstNodeType.ARRAY:
      {
        return ast.args.some(row => row.some(arg => doesContainFunctions(arg, functionCriterion)));
      }
  }
};
exports.doesContainFunctions = doesContainFunctions;