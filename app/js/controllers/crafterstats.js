"use strict";

angular.module('ffxivCraftOptWeb.controllers').controller('CrafterStatsController', function ($scope, _allClasses) {
  // Initialize tab names and initial active state
  $scope.tabs = [];
  for (var i = 0; i < _allClasses.length; i++) {
    var cls = _allClasses[i];
    $scope.tabs.push({ name: cls, active: cls === $scope.recipe.cls });
  }

  $scope.toggleAction = function (action) {
    var i = $scope.crafter.stats[$scope.crafter.cls].actions.indexOf(action);
    if (i >= 0) {
      $scope.crafter.stats[$scope.crafter.cls].actions.splice(i, 1);
    }
    else {
      $scope.crafter.stats[$scope.crafter.cls].actions.push(action);
    }
  };

});