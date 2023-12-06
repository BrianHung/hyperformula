"use strict";

exports.__esModule = true;
exports.InterpreterState = void 0;
/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */
class InterpreterState {
  constructor(formulaAddress, arraysFlag, formulaVertex) {
    this.formulaAddress = formulaAddress;
    this.arraysFlag = arraysFlag;
    this.formulaVertex = formulaVertex;
  }
}
exports.InterpreterState = InterpreterState;