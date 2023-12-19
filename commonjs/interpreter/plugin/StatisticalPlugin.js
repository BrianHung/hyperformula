"use strict";

exports.__esModule = true;
exports.StatisticalPlugin = void 0;
var _Cell = require("../../Cell");
var _errorMessage = require("../../error-message");
var _bessel = require("./3rdparty/bessel/bessel");
var _jstat = require("./3rdparty/jstat/jstat");
var _FunctionPlugin = require("./FunctionPlugin");
/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */

class StatisticalPlugin extends _FunctionPlugin.FunctionPlugin {
  erf(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('ERF'), (lowerBound, upperBound) => {
      if (upperBound === undefined) {
        return (0, _jstat.erf)(lowerBound);
      } else {
        return (0, _jstat.erf)(upperBound) - (0, _jstat.erf)(lowerBound);
      }
    });
  }
  erfc(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('ERFC'), _jstat.erfc);
  }
  expondist(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('EXPON.DIST'), (x, lambda, cumulative) => {
      if (cumulative) {
        return _jstat.exponential.cdf(x, lambda);
      } else {
        return _jstat.exponential.pdf(x, lambda);
      }
    });
  }
  fisher(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('FISHER'), x => Math.log((1 + x) / (1 - x)) / 2);
  }
  fisherinv(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('FISHERINV'), y => 1 - 2 / (Math.exp(2 * y) + 1));
  }
  gamma(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('GAMMA'), _jstat.gammafn);
  }
  gammadist(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('GAMMA.DIST'), (value, alphaVal, betaVal, cumulative) => {
      if (cumulative) {
        return _jstat.gamma.cdf(value, alphaVal, betaVal);
      } else {
        return _jstat.gamma.pdf(value, alphaVal, betaVal);
      }
    });
  }
  gammaln(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('GAMMALN'), _jstat.gammaln);
  }
  gammainv(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('GAMMA.INV'), _jstat.gamma.inv);
  }
  gauss(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('GAUSS'), z => _jstat.normal.cdf(z, 0, 1) - 0.5);
  }
  betadist(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('BETA.DIST'), (x, alphaVal, betaVal, cumulative, A, B) => {
      if (x <= A) {
        return new _Cell.CellError(_Cell.ErrorType.NUM, _errorMessage.ErrorMessage.ValueSmall);
      } else if (x >= B) {
        return new _Cell.CellError(_Cell.ErrorType.NUM, _errorMessage.ErrorMessage.ValueLarge);
      }
      x = (x - A) / (B - A);
      if (cumulative) {
        return _jstat.beta.cdf(x, alphaVal, betaVal);
      } else {
        return _jstat.beta.pdf(x, alphaVal, betaVal);
      }
    });
  }
  betainv(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('BETA.INV'), (x, alphaVal, betaVal, A, B) => {
      if (A >= B) {
        return new _Cell.CellError(_Cell.ErrorType.NUM, _errorMessage.ErrorMessage.WrongOrder);
      } else {
        return _jstat.beta.inv(x, alphaVal, betaVal) * (B - A) + A;
      }
    });
  }
  binomialdist(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('BINOM.DIST'), (succ, trials, prob, cumulative) => {
      if (succ > trials) {
        return new _Cell.CellError(_Cell.ErrorType.NUM, _errorMessage.ErrorMessage.WrongOrder);
      }
      succ = Math.trunc(succ);
      trials = Math.trunc(trials);
      if (cumulative) {
        return _jstat.binomial.cdf(succ, trials, prob);
      } else {
        return _jstat.binomial.pdf(succ, trials, prob);
      }
    });
  }
  binomialinv(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('BINOM.INV'), (trials, prob, alpha) => {
      trials = Math.trunc(trials);
      let lower = -1;
      let upper = trials;
      while (upper > lower + 1) {
        const mid = Math.trunc((lower + upper) / 2);
        if (_jstat.binomial.cdf(mid, trials, prob) >= alpha) {
          upper = mid;
        } else {
          lower = mid;
        }
      }
      return upper;
    });
  }
  besselifn(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('BESSELI'), (x, n) => (0, _bessel.besseli)(x, Math.trunc(n)));
  }
  besseljfn(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('BESSELJ'), (x, n) => (0, _bessel.besselj)(x, Math.trunc(n)));
  }
  besselkfn(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('BESSELK'), (x, n) => (0, _bessel.besselk)(x, Math.trunc(n)));
  }
  besselyfn(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('BESSELY'), (x, n) => (0, _bessel.bessely)(x, Math.trunc(n)));
  }
  chisqdist(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('CHISQ.DIST'), (x, deg, cumulative) => {
      deg = Math.trunc(deg);
      if (cumulative) {
        return _jstat.chisquare.cdf(x, deg);
      } else {
        return _jstat.chisquare.pdf(x, deg);
      }
    });
  }
  chisqdistrt(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('CHISQ.DIST.RT'), (x, deg) => 1 - _jstat.chisquare.cdf(x, Math.trunc(deg)));
  }
  chisqinv(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('CHISQ.INV'), (p, deg) => _jstat.chisquare.inv(p, Math.trunc(deg)));
  }
  chisqinvrt(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('CHISQ.INV.RT'), (p, deg) => _jstat.chisquare.inv(1.0 - p, Math.trunc(deg)));
  }
  fdist(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('F.DIST'), (x, deg1, deg2, cumulative) => {
      deg1 = Math.trunc(deg1);
      deg2 = Math.trunc(deg2);
      if (cumulative) {
        return _jstat.centralF.cdf(x, deg1, deg2);
      } else {
        return _jstat.centralF.pdf(x, deg1, deg2);
      }
    });
  }
  fdistrt(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('F.DIST.RT'), (x, deg1, deg2) => 1 - _jstat.centralF.cdf(x, Math.trunc(deg1), Math.trunc(deg2)));
  }
  finv(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('F.INV'), (p, deg1, deg2) => _jstat.centralF.inv(p, Math.trunc(deg1), Math.trunc(deg2)));
  }
  finvrt(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('F.INV.RT'), (p, deg1, deg2) => _jstat.centralF.inv(1.0 - p, Math.trunc(deg1), Math.trunc(deg2)));
  }
  weibulldist(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('WEIBULL.DIST'), (x, shape, scale, cumulative) => {
      if (cumulative) {
        return _jstat.weibull.cdf(x, scale, shape);
      } else {
        return _jstat.weibull.pdf(x, scale, shape);
      }
    });
  }
  poissondist(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('POISSON.DIST'), (x, mean, cumulative) => {
      x = Math.trunc(x);
      if (cumulative) {
        return _jstat.poisson.cdf(x, mean);
      } else {
        return _jstat.poisson.pdf(x, mean);
      }
    });
  }
  hypgeomdist(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('HYPGEOM.DIST'), (s, numberS, populationS, numberPop, cumulative) => {
      if (s > numberS || s > populationS || numberS > numberPop || populationS > numberPop) {
        return new _Cell.CellError(_Cell.ErrorType.NUM, _errorMessage.ErrorMessage.ValueLarge);
      }
      if (s + numberPop < populationS + numberS) {
        return new _Cell.CellError(_Cell.ErrorType.NUM, _errorMessage.ErrorMessage.ValueLarge);
      }
      s = Math.trunc(s);
      numberS = Math.trunc(numberS);
      populationS = Math.trunc(populationS);
      numberPop = Math.trunc(numberPop);
      if (cumulative) {
        return _jstat.hypgeom.cdf(s, numberPop, populationS, numberS);
      } else {
        return _jstat.hypgeom.pdf(s, numberPop, populationS, numberS);
      }
    });
  }
  tdist(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('T.DIST'), (x, deg, cumulative) => {
      deg = Math.trunc(deg);
      if (cumulative) {
        return _jstat.studentt.cdf(x, deg);
      } else {
        return _jstat.studentt.pdf(x, deg);
      }
    });
  }
  tdist2t(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('T.DIST.2T'), (x, deg) => (1 - _jstat.studentt.cdf(x, Math.trunc(deg))) * 2);
  }
  tdistrt(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('T.DIST.RT'), (x, deg) => 1 - _jstat.studentt.cdf(x, Math.trunc(deg)));
  }
  tdistold(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('TDIST'), (x, deg, mode) => mode * (1 - _jstat.studentt.cdf(x, Math.trunc(deg))));
  }
  tinv(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('T.INV'), (p, deg) => _jstat.studentt.inv(p, Math.trunc(deg)));
  }
  tinv2t(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('T.INV.2T'), (p, deg) => _jstat.studentt.inv(1 - p / 2, Math.trunc(deg)));
  }
  lognormdist(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('LOGNORM.DIST'), (x, mean, stddev, cumulative) => {
      if (cumulative) {
        return _jstat.lognormal.cdf(x, mean, stddev);
      } else {
        return _jstat.lognormal.pdf(x, mean, stddev);
      }
    });
  }
  lognorminv(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('LOGNORM.INV'), (p, mean, stddev) => _jstat.lognormal.inv(p, mean, stddev));
  }
  normdist(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('NORM.DIST'), (x, mean, stddev, cumulative) => {
      if (cumulative) {
        return _jstat.normal.cdf(x, mean, stddev);
      } else {
        return _jstat.normal.pdf(x, mean, stddev);
      }
    });
  }
  norminv(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('NORM.INV'), (p, mean, stddev) => _jstat.normal.inv(p, mean, stddev));
  }
  normsdist(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('NORM.S.DIST'), (x, cumulative) => {
      if (cumulative) {
        return _jstat.normal.cdf(x, 0, 1);
      } else {
        return _jstat.normal.pdf(x, 0, 1);
      }
    });
  }
  normsinv(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('NORM.S.INV'), p => _jstat.normal.inv(p, 0, 1));
  }
  phi(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('PHI'), x => _jstat.normal.pdf(x, 0, 1));
  }
  negbinomdist(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('NEGBINOM.DIST'), (nf, ns, p, cumulative) => {
      nf = Math.trunc(nf);
      ns = Math.trunc(ns);
      if (cumulative) {
        return _jstat.negbin.cdf(nf, ns, p);
      } else {
        return _jstat.negbin.pdf(nf, ns, p);
      }
    });
  }
  confidencenorm(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('CONFIDENCE.NORM'),
    // eslint-disable-next-line
    // @ts-ignore
    (alpha, stddev, size) => (0, _jstat.normalci)(1, alpha, stddev, Math.trunc(size))[1] - 1);
  }
  confidencet(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('CONFIDENCE.T'), (alpha, stddev, size) => {
      size = Math.trunc(size);
      if (size === 1) {
        return new _Cell.CellError(_Cell.ErrorType.DIV_BY_ZERO);
      }
      // eslint-disable-next-line
      // @ts-ignore
      return (0, _jstat.tci)(1, alpha, stddev, size)[1] - 1;
    });
  }
  standardize(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('STANDARDIZE'), (x, mean, stddev) => (x - mean) / stddev);
  }
}
exports.StatisticalPlugin = StatisticalPlugin;
StatisticalPlugin.implementedFunctions = {
  'ERF': {
    method: 'erf',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      optionalArg: true
    }]
  },
  'ERFC': {
    method: 'erfc',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }]
  },
  'EXPON.DIST': {
    method: 'expondist',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      minValue: 0
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      greaterThan: 0
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.BOOLEAN
    }]
  },
  'FISHER': {
    method: 'fisher',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      greaterThan: -1,
      lessThan: 1
    }]
  },
  'FISHERINV': {
    method: 'fisherinv',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }]
  },
  'GAMMA': {
    method: 'gamma',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }]
  },
  'GAMMA.DIST': {
    method: 'gammadist',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      minValue: 0
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      greaterThan: 0
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      greaterThan: 0
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.BOOLEAN
    }]
  },
  'GAMMALN': {
    method: 'gammaln',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      greaterThan: 0
    }]
  },
  'GAMMA.INV': {
    method: 'gammainv',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      minValue: 0,
      lessThan: 1
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      greaterThan: 0
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      greaterThan: 0
    }]
  },
  'GAUSS': {
    method: 'gauss',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }]
  },
  'BETA.DIST': {
    method: 'betadist',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      greaterThan: 0
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      greaterThan: 0
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.BOOLEAN
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      defaultValue: 0
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      defaultValue: 1
    }]
  },
  'BETA.INV': {
    method: 'betainv',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      greaterThan: 0,
      maxValue: 1
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      greaterThan: 0
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      greaterThan: 0
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      defaultValue: 0
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      defaultValue: 1
    }]
  },
  'BINOM.DIST': {
    method: 'binomialdist',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      minValue: 0
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      minValue: 0
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      minValue: 0,
      maxValue: 1
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.BOOLEAN
    }]
  },
  'BINOM.INV': {
    method: 'binomialinv',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      minValue: 0
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      minValue: 0,
      maxValue: 1
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      greaterThan: 0,
      lessThan: 1
    }]
  },
  'BESSELI': {
    method: 'besselifn',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      minValue: 0
    }]
  },
  'BESSELJ': {
    method: 'besseljfn',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      minValue: 0
    }]
  },
  'BESSELK': {
    method: 'besselkfn',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      minValue: 0
    }]
  },
  'BESSELY': {
    method: 'besselyfn',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      minValue: 0
    }]
  },
  'CHISQ.DIST': {
    method: 'chisqdist',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      minValue: 1,
      maxValue: 1e10
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.BOOLEAN
    }]
  },
  'CHISQ.DIST.RT': {
    method: 'chisqdistrt',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      minValue: 1,
      maxValue: 1e10
    }]
  },
  'CHISQ.INV': {
    method: 'chisqinv',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      minValue: 0,
      maxValue: 1
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      minValue: 1,
      maxValue: 1e10
    }]
  },
  'CHISQ.INV.RT': {
    method: 'chisqinvrt',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      minValue: 0,
      maxValue: 1
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      minValue: 1
    }]
  },
  'F.DIST': {
    method: 'fdist',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      minValue: 0
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      minValue: 1
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      minValue: 1
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.BOOLEAN
    }]
  },
  'F.DIST.RT': {
    method: 'fdistrt',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      minValue: 0
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      minValue: 1
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      minValue: 1
    }]
  },
  'F.INV': {
    method: 'finv',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      minValue: 0,
      maxValue: 1
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      minValue: 1
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      minValue: 1
    }]
  },
  'F.INV.RT': {
    method: 'finvrt',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      minValue: 0,
      maxValue: 1
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      minValue: 1
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      minValue: 1
    }]
  },
  'WEIBULL.DIST': {
    method: 'weibulldist',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      minValue: 0
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      greaterThan: 0
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      greaterThan: 0
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.BOOLEAN
    }]
  },
  'POISSON.DIST': {
    method: 'poissondist',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      minValue: 0
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      minValue: 0
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.BOOLEAN
    }]
  },
  'HYPGEOM.DIST': {
    method: 'hypgeomdist',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      minValue: 0
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      greaterThan: 0
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      greaterThan: 0
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      greaterThan: 0
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.BOOLEAN
    }]
  },
  'T.DIST': {
    method: 'tdist',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      minValue: 1
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.BOOLEAN
    }]
  },
  'T.DIST.2T': {
    method: 'tdist2t',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      minValue: 0
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      minValue: 1
    }]
  },
  'T.DIST.RT': {
    method: 'tdistrt',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      minValue: 1
    }]
  },
  'TDIST': {
    method: 'tdistold',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      minValue: 0
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      minValue: 1
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.INTEGER,
      minValue: 1,
      maxValue: 2
    }]
  },
  'T.INV': {
    method: 'tinv',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      greaterThan: 0,
      lessThan: 1
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      minValue: 1
    }]
  },
  'T.INV.2T': {
    method: 'tinv2t',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      greaterThan: 0,
      maxValue: 1
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      minValue: 1
    }]
  },
  'LOGNORM.DIST': {
    method: 'lognormdist',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      greaterThan: 0
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      greaterThan: 0
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.BOOLEAN
    }]
  },
  'LOGNORM.INV': {
    method: 'lognorminv',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      greaterThan: 0,
      lessThan: 1
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      greaterThan: 0
    }]
  },
  'NORM.DIST': {
    method: 'normdist',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      greaterThan: 0
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.BOOLEAN
    }]
  },
  'NORM.INV': {
    method: 'norminv',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      greaterThan: 0,
      lessThan: 1
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      greaterThan: 0
    }]
  },
  'NORM.S.DIST': {
    method: 'normsdist',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.BOOLEAN
    }]
  },
  'NORM.S.INV': {
    method: 'normsinv',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      greaterThan: 0,
      lessThan: 1
    }]
  },
  'PHI': {
    method: 'phi',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }]
  },
  'NEGBINOM.DIST': {
    method: 'negbinomdist',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      minValue: 0
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      minValue: 1
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      minValue: 0,
      maxValue: 1
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.BOOLEAN
    }]
  },
  'CONFIDENCE.NORM': {
    method: 'confidencenorm',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      greaterThan: 0,
      lessThan: 1
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      greaterThan: 0
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      minValue: 1
    }]
  },
  'CONFIDENCE.T': {
    method: 'confidencet',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      greaterThan: 0,
      lessThan: 1
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      greaterThan: 0
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      minValue: 1
    }]
  },
  'STANDARDIZE': {
    method: 'standardize',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.NUMBER,
      greaterThan: 0
    }]
  }
};
StatisticalPlugin.aliases = {
  NEGBINOMDIST: 'NEGBINOM.DIST',
  EXPONDIST: 'EXPON.DIST',
  BETADIST: 'BETA.DIST',
  NORMDIST: 'NORM.DIST',
  NORMINV: 'NORM.INV',
  NORMSDIST: 'NORM.S.DIST',
  NORMSINV: 'NORM.S.INV',
  LOGNORMDIST: 'LOGNORM.DIST',
  LOGINV: 'LOGNORM.INV',
  TINV: 'T.INV.2T',
  HYPGEOMDIST: 'HYPGEOM.DIST',
  POISSON: 'POISSON.DIST',
  WEIBULL: 'WEIBULL.DIST',
  FINV: 'F.INV.RT',
  FDIST: 'F.DIST.RT',
  CHIDIST: 'CHISQ.DIST.RT',
  CHIINV: 'CHISQ.INV.RT',
  GAMMADIST: 'GAMMA.DIST',
  'GAMMALN.PRECISE': 'GAMMALN',
  GAMMAINV: 'GAMMA.INV',
  BETAINV: 'BETA.INV',
  BINOMDIST: 'BINOM.DIST',
  CONFIDENCE: 'CONFIDENCE.NORM',
  CRITBINOM: 'BINOM.INV',
  WEIBULLDIST: 'WEIBULL.DIST',
  TINV2T: 'T.INV.2T',
  TDISTRT: 'T.DIST.RT',
  TDIST2T: 'T.DIST.2T',
  FINVRT: 'F.INV.RT',
  FDISTRT: 'F.DIST.RT',
  CHIDISTRT: 'CHISQ.DIST.RT',
  CHIINVRT: 'CHISQ.INV.RT',
  LOGNORMINV: 'LOGNORM.INV',
  POISSONDIST: 'POISSON.DIST'
};