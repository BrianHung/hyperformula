"use strict";

exports.__esModule = true;
exports.default = void 0;
/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */
const dictionary = {
  errors: {
    CYCLE: '#CYCLE!',
    DIV_BY_ZERO: '#SAYI/0!',
    ERROR: '#ERROR!',
    NA: '#YOK',
    NAME: '#AD?',
    NUM: '#SAYI!',
    REF: '#BAŞV!',
    SPILL: '#TAŞMA!',
    VALUE: '#DEĞER!'
  },
  functions: {
    FILTER: 'FILTER',
    ADDRESS: 'ADRES',
    'ARRAY_CONSTRAIN': 'ARRAY_CONSTRAIN',
    ARRAYFORMULA: 'ARRAYFORMULA',
    ABS: 'MUTLAK',
    ACOS: 'ACOS',
    ACOSH: 'ACOSH',
    ACOT: 'ACOT',
    ACOTH: 'ACOTH',
    AND: 'VE',
    ASIN: 'ASİN',
    ASINH: 'ASİNH',
    ATAN2: 'ATAN2',
    ATAN: 'ATAN',
    ATANH: 'ATANH',
    AVERAGE: 'ORTALAMA',
    AVERAGEA: 'ORTALAMAA',
    AVERAGEIF: 'EĞERORTALAMA',
    BASE: 'TABAN',
    BIN2DEC: 'BIN2DEC',
    BIN2HEX: 'BIN2HEX',
    BIN2OCT: 'BIN2OCT',
    BITAND: 'BİTVE',
    BITLSHIFT: 'BİTSOLAKAYDIR',
    BITOR: 'BİTVEYA',
    BITRSHIFT: 'BİTSAĞAKAYDIR',
    BITXOR: 'BİTÖZELVEYA',
    CEILING: 'TAVANAYUVARLA',
    CHAR: 'DAMGA',
    CHOOSE: 'ELEMAN',
    CLEAN: 'TEMİZ',
    CODE: 'KOD',
    COLUMN: 'SÜTUN',
    COLUMNS: 'SÜTUNSAY',
    CONCATENATE: 'BİRLEŞTİR',
    CORREL: 'KORELASYON',
    COS: 'COS',
    COSH: 'COSH',
    COT: 'COT',
    COTH: 'COTH',
    COUNT: 'SAY',
    COUNTA: 'BAĞ_DEĞ_DOLU_SAY',
    COUNTBLANK: 'BOŞLUKSAY',
    COUNTIF: 'EĞERSAY',
    COUNTIFS: 'ÇOKEĞERSAY',
    COUNTUNIQUE: 'COUNTUNIQUE',
    CSC: 'CSC',
    CSCH: 'CSCH',
    CUMIPMT: 'TOPÖDENENFAİZ',
    CUMPRINC: 'TOPANAPARA',
    DATE: 'TARİH',
    DATEDIF: 'DATEDIF',
    DATEVALUE: 'TARİHSAYISI',
    DAY: 'GÜN',
    DAYS360: 'GÜN360',
    DAYS: 'GÜNSAY',
    DB: 'AZALANBAKİYE',
    DDB: 'ÇİFTAZALANBAKİYE',
    DEC2BIN: 'DEC2BIN',
    DEC2HEX: 'DEC2HEX',
    DEC2OCT: 'DEC2OCT',
    DECIMAL: 'ONDALIK',
    DEGREES: 'DERECE',
    DELTA: 'DELTA',
    DOLLARDE: 'LİRAON',
    DOLLARFR: 'LİRAKES',
    EDATE: 'SERİTARİH',
    EFFECT: "ETKİN",
    EOMONTH: 'SERİAY',
    ERF: 'HATAİŞLEV',
    ERFC: 'TÜMHATAİŞLEV',
    EVEN: 'ÇİFT',
    EXACT: 'ÖZDEŞ',
    EXP: 'ÜS',
    FALSE: 'YANLIŞ',
    FIND: 'BUL',
    FORMULATEXT: 'FORMÜLMETNİ',
    FV: 'GD',
    FVSCHEDULE: 'GDPROGRAM',
    HEX2BIN: 'HEX2BIN',
    HEX2DEC: 'HEX2DEC',
    HEX2OCT: 'HEX2OCT',
    HLOOKUP: 'YATAYARA',
    HOUR: 'SAAT',
    HYPERLINK: 'KÖPRÜ',
    IF: 'EĞER',
    IFERROR: 'EĞERHATA',
    IFNA: 'EĞERYOKSA',
    IFS: 'ÇOKEĞER',
    INDEX: 'İNDİS',
    INT: 'TAMSAYI',
    INTERVAL: 'INTERVAL',
    IPMT: 'FAİZTUTARI',
    ISBINARY: 'ISBINARY',
    ISBLANK: 'EBOŞSA',
    ISERR: 'EHATA',
    ISERROR: 'EHATALIYSA',
    ISEVEN: 'ÇİFTMİ',
    ISFORMULA: 'EFORMÜLSE',
    ISLOGICAL: 'EMANTIKSALSA',
    ISNA: 'EYOKSA',
    ISNONTEXT: 'EMETİNDEĞİLSE',
    ISNUMBER: 'ESAYIYSA',
    ISODD: 'TEKMİ',
    ISOWEEKNUM: 'ISOHAFTASAY',
    ISPMT: 'ISPMT',
    ISREF: 'EREFSE',
    ISTEXT: 'EMETİNSE',
    LEFT: 'SOL',
    LEN: 'UZUNLUK',
    LN: 'LN',
    LOG10: 'LOG10',
    LOG: 'LOG',
    LOWER: 'KÜÇÜKHARF',
    MATCH: 'KAÇINCI',
    MAX: 'MAK',
    MAXA: 'MAKA',
    MAXIFS: 'ÇOKEĞERMAK',
    MAXPOOL: 'MAXPOOL',
    MEDIAN: 'ORTANCA',
    MEDIANPOOL: 'MEDIANPOOL',
    MID: 'PARÇAAL',
    MIN: 'MİN',
    MINA: 'MİNA',
    MINIFS: 'ÇOKEĞERMİN',
    MINUTE: 'DAKİKA',
    MIRR: 'D_İÇ_VERİM_ORANI',
    MMULT: 'DÇARP',
    MOD: 'MOD',
    MONTH: 'AY',
    NA: 'YOKSAY',
    NETWORKDAYS: 'TAMİŞGÜNÜ',
    'NETWORKDAYS.INTL': 'TAMİŞGÜNÜ.ULUSL',
    NOMINAL: 'NOMİNAL',
    NOT: 'DEĞİL',
    NOW: 'ŞİMDİ',
    NPER: 'TAKSİT_SAYISI',
    NPV: 'NBD',
    OCT2BIN: 'OCT2BIN',
    OCT2DEC: 'OCT2DEC',
    OCT2HEX: 'OCT2HEX',
    ODD: 'TEK',
    OFFSET: 'KAYDIR',
    OR: 'VEYA',
    PDURATION: 'PSÜRE',
    PI: 'Pİ',
    PMT: 'DEVRESEL_ÖDEME',
    PRODUCT: 'ÇARPIM',
    POWER: 'KUVVET',
    PPMT: 'ANA_PARA_ÖDEMESİ',
    PROPER: 'YAZIM.DÜZENİ',
    PV: 'BD',
    RADIANS: 'RADYAN',
    RAND: 'S_SAYI_ÜRET',
    RATE: 'FAİZ_ORANI',
    REPLACE: 'DEĞİŞTİR',
    REPT: 'YİNELE',
    RIGHT: 'SAĞ',
    ROUND: 'YUVARLA',
    ROUNDDOWN: 'AŞAĞIYUVARLA',
    ROUNDUP: 'YUKARIYUVARLA',
    ROW: 'SAT',
    ROWS: 'SATIRSAY',
    RRI: 'GERÇEKLEŞENYATIRIMGETİRİSİ',
    SEARCH: 'MBUL',
    SEC: 'SEC',
    SECH: 'SECH',
    SECOND: 'SANİYE',
    SHEET: 'SAYFA',
    SHEETS: 'SAYFALAR',
    SIN: 'SİN',
    SINH: 'SINH',
    SLN: 'DA',
    SPLIT: 'SPLIT',
    SQRT: 'KAREKÖK',
    STDEVA: 'STDSAPMAA',
    'STDEV.P': 'STDSAPMA.P',
    STDEVPA: 'STDSAPMASA',
    'STDEV.S': 'STDSAPMA.S',
    SUBSTITUTE: 'YERİNEKOY',
    SUBTOTAL: 'ALTTOPLAM   SUMY.CZĘŚCIOWE',
    SUM: 'TOPLA',
    SUMIF: 'ETOPLA',
    SUMIFS: 'ÇOKETOPLA',
    SUMPRODUCT: 'TOPLA.ÇARPIM',
    SUMSQ: 'TOPKARE',
    SWITCH: '',
    SYD: 'YAT',
    T: 'T',
    TAN: 'TAN',
    TANH: 'TANH',
    TBILLEQ: 'HTAHEŞ',
    TBILLPRICE: 'HTAHDEĞER',
    TBILLYIELD: 'HTAHÖDEME',
    TEXT: 'METNEÇEVİR',
    TIME: 'ZAMAN',
    TIMEVALUE: 'ZAMANSAYISI',
    TODAY: 'BUGÜN',
    TRANSPOSE: 'DEVRİK_DÖNÜŞÜM',
    TRIM: 'KIRP',
    TRUE: 'DOĞRU',
    TRUNC: 'NSAT',
    UNICHAR: 'UNICODEKARAKTERİ',
    UNICODE: 'UNICODE',
    UPPER: 'BÜYÜKHARF',
    VARA: 'VARA',
    'VAR.P': 'VAR.P',
    VARPA: 'VARSA',
    'VAR.S': 'VAR.S',
    VLOOKUP: 'DÜŞEYARA',
    WEEKDAY: 'HAFTANINGÜNÜ',
    WEEKNUM: 'HAFTASAY',
    WORKDAY: 'İŞGÜNÜ',
    'WORKDAY.INTL': 'İŞGÜNÜ.ULUSL',
    XNPV: 'ANBD',
    XOR: 'ÖZELVEYA',
    YEAR: 'YIL',
    YEARFRAC: 'YILORAN',
    ROMAN: 'ROMEN',
    ARABIC: 'ARAPÇA',
    'HF.ADD': 'HF.ADD',
    'HF.CONCAT': 'HF.CONCAT',
    'HF.DIVIDE': 'HF.DIVIDE',
    'HF.EQ': 'HF.EQ',
    'HF.GT': 'HF.GT',
    'HF.GTE': 'HF.GTE',
    'HF.LT': 'HF.LT',
    'HF.LTE': 'HF.LTE',
    'HF.MINUS': 'HF.MINUS',
    'HF.MULTIPLY': 'HF.MULTIPLY',
    'HF.NE': 'HF.NE',
    'HF.POW': 'HF.POW',
    'HF.UMINUS': 'HF.UMINUS',
    'HF.UNARY_PERCENT': 'HF.UNARY_PERCENT',
    'HF.UPLUS': 'HF.UPLUS',
    VAR: 'VAR',
    VARP: 'VARS',
    STDEV: 'STDSAPMA',
    STDEVP: 'STDSAPMAS',
    FACT: 'ÇARPINIM',
    FACTDOUBLE: 'ÇİFTFAKTÖR',
    COMBIN: 'KOMBİNASYON',
    COMBINA: 'KOMBİNASYONA',
    GCD: 'OBEB',
    LCM: 'OKEK',
    MROUND: 'KYUVARLA',
    MULTINOMIAL: 'ÇOKTERİMLİ',
    QUOTIENT: 'BÖLÜM',
    RANDBETWEEN: 'RASTGELEARADA',
    SERIESSUM: 'SERİTOPLA',
    SIGN: 'İŞARET',
    SQRTPI: 'KAREKÖKPİ',
    SUMX2MY2: 'TOPX2EY2',
    SUMX2PY2: 'TOPX2AY2',
    SUMXMY2: 'TOPXEY2',
    'EXPON.DIST': 'ÜSTEL.DAĞ',
    EXPONDIST: 'ÜSTELDAĞ',
    FISHER: 'FISHER',
    FISHERINV: 'FISHERTERS',
    GAMMA: 'GAMA',
    'GAMMA.DIST': 'GAMA.DAĞ',
    'GAMMA.INV': 'GAMA.TERS',
    GAMMADIST: 'GAMADAĞ',
    GAMMAINV: 'GAMATERS',
    GAMMALN: 'GAMALN',
    'GAMMALN.PRECISE': 'GAMALN.DUYARLI',
    GAUSS: 'GAUSS',
    'BETA.DIST': 'BETA.DAĞ',
    BETADIST: 'BETADAĞ',
    'BETA.INV': 'BETA.TERS',
    BETAINV: 'BETATERS',
    'BINOM.DIST': 'BİNOM.DAĞ',
    BINOMDIST: 'BİNOMDAĞ',
    'BINOM.INV': 'BİNOM.TERS',
    BESSELI: 'BESSELI',
    BESSELJ: 'BESSELJ',
    BESSELK: 'BESSELK',
    BESSELY: 'BESSELY',
    CHIDIST: 'KİKAREDAĞ',
    CHIINV: 'KİKARETERS',
    'CHISQ.DIST': 'KİKARE.DAĞ',
    'CHISQ.DIST.RT': 'KİKARE.DAĞ.SAĞK',
    'CHISQ.INV': 'KİKARE.TERS',
    'CHISQ.INV.RT': 'KİKARE.TERS.SAĞK',
    'F.DIST': 'F.DAĞ',
    'F.DIST.RT': 'F.DAĞ.SAĞK',
    'F.INV': 'F.TERS',
    'F.INV.RT': 'F.TERS.SAĞK',
    FDIST: 'FDAĞ',
    FINV: 'FTERS',
    WEIBULL: 'WEIBULL',
    'WEIBULL.DIST': 'WEIBULL.DAĞ',
    POISSON: 'POISSON',
    'POISSON.DIST': 'POISSON.DAĞ',
    'HYPGEOM.DIST': 'HİPERGEOM.DAĞ',
    HYPGEOMDIST: 'HİPERGEOMDAĞ',
    'T.DIST': 'T.DAĞ',
    'T.DIST.2T': 'T.DAĞ.2K',
    'T.DIST.RT': 'T.DAĞ.SAĞK',
    'T.INV': 'T.TERS',
    'T.INV.2T': 'T.TERS.2K',
    TDIST: 'TDAĞ',
    TINV: 'TTERS',
    LOGINV: 'LOGTERS',
    'LOGNORM.DIST': 'LOGNORM.DAĞ',
    'LOGNORM.INV': 'LOGNORM.TERS',
    LOGNORMDIST: 'LOGNORMDAĞ',
    'NORM.DIST': 'NORM.DAĞ',
    PHI: 'PHI',
    'NORM.INV': 'NORM.TERS',
    'NORM.S.DIST': 'NORM.S.DAĞ',
    'NORM.S.INV': 'NORM.S.TERS',
    NORMDIST: 'NORMDAĞ',
    NORMINV: 'NORMTERS',
    NORMSDIST: 'NORMSDAĞ',
    NORMSINV: 'NORMSTERS',
    'NEGBINOM.DIST': 'NEGBİNOM.DAĞ',
    NEGBINOMDIST: 'NEGBİNOMDAĞ',
    COMPLEX: 'KARMAŞIK',
    IMABS: 'SANMUTLAK',
    IMAGINARY: 'SANAL',
    IMARGUMENT: 'SANBAĞ_DEĞİŞKEN',
    IMCONJUGATE: 'SANEŞLENEK',
    IMCOS: 'SANCOS',
    IMCOSH: 'SANCOSH',
    IMCOT: 'SANCOT',
    IMCSC: 'SANCSC',
    IMCSCH: 'SANCSCH',
    IMDIV: 'SANBÖL',
    IMEXP: 'SANÜS',
    IMLN: 'SANLN',
    IMLOG10: 'SANLOG10',
    IMLOG2: 'SANLOG2',
    IMPOWER: 'SANKUVVET',
    IMPRODUCT: 'SANÇARP',
    IMREAL: 'SANGERÇEK',
    IMSEC: 'SANSEC',
    IMSECH: 'SANSECH',
    IMSIN: 'SANSIN',
    IMSINH: 'SANSINH',
    IMSQRT: 'SANKAREKÖK',
    IMSUB: 'SANTOPLA',
    IMSUM: 'SANÇIKAR',
    IMTAN: 'SANTAN',
    LARGE: 'BÜYÜK',
    SMALL: 'KÜÇÜK',
    AVEDEV: 'ORTSAP',
    CONFIDENCE: 'GÜVENİRLİK',
    'CONFIDENCE.NORM': 'GÜVENİLİRLİK.NORM',
    'CONFIDENCE.T': 'GÜVENİLİRLİK.T',
    DEVSQ: 'SAPKARE',
    GEOMEAN: 'GEOORT',
    HARMEAN: 'HARORT',
    CRITBINOM: 'KRİTİKBİNOM',
    PEARSON: 'PEARSON',
    RSQ: 'RKARE',
    STANDARDIZE: 'STANDARTLAŞTIRMA',
    'Z.TEST': 'Z.TEST',
    ZTEST: 'ZTEST',
    'F.TEST': 'F.TEST',
    FTEST: 'FTEST',
    STEYX: 'STHYX',
    SLOPE: 'EĞİM',
    COVAR: 'KOVARYANS',
    'COVARIANCE.P': 'KOVARYANS.P',
    'COVARIANCE.S': 'KOVARYANS.S',
    'CHISQ.TEST': 'KİKARE.TEST',
    CHITEST: 'KİKARETEST',
    'T.TEST': 'T.TEST',
    TTEST: 'TTEST',
    SKEW: 'ÇARPIKLIK',
    'SKEW.P': 'ÇARPIKLIK.P',
    WEIBULLDIST: 'WEIBULLDIST',
    VARS: '_VARS',
    TINV2T: 'TINV2T',
    TDISTRT: 'TDISTRT',
    TDIST2T: 'TDIST2T',
    STDEVS: 'STDEVS',
    FINVRT: 'FINVRT',
    FDISTRT: 'FDISTRT',
    CHIDISTRT: 'CHIDISTRT',
    CHIINVRT: 'CHIINVRT',
    COVARIANCEP: 'COVARIANCEP',
    COVARIANCES: 'COVARIANCES',
    LOGNORMINV: 'LOGNORMINV',
    POISSONDIST: 'POISSONDIST',
    SKEWP: 'SKEWP',
    'CEILING.MATH': 'TAVANAYUVARLA.MATEMATİK',
    FLOOR: 'TABANAYUVARLA',
    'FLOOR.MATH': 'TABANAYUVARLA.MATEMATİK',
    'CEILING.PRECISE': 'CEILING.PRECISE',
    'FLOOR.PRECISE': 'FLOOR.PRECISE',
    'ISO.CEILING': 'ISO.CEILING'
  },
  langCode: 'trTR',
  ui: {
    NEW_SHEET_PREFIX: 'Sheet'
  }
};
var _default = dictionary;
exports.default = _default;