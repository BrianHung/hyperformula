import {Config} from '../../src/Config'
import {SheetMapping} from '../../src/DependencyGraph'
import { ImmutableReferenceMapping } from '../../src/DependencyGraph/ImmutableRefMapping'
import {buildTranslationPackage} from '../../src/i18n'
import {enGB} from '../../src/i18n/languages'
import {FunctionRegistry} from '../../src/interpreter/FunctionRegistry'
import {ParserWithCaching} from '../../src/parser'

export function buildEmptyParserWithCaching(config: Config, sheetMapping?: SheetMapping, refMapping?: ImmutableReferenceMapping): ParserWithCaching {
  sheetMapping = sheetMapping || new SheetMapping(buildTranslationPackage(enGB))
  return new ParserWithCaching(config, new FunctionRegistry(config), sheetMapping.get, refMapping as any)
}
