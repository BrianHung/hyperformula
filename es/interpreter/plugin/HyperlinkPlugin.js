/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */
import { FunctionArgumentType, FunctionPlugin } from './FunctionPlugin';
export class HyperlinkPlugin extends FunctionPlugin {
  hyperlink(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('HYPERLINK'), (url, linkLabel) => {
      ast.hyperlink = url;
      return linkLabel !== null && linkLabel !== void 0 ? linkLabel : url;
    });
  }
}
HyperlinkPlugin.implementedFunctions = {
  'HYPERLINK': {
    method: 'hyperlink',
    parameters: [{
      argumentType: FunctionArgumentType.STRING
    }, {
      argumentType: FunctionArgumentType.STRING,
      optionalArg: true
    }]
  }
};