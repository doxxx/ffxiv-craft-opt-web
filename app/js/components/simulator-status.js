'use strict';

angular.module('ffxivCraftOptWeb.components')
  .directive('simulatorStatus', function () {
    return {
      restrict: 'E',
      templateUrl: 'components/simulator-status.html',
      scope: {
        recipe: '=',
        status: '=',
        valid: '&'
      }
    }
  });
