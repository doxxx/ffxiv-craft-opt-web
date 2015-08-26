'use strict';

angular.module('ffxivCraftOptWeb.components')
  .directive('actionSequence', function () {
    return {
      restrict: 'E',
      templateUrl: 'components/action-sequence.html',
      scope: {
        class: '@',
        actions: '=',
        cls: '=',
        onClick: '=',
        actionClasses: '=',
        draggable: '=',
        tooltipPlacement: '@'
      },
      controller: function ($scope, $rootScope, $translate, _allActions, _allClasses, _actionGroups, _actionsByName, _xivdbtooltips, _getActionImagePath) {
        $scope.actionGroups = _actionGroups;

        $scope.getActionImagePath = _getActionImagePath;

        $scope.actionTooltip = _xivdbtooltips.actionTooltip.bind(_xivdbtooltips);

        $scope._actionClasses = function (action, cls, index) {
          var classes = {};
          if ($scope.actionClasses) {
            classes = $scope.actionClasses(action, cls, index);
          }
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
