"use strict";

exports.__esModule = true;
exports.VersionPlugin = void 0;
var _HyperFormula = require("../../HyperFormula");
var _FunctionPlugin = require("./FunctionPlugin");
/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */

const LICENSE_STATUS_MAP = new Map([['gpl-v3', 1], ["missing" /* MISSING */, 2], ["invalid" /* INVALID */, 3], ["expired" /* EXPIRED */, 4]]);
class VersionPlugin extends _FunctionPlugin.FunctionPlugin {
  version(ast, state) {
    return this.runFunction(ast.args, state, this.metadata('VERSION'), () => {
      const {
        licenseKeyValidityState: validityState,
        licenseKey
      } = this.config;
      let status;
      if (LICENSE_STATUS_MAP.has(licenseKey)) {
        status = LICENSE_STATUS_MAP.get(licenseKey);
      } else if (LICENSE_STATUS_MAP.has(validityState)) {
        status = LICENSE_STATUS_MAP.get(validityState);
      } else if (validityState === "valid" /* VALID */) {
        status = licenseKey.slice(-5);
      }
      return `HyperFormula v${_HyperFormula.HyperFormula.version}, ${status}`;
    });
  }
}
exports.VersionPlugin = VersionPlugin;
VersionPlugin.implementedFunctions = {
  'VERSION': {
    method: 'version',
    parameters: []
  }
};