'use strict';

angular.module('ffxivCraftOptWeb.components')
  .directive('simulatorStatus', function () {
    return {
      restrict: 'E',
      templateUrl: 'components/simulator-status.html',
      scope: {
        crafter: '=',
        recipe: '=',
        status: '=',
        valid: '&'
      },
      controller: function ($scope) {
        var update = function (event, newState) {
          if (newState) {
            $scope.durability = newState.durability;
            $scope.condition = newState.condition;
            $scope.progress = newState.progress;
            $scope.quality = newState.quality;
            $scope.cp = newState.cp;
          }
          else {
            $scope.durability = $scope.recipe.durability;
            $scope.condition = '';
            $scope.progress = 0;
            $scope.quality =  0;
            $scope.cp = $scope.crafter.cp;
          }

          $scope.progressPercent = Math.min(100, $scope.progress / $scope.recipe.difficulty * 100);
          $scope.qualityPercent = Math.min(100, $scope.quality / $scope.recipe.maxQuality * 100);
          $scope.cpPercent = Math.min(100, $scope.cp / $scope.crafter.cp * 100);

          $scope.hqPercent = newState && newState.hqPercent || 0;
          $scope.successPercent = newState && newState.successPercent || 0;
        };

        $scope.$watchCollection("status.state", update);

        update();
      }
    }
  });
