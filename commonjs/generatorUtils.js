"use strict";

exports.__esModule = true;
exports.empty = empty;
exports.first = first;
exports.split = split;
/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */
function* empty() {}
function split(iterable) {
  const iterator = iterable[Symbol.iterator]();
  const {
    done,
    value
  } = iterator.next();
  if (done) {
    return {
      rest: empty()
    };
  } else {
    return {
      value,
      rest: iterator
    };
  }
}
function first(iterable) {
  const iterator = iterable[Symbol.iterator]();
  const {
    done,
    value
  } = iterator.next();
  if (!done) {
    return value;
  }
  return undefined;
}