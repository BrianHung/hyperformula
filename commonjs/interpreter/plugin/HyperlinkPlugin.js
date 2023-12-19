"use strict";

exports.__esModule = true;
exports.HyperlinkPlugin = void 0;
var _FunctionPlugin = require("./FunctionPlugin");
/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */

class HyperlinkPlugin extends _FunctionPlugin.FunctionPlugin {
  hyperlink(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('HYPERLINK'), (url, linkLabel) => {
      ast.hyperlink = url;
      return linkLabel !== null && linkLabel !== void 0 ? linkLabel : url;
    });
  }
}
exports.HyperlinkPlugin = HyperlinkPlugin;
HyperlinkPlugin.implementedFunctions = {
  'HYPERLINK': {
    method: 'hyperlink',
    parameters: [{
      argumentType: _FunctionPlugin.FunctionArgumentType.STRING
    }, {
      argumentType: _FunctionPlugin.FunctionArgumentType.STRING,
      optionalArg: true
    }]
  }
};