"use strict";

exports.__esModule = true;
exports.collectDependencies = void 0;
var _ = require("./");
/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */

const collectDependenciesFn = (ast, functionRegistry, dependenciesSet, needArgument) => {
  switch (ast.type) {
    case _.AstNodeType.EMPTY:
    case _.AstNodeType.NUMBER:
    case _.AstNodeType.STRING:
    case _.AstNodeType.ERROR:
      return;
    case _.AstNodeType.NAMED_EXPRESSION:
      {
        if (needArgument) {
          dependenciesSet.push(new _.NamedExpressionDependency(ast.expressionName));
        }
        return;
      }
    case _.AstNodeType.CELL_REFERENCE:
      {
        if (needArgument) {
          dependenciesSet.push(new _.AddressDependency(ast.reference));
        }
        return;
      }
    case _.AstNodeType.CELL_RANGE:
      {
        if (needArgument && ast.start.sheet === ast.end.sheet) {
          dependenciesSet.push(new _.CellRangeDependency(ast.start, ast.end));
        }
        return;
      }
    case _.AstNodeType.COLUMN_RANGE:
      {
        if (needArgument && ast.start.sheet === ast.end.sheet) {
          dependenciesSet.push(new _.ColumnRangeDependency(ast.start, ast.end));
        }
        return;
      }
    case _.AstNodeType.ROW_RANGE:
      {
        if (needArgument && ast.start.sheet === ast.end.sheet) {
          dependenciesSet.push(new _.RowRangeDependency(ast.start, ast.end));
        }
        return;
      }
    case _.AstNodeType.PERCENT_OP:
    case _.AstNodeType.PLUS_UNARY_OP:
    case _.AstNodeType.MINUS_UNARY_OP:
      {
        collectDependenciesFn(ast.value, functionRegistry, dependenciesSet, true);
        return;
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
      collectDependenciesFn(ast.left, functionRegistry, dependenciesSet, true);
      collectDependenciesFn(ast.right, functionRegistry, dependenciesSet, true);
      return;
    case _.AstNodeType.PARENTHESIS:
      collectDependenciesFn(ast.expression, functionRegistry, dependenciesSet, needArgument);
      return;
    case _.AstNodeType.FUNCTION_CALL:
      {
        const functionNeedArgument = !functionRegistry.doesFunctionNeedArgumentToBeComputed(ast.procedureName);
        ast.args.forEach(argAst => collectDependenciesFn(argAst, functionRegistry, dependenciesSet, functionNeedArgument));
        return;
      }
  }
};
const collectDependencies = (ast, functionRegistry) => {
  const result = new Array();
  collectDependenciesFn(ast, functionRegistry, result, true);
  return result;
};
exports.collectDependencies = collectDependencies;