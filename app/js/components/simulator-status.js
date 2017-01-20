(function () {
  'use strict';

  angular
    .module('ffxivCraftOptWeb.components')
    .directive('simulatorStatus', factory);

  function factory() {
    return {
      restrict: 'E',
      templateUrl: 'components/simulator-status.html',
      scope: {
        crafter: '=',
        bonusStats: '=',
        recipe: '=',
        status: '=',
        valid: '&'
      },
      controller: controller
    }
  }

  function controller($scope, _bonusStats) {
    $scope.$watchCollection("crafter", update);
    $scope.$watchCollection("bonusStats", update);
    $scope.$watchCollection("recipe", update);
    $scope.$watchCollection("status", update);

    update();

    //////////////////////////////////////////////////////////////////////////

    function update() {
      if ($scope.bonusStats) {
        $scope.stats = _bonusStats.addCrafterBonusStats($scope.crafter, $scope.bonusStats)
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
        $scope.durability = $scope.recipe.durability;
        $scope.condition = '';
        $scope.progress = 0;
        $scope.quality = 0;
        $scope.cp = $scope.stats.cp;
      }

      $scope.progressPercent = Math.min(100, $scope.progress / $scope.recipe.difficulty * 100);
      $scope.qualityPercent = Math.min(100, $scope.quality / $scope.recipe.maxQuality * 100);
      $scope.cpPercent = Math.min(100, $scope.cp / $scope.stats.cp * 100);

      $scope.hqPercent = $scope.status.state && $scope.status.state.hqPercent || 0;
      $scope.successPercent = $scope.status.state && $scope.status.state.successPercent || 0;

    }
  }
})();
