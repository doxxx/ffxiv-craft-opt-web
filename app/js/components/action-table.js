(function () {
  'use strict';

  angular
    .module('ffxivCraftOptWeb.components')
    .directive('actionTable', factory);

  function factory() {
    return {
      restrict: 'E',
      templateUrl: 'components/action-table.html',
      scope: {
        cls: '=',
        onClick: '=',
        actionClasses: '=',
        selectable: '=',
        draggable: '=',
        tooltipPlacement: '@'
      },
      controller: controller
    }
  }

  function controller($scope, _actionGroups, _actionsByName, _tooltips, _getActionImagePath, _iActionClassSpecific) {
    $scope.actionGroups = _actionGroups;
    $scope.getActionImagePath = _getActionImagePath;
    $scope.cssClassesForAction = cssClassesForAction;
    $scope.actionForName = actionForName;
    $scope.iActionClassSpecific = _iActionClassSpecific;

    $scope.actionTooltips = {};

    $scope.$on("tooltipCacheUpdated", updateActionTooltips);
    $scope.$watch("cls", updateActionTooltips);

    updateActionTooltips();

    //////////////////////////////////////////////////////////////////////////

    function updateActionTooltips() {
      var newTooltips = {};
      angular.forEach(_actionsByName, function (action) {
        var key;
        if (action.cls != 'All') {
          key = action.cls + action.shortName;
        }
        else {
          key = $scope.cls + action.shortName;
        }
        newTooltips[action.shortName] = _tooltips.actionTooltips[key];
      });
      $scope.actionTooltips = newTooltips;
    }

    function cssClassesForAction(name) {
      var classes = $scope.actionClasses(name, $scope.cls);
      classes['selectable'] = $scope.selectable;
      return classes;
    }

    function actionForName(name) {
      return _actionsByName[name];
    }

  }
})();
