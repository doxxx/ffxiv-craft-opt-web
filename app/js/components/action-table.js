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

        $scope.actionTooltips = {};
        $scope.updateActionTooltips = function() {
          var newTooltips = {};
          angular.forEach(_actionsByName, function(actionInfo) {
            var key;
            if (actionInfo.cls != 'All') {
              key = actionInfo.cls + actionInfo.shortName;
            }
            else {
              key = $scope.cls + actionInfo.shortName;
            }
            newTooltips[actionInfo.shortName] = _xivdbtooltips.actionTooltips[key];
          });
          $scope.actionTooltips = newTooltips;
        };
        $scope.updateActionTooltips();
        $scope.$on("tooltipCacheUpdated", function (event) {
          $scope.updateActionTooltips();
        });
        $scope.$watch("cls", function (event) {
          $scope.updateActionTooltips();
        });

        $scope._actionClasses = function (action, cls) {
          var classes = $scope.actionClasses(action, cls);
          classes['selectable'] = $scope.selectable;
          return classes;
        };

        $scope.actionForName = function (name) {
          return _actionsByName[name];
        };

        $scope.isActionCrossClass = function (action, cls) {
          if (!angular.isDefined(action)) {
            console.error('undefined actionName');
            return undefined;
          }
          var info = _actionsByName[action];
          if (!angular.isDefined(info)) {
            console.error('unknown action: %s', action);
            return undefined;
          }
          return info.cls != 'All' &&
                 info.cls != cls;
        };
      }
    }
  });
