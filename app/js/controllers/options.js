"use strict";

angular.module('ffxivCraftOptWeb.controllers').controller('OptionsController', function ($scope, $modalInstance, pageState, sequenceSettings, solver, macroOptions) {
  $scope.pageState = angular.copy(pageState);
  $scope.sequenceSettings = angular.copy(sequenceSettings);
  $scope.solver = angular.copy(solver);
  $scope.macroOptions = angular.copy(macroOptions);

  $scope.save = function () {
    $modalInstance.close({
      pageState: $scope.pageState,
      sequenceSettings: $scope.sequenceSettings,
      solver: $scope.solver,
      macroOptions: $scope.macroOptions
    });
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  }
});
