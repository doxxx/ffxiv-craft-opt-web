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
    },
    templateUrl: 'partials/action-list.html'
  }
});

module.directive('myRadioButtons', function() {
    return {
        restrict: 'E',
        scope: {
          model: '=',
          options:'='
        },
        controller: function($scope){
            $scope.activate = function(option) {
                $scope.model = option;
            };      
        },
        template: "<button type='button' class='btn btn-primary' "+
                    "ng-class='{active: option == model}'"+
                    "ng-repeat='option in options' "+
                    "ng-click='activate(option)'>{{option}} "+
                  "</button>"
    };
});
