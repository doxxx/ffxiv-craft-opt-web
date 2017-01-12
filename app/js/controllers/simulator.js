(function () {
  'use strict';

  angular
    .module('ffxivCraftOptWeb.controllers')
    .controller('SimulatorController', controller);

  function controller($scope, $filter, $modal, $rootScope, $translate, $timeout, $state, _recipeLibrary, _simulator,
    _actionsByName, _bonusStats)
  {
    // Global page state
    angular.extend($scope.pageState, {});

    // Local page state
    $scope.logTabs = {
      monteCarlo: {active: true},
      probabilistic: {active: false},
      macro: {active: false}
    };

    //
    // RECIPE SEARCH
    //

    $scope.updateRecipeSearchList = updateRecipeSearchList;
    $scope.recipeSelected = recipeSelected;
    $scope.onSearchKeyPress = onSearchKeyPress;
    $scope.onSearchKeyDown = onSearchKeyDown;

    $scope.recipeSearch = {
      list: [],
      selected: 0,
      text: '',
      order: ['level', 'name']
    };

    $scope.$watch('recipeSearch.text', updateRecipeSearchList);
    $scope.$on('recipe.cls.changed', onRecipeClsChanged);
    $rootScope.$on('$translateChangeSuccess', updateRecipeSearchList);

    //////////////////////////////////////////////////////////////////////////

    function onRecipeClsChanged() {
      $scope.recipeSearch.text = '';
      updateRecipeSearchList();
    }

    function updateRecipeSearchList() {
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
    }

    function recipeSelected(name) {
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
    }

    function onSearchKeyPress(event) {
      if (event.which == 13) {
        event.preventDefault();
        recipeSelected($scope.recipeSearch.list[$scope.recipeSearch.selected].name);
      }
    }

    function onSearchKeyDown(event) {
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
    }

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

    $scope.$on('simulation.needs.update', onSimulationNeedsUpdate);

    // Trigger simulation update when controller is initialized
    $scope.$broadcast('simulation.needs.update');

    //////////////////////////////////////////////////////////////////////////

    function onSimulationNeedsUpdate() {
      if ($scope.sequence.length > 0 && $scope.isValidSequence($scope.sequence, $scope.recipe.cls)) {
        runMonteCarloSim();
      }
      else {
        $scope.simulatorStatus.sequence = null;
        $scope.simulatorStatus.monteCarlo.logText = '';
        $scope.simulatorStatus.probabilistic.logText = '';
        $scope.simulatorStatus.state = null;
        $scope.simulatorStatus.error = null;
      }
    }

    function monteCarloSimSuccess(data) {
      $scope.simulatorStatus.sequence = data.sequence;
      $scope.simulatorStatus.monteCarlo.logText = data.log;
      $scope.simulatorStatus.state = data.state;
      $scope.simulatorStatus.error = null;

      runProbabilisticSim();
    }

    function monteCarloSimError(data) {
      $scope.simulatorStatus.sequence = data.sequence;
      $scope.simulatorStatus.monteCarlo.logText = data.log;
      $scope.simulatorStatus.monteCarlo.logText += '\n\nError: ' + data.error;
      $scope.simulatorStatus.state = null;
      $scope.simulatorStatus.error = data.error;
      $scope.simulatorStatus.running = false;
    }

    function runMonteCarloSim() {
      var settings = {
        crafter: _bonusStats.addCrafterBonusStats($scope.crafter.stats[$scope.recipe.cls], $scope.bonusStats),
        recipe: _bonusStats.addRecipeBonusStats($scope.recipe, $scope.bonusStats),
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
    }

    function probabilisticSimSuccess(data) {
      $scope.simulatorStatus.probabilistic.logText = data.log;
      $scope.simulatorStatus.running = false;
    }

    function probabilisticSimError(data) {
      $scope.simulatorStatus.probabilistic.logText = data.log;
      $scope.simulatorStatus.probabilistic.logText += '\n\nError: ' + data.error;
      $scope.simulatorStatus.running = false;
    }

    function runProbabilisticSim() {
      var settings = {
        crafter: _bonusStats.addCrafterBonusStats($scope.crafter.stats[$scope.recipe.cls], $scope.bonusStats),
        recipe: _bonusStats.addRecipeBonusStats($scope.recipe, $scope.bonusStats),
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
    }

    //
    // SEQUENCE EDITOR
    //

    $scope.seqeunceActionClasses = seqeunceActionClasses;
    $scope.editSequenceInline = editSequenceInline;

    $scope.editingSequence = false;

    $scope.$on('sequence.editor.close', onSequenceEditorClose);

    //////////////////////////////////////////////////////////////////////////

    function onSequenceEditorClose() {
      $scope.editingSequence = false;
    }

    function seqeunceActionClasses(action, cls, index) {
      var wastedAction = $scope.simulatorStatus.state && (index + 1 > $scope.simulatorStatus.state.lastStep);
      var cpExceeded = wastedAction && _actionsByName[action].cpCost > $scope.simulatorStatus.state.cp;
      return {
        'faded-icon': !$scope.isActionSelected(action, cls),
        'wasted-action': wastedAction,
        'action-no-cp': cpExceeded
      };
    }

    function editSequenceInline() {
      $scope.editingSequence = true;
      $timeout(function () {
        $scope.$broadcast('sequence.editor.init', $scope.sequence, $scope.recipe,
          $scope.crafter.stats[$scope.recipe.cls], $scope.bonusStats, $scope.sequenceSettings);
      });
    }

    //
    // State Transitions
    //

    $scope.goToSolver = goToSolver;

    function goToSolver() {
      $state.go('solver', {autoStart: true});
    }
  }
})();
