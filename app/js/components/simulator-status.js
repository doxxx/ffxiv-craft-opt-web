'use strict';

angular.module('ffxivCraftOptWeb.components')
  .directive('simulatorStatus', function () {
    return {
      restrict: 'E',
      templateUrl: 'components/simulator-status.html',
      scope: {
        crafter: '=',
        bonusStats: '=',
        recipeStartWith : "=startWith",
        recipe: '=',
        status: '=',
        valid: '&'
      },
      controller: function ($scope) {
        var update = function () {
          if ($scope.bonusStats) {
            $scope.stats = addCrafterBonusStats($scope.crafter, $scope.bonusStats)
          }
          else {
            $scope.stats = $scope.crafter;
          }

          if ($scope.status.state) {
            $scope.durability = $scope.status.state.durability;
            $scope.condition = $scope.status.state.condition;
            $scope.progress = $scope.status.state.progress;
            $scope.quality = $scope.status.state.quality;
            $scope.cp = $scope.status.state.cp;
          }
          else {
            $scope.durability = $scope.recipeStartWith.durability || $scope.recipe.durability;
            $scope.condition = $scope.recipeStartWith.condition || '';
            $scope.progress = $scope.recipeStartWith.difficulty || 0;
            $scope.quality =  $scope.recipeStartWith.quality || 0;
            $scope.cp = $scope.recipeStartWith.cp || $scope.stats.cp;
          }

          $scope.progressPercent = Math.min(100, $scope.progress / $scope.recipe.difficulty * 100);
          $scope.qualityPercent = Math.min(100, $scope.quality / $scope.recipe.maxQuality * 100);
          $scope.cpPercent = Math.min(100, $scope.cp / $scope.stats.cp * 100);

          $scope.hqPercent = $scope.status.state && $scope.status.state.hqPercent || 0;
          $scope.successPercent = $scope.status.state && $scope.status.state.successPercent || 0;

        };

        $scope.$watchCollection("crafter", update);
        $scope.$watchCollection("bonusStats", update);
        $scope.$watchCollection("recipeStartWith", update);
        $scope.$watchCollection("recipe", update);
        $scope.$watchCollection("status", update);

        update();
      }
    }
  });
