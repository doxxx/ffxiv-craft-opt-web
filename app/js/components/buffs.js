'use strict';

angular.module('ffxivCraftOptWeb.components')
  .directive('buffs', function () {
    return {
      restrict: 'E',
      templateUrl: 'components/buffs.html',
      scope: {
        effects: '=',
        recipe: '=',
        action : "&?"
      },
      controller: function ($scope, _getActionImagePath) {
        $scope.getActionImagePath = _getActionImagePath;

          var update = function () {
          $scope.buffs = [];


          var effects = $scope.effects;
          if (effects) {
            for (var name in effects.countUps) {
              $scope.buffs.push({name: name, count: effects.countUps[name] + 1});
            }
            for (var name in effects.countDowns) {
              $scope.buffs.push({name: name, count: effects.countDowns[name]});
            }
          }
        };

        $scope.$watchCollection('effects.countDowns', update);
        $scope.$watchCollection('effects.countUps', update);

        // Execute on click action
        $scope.execute = function(buff){
          if (angular.isFunction($scope.action))
            $scope.action({buff: buff});
        }


        update();
      },

      link: function (scope, element, attrs) {
        // One-way method bindind bind a noop() function even if no attributes was set. So force value to be undefined if no callback was set
        if (!attrs.action) {
          scope.action = undefined;
        }
        scope.actionable = angular.isFunction(scope.action);
      }

    }
  });
