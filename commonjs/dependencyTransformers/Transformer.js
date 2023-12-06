"use strict";

exports.__esModule = true;
exports.Transformer = void 0;
var _Cell = require("../Cell");
var _parser = require("../parser");
/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */

class Transformer {
  performEagerTransformations(graph, parser) {
    for (const node of graph.arrayFormulaNodes()) {
      const [newAst, newAddress] = this.transformSingleAst(node.getFormula(graph.lazilyTransformingAstService), node.getAddress(graph.lazilyTransformingAstService));
      const cachedAst = parser.rememberNewAst(newAst);
      node.setFormula(cachedAst);
      node.setAddress(newAddress);
    }
  }
  transformSingleAst(ast, address) {
    const newAst = this.transformAst(ast, address);
    const newAddress = this.fixNodeAddress(address);
    return [newAst, newAddress];
  }
  transformAst(ast, address) {
    switch (ast.type) {
      case _parser.AstNodeType.CELL_REFERENCE:
        {
          return this.transformCellReferenceAst(ast, address);
        }
      case _parser.AstNodeType.CELL_RANGE:
        {
          return this.transformCellRangeAst(ast, address);
        }
      case _parser.AstNodeType.COLUMN_RANGE:
        {
          return this.transformColumnRangeAst(ast, address);
        }
      case _parser.AstNodeType.ROW_RANGE:
        {
          return this.transformRowRangeAst(ast, address);
        }
      case _parser.AstNodeType.EMPTY:
      case _parser.AstNodeType.ERROR:
      case _parser.AstNodeType.NUMBER:
      case _parser.AstNodeType.NAMED_EXPRESSION:
      case _parser.AstNodeType.ERROR_WITH_RAW_INPUT:
      case _parser.AstNodeType.STRING:
        {
          return ast;
        }
      case _parser.AstNodeType.PERCENT_OP:
      case _parser.AstNodeType.MINUS_UNARY_OP:
      case _parser.AstNodeType.PLUS_UNARY_OP:
        {
          return Object.assign(Object.assign({}, ast), {
            value: this.transformAst(ast.value, address)
          });
        }
      case _parser.AstNodeType.FUNCTION_CALL:
        {
          return Object.assign(Object.assign({}, ast), {
            procedureName: ast.procedureName,
            args: ast.args.map(arg => this.transformAst(arg, address))
          });
        }
      case _parser.AstNodeType.PARENTHESIS:
        {
          return Object.assign(Object.assign({}, ast), {
            expression: this.transformAst(ast.expression, address)
          });
        }
      case _parser.AstNodeType.ARRAY:
        {
          return Object.assign(Object.assign({}, ast), {
            args: ast.args.map(row => row.map(val => this.transformAst(val, address)))
          });
        }
      default:
        {
          return Object.assign(Object.assign({}, ast), {
            left: this.transformAst(ast.left, address),
            right: this.transformAst(ast.right, address)
          });
        }
    }
  }
  transformCellReferenceAst(ast, formulaAddress) {
    const newCellAddress = this.transformCellAddress(ast.reference, formulaAddress);
    if (newCellAddress instanceof _parser.CellAddress) {
      return Object.assign(Object.assign({}, ast), {
        reference: newCellAddress
      });
    } else if (newCellAddress === _Cell.ErrorType.REF) {
      return (0, _parser.buildCellErrorAst)(new _Cell.CellError(_Cell.ErrorType.REF));
    } else {
      return ast;
    }
  }
  transformCellRangeAst(ast, formulaAddress) {
    const newRange = this.transformCellRange(ast.start, ast.end, formulaAddress);
    if (Array.isArray(newRange)) {
      return Object.assign(Object.assign({}, ast), {
        start: newRange[0],
        end: newRange[1]
      });
    } else if (newRange === _Cell.ErrorType.REF) {
      return (0, _parser.buildCellErrorAst)(new _Cell.CellError(_Cell.ErrorType.REF));
    } else {
      return ast;
    }
  }
  transformColumnRangeAst(ast, formulaAddress) {
    const newRange = this.transformColumnRange(ast.start, ast.end, formulaAddress);
    if (Array.isArray(newRange)) {
      return Object.assign(Object.assign({}, ast), {
        start: newRange[0],
        end: newRange[1]
      });
    } else if (newRange === _Cell.ErrorType.REF) {
      return (0, _parser.buildCellErrorAst)(new _Cell.CellError(_Cell.ErrorType.REF));
    } else {
      return ast;
    }
  }
  transformRowRangeAst(ast, formulaAddress) {
    const newRange = this.transformRowRange(ast.start, ast.end, formulaAddress);
    if (Array.isArray(newRange)) {
      return Object.assign(Object.assign({}, ast), {
        start: newRange[0],
        end: newRange[1]
      });
    } else if (newRange === _Cell.ErrorType.REF) {
      return (0, _parser.buildCellErrorAst)(new _Cell.CellError(_Cell.ErrorType.REF));
    } else {
      return ast;
    }
  }
}
exports.Transformer = Transformer;