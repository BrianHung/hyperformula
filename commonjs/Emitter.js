"use strict";

exports.__esModule = true;
exports.Events = exports.Emitter = void 0;
var _tinyEmitter = require("tiny-emitter");
/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */

var Events;
exports.Events = Events;
(function (Events) {
  Events["SheetAdded"] = "sheetAdded";
  Events["SheetRemoved"] = "sheetRemoved";
  Events["SheetRenamed"] = "sheetRenamed";
  Events["NamedExpressionAdded"] = "namedExpressionAdded";
  Events["NamedExpressionRemoved"] = "namedExpressionRemoved";
  Events["ValuesUpdated"] = "valuesUpdated";
  Events["EvaluationSuspended"] = "evaluationSuspended";
  Events["EvaluationResumed"] = "evaluationResumed";
})(Events || (exports.Events = Events = {}));
class Emitter extends _tinyEmitter.TinyEmitter {
  emit(event, ...args) {
    super.emit(event, ...args);
    return this;
  }
}
exports.Emitter = Emitter;