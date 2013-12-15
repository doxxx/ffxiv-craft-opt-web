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

module.directive('myActionList', function() {
  return {
    restrict: 'E',
    scope: {
      actions: '=',
      actionClass: '&',
      actionClick: '&',
      actionTooltip: '&',
    },
    templateUrl: 'partials/action-list.html'
  }
});

module.directive('selectOnClick', function () {
    // Linker function
    return function (scope, element, attrs) {
        element.bind('click', function () {
            this.select();
        });
    };
});
