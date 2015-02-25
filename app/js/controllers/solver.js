"use strict";

angular.module('ffxivCraftOptWeb.controllers').controller('SolverController', function ($scope) {

  //
  // SEQUENCE EDITOR
  //

  $scope.editingSequence = false;

  $scope.$on('sequence.editor.save', function () {
    $scope.editingSequence = false;
  });

  $scope.$on('sequence.editor.cancel', function () {
    $scope.editingSequence = false;
  });

  $scope.editSequenceInline = function () {
    $scope.editingSequence = true;
    $scope.$broadcast('sequence.editor.init', $scope.sequence,  $scope.recipe, $scope.crafter.stats[$scope.recipe.cls], $scope.bonusStats, $scope.sequenceSettings)
  };

});