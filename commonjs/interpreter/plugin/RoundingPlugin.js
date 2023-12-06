"use strict";

exports.__esModule = true;
exports.RoundingPlugin = void 0;
exports.findNextEvenNumber = findNextEvenNumber;
exports.findNextOddNumber = findNextOddNumber;
var _Cell = require("../../Cell");
var _errorMessage = require("../../error-message");
var _FunctionPlugin = require("./FunctionPlugin");
/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */

function findNextOddNumber(arg) {
  const ceiled = Math.ceil(arg);
  return ceiled % 2 === 1 ? ceiled : ceiled + 1;
}
function findNextEvenNumber(arg) {
  const ceiled = Math.ceil(arg);
  return ceiled % 2 === 0 ? ceiled : ceiled + 1;
}
class RoundingPlugin extends _FunctionPlugin.FunctionPlugin {
  roundup(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('ROUNDDOWN'), (numberToRound, places) => {
      const placesMultiplier = Math.pow(10, places);
      if (numberToRound < 0) {
        return -Math.ceil(-numberToRound * placesMultiplier) / placesMultiplier;
      } else {
        return Math.ceil(numberToRound * placesMultiplier) / placesMultiplier;
      }
    });
  }
  rounddown(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('ROUNDDOWN'), (numberToRound, places) => {
      const placesMultiplier = Math.pow(10, places);
      if (numberToRound < 0) {
        return -Math.floor(-numberToRound * placesMultiplier) / placesMultiplier;
      } else {
        return Math.floor(numberToRound * placesMultiplier) / placesMultiplier;
      }
    });
  }
  round(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('ROUND'), (numberToRound, places) => {
      const placesMultiplier = Math.pow(10, places);
      if (numberToRound < 0) {
        return -Math.round(-numberToRound * placesMultiplier) / placesMultiplier;
      } else {
        return Math.round(numberToRound * placesMultiplier) / placesMultiplier;
      }
    });
  }
  intFunc(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('INT'), coercedNumberToRound => {
      if (coercedNumberToRound < 0) {
        return -Math.floor(-coercedNumberToRound);
      } else {
        return Math.floor(coercedNumberToRound);
      }
    });
  }
  even(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('EVEN'), coercedNumberToRound => {
      if (coercedNumberToRound < 0) {
        return -findNextEvenNumber(-coercedNumberToRound);
      } else {
        return findNextEvenNumber(coercedNumberToRound);
      }
    });
  }
  odd(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('ODD'), coercedNumberToRound => {
      if (coercedNumberToRound < 0) {
        return -findNextOddNumber(-coercedNumberToRound);
      } else {
        return findNextOddNumber(coercedNumberToRound);
      }
    });
  }
  ceilingmath(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('CEILING.MATH'), (value, significance, mode) => {
      if (significance === 0 || value === 0) {
        return 0;
      }
      significance = Math.abs(significance);
      if (mode === 1 && value < 0) {
        significance = -significance;
      }
      return Math.ceil(value / significance) * significance;
    });
  }
  ceiling(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('CEILING'), (value, significance) => {
      if (value === 0) {
        return 0;
      }
      if (significance === 0) {
        return new _Cell.CellError(_Cell.ErrorType.DIV_BY_ZERO);
      }
      if (value > 0 && significance < 0) {
        return new _Cell.CellError(_Cell.ErrorType.NUM, _errorMessage.ErrorMessage.DistinctSigns);
      }
      return Math.ceil(value / significance) * significance;
    });
  }
  ceilingprecise(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('CEILING.PRECISE'), (value, significance) => {
      if (significance === 0 || value === 0) {
        return 0;
      }
      significance = Math.abs(significance);
      return Math.ceil(value / significance) * significance;
    });
  }
  floormath(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('FLOOR.MATH'), (value, significance, mode) => {
      if (significance === 0 || value === 0) {
        return 0;
      }
      significance = Math.abs(significance);
      if (mode === 1 && value < 0) {
        significance *= -1;
      }
      return Math.floor(value / significance) * significance;
    });
  }
  floor(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('FLOOR'), (value, significance) => {
      if (value === 0) {
        return 0;
      }
      if (significance === 0) {
        return new _Cell.CellError(_Cell.ErrorType.DIV_BY_ZERO);
      }
      if (value > 0 && significance < 0) {
        return new _Cell.CellError(_Cell.ErrorType.NUM, _errorMessage.ErrorMessage.DistinctSigns);
      }
      return Math.floor(value / significance) * significance;
    });
  }
  floorprecise(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('FLOOR.PRECISE'), (value, significance) => {
      if (significance === 0 || value === 0) {
        return 0;
      }
      significance = Math.abs(significance);
      return Math.floor(value / significance) * significance;
    });
  }
}
exports.RoundingPlugin = RoundingPlugin;
RoundingPlugin.implementedFunctions = {
  'ROUNDUP': {
    method: 'roundup',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      defaultValue: 0
    }]
  },
  'ROUNDDOWN': {
    method: 'rounddown',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      defaultValue: 0
    }]
  },
  'ROUND': {
    method: 'round',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      defaultValue: 0
    }]
  },
  'INT': {
    method: 'intFunc',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }]
  },
  'EVEN': {
    method: 'even',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }]
  },
  'ODD': {
    method: 'odd',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }]
  },
  'CEILING.MATH': {
    method: 'ceilingmath',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      defaultValue: 1
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      defaultValue: 0
    }]
  },
  'CEILING': {
    method: 'ceiling',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }]
  },
  'CEILING.PRECISE': {
    method: 'ceilingprecise',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      defaultValue: 1
    }]
  },
  'FLOOR.MATH': {
    method: 'floormath',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      defaultValue: 1
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      defaultValue: 0
    }]
  },
  'FLOOR': {
    method: 'floor',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }]
  },
  'FLOOR.PRECISE': {
    method: 'floorprecise',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      defaultValue: 1
    }]
  }
};
RoundingPlugin.aliases = {
  'ISO.CEILING': 'CEILING.PRECISE',
  'TRUNC': 'ROUNDDOWN'
};