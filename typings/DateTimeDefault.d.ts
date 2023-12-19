/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */
import { DateTime } from './DateTimeHelper';
import { Maybe } from './Maybe';
export declare const TIME_FORMAT_SECONDS_ITEM_REGEXP: RegExp;
/**
 * Parses a DateTime value from a string if the string matches the given date format and time format.
 *
 * Idea for more readable implementation:
 *   - divide string into parts by a regexp [date_regexp]? [time_regexp]? [ampm_regexp]?
 *   - start by finding the time part, because it is unambiguous '([0-9]+:[0-9:.]+ ?[ap]?m?)$', before it is the date part
 *   - OR split by spaces - last segment is ampm token, second to last is time (with or without ampm), rest is date
 * If applied:
 *   - date parsing might work differently after these changes but still according to the docs
 *   - make sure to test edge cases like timeFormats: ['hh', 'ss.ss'] etc, string: '01-01-2019 AM', 'PM'
 */
export declare function defaultParseToDateTime(text: string, dateFormat: Maybe<string>, timeFormat: Maybe<string>): Maybe<DateTime>;