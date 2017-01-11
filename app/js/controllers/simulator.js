"use strict";

// Remove Accent from source (ex: ùéèûà will be returned as ueeua).
// Use to compare string without accents
// ---------------------------------------------------
String.prototype.removeAccent = function(){
    var accent = [
            /[\300-\306]/g, /[\340-\346]/g, // A, a
            /[\310-\313]/g, /[\350-\353]/g, // E, e
            /[\314-\317]/g, /[\354-\357]/g, // I, i
            /[\322-\330]/g, /[\362-\370]/g, // O, o
            /[\331-\334]/g, /[\371-\374]/g, // U, u
            /[\321]/g, /[\361]/g, // N, n
            /[\307]/g, /[\347]/g, // C, c
        ],
        noaccent = ['A','a','E','e','I','i','O','o','U','u','N','n','C','c'];

    var str = this;
    for (var i = 0; i < accent.length; i++){
        str = str.replace(accent[i], noaccent[i]);
    }

    return str;
};


angular.module('ffxivCraftOptWeb.controllers').controller('SimulatorController', function ($scope, $filter, $modal,
  $rootScope, $translate, $timeout, $state, _recipeLibrary, _simulator, _actionsByName)
{

  // Global page state
  angular.extend($scope.pageState, {
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
      // Restrict recipes to crafter level
      recipes = $filter('filter')(recipes, {baseLevel: $scope.crafter.stats[$scope.recipe.cls].level},
        function (recipeLevel, crafterLevel) {
          if (!crafterLevel || crafterLevel >= recipeLevel - 5)
            return true;
          return false;
        });

      // Then filter on text search, ignoring case and accents
      $scope.recipeSearch.list =
        $filter('filter')(recipes, {name: $scope.recipeSearch.text}, function (recipeName, recipeSearch) {
          if (recipeName === undefined || recipeSearch === undefined)
            return true;

          return recipeName.removeAccent().toUpperCase().indexOf(recipeSearch.removeAccent().toUpperCase()) >= 0;
        });

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
    var root = document.getElementById('recipe-menu-root');
    if (root.closeMenu) { // sometimes it's undefined? why???
      root.closeMenu();
    }
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
    running: false,
    state: null,
    error: null,
    sequence: null
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

    $scope.runProbabilisticSim();
  }

  function monteCarloSimError(data) {
    $scope.simulatorStatus.sequence = data.sequence;
    $scope.simulatorStatus.monteCarlo.logText = data.log;
    $scope.simulatorStatus.monteCarlo.logText += '\n\nError: ' + data.error;
    $scope.simulatorStatus.state = null;
    $scope.simulatorStatus.error = data.error;
    $scope.simulatorStatus.running = false;
  }

  $scope.runMonteCarloSim = function () {
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

  $scope.seqeunceActionClasses = function (action, cls, index) {
    var wastedAction = $scope.simulatorStatus.state && (index + 1 > $scope.simulatorStatus.state.lastStep);
    var cpExceeded = wastedAction && _actionsByName[action].cpCost > $scope.simulatorStatus.state.cp;
    return {
      'faded-icon': !$scope.isActionSelected(action, cls),
      'wasted-action': wastedAction,
      'action-no-cp': cpExceeded
    };
  };

  $scope.editingSequence = false;

  $scope.$on('sequence.editor.close', function () {
    $scope.editingSequence = false;
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
