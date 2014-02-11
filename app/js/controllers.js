'use strict';

/* Controllers */

var controllers = angular.module('ffxivCraftOptWeb.controllers', []);

controllers.controller('MainCtrl', function($scope, $http, $location, $modal, $document, $timeout,
                                            _getSolverServiceURL, _allClasses, _actionGroups, _allActions,
                                            _getActionImagePath, _recipeLibrary, _simulator, _solver) {
  // provide access to constants
  $scope.allClasses = _allClasses;
  $scope.actionGroups = _actionGroups;
  $scope.getActionImagePath = _getActionImagePath;

  $scope.allActions = {};
  for (var i = 0; i < _allActions.length; i++) {
    var action = _allActions[i];
    $scope.allActions[action.shortName] = action;
  }

  // non-persistent page states
  $scope.navBarCollapsed = true;

  $scope.simulatorStatus = {
    running: false
  };

  $scope.solverStatus = {
    running: false,
    taskID: null,
    generationsCompleted: 0,
    error: null
  };

  $scope.simulatorTabs = {
    simulation: { },
    solver: { }
  };

  $scope.simulationResult = {
    logText: '',
    finalState: null
  };

  $scope.solverResult = {
    logText: '',
    sequence: [],
    finalState: null
  };

  // load/initialize persistent page state
  loadPageState($scope);

  // load saved settings
  $scope.savedSettings = JSON.parse(localStorage['savedSettings'] || '{}');

  // Add missing name field to old settings
  for (var name in $scope.savedSettings) {
    var s = $scope.savedSettings[name];
    if (s.name == null) {
      s.name = name;
    }
  }

  // watches for automatic updates and saving settings
  $scope.$watchCollection('sections', function() {
    savePageState($scope);
  });
  $scope.$watchCollection('savedSettings', function(newValue) {
    localStorage['savedSettings'] = JSON.stringify(newValue);
  });

  function saveAndRerunSim() {
    savePageState($scope);
    if ($scope.sequence.length > 0 && $scope.isValidSequence($scope.sequence, $scope.recipe.cls)) {
      $scope.runSimulation();
    }
    else {
      $scope.simulationResult.finalState = null
    }
  }

  $scope.$watch('settings.name', function() {
    savePageState($scope);
  });

  $scope.$watchCollection('crafter', saveAndRerunSim);

  $scope.$watchCollection('bonusStats', saveAndRerunSim);

  for (var cls in $scope.crafter.stats) {
    $scope.$watchCollection('crafter.stats.' + cls, saveAndRerunSim);
    $scope.$watchCollection('crafter.stats.' + cls + '.actions', saveAndRerunSim);
  }

  $scope.$watchCollection('recipe', saveAndRerunSim);

  $scope.$watchCollection('sequence', saveAndRerunSim);

  $scope.$watchCollection('sequenceSettings', saveAndRerunSim);

  $scope.$watchCollection('simulation', saveAndRerunSim);

  $scope.$watchCollection('solver', function() {
    savePageState($scope);
  });

  // data model interaction functions
  $scope.recipesForClass = function(cls) {
    /*var recipes = angular.copy(_recipeLibrary.recipesForClass(cls));
    recipes.sort(function(a,b) { return a.name.localeCompare(b.name); });
    return recipes;*/
    return _recipeLibrary.recipesForClass(cls);
  };

  $scope.importRecipe = function(name) {
    var cls = $scope.recipe.cls;
    $scope.recipe = angular.copy(_recipeLibrary.recipeForClassByName(cls, name));
    $scope.recipe.cls = cls;
    $scope.recipe.startQuality = 0;
  };

  $scope.newSettings = function() {
    $scope.settings.name = '';
    var newRecipe = newRecipeStats($scope);
    newRecipe.cls = $scope.recipe.cls;
    $scope.recipe = newRecipe;
    $scope.bonusStats = newBonusStats();
  };

  $scope.loadSettings = function(name) {
    var settings = $scope.savedSettings[name];

    $scope.bonusStats = angular.copy(settings.bonusStats);
    $scope.recipe = angular.copy(settings.recipe);
    $scope.sequence = angular.copy(settings.sequence);
    $scope.sequenceSettings = angular.copy(settings.sequenceSettings);
    $scope.simulation = angular.copy(settings.simulation);
    $scope.solver = angular.copy(settings.solver);
    $scope.solverResult = {
      logText: '',
      sequence: [],
      finalState: null
    };

    $scope.settings.name = name;
  };

  $scope.saveSettings = function() {
    var settings = {};

    settings.bonusStats = angular.copy($scope.bonusStats);
    settings.recipe = angular.copy($scope.recipe);
    settings.sequence = angular.copy($scope.sequence);
    settings.sequenceSettings = angular.copy($scope.sequenceSettings);
    settings.simulation = angular.copy($scope.simulation);
    settings.solver = angular.copy($scope.solver);

    $scope.savedSettings[$scope.settings.name] = settings;
  };

  $scope.saveSettingsAs = function() {
    var name = prompt('Enter recipe name:');
    if (name == null || name.length == 0) return;
    $scope.settings.name = name;
    $scope.saveSettings();
  };

  $scope.deleteSettings = function(name) {
    if (confirm('Are you sure you want to delete the "' + name + '" settings?')) {
      delete $scope.savedSettings[name];
      if (name == $scope.settings.name) {
        $scope.settings.name = '';
      }
    }
  };

  $scope.renameSettings = function(name) {
    var newName = prompt('Enter new recipe name:');
    if (newName == null || newName.length == 0) return;
    $scope.savedSettings[newName] = $scope.savedSettings[name];
    delete $scope.savedSettings[name];
    if (name == $scope.settings.name) {
      $scope.settings.name = newName;
    }
  };

  $scope.areSettingsDirty = function() {
    if ($scope.settings.name == '') {
      return false;
    }

    var settings = $scope.savedSettings[$scope.settings.name];
    var clean = true;

    clean = clean && angular.equals(settings.bonusStats, angular.copy($scope.bonusStats));
    clean = clean && angular.equals(settings.recipe, angular.copy($scope.recipe));
    clean = clean && angular.equals(settings.sequence, angular.copy($scope.sequence));
    clean = clean && angular.equals(settings.sequenceSettings, angular.copy($scope.sequenceSettings));
    clean = clean && angular.equals(settings.simulation, angular.copy($scope.simulation));
    clean = clean && angular.equals(settings.solver, angular.copy($scope.solver));

    return !clean;
  };

  $scope.settingsNameForDisplay = function() {
    if ($scope.settings.name == '') {
      return '<unnamed>';
    }
    else {
      return $scope.settings.name;
    }
  };

  $scope.actionClasses = function(action, cls) {
    return {
      'selected-action': $scope.isActionSelected(action, cls),
      'action-cross-class': $scope.isActionCrossClass(action, cls),
      'invalid-action': !$scope.isActionSelected(action, cls)
    }
  };

  $scope.isActionSelected = function(action, cls) {
    return $scope.crafter.stats[cls].actions.indexOf(action) >= 0;
  };

  $scope.isActionCrossClass = function(action, cls) {
    return $scope.allActions[action].cls != 'All' &&
           $scope.allActions[action].cls != cls;
  };

  $scope.isValidSequence = function(sequence, cls) {
    return sequence.every(function(action) {
      return $scope.isActionSelected(action, cls);
    });
  };

  $scope.actionTooltip = function(action, cls) {
    var info = $scope.allActions[action];
    var tooltip = info.name;
    if (info.cls != 'All' && info.cls != cls) {
      tooltip += ' (' + info.cls + ')';
    }
    return tooltip;
  };

  $scope.sequenceActionTooltip = function(action, cls) {
    var tooltip = $scope.actionTooltip(action, cls);
    if (!$scope.isActionSelected(action, cls)) {
      tooltip += '<br/><b>[Action Not Available]</b>';
    }
    return tooltip;
  };

  $scope.uniqueCrossClassActions = function(sequence, cls) {
    if (typeof sequence == 'undefined') return [];
    var crossClassActions = sequence.filter(function(action) {
      var actionClass = $scope.allActions[action].cls;
      return actionClass != 'All' && actionClass != cls;
    });
    return crossClassActions.unique();
  };

  $scope.toggleAction = function(action) {
    var i = $scope.crafter.stats[$scope.crafter.cls].actions.indexOf(action);
    if (i >= 0) {
      $scope.crafter.stats[$scope.crafter.cls].actions.splice(i, 1);
    }
    else {
      $scope.crafter.stats[$scope.crafter.cls].actions.push(action);
    }
  };

  $scope.showStatBonusesModal = function() {
    var modalInstance = $modal.open({
      templateUrl: 'partials/stat-bonus-editor.html',
      controller: 'StatBonusEditorCtrl',
      windowClass: 'stat-bonus-editor',
      resolve: {
        crafter: function() { return $scope.crafter; },
        bonusStats: function() { return $scope.bonusStats; }
      }
    });
    modalInstance.result.then(function(result) {
      $scope.bonusStats = angular.copy(result);
    });
  };

  $scope.editSequence = function() {
    var modalInstance = $modal.open({
      templateUrl: 'partials/sequence-editor.html',
      controller: 'SequenceEditorCtrl',
      windowClass: 'sequence-editor',
      resolve: {
        origSequence: function() { return $scope.sequence; },
        recipe: function() { return $scope.recipe; },
        crafterStats: function() { return $scope.crafter.stats[$scope.recipe.cls]; },
        bonusStats: function() { return $scope.bonusStats; },
        sequenceSettings: function() { return $scope.sequenceSettings; }
      }
    });
    modalInstance.result.then(function(result) {
      $scope.sequence = angular.copy(result)
    });
  };

  $scope.showMacroModal = function() {
    $modal.open({
      templateUrl: 'partials/macro.html',
      controller: 'MacroCtrl',
      windowClass: 'macro-modal',
      resolve: {
        allActions: function() { return $scope.allActions; },
        sequence: function() { return $scope.sequence; }
      }
    });
  };

  $scope.useSolverResult = function() {
    var seq = $scope.solverResult.sequence;
    if (seq instanceof Array && seq.length > 0) {
      $scope.sequence = $scope.solverResult.sequence;
    }
  };

  // Web Service API

  $scope.simulationSuccess = function(data) {
    $scope.simulationResult.logText = data.log;
    $scope.simulationResult.finalState = data.finalState;
    $scope.simulatorTabs.simulation.active = true;
    $scope.simulatorStatus.running = false;
  };

  $scope.simulationError = function(data) {
    $scope.simulationResult.logText = data.log;
    $scope.simulationResult.logText += '\n\nError: ' + data.error;
    $scope.simulatorTabs.simulation.active = true;
    $scope.simulatorStatus.running = false;
  };

  $scope.runSimulation = function() {
    var settings = {
      crafter: addBonusStats($scope.crafter.stats[$scope.recipe.cls], $scope.bonusStats),
      recipe: $scope.recipe,
      sequence: $scope.sequence,
      maxTricksUses: $scope.sequenceSettings.maxTricksUses,
      maxMontecarloRuns: $scope.sequenceSettings.maxMontecarloRuns
    };
    if ($scope.sequenceSettings.specifySeed) {
      settings.seed = $scope.sequenceSettings.seed;
    }

    _simulator.start($scope.sequence, settings, $scope.simulationSuccess, $scope.simulationError);
    $scope.simulatorStatus.running = true;
  };

  $scope.solverProgress = function(data) {
    $scope.solverStatus.generationsCompleted = data.generationsCompleted;
    $scope.solverStatus.bestState = data.bestState;
  };

  $scope.solverSuccess = function(data) {
    $scope.solverResult.logText = data.log;
    $scope.solverResult.finalState = data.finalState;
    $scope.solverResult.sequence = data.bestSequence;
    $scope.simulatorTabs.solver.active = true;
    $scope.solverStatus.running = false;
    $scope.solverStatus.generationsCompleted = 0;
  };

  $scope.solverError = function(data) {
    $scope.solverStatus.error = data.error;
    $scope.solverResult.logText = data.log;
    $scope.solverResult.logText += '\n\nError: ' + data.error;
    $scope.solverResult.sequence = [];
    $scope.simulatorTabs.solver.active = true;
    $scope.solverStatus.running = false;
    $scope.solverStatus.generationsCompleted = 0;
  };

  $scope.runSolver = function() {
    $scope.solverStatus.generationsCompleted = 0;
    $scope.solverResult.sequence = [];
    var settings = {
      crafter: addBonusStats($scope.crafter.stats[$scope.recipe.cls], $scope.bonusStats),
      recipe: $scope.recipe,
      sequence: $scope.sequence,
      maxTricksUses: $scope.sequenceSettings.maxTricksUses,
      maxMontecarloRuns: $scope.sequenceSettings.maxMontecarloRuns,
      solver: $scope.solver
    };
    if ($scope.sequenceSettings.specifySeed) {
        settings.seed = $scope.sequenceSettings.seed;
    }
    _solver.start($scope.sequence, settings, $scope.solverProgress, $scope.solverSuccess, $scope.solverError);
    $scope.solverStatus.running = true;
  };

  $scope.stopSolver = function() {
    _solver.stop();
    $scope.solverStatus.error = "cancelled";
    $scope.solverResult.logText = "";
    $scope.solverResult.sequence = [];
    $scope.solverStatus.running = false;
    $scope.solverStatus.generationsCompleted = 0;
  }
});

function savePageState($scope) {
  localStorage['sections'] = JSON.stringify($scope.sections);
  localStorage['settingsName'] = $scope.settings.name;
  localStorage['settings.crafter'] = JSON.stringify($scope.crafter);
  localStorage['settings.bonusStats'] = JSON.stringify($scope.bonusStats);
  localStorage['settings.recipe'] = JSON.stringify($scope.recipe);
  localStorage['settings.sequence'] = JSON.stringify($scope.sequence);
  localStorage['settings.sequenceSettings'] = JSON.stringify($scope.sequenceSettings);
  localStorage['settings.simulation'] = JSON.stringify($scope.simulation);
  localStorage['settings.solver'] = JSON.stringify($scope.solver);

  return true;
}

function loadPageState($scope) {
  var sections = localStorage['sections'];
  if (sections) {
    $scope.sections = JSON.parse(sections);
  }
  else {
    $scope.sections = {
      crafter: true,
      synth: true,
      simulator: true,
      simulatorOptions: false
    };
  }

  var settingsName = localStorage['settingsName'];
  if (settingsName) {
    $scope.settings = { name: settingsName };
  }
  else {
    $scope.settings = { name: '' };
  }

  var crafter = localStorage['settings.crafter'];
  if (crafter) {
    $scope.crafter = JSON.parse(crafter);
  }
  else {
    $scope.crafter = {
      cls: $scope.allClasses[0],
      stats: {}
    };

    for (var i = 0; i < $scope.allClasses.length; i++) {
      var c = $scope.allClasses[i];
      $scope.crafter.stats[c] = {
        level: 1,
        craftsmanship: 24,
        control: 0,
        cp: 180,
        actions: ['basicSynth']
      }
    }
  }

  var bonusStats = localStorage['settings.bonusStats'];
  if (bonusStats) {
    $scope.bonusStats = JSON.parse(bonusStats);
  }
  else {
    $scope.bonusStats = newBonusStats();
  }

  var recipe = localStorage['settings.recipe'];
  if (recipe) {
    recipe = JSON.parse(recipe);

    // convert previously selected saved recipe
    if (recipe.current) {
      var allRecipes = JSON.parse(localStorage['settings.allRecipes']);
      recipe = allRecipes[recipe.current];
    }

    $scope.recipe = recipe;
  }
  else {
    $scope.recipe = newRecipeStats($scope);
  }

  var sequence = localStorage['settings.sequence'];
  if (sequence) {
    $scope.sequence = JSON.parse(sequence);
  }
  else {
    $scope.sequence = [ ];
  }

  var sequenceSettings = localStorage['settings.sequenceSettings'];
  if (sequenceSettings) {
    $scope.sequenceSettings = JSON.parse(sequenceSettings);
  }
  else {
    $scope.sequenceSettings = {
      maxTricksUses: 0,
      maxMontecarloRuns: 500,
      specifySeed: false,
      seed: 1337
    }
  }

  var simulation = localStorage['settings.simulation'];
  if (simulation) {
    $scope.simulation = JSON.parse(simulation);
  }
  else {
    $scope.simulation = {};
  }

  var solver = localStorage['settings.solver'];
  if (solver) {
    $scope.solver = JSON.parse(solver);
  }
  else {
    $scope.solver = {
      penaltyWeight: 10000,
      population: 300,
      generations: 100
    };
  }

  // cleanup old storage
  if (localStorage['settings.allRecipes']) {
    delete localStorage['settings.allRecipes'];
  }

  return true;
}

// attach the .equals method to Array's prototype to call it on any array
Array.prototype.equals = function (array) {
    // if the other array is a falsy value, return
    if (!array)
        return false;

    // compare lengths - can save a lot of time
    if (this.length != array.length)
        return false;

    for (var i = 0, l=this.length; i < l; i++) {
        // Check if we have nested arrays
        if (this[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!this[i].compare(array[i]))
                return false;
        }
        else if (this[i] != array[i]) {
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;
        }
    }
    return true;
};

Array.prototype.unique = function() {
  return this.filter(function(value, index, self) {
    return self.indexOf(value) === index;
  })
};

function newRecipeStats($scope) {
  return {
    cls: $scope.crafter.cls,
    level: 1,
    difficulty: 9,
    durability: 40,
    startQuality: 0,
    maxQuality: 312
  }
}

function newBonusStats() {
  return {
    craftsmanship: 0,
    control: 0,
    cp: 0
  }
}

function addBonusStats(crafter, bonusStats) {
  var newStats = angular.copy(crafter);
  newStats.craftsmanship += bonusStats.craftsmanship;
  newStats.control += bonusStats.control;
  newStats.cp += bonusStats.cp;
  return newStats;
}
