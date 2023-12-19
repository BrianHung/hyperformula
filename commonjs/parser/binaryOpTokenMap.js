"use strict";

exports.__esModule = true;
exports.binaryOpTokenMap = void 0;
var _Ast = require("./Ast");
/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */

const binaryOpTokenMap = {
  [_Ast.AstNodeType.PLUS_OP]: '+',
  [_Ast.AstNodeType.MINUS_OP]: '-',
  [_Ast.AstNodeType.TIMES_OP]: '*',
  [_Ast.AstNodeType.DIV_OP]: '/',
  [_Ast.AstNodeType.CONCATENATE_OP]: '&',
  [_Ast.AstNodeType.POWER_OP]: '^',
  [_Ast.AstNodeType.EQUALS_OP]: '=',
  [_Ast.AstNodeType.NOT_EQUAL_OP]: '<>',
  [_Ast.AstNodeType.GREATER_THAN_OP]: '>',
  [_Ast.AstNodeType.GREATER_THAN_OR_EQUAL_OP]: '>=',
  [_Ast.AstNodeType.LESS_THAN_OP]: '<',
  [_Ast.AstNodeType.LESS_THAN_OR_EQUAL_OP]: '<='
};
exports.binaryOpTokenMap = binaryOpTokenMap;