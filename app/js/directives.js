'use strict';

/* Directives */
var module = angular.module('ffxivCraftOptWeb.directives', []);

module.directive('appVersion', ['version', function(version) {
  return function(scope, elm, attrs) {
    elm.text(version);
  };
}]);

module.directive('mySectionHeader', function() {
  return {
    restrict: 'E',
    scope: {
      section: '=',
    },
    templateUrl: 'partials/section-header.html'
  }
});