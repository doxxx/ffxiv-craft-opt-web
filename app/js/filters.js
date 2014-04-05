'use strict';

/* Filters */

angular.module('ffxivCraftOptWeb.filters', [])
  .filter('objectToArray', function () {
    return function (input) {
      var output = [];
      for (var e in input) {
        output.push(input[e]);
      }
      return output;
    }
  });
