"use strict";

angular.module('ffxivCraftOptWeb.controllers')
  .controller('StatBonusEditorCtrl', function ($scope, $modalInstance, crafter, bonusStats) {
    $scope.crafter = crafter;
    if (bonusStats) {
      $scope.bonusStats = angular.copy(bonusStats);
    }
    else {
      $scope.bonusStats = newBonusStats();
    }

    $scope.clear = function () {
      $scope.bonusStats = newBonusStats();
    };

    $scope.save = function () {
      $modalInstance.close($scope.bonusStats);
    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    }
  });
