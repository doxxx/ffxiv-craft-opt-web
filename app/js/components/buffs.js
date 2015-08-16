'use strict';

angular.module('ffxivCraftOptWeb.components')
  .directive('buffs', function () {
    return {
      restrict: 'E',
      templateUrl: 'components/buffs.html',
      scope: {
        effects: '=',
        recipe: '='
      },
      controller: function ($scope, _getActionImagePath) {
        $scope.getActionImagePath = _getActionImagePath;
        
        var update = function () {
          $scope.buffs = [];


          var effects = $scope.effects;
          if (effects) {
            for (var name in effects.countUps) {
              $scope.buffs.push({name: name, count: effects.countUps[name]});
            }
            for (var name in effects.countDowns) {
              $scope.buffs.push({name: name, count: effects.countDowns[name]});
            }
          }
        };

        $scope.$watchCollection('effects', update);

        update();
      }
    }
  });
