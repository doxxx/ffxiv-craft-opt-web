(function () {
  'use strict';

  angular
    .module('ffxivCraftOptWeb.components', [
      'ffxivCraftOptWeb.services.bonusStats',
      'ffxivCraftOptWeb.services.buffsdb'
    ])
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

  function controller($scope, $rootScope, $translate, _bonusStats, _buffsDatabase) {
    $scope.buffList = {};

    $scope.buffName = buffName;

    $scope.$watchCollection("crafter", update);
    $scope.$watchCollection("bonusStats", update);
    $scope.$watchCollection("recipe", update);
    $scope.$watchCollection("status", update);

    $rootScope.$on('$translateChangeSuccess', updateBuffsLists);

    updateBuffsLists();
    update();

    //////////////////////////////////////////////////////////////////////////

    function updateBuffsLists() {
      _buffsDatabase.buffs($translate.use(), 'Meal').then(function (buffs) {
        $scope.buffList.food = buffs;
      });
      _buffsDatabase.buffs($translate.use(), 'Medicine').then(function (buffs) {
        $scope.buffList.medicine = buffs;
      });
    }

    function update() {
      $scope.baseStats = $scope.crafter;

      if ($scope.bonusStats) {
        var buffStats = _bonusStats.newBonusStats();
        if ($scope.bonusStats.food) {
          buffStats = _bonusStats.sumCrafterBonusStats(
            buffStats,
            _bonusStats.calculateBuffBonusStats($scope.crafter, $scope.bonusStats.food)
          );
        }
        if ($scope.bonusStats.medicine) {
          buffStats = _bonusStats.sumCrafterBonusStats(
            buffStats,
            _bonusStats.calculateBuffBonusStats($scope.crafter, $scope.bonusStats.medicine)
          );
        }
        $scope.buffStats = buffStats;

        var stats = _bonusStats.sumCrafterBonusStats($scope.crafter, $scope.buffStats);
        $scope.stats = _bonusStats.sumCrafterBonusStats(stats, $scope.bonusStats);
      }
      else {
        $scope.buffStats = _bonusStats.newBonusStats();
        $scope.stats = $scope.crafter;
      }

      $scope.baseValues = $scope.status.baseValues;

      if ($scope.status.state) {
        $scope.durability = $scope.status.state.durability;
        $scope.condition = $scope.status.state.condition;
        $scope.progress = $scope.status.state.progress;
        $scope.quality = $scope.status.state.quality;
        $scope.cp = $scope.status.state.cp;
        $scope.maxCp = $scope.stats.cp + $scope.status.state.bonusMaxCp;
      }
      else {
        $scope.durability = $scope.recipe.durability;
        $scope.condition = '';
        $scope.progress = 0;
        $scope.quality = 0;
        $scope.cp = $scope.stats.cp;
        $scope.maxCp = $scope.stats.cp;
      }

      $scope.progressPercent = Math.min(100, $scope.progress / $scope.recipe.difficulty * 100);
      $scope.qualityPercent = Math.min(100, $scope.quality / $scope.recipe.maxQuality * 100);
      $scope.cpPercent = Math.min(100, $scope.cp / $scope.maxCp * 100);

      $scope.hqPercent = $scope.status.state && $scope.status.state.hqPercent || 0;
      $scope.successPercent = $scope.status.state && $scope.status.state.successPercent || 0;

    }

    function buffName(buff) {
      var s = buff.name;
      if (buff.hq) {
        s += ' (HQ)';
      }
      return s;
    }
  }
})();
