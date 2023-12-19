"use strict";

exports.__esModule = true;
exports.StatType = void 0;
/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */
var StatType;
exports.StatType = StatType;
(function (StatType) {
  /* build engine */
  StatType["BUILD_ENGINE_TOTAL"] = "BUILD_ENGINE_TOTAL";
  StatType["PARSER"] = "PARSER";
  StatType["GRAPH_BUILD"] = "GRAPH_BUILD";
  StatType["COLLECT_DEPENDENCIES"] = "COLLECT_DEPENDENCIES";
  StatType["PROCESS_DEPENDENCIES"] = "PROCESS_DEPENDENCIES";
  StatType["TOP_SORT"] = "TOP_SORT";
  StatType["BUILD_COLUMN_INDEX"] = "BUILD_COLUMN_INDEX";
  StatType["EVALUATION"] = "EVALUATION";
  StatType["VLOOKUP"] = "VLOOKUP";
  /* crud adjustments */
  StatType["TRANSFORM_ASTS"] = "TRANSFORM_ASTS";
  StatType["TRANSFORM_ASTS_POSTPONED"] = "TRANSFORM_ASTS_POSTPONED";
  StatType["ADJUSTING_ADDRESS_MAPPING"] = "ADJUSTING_ADDRESS_MAPPING";
  StatType["ADJUSTING_ARRAY_MAPPING"] = "ADJUSTING_ARRAY_MAPPING";
  StatType["ADJUSTING_RANGES"] = "ADJUSTING_RANGES";
  StatType["ADJUSTING_GRAPH"] = "ADJUSTING_GRAPH";
  /* criterion cache */
  StatType["CRITERION_FUNCTION_FULL_CACHE_USED"] = "CRITERION_FUNCTION_FULL_CACHE_USED";
  StatType["CRITERION_FUNCTION_PARTIAL_CACHE_USED"] = "CRITERION_FUNCTION_PARTIAL_CACHE_USED";
})(StatType || (exports.StatType = StatType = {}));