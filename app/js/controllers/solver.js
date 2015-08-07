"use strict";

angular.module('ffxivCraftOptWeb.controllers').controller('SolverController', function ($scope, $state, $stateParams, _solver) {

  // Global page state
  if (!$scope.pageState.solverStatus) {
    extend($scope.pageState, {
      solverStatus: {
        running: false,
        generationsCompleted: 0,
        maxGenerations: 0,
        state: null,
        logText: '',
        sequence: [],
        error: null
      }
    });
  }

  // Local page state
  $scope.logTabs = {
    solver: { active: true }
  };

  //
  // SOLVER
  //

  $scope.$on('synth.changed', function () {
    $scope.resetSolver();
  });

  function solverProgress(data) {
    $scope.pageState.solverStatus.generationsCompleted = data.generationsCompleted;
    $scope.pageState.solverStatus.maxGenerations = data.maxGenerations;
    $scope.pageState.solverStatus.state = data.state;
    $scope.pageState.solverStatus.sequence = data.bestSequence;
  }

  function solverSuccess(data) {
    $scope.pageState.solverStatus.running = false;
    $scope.pageState.solverStatus.state = data.state;
    $scope.pageState.solverStatus.sequence = data.bestSequence;
    $scope.pageState.solverStatus.logText = data.log;

    $scope.logTabs.solver.active = true;
  }

  function solverError(data) {
    $scope.pageState.solverStatus.running = false;

    $scope.pageState.solverStatus.error = data.error;
    $scope.pageState.solverStatus.state = data.state;
    $scope.pageState.solverStatus.logText = data.log;
    $scope.pageState.solverStatus.logText += '\n\nError: ' + data.error;
    $scope.pageState.solverStatus.sequence = [];

    $scope.logTabs.solver.active = true;
  }

  $scope.startSolver = function () {
    var sequence = $scope.pageState.solverStatus.sequence;
    if (sequence.length === 0) sequence = $scope.sequence;

    var settings = {
      crafter: addBonusStats($scope.crafter.stats[$scope.recipe.cls], $scope.bonusStats),
      recipe: $scope.recipe,
      sequence: sequence,
      algorithm: $scope.solver.algorithm,
      maxTricksUses: $scope.sequenceSettings.maxTricksUses,
      maxMontecarloRuns: $scope.sequenceSettings.maxMontecarloRuns,
      reliabilityPercent: $scope.sequenceSettings.reliabilityPercent,
      useConditions: $scope.sequenceSettings.useConditions,
      solver: $scope.solver,
      debug: $scope.sequenceSettings.debug
    };
    if ($scope.sequenceSettings.specifySeed) {
      settings.seed = $scope.sequenceSettings.seed;
    }
    $scope.pageState.solverStatus.running = true;
    _solver.start(settings, solverProgress, solverSuccess, solverError);
  };

  $scope.resetSolver = function() {
    $scope.pageState.solverStatus.error = null;
    $scope.pageState.solverStatus.generationsCompleted = 0;
    $scope.pageState.solverStatus.maxGenerations = $scope.solver.generations;
    $scope.pageState.solverStatus.state = null;

    $scope.pageState.solverStatus.logText = "";
    $scope.pageState.solverStatus.sequence = [];
  };

  $scope.resumeSolver = function() {
    $scope.pageState.solverStatus.running = true;
    _solver.resume();
  };

  $scope.stopSolver = function () {
    _solver.stop();
  };

  $scope.useSolverResult = function () {
    var newSeq = $scope.pageState.solverStatus.sequence;
    if (newSeq instanceof Array && newSeq.length > 0) {
      Array.prototype.splice.apply($scope.sequence, [0, newSeq.length].concat(newSeq));
      $state.go('simulator');
    }
  };

  //
  // State Parameter Handling
  //

  if ($stateParams.autoStart) {
    $scope.resetSolver();
    $scope.startSolver();
  }

});
