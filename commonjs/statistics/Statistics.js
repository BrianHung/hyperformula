"use strict";

exports.__esModule = true;
exports.Statistics = void 0;
var _StatType = require("./StatType");
/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */

/**
 * Provides tracking performance statistics to the engine
 */
class Statistics {
  constructor() {
    this.stats = new Map([[_StatType.StatType.CRITERION_FUNCTION_FULL_CACHE_USED, 0], [_StatType.StatType.CRITERION_FUNCTION_PARTIAL_CACHE_USED, 0]]);
    this.startTimes = new Map();
  }
  incrementCriterionFunctionFullCacheUsed() {
    var _a;
    const newValue = ((_a = this.stats.get(_StatType.StatType.CRITERION_FUNCTION_FULL_CACHE_USED)) !== null && _a !== void 0 ? _a : 0) + 1;
    this.stats.set(_StatType.StatType.CRITERION_FUNCTION_FULL_CACHE_USED, newValue);
  }
  incrementCriterionFunctionPartialCacheUsed() {
    var _a;
    const newValue = ((_a = this.stats.get(_StatType.StatType.CRITERION_FUNCTION_PARTIAL_CACHE_USED)) !== null && _a !== void 0 ? _a : 0) + 1;
    this.stats.set(_StatType.StatType.CRITERION_FUNCTION_PARTIAL_CACHE_USED, newValue);
  }
  /**
   * Resets statistics
   */
  reset() {
    this.stats.clear();
    this.startTimes.clear();
    this.stats.set(_StatType.StatType.CRITERION_FUNCTION_FULL_CACHE_USED, 0);
    this.stats.set(_StatType.StatType.CRITERION_FUNCTION_PARTIAL_CACHE_USED, 0);
  }
  /**
   * Starts tracking particular statistic.
   *
   * @param name - statistic to start tracking
   */
  start(name) {
    if (this.startTimes.get(name)) {
      throw Error(`Statistics ${name} already started`);
    } else {
      this.startTimes.set(name, Date.now());
    }
  }
  /**
   * Stops tracking particular statistic.
   * Raise error if tracking statistic wasn't started.
   *
   * @param name - statistic to stop tracking
   */
  end(name) {
    var _a;
    const now = Date.now();
    const startTime = this.startTimes.get(name);
    if (startTime) {
      let values = (_a = this.stats.get(name)) !== null && _a !== void 0 ? _a : 0;
      values += now - startTime;
      this.stats.set(name, values);
      this.startTimes.delete(name);
    } else {
      throw Error(`Statistics ${name} not started`);
    }
  }
  /**
   * Measure given statistic as execution of given function.
   *
   * @param name - statistic to track
   * @param func - function to call
   * @returns result of the function call
   */
  measure(name, func) {
    this.start(name);
    const result = func();
    this.end(name);
    return result;
  }
  /**
   * Returns the snapshot of current results
   */
  snapshot() {
    return new Map(this.stats);
  }
}
exports.Statistics = Statistics;