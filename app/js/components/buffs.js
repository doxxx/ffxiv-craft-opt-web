(function () {
  'use strict';

  angular
    .module('ffxivCraftOptWeb.components')
    .directive('buffs', factory);

  function factory() {
    return {
      restrict: 'E',
      templateUrl: 'components/buffs.html',
      scope: {
        effects: '=',
        recipe: '='
      },
      controller: controller
    };
  }

  function controller($scope, _getActionImagePath) {
    $scope.getActionImagePath = _getActionImagePath;

    $scope.$watchCollection('effects', update);

    update();

    //////////////////////////////////////////////////////////////////////////

    function update() {
      $scope.buffs = [];

      var effects = $scope.effects;
      if (effects) {
        for (var name in effects.indefinites) {
          $scope.buffs.push({name: name, count: ''});
        }
        for (var name in effects.countUps) {
          $scope.buffs.push({name: name, count: effects.countUps[name] + 1});
        }
        for (var name in effects.countDowns) {
          $scope.buffs.push({name: name, count: effects.countDowns[name]});
        }
      }
    }
  }
})();
