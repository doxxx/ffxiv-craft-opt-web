"use strict";

angular.module('ffxivCraftOptWeb.controllers').controller('SolverController', function ($scope, $state, $stateParams, _solver, _simulator) {

  // Global page state
  if (!$scope.pageState.solverStatus) {
    extend($scope.pageState, {
      solverStatus: {
        running: false,
        generationsCompleted: 0,
        maxGenerations: 0,
        state: null,
        logs: {
          execution: '',
          ga: '',
          mc: ''
        },
        sequence: [],
        error: null
      }
    });
  }

  // Local page state
  $scope.logTabs = {
    execution: { active: false },
    ga: { active: false },
    mc: { active: true },
    macro: { active: false }
  };

  //
  // SOLVER
  //

  $scope.$on('synth.changed', function () {
    $scope.resetSolver();
  });

  function probabilisticSimSuccess(data) {
    $scope.pageState.solverStatus.logs.ga = data.log;
  }

  function probabilisticSimError(data) {
    $scope.pageState.solverStatus.logs.ga = data.log;
  }

  function runProbabilisticSim(sequence) {
    var settings = {
      crafter: addCrafterBonusStats($scope.crafter.stats[$scope.recipe.cls], $scope.bonusStats),
      recipe: addRecipeBonusStats($scope.recipe, $scope.bonusStats),
      sequence: sequence,
      maxTricksUses: $scope.sequenceSettings.maxTricksUses,
      maxMontecarloRuns: $scope.sequenceSettings.maxMontecarloRuns,
      reliabilityPercent: $scope.sequenceSettings.reliabilityPercent,
      useConditions: $scope.sequenceSettings.useConditions,
      overrideOnCondition: $scope.sequenceSettings.overrideOnCondition,
      debug: $scope.sequenceSettings.debug
    };

    _simulator.runProbabilisticSim(settings, probabilisticSimSuccess, probabilisticSimError);
  }

  function monteCarloSimSuccess(data) {
    $scope.pageState.solverStatus.error = null;
    $scope.pageState.solverStatus.state = data.state;
    $scope.pageState.solverStatus.logs.mc = data.log;

    runProbabilisticSim(data.sequence);
  }

  function monteCarloSimError(data) {
    $scope.pageState.solverStatus.error = data.error;
    $scope.pageState.solverStatus.state = null;
    $scope.pageState.solverStatus.logs.mc = data.log;
  }

  $scope.runMonteCarloSim = function (sequence) {
    var settings = {
      crafter: addCrafterBonusStats($scope.crafter.stats[$scope.recipe.cls], $scope.bonusStats),
      recipe: addRecipeBonusStats($scope.recipe, $scope.bonusStats),
      sequence: sequence,
      maxTricksUses: $scope.sequenceSettings.maxTricksUses,
      maxMontecarloRuns: $scope.sequenceSettings.maxMontecarloRuns,
      reliabilityPercent: $scope.sequenceSettings.reliabilityPercent,
      useConditions: $scope.sequenceSettings.useConditions,
      overrideOnCondition: $scope.sequenceSettings.overrideOnCondition,
      debug: $scope.sequenceSettings.debug
    };

    if ($scope.sequenceSettings.specifySeed) {
      settings.seed = $scope.sequenceSettings.seed;
    }

    _simulator.runMonteCarloSim(settings, monteCarloSimSuccess, monteCarloSimError);
  }

  function solverProgress(data) {
    $scope.pageState.solverStatus.generationsCompleted = data.generationsCompleted;
    $scope.pageState.solverStatus.maxGenerations = data.maxGenerations;
    $scope.pageState.solverStatus.error = null;
    $scope.pageState.solverStatus.state = data.state;
    $scope.pageState.solverStatus.sequence = data.bestSequence;
  }

  function solverSuccess(data) {
    $scope.pageState.solverStatus.running = false;
    $scope.pageState.solverStatus.error = null;
    $scope.pageState.solverStatus.logs.execution = data.executionLog;
    $scope.pageState.solverStatus.sequence = data.bestSequence;

    $scope.runMonteCarloSim(data.bestSequence);
  }

  function solverError(data) {
    $scope.pageState.solverStatus.running = false;

    $scope.pageState.solverStatus.error = data.error;
    $scope.pageState.solverStatus.state = data.state;
    $scope.pageState.solverStatus.logs = data.logs;
    $scope.pageState.solverStatus.sequence = [];
  }

  $scope.startSolver = function () {
    var sequence = $scope.pageState.solverStatus.sequence;
    if (sequence.length === 0) sequence = $scope.sequence;

    var settings = {
      crafter: addCrafterBonusStats($scope.crafter.stats[$scope.recipe.cls], $scope.bonusStats),
      recipe: addRecipeBonusStats($scope.recipe, $scope.bonusStats),
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

    $scope.pageState.solverStatus.logs = {
      setup: '',
      ga: '',
      mc: ''
    };
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
      $scope.$emit('update.sequence', newSeq);
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
