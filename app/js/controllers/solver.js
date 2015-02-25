"use strict";

angular.module('ffxivCraftOptWeb.controllers').controller('SolverController', function ($scope, $filter, $modal, $log,
    _recipeLibrary, _simulator) {

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
    var recipesForClass = $scope.recipesForClass($scope.recipe.cls) || [];
    $scope.recipeSearch.list = $filter('filter')(recipesForClass, {name: $scope.recipeSearch.text});
    $scope.recipeSearch.selected = Math.min($scope.recipeSearch.selected, $scope.recipeSearch.list.length - 1);
  };

  $scope.recipesForClass = function (cls) {
    /*var recipes = angular.copy(_recipeLibrary.recipesForClass(cls));
     recipes.sort(function(a,b) { return a.name.localeCompare(b.name); });
     return recipes;*/
    return _recipeLibrary.recipesForClass(cls);
  };

  $scope.recipeSelected = function (name) {
    var cls = $scope.recipe.cls;
    var recipe = angular.copy(_recipeLibrary.recipeForClassByName(cls, name));
    recipe.cls = cls;
    recipe.startQuality = 0;
    $scope.$emit('recipe.selected', recipe);
  };

  $scope.deleteUserRecipe = function (name) {
    _recipeLibrary.deleteUserRecipe($scope.recipe.cls, name);
    $scope.updateRecipeSearchList();
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

  $scope.showAddRecipeModal = function () {
    var modalInstance = $modal.open({
      templateUrl: 'partials/add-recipe.html',
      controller: 'AddRecipeController',
      windowClass: 'add-recipe-modal',
      resolve: {
        cls: function() { return $scope.recipe.cls; },
        level: function () { return $scope.crafter.stats[$scope.recipe.cls].level; }
      }
    });
    modalInstance.result.then(function (result) {
      _recipeLibrary.saveUserRecipe(result);
      $scope.updateRecipeSearchList();
    });
  };

  //
  // SIMULATION
  //

  $scope.simulatorStatus = {
    logText: '',
    running: false
  };

  $scope.$on('simulation.needs.update', function () {
    if ($scope.sequence.length > 0 && $scope.isValidSequence($scope.sequence, $scope.recipe.cls)) {
      $scope.runSimulation();
    }
    else {
      $scope.simulatorStatus.state = null;
      $scope.simulatorStatus.error = null;
    }
  });

  function simulationSuccess(data) {
    $scope.simulatorStatus.sequence = $scope.sequence;
    $scope.simulatorStatus.logText = data.log;
    $scope.simulatorStatus.state = data.state;
    $scope.simulatorStatus.error = undefined;
    $scope.simulatorTabs.simulation.active = true;
    $scope.simulatorStatus.running = false;
  }

  function simulationError(data) {
    $scope.simulatorStatus.sequence = $scope.sequence;
    $scope.simulatorStatus.logText = data.log;
    $scope.simulatorStatus.logText += '\n\nError: ' + data.error;
    $scope.simulatorStatus.state = undefined;
    $scope.simulatorStatus.error = data.error;
    $scope.simulatorTabs.simulation.active = true;
    $scope.simulatorStatus.running = false;
  }

  $scope.runSimulation = function () {
    if ($scope.simulatorStatus.running) {
      return;
    }

    var settings = {
      crafter: addBonusStats($scope.crafter.stats[$scope.recipe.cls], $scope.bonusStats),
      recipe: $scope.recipe,
      sequence: $scope.sequence,
      maxTricksUses: $scope.sequenceSettings.maxTricksUses,
      maxMontecarloRuns: $scope.sequenceSettings.maxMontecarloRuns,
      reliabilityPercent: $scope.sequenceSettings.reliabilityPercent,
      useConditions: $scope.sequenceSettings.useConditions,
      debug: $scope.sequenceSettings.debug
    };

    if ($scope.sequenceSettings.specifySeed) {
      settings.seed = $scope.sequenceSettings.seed;
    }

    $scope.simulatorStatus.running = true;
    _simulator.start(settings, simulationSuccess, simulationError);
  };

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

  // Trigger simulation update
  $scope.$broadcast('simulation.needs.update');

});