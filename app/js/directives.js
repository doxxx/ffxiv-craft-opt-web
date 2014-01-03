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
      isOpen: '=',
      title: '@',
    },
    templateUrl: 'partials/section-header.html'
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

module.directive('isolateScrolling', function () {
  return {
    restrict: 'A',
    link: function (scope, element, attr) {
      element.bind('mousewheel', function (e) {
        if ((e.deltaY > 0 && this.clientHeight + this.scrollTop == this.scrollHeight) ||
            (e.deltaY < 0 && this.scrollTop == 0))
        {
          e.stopPropagation();
          e.preventDefault();
          return false;
        }

        return true;
      });
    }
  };
});
