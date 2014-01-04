'use strict';

/* Controllers */

var controllers = angular.module('ffxivCraftOptWeb.controllers', []);

controllers.controller('MainCtrl', function($scope, $http, $location, $modal, $document, $timeout, _getSolverServiceURL, _allClasses, _actionGroups, _allActions) {
  // provide access to constants
  $scope.allClasses = _allClasses;
  $scope.actionGroups = _actionGroups;

  $scope.allActions = {};
  for (var i = 0; i < _allActions.length; i++) {
    var action = _allActions[i];
    $scope.allActions[action.shortName] = action;
  }

  // non-persistent page states
  $scope.navBarCollapsed = true;

  $scope.simulatorRunning = false;

  $scope.solverStatus = {
    running: false,
    generationsCompleted: 0,
    error: null,
  }

  $scope.macro = {
    macros: [],
    waitTime: 3,
  };

  $scope.simulatorTabs = {
    simulation: { },
    solver: { },
  };

  // load/initialize persistent page state
  loadPageState($scope)

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
  $scope.$watchCollection('sections', function(newValue) {
    savePageState($scope);
  })
  $scope.$watchCollection('savedSettings', function(newValue) {
    localStorage['savedSettings'] = JSON.stringify(newValue);
  });

  $scope.$watch('settings.name', function() {
    savePageState($scope);
  });

  $scope.$watch('sequence', function(newValue, oldValue) {
    $scope.macro.macros = createMacros($scope.allActions, newValue, $scope.macro.waitTime)
  });

  $scope.$watch('macro.waitTime', function(newValue, oldValue) {
    $scope.macro.macros = createMacros($scope.allActions, $scope.sequence, newValue)
  });

  $scope.$watchCollection('crafter', function() {
    savePageState($scope)
  })

  $scope.$watchCollection('bonusStats', function() {
    savePageState($scope)
  })

  for (var cls in $scope.crafter.stats) {
    $scope.$watchCollection('crafter.stats.' + cls, function() {
      savePageState($scope)
    })
  }

  $scope.$watchCollection('recipe', function() {
    savePageState($scope)
  })

  $scope.$watchCollection('sequence', function(newValue) {
    savePageState($scope)
    if (newValue.length > 0) {
      $scope.runSimulation($scope.simulationSuccess, $scope.simulationError)
    }
    else {
      $scope.simulationResult.finalState = null
    }
  })

  $scope.$watchCollection('sequenceSettings', function() {
    savePageState($scope)
  })

  $scope.$watchCollection('simulation', function() {
    savePageState($scope)
  })

  $scope.$watchCollection('simulationResult', function() {
    savePageState($scope)
  })

  $scope.$watchCollection('solver', function() {
    savePageState($scope)
  })

  $scope.$watchCollection('solverResult', function() {
    savePageState($scope)
  })

  // data model interaction functions
  $scope.newSettings = function() {
    $scope.settings.name = '';
    var newRecipe = newRecipeStats($scope);
    newRecipe.cls = $scope.recipe.cls;
    $scope.recipe = newRecipe;
    $scope.bonusStats = newBonusStats();
  }

  $scope.loadSettings = function(name) {
    var settings = $scope.savedSettings[name];

    $scope.bonusStats = angular.copy(settings.bonusStats);
    $scope.recipe = angular.copy(settings.recipe);
    $scope.sequence = angular.copy(settings.sequence);
    $scope.sequenceSettings = angular.copy(settings.sequenceSettings);
    $scope.simulation = angular.copy(settings.simulation);
    $scope.solver = angular.copy(settings.solver);
    $scope.solverResult = angular.copy(settings.solverResult);

    $scope.settings.name = name;
  }

  $scope.saveSettings = function() {
    var settings = {}

    settings.name = $scope.settings.name;
    settings.bonusStats = angular.copy($scope.bonusStats);
    settings.recipe = angular.copy($scope.recipe);
    settings.sequence = angular.copy($scope.sequence);
    settings.sequenceSettings = angular.copy($scope.sequenceSettings);
    settings.simulation = angular.copy($scope.simulation);
    settings.solver = angular.copy($scope.solver);
    settings.solverResult = angular.copy($scope.solverResult);

    $scope.savedSettings[$scope.settings.name] = settings;
  }

  $scope.saveSettingsAs = function() {
    var name = prompt('Enter recipe name:');
    if (name == null || name.length == 0) return;
    $scope.settings.name = name;
    $scope.saveSettings();
  }

  $scope.deleteSettings = function(name) {
    if (confirm('Are you sure you want to delete the "' + name + '" settings?')) {
      delete $scope.savedSettings[name];
      if (name == $scope.settings.name) {
        $scope.settings.name = '';
      }
    }
  }

  $scope.renameSettings = function(name) {
    var newName = prompt('Enter new recipe name:');
    if (newName == null || newName.length == 0) return;
    $scope.savedSettings[newName] = savedSettings[name];
    delete $scope.savedSettings[name];
    if (name == $scope.settings.name) {
      $scope.settings.name = newName;
    }
  }

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
    clean = clean && angular.equals(settings.solverResult, angular.copy($scope.solverResult));

    return !clean;
  }

  $scope.settingsNameForDisplay = function() {
    if ($scope.settings.name == '') {
      return '<unnamed>';
    }
    else {
      return $scope.settings.name;
    }
  }

  $scope.actionTableClasses = function(action, cls) {
    return {
      'selected-action': $scope.isActionSelected(action),
      'action-cross-class': $scope.isActionCrossClass(action, cls)
      }
  }

  $scope.sequenceActionClasses = function(action, cls) {
    return {
      'action-cross-class': $scope.isActionCrossClass(action, cls),
    }
  }

  $scope.isActionSelected = function(action) {
    return $scope.crafter.stats[$scope.crafter.cls].actions.indexOf(action) >= 0;
  }

  $scope.isActionCrossClass = function(action, cls) {
    return $scope.allActions[action].cls != 'All' &&
           $scope.allActions[action].cls != cls;
  }

  $scope.actionTooltip = function(action, cls) {
    var info = $scope.allActions[action];
    var tooltip = info.name;
    if (info.cls != 'All' && info.cls != cls) {
      tooltip += ' (' + info.cls + ')';
    }
    return tooltip;
  }

  $scope.uniqueCrossClassActions = function(sequence, cls) {
    if (typeof sequence == 'undefined') return [];
    var crossClassActions = sequence.filter(function(action) {
      var actionClass = $scope.allActions[action].cls;
      return actionClass != 'All' && actionClass != cls;
    });
    var unique = crossClassActions.unique();
    return unique;
  }

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
        bonusStats: function() { return $scope.bonusStats; },
      },
    });
    modalInstance.result.then(function(result) {
      $scope.bonusStats = angular.copy(result);
    }
    )
  }

  $scope.editSequence = function() {
    var modalInstance = $modal.open({
      templateUrl: 'partials/sequence-editor.html',
      controller: 'SequenceEditorCtrl',
      windowClass: 'sequence-editor',
      resolve: {
        origSequence: function() { return $scope.sequence; },
        availableActions: function() { return $scope.crafter.stats[$scope.crafter.cls].actions; },
        recipe: function() { return $scope.recipe; },
      },
    });
    modalInstance.result.then(
      function(result) {
        $scope.sequence = angular.copy(result)
      }
    )
  }

  $scope.useSolverResult = function() {
    var seq = $scope.solverResult.sequence
    if (seq instanceof Array && seq.length > 0) {
      $scope.sequence = $scope.solverResult.sequence;
    }
  }

  // Web Service API

  $scope.simulationSuccess = function(data, status, headers, config) {
    $scope.simulationResult.logText = data.log;
    $scope.simulationResult.finalState = data.finalState;
    $scope.simulatorTabs.simulation.active = true;
    $scope.simulatorRunning = false;
  }

  $scope.simulationError = function(data, status, headers, config) {
    $scope.simulationResult.logText = data.log;
    $scope.simulationResult.logText += '\n\nError: ' + data.error
    $scope.simulatorTabs.simulation.active = true;
    $scope.simulatorRunning = false;
  }
  
  $scope.runSimulation = function(success, error) {
    if ($scope.sequence.length <= 0) {
      error({log: '', error: 'Must provide non-empty sequence'});
      return;
    }
    $scope.simulatorRunning = true;
    var settings = {
      crafter: addBonusStats($scope.crafter.stats[$scope.recipe.cls], $scope.bonusStats),
      recipe: $scope.recipe,
      sequence: $scope.sequence,
      maxTricksUses: $scope.sequenceSettings.maxTricksUses,
      maxMontecarloRuns: $scope.sequenceSettings.maxMontecarloRuns,
    };
    if ($scope.sequenceSettings.specifySeed) {
      settings.seed = $scope.sequenceSettings.seed;
    }
    $http.post(_getSolverServiceURL() + 'simulation', settings).
      success(success).
      error(error);
  }

  $scope.solverSuccess = function(data) {
    $scope.solverResult.logText = data.log;
    $scope.solverResult.finalState = data.finalState;
    $scope.solverResult.sequence = data.bestSequence;
    $scope.simulatorTabs.solver.active = true;
    $scope.solverStatus.running = false;
  }

  $scope.solverError = function(data) {
    $scope.solverResult.logText = data.log;
    $scope.solverResult.logText += '\n\nError: ' + data.error
    $scope.solverResult.sequence = []
    $scope.simulatorTabs.solver.active = true;
    $scope.solverStatus.running = false;
  }

  $scope.checkSolverProgress = function(taskID, success, error) {
    $timeout(function() {
      $http.get(_getSolverServiceURL() + "async_solver", {params: {taskID: taskID}}).
        success(function(data) {
          $scope.solverStatus.generationsCompleted = data.generationsCompleted;

          if (!data.done) {
            $scope.checkSolverProgress(taskID, success, error);
          }
          else {
            if (data.result.error) {
              $scope.solverStatus.error = data.result.error;
              error(data.result);
            }
            else {
              success(data.result);
            }
          }
        }).
        error(function(data) {
          console.log("Error checking solver_async status: " + data)
          $scope.solverStatus.error = data;
          $scope.solverStatus.running = false;
        })
    }, 2000)
  }
  
  $scope.runSolver = function() {
    $scope.solverStatus.running = true;
    $scope.solverStatus.generationsCompleted = 0;
    $scope.solverResult.sequence = [];
    var settings = {
      crafter: addBonusStats($scope.crafter.stats[$scope.recipe.cls], $scope.bonusStats),
      recipe: $scope.recipe,
      sequence: $scope.sequence,
      maxTricksUses: $scope.sequenceSettings.maxTricksUses,
      maxMontecarloRuns: $scope.sequenceSettings.maxMontecarloRuns,
      solver: $scope.solver,
    };
    if ($scope.sequenceSettings.specifySeed) {
        settings.seed = $scope.sequenceSettings.seed;
    }
    $http.post(_getSolverServiceURL() + 'async_solver', settings).
      success(function(data) {
        var taskID = data.taskID
        $scope.checkSolverProgress(taskID, $scope.solverSuccess, $scope.solverError)
      }).
      error($scope.solverError);
  }
});

var SequenceEditorCtrl = controllers.controller('SequenceEditorCtrl', function($scope, $modalInstance, _actionGroups, _allActions, origSequence, availableActions, recipe) {
  $scope.actionGroups = _actionGroups;
  $scope.allActions = {};
  for (var i = 0; i < _allActions.length; i++) {
    var action = _allActions[i];
    $scope.allActions[action.shortName] = action;
  }
  $scope.sequence = angular.copy(origSequence);
  $scope.availableActions = availableActions;
  $scope.recipe = recipe;

  $scope.isActionVisible = function(action) {
    return $scope.availableActions.indexOf(action) >= 0;
  }

  $scope.sequenceActionClasses = function(action) {
    var crossClass = $scope.allActions[action].cls != 'All' &&
                     $scope.allActions[action].cls != $scope.recipe.cls;

    return {
      'action-cross-class': crossClass,
    }
  }

  $scope.actionTooltip = function(action, cls) {
    var info = $scope.allActions[action];
    var tooltip = info.name;
    if (info.cls != 'All') {
      tooltip += ' (' + info.cls + ')';
    }
    return tooltip;
  }

  $scope.dropAction = function(dragEl, dropEl) {
    var drag = angular.element(dragEl);
    var drop = angular.element(dropEl);
    var newAction = drag.attr('data-new-action');

    if (newAction) {
      var dropIndex = parseInt(drop.attr('data-index'));

      // insert new action into the drop position
      $scope.sequence.splice(dropIndex, 0, newAction);
    }
    else {
      var dragIndex = parseInt(drag.attr('data-index'));
      var dropIndex = parseInt(drop.attr('data-index'));

      // do nothing if dropped on itself
      if (dragIndex == dropIndex) return;

      // insert dragged action into the drop position
      $scope.sequence.splice(dropIndex, 0, $scope.sequence[dragIndex]);

      // remove dragged action from its original position
      if (dropIndex > dragIndex) {
        $scope.sequence.splice(dragIndex, 1);
      }
      else {
        $scope.sequence.splice(dragIndex + 1, 1);
      }
    }

    $scope.$apply();
  };

  $scope.addAction = function(action) {
    $scope.sequence.push(action);
  }

  $scope.removeAction = function(index) {
    $scope.sequence.splice(index, 1)
  }

  $scope.clear = function() {
    $scope.sequence = [];
  }

  $scope.save = function() {
    $modalInstance.close($scope.sequence);
  }

  $scope.cancel = function() {
    $modalInstance.dismiss('cancel');
  }
});

var StatBonusEditorCtrl = controllers.controller('StatBonusEditorCtrl', function($scope, $modalInstance, crafter, bonusStats) {
  $scope.crafter = crafter;
  if (bonusStats) {
    $scope.bonusStats = angular.copy(bonusStats);
  }
  else {
    $scope.bonusStats = newBonusStats();
  }

  $scope.clear = function() {
    $scope.bonusStats = newBonusStats();
  }

  $scope.save = function() {
    $modalInstance.close($scope.bonusStats);
  }

  $scope.cancel = function() {
    $modalInstance.dismiss('cancel');
  }
});

function createMacros(allActions, actions, waitTime, insertTricks) {
  if (typeof actions == 'undefined') {
    return '';
  }

  waitTime = typeof waitTime !== 'undefined' ? waitTime : 3;
  insertTricks = typeof insertTricks !== 'undefined' ? insertTricks : false;

  var maxLines = 14

  var waitString = '/wait ' + waitTime + '\n'
  var lines = [];

  for (var i = 0; i < actions.length; i++) {
    var action = actions[i];
    if (action !== 'tricksOfTheTrade') {
      lines.push('/ac "' + allActions[action].name + '" <me>\n');
      lines.push(waitString);
      if (insertTricks) {
        lines.append('/ac "Tricks of the Trade" <me>=\n')
        lines.push(waitString);
      }
    }
  }

  var macros = []

  var macroString = ''
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];
    macroString += line;
    var step = i + 1;
    if (step % maxLines == 0) {
      macroString += '/echo Macro step ' + step/maxLines + ' complete <se.1>\n';
      macros.push(macroString);
      macroString = '';
    }
  }

  if (macroString !== '') {
    macroString += '/echo Macro step ' + Math.ceil(lines.length/maxLines) + ' complete <se.1>\n';
    macros.push(macroString)
  }

  return macros;
}

function savePageState($scope) {
  localStorage['sections'] = JSON.stringify($scope.sections);
  localStorage['settingsName'] = $scope.settings.name;
  localStorage['settings.crafter'] = JSON.stringify($scope.crafter);
  localStorage['settings.bonusStats'] = JSON.stringify($scope.bonusStats);
  localStorage['settings.recipe'] = JSON.stringify($scope.recipe);
  localStorage['settings.sequence'] = JSON.stringify($scope.sequence);
  localStorage['settings.sequenceSettings'] = JSON.stringify($scope.sequenceSettings);
  localStorage['settings.simulation'] = JSON.stringify($scope.simulation);
  localStorage['settings.simulationResult'] = JSON.stringify($scope.simulationResult);
  localStorage['settings.solver'] = JSON.stringify($scope.solver);
  localStorage['settings.solverResult'] = JSON.stringify($scope.solverResult);

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
      simulatorOptions: false,
      macro: false,
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
      stats: {},
    };

    for (var i = 0; i < $scope.allClasses.length; i++) {
      var c = $scope.allClasses[i];
      $scope.crafter.stats[c] = {
        level: 1,
        craftsmanship: 24,
        control: 0,
        cp: 180,
        actions: ['basicSynth'],
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
      var allRecipes = JSON.parse(localStorage['settings.allRecipes'])
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
      seed: 1337,
    }
  }

  var simulation = localStorage['settings.simulation'];
  if (simulation) {
    $scope.simulation = JSON.parse(simulation);
  }
  else {
    $scope.simulation = {};
  }

  var simulationResult = localStorage['settings.simulationResult'];
  if (simulationResult) {
    $scope.simulationResult = JSON.parse(simulationResult);
  }
  else {
    $scope.simulationResult = {
      logText: '',
      finalState: null,
    };
  }

  var solver = localStorage['settings.solver'];
  if (solver) {
    $scope.solver = JSON.parse(solver);
  }
  else {
    $scope.solver = {
      penaltyWeight: 10000,
      population: 300,
      generations: 100,
    };
  }

  var solverResult = localStorage['settings.solverResult'];
  if (solverResult) {
    $scope.solverResult = JSON.parse(solverResult);
  }
  else {
    $scope.solverResult = {
      logText: '',
      sequence: [],
      finalState: null,
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
}

Array.prototype.unique = function() {
  return this.filter(function(value, index, self) {
    return self.indexOf(value) === index;
  })
}

function newRecipeStats($scope) {
  return {
    cls: $scope.crafter.cls,
    level: 1,
    difficulty: 9,
    durability: 40,
    startQuality: 0,
    maxQuality: 312,
  }
}

function newBonusStats() {
  return {
    craftsmanship: 0,
    control: 0,
    cp: 0,
  }
}

function addBonusStats(crafter, bonusStats) {
  var newStats = angular.copy(crafter);
  newStats.craftsmanship += bonusStats.craftsmanship;
  newStats.control += bonusStats.control;
  newStats.cp += bonusStats.cp;
  return newStats;
}
