/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */
import { CellError, ErrorType } from '../../Cell';
import { ErrorMessage } from '../../error-message';
import { padLeft } from '../../format/format';
import { FunctionArgumentType, FunctionPlugin } from './FunctionPlugin';
const MAX_LENGTH = 10;
const DECIMAL_NUMBER_OF_BITS = 255;
const MIN_BASE = 2;
const MAX_BASE = 36;
const ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
export class RadixConversionPlugin extends FunctionPlugin {
  dec2bin(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('DEC2BIN'), (value, places) => decimalToBaseWithExactPadding(value, 2, places));
  }
  dec2oct(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('DEC2OCT'), (value, places) => decimalToBaseWithExactPadding(value, 8, places));
  }
  dec2hex(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('DEC2HEX'), (value, places) => decimalToBaseWithExactPadding(value, 16, places));
  }
  bin2dec(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('BIN2DEC'), binary => {
      const binaryWithSign = coerceStringToBase(binary, 2, MAX_LENGTH);
      if (binaryWithSign === undefined) {
        return new CellError(ErrorType.NUM, ErrorMessage.NotBinary);
      }
      return twoComplementToDecimal(binaryWithSign, 2);
    });
  }
  bin2oct(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('BIN2OCT'), (binary, places) => {
      const binaryWithSign = coerceStringToBase(binary, 2, MAX_LENGTH);
      if (binaryWithSign === undefined) {
        return new CellError(ErrorType.NUM, ErrorMessage.NotBinary);
      }
      return decimalToBaseWithExactPadding(twoComplementToDecimal(binaryWithSign, 2), 8, places);
    });
  }
  bin2hex(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('BIN2HEX'), (binary, places) => {
      const binaryWithSign = coerceStringToBase(binary, 2, MAX_LENGTH);
      if (binaryWithSign === undefined) {
        return new CellError(ErrorType.NUM, ErrorMessage.NotBinary);
      }
      return decimalToBaseWithExactPadding(twoComplementToDecimal(binaryWithSign, 2), 16, places);
    });
  }
  oct2dec(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('OCT2DEC'), octal => {
      const octalWithSign = coerceStringToBase(octal, 8, MAX_LENGTH);
      if (octalWithSign === undefined) {
        return new CellError(ErrorType.NUM, ErrorMessage.NotOctal);
      }
      return twoComplementToDecimal(octalWithSign, 8);
    });
  }
  oct2bin(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('OCT2BIN'), (octal, places) => {
      const octalWithSign = coerceStringToBase(octal, 8, MAX_LENGTH);
      if (octalWithSign === undefined) {
        return new CellError(ErrorType.NUM, ErrorMessage.NotOctal);
      }
      return decimalToBaseWithExactPadding(twoComplementToDecimal(octalWithSign, 8), 2, places);
    });
  }
  oct2hex(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('OCT2HEX'), (octal, places) => {
      const octalWithSign = coerceStringToBase(octal, 8, MAX_LENGTH);
      if (octalWithSign === undefined) {
        return new CellError(ErrorType.NUM, ErrorMessage.NotOctal);
      }
      return decimalToBaseWithExactPadding(twoComplementToDecimal(octalWithSign, 8), 16, places);
    });
  }
  hex2dec(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('HEX2DEC'), hexadecimal => {
      const hexadecimalWithSign = coerceStringToBase(hexadecimal, 16, MAX_LENGTH);
      if (hexadecimalWithSign === undefined) {
        return new CellError(ErrorType.NUM, ErrorMessage.NotHex);
      }
      return twoComplementToDecimal(hexadecimalWithSign, 16);
    });
  }
  hex2bin(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('HEX2BIN'), (hexadecimal, places) => {
      const hexadecimalWithSign = coerceStringToBase(hexadecimal, 16, MAX_LENGTH);
      if (hexadecimalWithSign === undefined) {
        return new CellError(ErrorType.NUM, ErrorMessage.NotHex);
      }
      return decimalToBaseWithExactPadding(twoComplementToDecimal(hexadecimalWithSign, 16), 2, places);
    });
  }
  hex2oct(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('HEX2OCT'), (hexadecimal, places) => {
      const hexadecimalWithSign = coerceStringToBase(hexadecimal, 16, MAX_LENGTH);
      if (hexadecimalWithSign === undefined) {
        return new CellError(ErrorType.NUM, ErrorMessage.NotHex);
      }
      return decimalToBaseWithExactPadding(twoComplementToDecimal(hexadecimalWithSign, 16), 8, places);
    });
  }
  base(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('BASE'), decimalToBaseWithMinimumPadding);
  }
  decimal(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('DECIMAL'), (arg, base) => {
      const input = coerceStringToBase(arg, base, DECIMAL_NUMBER_OF_BITS);
      if (input === undefined) {
        return new CellError(ErrorType.NUM, ErrorMessage.NotHex);
      }
      return parseInt(input, base);
    });
  }
}
RadixConversionPlugin.implementedFunctions = {
  'DEC2BIN': {
    method: 'dec2bin',
    parameters: [{
      argumentType: FunctionArgumentType.NUMBER
    }, {
      argumentType: FunctionArgumentType.NUMBER,
      optionalArg: true,
      minValue: 1,
      maxValue: 10
    }]
  },
  'DEC2OCT': {
    method: 'dec2oct',
    parameters: [{
      argumentType: FunctionArgumentType.NUMBER
    }, {
      argumentType: FunctionArgumentType.NUMBER,
      optionalArg: true,
      minValue: 1,
      maxValue: 10
    }]
  },
  'DEC2HEX': {
    method: 'dec2hex',
    parameters: [{
      argumentType: FunctionArgumentType.NUMBER
    }, {
      argumentType: FunctionArgumentType.NUMBER,
      optionalArg: true,
      minValue: 1,
      maxValue: 10
    }]
  },
  'BIN2DEC': {
    method: 'bin2dec',
    parameters: [{
      argumentType: FunctionArgumentType.STRING
    }]
  },
  'BIN2OCT': {
    method: 'bin2oct',
    parameters: [{
      argumentType: FunctionArgumentType.STRING
    }, {
      argumentType: FunctionArgumentType.NUMBER,
      optionalArg: true,
      minValue: 0,
      maxValue: MAX_LENGTH
    }]
  },
  'BIN2HEX': {
    method: 'bin2hex',
    parameters: [{
      argumentType: FunctionArgumentType.STRING
    }, {
      argumentType: FunctionArgumentType.NUMBER,
      optionalArg: true,
      minValue: 0,
      maxValue: MAX_LENGTH
    }]
  },
  'OCT2DEC': {
    method: 'oct2dec',
    parameters: [{
      argumentType: FunctionArgumentType.STRING
    }]
  },
  'OCT2BIN': {
    method: 'oct2bin',
    parameters: [{
      argumentType: FunctionArgumentType.STRING
    }, {
      argumentType: FunctionArgumentType.NUMBER,
      optionalArg: true,
      minValue: 0,
      maxValue: MAX_LENGTH
    }]
  },
  'OCT2HEX': {
    method: 'oct2hex',
    parameters: [{
      argumentType: FunctionArgumentType.STRING
    }, {
      argumentType: FunctionArgumentType.NUMBER,
      optionalArg: true,
      minValue: 0,
      maxValue: MAX_LENGTH
    }]
  },
  'HEX2DEC': {
    method: 'hex2dec',
    parameters: [{
      argumentType: FunctionArgumentType.STRING
    }]
  },
  'HEX2BIN': {
    method: 'hex2bin',
    parameters: [{
      argumentType: FunctionArgumentType.STRING
    }, {
      argumentType: FunctionArgumentType.NUMBER,
      optionalArg: true,
      minValue: 0,
      maxValue: MAX_LENGTH
    }]
  },
  'HEX2OCT': {
    method: 'hex2oct',
    parameters: [{
      argumentType: FunctionArgumentType.STRING
    }, {
      argumentType: FunctionArgumentType.NUMBER,
      optionalArg: true,
      minValue: 0,
      maxValue: MAX_LENGTH
    }]
  },
  'DECIMAL': {
    method: 'decimal',
    parameters: [{
      argumentType: FunctionArgumentType.STRING
    }, {
      argumentType: FunctionArgumentType.NUMBER,
      minValue: MIN_BASE,
      maxValue: MAX_BASE
    }]
  },
  'BASE': {
    method: 'base',
    parameters: [{
      argumentType: FunctionArgumentType.NUMBER,
      minValue: 0
    }, {
      argumentType: FunctionArgumentType.NUMBER,
      minValue: MIN_BASE,
      maxValue: MAX_BASE
    }, {
      argumentType: FunctionArgumentType.NUMBER,
      optionalArg: true,
      minValue: 0,
      maxValue: DECIMAL_NUMBER_OF_BITS
    }]
  }
};
function coerceStringToBase(value, base, maxLength) {
  const baseAlphabet = ALPHABET.substr(0, base);
  const regex = new RegExp(`^[${baseAlphabet}]+$`);
  if (value.length > maxLength || !regex.test(value)) {
    return undefined;
  }
  return value;
}
function decimalToBaseWithExactPadding(value, base, places) {
  if (value > maxValFromBase(base)) {
    return new CellError(ErrorType.NUM, ErrorMessage.ValueBaseLarge);
  }
  if (value < minValFromBase(base)) {
    return new CellError(ErrorType.NUM, ErrorMessage.ValueBaseSmall);
  }
  const result = decimalToRadixComplement(value, base);
  if (places === undefined || value < 0) {
    return result;
  } else if (result.length > places) {
    return new CellError(ErrorType.NUM, ErrorMessage.ValueBaseLong);
  } else {
    return padLeft(result, places);
  }
}
function minValFromBase(base) {
  return -Math.pow(base, MAX_LENGTH) / 2;
}
function maxValFromBase(base) {
  return -minValFromBase(base) - 1;
}
function decimalToBaseWithMinimumPadding(value, base, places) {
  const result = decimalToRadixComplement(value, base);
  if (places !== undefined && places > result.length) {
    return padLeft(result, places);
  } else {
    return result;
  }
}
function decimalToRadixComplement(value, base) {
  const offset = value < 0 ? Math.pow(base, MAX_LENGTH) : 0;
  return (value + offset).toString(base).toUpperCase();
}
function twoComplementToDecimal(value, base) {
  const parsed = parseInt(value, base);
  const offset = Math.pow(base, MAX_LENGTH);
  return parsed >= offset / 2 ? parsed - offset : parsed;
}