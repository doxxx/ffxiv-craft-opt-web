"use strict";

angular.module('ffxivCraftOptWeb.controllers').controller('CrafterStatsController', function ($scope) {

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