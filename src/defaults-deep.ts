/* This file is modified from https://github.com/nodeutils/defaults-deep,
   which is authored by Drew Llewellyn <drew@drew.pro>.
   Both the original version and this file are licensed by ISC.
*/
import * as _ from "lodash";

export function DefaultsDeep<T>(...data: T[]): Required<T> {
  var output: Partial<T> = {};
  _.toArray(arguments)
    .reverse()
    .forEach(function(item) {
      _.mergeWith(output, item, function(objectValue, sourceValue) {
        return _.isArray(sourceValue) ? sourceValue : undefined;
      });
    });

  // Type assertion added to avoid rewriting the whole function.
  return output as Required<T>;
}
