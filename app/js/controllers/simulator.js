"use strict";

angular.module('ffxivCraftOptWeb.controllers').controller('SimulatorController', function ($scope, $filter, $modal,
  $rootScope, $translate, $timeout, $state, _recipeLibrary, _simulator, _actionsByName)
{

  // Global page state
  extend($scope.pageState, {
  });

  // Local page state
  $scope.logTabs = {
    monteCarlo: {active: true},
    probabilistic: {active: false},
    macro: {active: false}
  };

  //
  // RECIPE SEARCH
  //

  $scope.recipeSearch = {
    list: [],
    selected: 0,
    text: '',
    order: ['level','name']
  };

  $scope.$watch('recipeSearch.text', function () {
    $scope.updateRecipeSearchList();
  });

  $scope.$on('recipe.cls.changed', function () {
    $scope.recipeSearch.text = '';
    $scope.updateRecipeSearchList();
  });

  $scope.updateRecipeSearchList = function() {
    $scope.recipeSearch.loading = true;
    var p = _recipeLibrary.recipesForClass($translate.use(), $scope.recipe.cls);
    p.then(function (recipes) {
      $scope.recipeSearch.list = $filter('filter')(recipes, {name: $scope.recipeSearch.text});
      $scope.recipeSearch.selected = Math.min($scope.recipeSearch.selected, $scope.recipeSearch.list.length - 1);
      $scope.recipeSearch.loading = false;
    }, function (err) {
      console.error("Failed to retrieve recipes:", err);
      $scope.recipeSearch.list = [];
      $scope.recipeSearch.selected = -1;
      $scope.recipeSearch.loading = false;
    });
  };

  $rootScope.$on('$translateChangeSuccess', function () {
    $scope.updateRecipeSearchList();
  });

  $scope.recipeSelected = function (name) {
    // force menu to close and search field to lose focus
    // improves behaviour on touch devices
    document.getElementById('recipe-menu-root').closeMenu();
    document.getElementById('recipe-search-text').blur();

    var cls = $scope.recipe.cls;
    var p = angular.copy(_recipeLibrary.recipeForClassByName($translate.use(), cls, name));
    p.then(function (recipe) {
      recipe = angular.copy(recipe);
      recipe.cls = cls;
      recipe.startQuality = 0;
      $scope.$emit('recipe.selected', recipe);
    }, function (err) {
      console.error("Failed to load recipe:", err);
    });
  };

  $scope.onSearchKeyPress = function (event) {
    if (event.which == 13) {
      event.preventDefault();
      $scope.recipeSelected($scope.recipeSearch.list[$scope.recipeSearch.selected].name);
      event.target.parentNode.parentNode.closeMenu();
    }
  };

  $scope.onSearchKeyDown = function (event) {
    if (event.which === 40) {
      // down
      $scope.recipeSearch.selected = Math.min($scope.recipeSearch.selected + 1, $scope.recipeSearch.list.length - 1);
      document.getElementById('recipeSearchElement' + $scope.recipeSearch.selected).scrollIntoViewIfNeeded(false);
    }
    else if (event.which === 38) {
      // up
      $scope.recipeSearch.selected = Math.max($scope.recipeSearch.selected - 1, 0);
      document.getElementById('recipeSearchElement' + $scope.recipeSearch.selected).scrollIntoViewIfNeeded(false);
    }
  };

  //
  // SIMULATION
  //

  $scope.simulatorStatus = {
    monteCarlo: {
      logText: ''
    },
    probabilistic: {
      logText: ''
    },
    running: false
  };

  $scope.$on('simulation.needs.update', function () {
    if ($scope.sequence.length > 0 && $scope.isValidSequence($scope.sequence, $scope.recipe.cls)) {
      $scope.runMonteCarloSim();
    }
    else {
      $scope.simulatorStatus.sequence = null;
      $scope.simulatorStatus.monteCarlo.logText = '';
      $scope.simulatorStatus.probabilistic.logText = '';
      $scope.simulatorStatus.state = null;
      $scope.simulatorStatus.error = null;
    }
  });

  function monteCarloSimSuccess(data) {
    $scope.simulatorStatus.sequence = data.sequence;
    $scope.simulatorStatus.monteCarlo.logText = data.log;
    $scope.simulatorStatus.state = data.state;
    $scope.simulatorStatus.error = null;
    $scope.logTabs.monteCarlo.active = true;

    $scope.runProbabilisticSim();
  }

  function monteCarloSimError(data) {
    $scope.simulatorStatus.sequence = data.sequence;
    $scope.simulatorStatus.monteCarlo.logText = data.log;
    $scope.simulatorStatus.monteCarlo.logText += '\n\nError: ' + data.error;
    $scope.simulatorStatus.state = null;
    $scope.simulatorStatus.error = data.error;
    $scope.logTabs.monteCarlo.active = true;
    $scope.simulatorStatus.running = false;
  }

  $scope.runMonteCarloSim = function () {
    if ($scope.simulatorStatus.running) {
      return;
    }

    var settings = {
      crafter: addCrafterBonusStats($scope.crafter.stats[$scope.recipe.cls], $scope.bonusStats),
      recipe: addRecipeBonusStats($scope.recipe, $scope.bonusStats),
      sequence: $scope.sequence,
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

    $scope.simulatorStatus.running = true;
    _simulator.runMonteCarloSim(settings, monteCarloSimSuccess, monteCarloSimError);
  };

  function probabilisticSimSuccess(data) {
    $scope.simulatorStatus.probabilistic.logText = data.log;
    $scope.simulatorStatus.running = false;
  }

  function probabilisticSimError(data) {
    $scope.simulatorStatus.probabilistic.logText = data.log;
    $scope.simulatorStatus.probabilistic.logText += '\n\nError: ' + data.error;
    $scope.simulatorStatus.running = false;
  }

  $scope.runProbabilisticSim = function () {
    var settings = {
      crafter: addCrafterBonusStats($scope.crafter.stats[$scope.recipe.cls], $scope.bonusStats),
      recipe: addRecipeBonusStats($scope.recipe, $scope.bonusStats),
      sequence: $scope.sequence,
      maxTricksUses: $scope.sequenceSettings.maxTricksUses,
      maxMontecarloRuns: $scope.sequenceSettings.maxMontecarloRuns,
      reliabilityPercent: $scope.sequenceSettings.reliabilityPercent,
      useConditions: $scope.sequenceSettings.useConditions,
      overrideOnCondition: $scope.sequenceSettings.overrideOnCondition,
      debug: $scope.sequenceSettings.debug,
    };

    $scope.simulatorStatus.running = true;
    _simulator.runProbabilisticSim(settings, probabilisticSimSuccess, probabilisticSimError);
  };

  //
  // SEQUENCE EDITOR
  //

  $scope.seqeunceActionClasses = function (action, cls) {
    return {
      'selected-action': $scope.isActionSelected(action, cls),
      'action-cross-class': $scope.isActionCrossClass(action, cls),
      'invalid-action': !$scope.isActionSelected(action, cls)
    }
  };

  $scope.editingSequence = false;

  $scope.$on('sequence.editor.save', function () {
    $scope.editingSequence = false;
    $scope.$broadcast('simulation.needs.update');
  });

  $scope.$on('sequence.editor.cancel', function () {
    $scope.editingSequence = false;
    $scope.$broadcast('simulation.needs.update');
  });

  $scope.$on('sequence.editor.simulation.start', function (event) {
    $scope.simulatorStatus.running = true;
  });

  $scope.$on('sequence.editor.simulation.success', function (event, data) {
    monteCarloSimSuccess(data);
  });

  $scope.$on('sequence.editor.simulation.error', function (event, data) {
    monteCarloSimError(data);
  });

  $scope.$on('sequence.editor.simulation.empty', function () {
    $scope.simulatorStatus.sequence = null;
    $scope.simulatorStatus.monteCarlo.logText = '';
    $scope.simulatorStatus.probabilistic.logText = '';
    $scope.simulatorStatus.state = null;
    $scope.simulatorStatus.error = null;
  });

  $scope.editSequenceInline = function () {
    $scope.editingSequence = true;
    $timeout(function () {
      $scope.$broadcast('sequence.editor.init', $scope.sequence,  $scope.recipe, $scope.crafter.stats[$scope.recipe.cls], $scope.bonusStats, $scope.sequenceSettings);
    });
  };

  //
  // State Transitions
  //

  $scope.goToSolver = function () {
    $state.go('solver', { autoStart: true });
  };


  //
  // Final Initialization
  //

  // Trigger simulation update
  $scope.$broadcast('simulation.needs.update');

});
