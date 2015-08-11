'use strict';

angular.module('ffxivCraftOptWeb.components')
  .directive('actionTable', function () {
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
      controller: function ($scope, $rootScope, $translate, _allActions, _allClasses, _actionGroups, _actionsByName, _xivdbtooltips, _getActionImagePath) {
        $scope.actionGroups = _actionGroups;

        $scope.getActionImagePath = _getActionImagePath;

        $scope.actionTooltip = function (action, cls) {
          return _xivdbtooltips.actionTooltip(action, cls);
        };

        $scope._actionClasses = function (action, cls) {
          var classes = $scope.actionClasses(action, cls);
          classes['selectable'] = $scope.selectable;
          return classes;
        }
      }
    }
  });
