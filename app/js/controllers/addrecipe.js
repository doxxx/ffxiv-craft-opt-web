"use strict";

angular.module('ffxivCraftOptWeb.controllers').controller('AddRecipeController', function ($scope, $modalInstance, cls, level) {
  $scope.recipe = {
    cls: cls,
    level: level,
    difficulty: 0,
    durability: 0,
    maxQuality: 0
  };

  $scope.save = function () {
    $modalInstance.close($scope.recipe);
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  }
});
