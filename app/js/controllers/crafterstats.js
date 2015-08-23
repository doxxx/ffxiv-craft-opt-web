"use strict";

angular.module('ffxivCraftOptWeb.controllers').controller('CrafterStatsController', function ($scope, _allClasses, _allActions) {
  // Initialize tab names and initial active state
  $scope.tabs = [];
  for (var i = 0; i < _allClasses.length; i++) {
    var cls = _allClasses[i];
    $scope.tabs.push({ name: cls, active: cls === $scope.recipe.cls });
  }

  $scope.crafterActionClasses = function (action, cls) {
    return {
      'faded': !$scope.isActionSelected(action, cls),
      'action-cross-class': $scope.isActionCrossClass(action, cls)
    }
  };

  $scope.toggleAction = function (action, cls) {
    var i = $scope.crafter.stats[cls].actions.indexOf(action);
    if (i >= 0) {
      $scope.crafter.stats[cls].actions.splice(i, 1);
    }
    else {
      $scope.crafter.stats[cls].actions.push(action);
    }
  };

  $scope.onTabSelect = function (tab) {
    $scope.currentClass = tab.name;
  };

  $scope.selectNoActions = function (cls) {
    var clsActions = $scope.crafter.stats[cls].actions;
    clsActions.splice(0, clsActions.length);
  };

  $scope.selectAllActions = function (cls) {
    var clsActions = $scope.crafter.stats[cls].actions;
    clsActions.splice(0, clsActions.length);
    for (var i = 0; i < _allActions.length; i++) {
      var action = _allActions[i];
      clsActions.push(action.shortName);
    }
  };

  $scope.selectActionsByLevel = function (cls) {
    var stats = $scope.crafter.stats[cls];
    var actions = [];

    for (var i = 0; i < _allActions.length; i++) {
      var action = _allActions[i];
      var actionClass = action.cls === "All" ? cls : action.cls;
      if (action.level <= $scope.crafter.stats[actionClass].level) {
        actions.push(action.shortName);
      }
    }

    stats.actions = actions;
  };

});
