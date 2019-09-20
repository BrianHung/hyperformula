import {Config} from '../../src'
import {SheetMapping} from '../../src/DependencyGraph'
import {buildLexerConfig, FormulaLexer, ParserWithCaching} from '../../src/parser'
import {adr} from '../testUtils'

describe('Compute hash from ast', () => {
  const config = new Config()
  const sheetMapping = new SheetMapping()
  sheetMapping.addSheet('Sheet1')
  const lexer = new FormulaLexer(buildLexerConfig(config))
  const parser = new ParserWithCaching(config, sheetMapping.fetch)

  it('literals',  () => {
    const formula = '=CONCATENATE("foo", 42.34)'
    const address = adr('A1')
    const ast = parser.parse(formula, address).ast
    const lexerResult = lexer.tokenizeFormula(formula)
    const hashFromTokens = parser.computeHashFromTokens(lexerResult.tokens, address)

    const hash = parser.computeHashFromAst(ast)

    expect(hash).toEqual(hashFromTokens)
  })

  it('function call',  () => {
    const address = adr('A1')
    const formula = '=SUM(1,2,3)'
    const ast = parser.parse(formula, address).ast
    const lexerResult = lexer.tokenizeFormula(formula)
    const hashFromTokens = parser.computeHashFromTokens(lexerResult.tokens, address)

    const hash = parser.computeHashFromAst(ast)
    expect(hash).toEqual(hashFromTokens)
  })

  it('simple addreess',  () => {
    const formula = '=$Sheet1.A1'
    const address = adr('D6')
    const ast = parser.parse(formula, address).ast
    const lexerResult = lexer.tokenizeFormula(formula)
    const hashFromTokens = parser.computeHashFromTokens(lexerResult.tokens, address)

    const hash = parser.computeHashFromAst(ast)
    expect(hash).toEqual(hashFromTokens)
  })

  it('absolute col',  () => {
    const formula = '=$Sheet1.$A1'
    const address = adr('D6')
    const ast = parser.parse(formula, address).ast
    const lexerResult = lexer.tokenizeFormula(formula)
    const hashFromTokens = parser.computeHashFromTokens(lexerResult.tokens, address)

    const hash = parser.computeHashFromAst(ast)
    expect(hash).toEqual(hashFromTokens)
  })

  it('absolute row addreess',  () => {
    const formula = '=$Sheet1.A$1'
    const address = adr('D6')
    const ast = parser.parse(formula, address).ast
    const lexerResult = lexer.tokenizeFormula(formula)
    const hashFromTokens = parser.computeHashFromTokens(lexerResult.tokens, address)

    const hash = parser.computeHashFromAst(ast)
    expect(hash).toEqual(hashFromTokens)
  })

  it('absolute address',  () => {
    const formula = '=$Sheet1.$A$1'
    const address = adr('D6')
    const ast = parser.parse(formula, address).ast
    const lexerResult = lexer.tokenizeFormula(formula)
    const hashFromTokens = parser.computeHashFromTokens(lexerResult.tokens, address)

    const hash = parser.computeHashFromAst(ast)
    expect(hash).toEqual(hashFromTokens)
  })

  it('cell range',  () => {
    const formula = '=$Sheet1.$A$1:B$2'
    const address = adr('D6')
    const ast = parser.parse(formula, address).ast
    const lexerResult = lexer.tokenizeFormula(formula)
    const hashFromTokens = parser.computeHashFromTokens(lexerResult.tokens, address)

    const hash = parser.computeHashFromAst(ast)
    expect(hash).toEqual(hashFromTokens)
  })

  it('ops',  () => {
    const formula = '=-1+1-1*1/1^1&1=1<>1<1<=1>1<1'
    const address = adr('A1')
    const ast = parser.parse(formula, address).ast
    const lexerResult = lexer.tokenizeFormula(formula)
    const hashFromTokens = parser.computeHashFromTokens(lexerResult.tokens, address)

    const hash = parser.computeHashFromAst(ast)
    expect(hash).toEqual(hashFromTokens)
  })

  it('cell ref between strings', () => {
    const formula = '="A5"+A4+"A6"'
    const address = adr('A1')
    const ast = parser.parse(formula, address).ast
    const lexerResult = lexer.tokenizeFormula(formula)
    const hashFromTokens = parser.computeHashFromTokens(lexerResult.tokens, address)

    const hash = parser.computeHashFromAst(ast)
    expect(hash).toEqual(hashFromTokens)
  })

  it('cell ref in string with escape', () => {
    const formula = '="fdsaf\\"A5"'
    const address = adr('A1')
    const ast = parser.parse(formula, address).ast
    const lexerResult = lexer.tokenizeFormula(formula)
    const hashFromTokens = parser.computeHashFromTokens(lexerResult.tokens, address)

    const hash = parser.computeHashFromAst(ast)
    expect(hash).toEqual(hashFromTokens)
  })
})