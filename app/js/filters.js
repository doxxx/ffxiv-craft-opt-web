'use strict';

/* Filters */


var filters = angular.module('ffxivCraftOptWeb.filters', []);

filters.filter('objectToArray', function() {
  return function(input) {
    var output = [];
    for (var e in input) {
      output.push(input[e]);
    }
    return output;
  }
});
