'use strict';

/* Controllers */

var controllers = angular.module('ffxivCraftOptWeb.controllers', []);

controllers.controller('MainCtrl', function($scope, $http, $location, $modal, $document, $timeout, _getSolverServiceURL, _allClasses, _actionGroups, _allActions) {
  $scope.navBarCollapsed = true;
  
  // variables to track which sections are open
  $scope.sections = {
    synth: {
      open: true,
    },
    simulator: {
      open: true,
      options: { open: false, }
    },
    macro: { open: false, },
  };
  
  // provide access to constants
  $scope.allClasses = _allClasses;
  $scope.actionGroups = _actionGroups;

  $scope.allActions = {};
  for (var i = 0; i < _allActions.length; i++) {
    var action = _allActions[i];
    $scope.allActions[action.shortName] = action;
  }

  // non-persistent page states
  $scope.simulatorRunning = false;

  $scope.macro = {
    macros: [],
    waitTime: 3,
  };

  $scope.simulatorTabs = {
    simulation: { },
    solver: { },
  };

  $scope.simulationResult = {
    logText: '',
    finalState: null,
  };

  $scope.solverResult = {
    logText: '',
    sequence: [],
    finalState: null,
  };

  // load/initialize user settings
  loadSettings($scope)

  // watches for automatic updates
  $scope.$watch('crafter.cls', function(newValue, oldValue) {
    $scope.currentClassStats = $scope.crafter.stats[newValue];
  });

  $scope.$watch('sequence', function(newValue, oldValue) {
    $scope.macro.macros = createMacros($scope.allActions, newValue, $scope.macro.waitTime)
  });

  $scope.$watch('macro.waitTime', function(newValue, oldValue) {
    $scope.macro.macros = createMacros($scope.allActions, $scope.sequence, newValue)
  });

  $scope.$watchCollection('crafter', function() {
    saveSettings($scope)
  })

  $scope.$watchCollection('recipe', function() {
    saveSettings($scope)
  })

  $scope.$watchCollection('sequence', function(newValue) {
    saveSettings($scope)
    if (newValue.length > 0) {
      $scope.runSimulation($scope.simulationSuccess, $scope.simulationError)
    }
    else {
      $scope.simulationResult.finalState = null
    }
  })

  $scope.$watchCollection('sequenceSettings', function() {
    saveSettings($scope)
  })

  $scope.$watchCollection('simulation', function() {
    saveSettings($scope)
  })

  $scope.$watchCollection('solver', function() {
    saveSettings($scope)
  })

  // data model interaction functions
  $scope.isActionSelected = function(action) {
    return $scope.currentClassStats.actions.indexOf(action) >= 0;
  }

  $scope.toggleAction = function(action) {
    var i = $scope.currentClassStats.actions.indexOf(action);
    if (i >= 0) {
      $scope.currentClassStats.actions.splice(i, 1);
    }
    else {
      $scope.currentClassStats.actions.push(action);
    }
  };

  $scope.editSequence = function() {
    var modalInstance = $modal.open({
      templateUrl: 'partials/sequence-editor.html',
      controller: 'SequenceEditorCtrl',
      windowClass: 'sequence-editor',
      resolve: {
        origSequence: function() { return $scope.sequence; },
        availableActions: function() { return $scope.currentClassStats.actions; },
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
      crafter: $scope.currentClassStats,
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
    $scope.simulatorRunning = false;
  }

  $scope.solverError = function(data) {
    $scope.solverResult.logText = data.log;
    $scope.solverResult.logText += '\n\nError: ' + data.error
    $scope.solverResult.sequence = []
    $scope.simulatorTabs.solver.active = true;
    $scope.simulatorRunning = false;
  }

  $scope.checkSolverAsync = function(taskID, success, error) {
    $timeout(function() {
      $http.get(_getSolverServiceURL() + "async_solver", {params: {taskID: taskID}}).
        success(function(data) {
          if (data.done) {
            if (data.result.error != null) {
              error(data.result)
            }
            else {
              success(data.result)
            }
          }
          else {
            $scope.checkSolverAsync(taskID, success, error)
          }
        }).
        error(function(data) {
          console.log("Error checking solver_async status: " + data)
        })
    }, 5000)
  }
  
  $scope.runSolver = function(success, error) {
    $scope.simulatorRunning = true;
    $scope.solverResult.sequence = [];
    var settings = {
      crafter: $scope.currentClassStats,
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
        $scope.checkSolverAsync(taskID, success, error)
      }).
      error(error);
  }
});

var SequenceEditorCtrl = controllers.controller('SequenceEditorCtrl', function($scope, $modalInstance, _actionGroups, _allActions, origSequence, availableActions) {
  $scope.actionGroups = _actionGroups;
  $scope.allActions = {};
  for (var i = 0; i < _allActions.length; i++) {
    var action = _allActions[i];
    $scope.allActions[action.shortName] = action;
  }
  $scope.sequence = angular.copy(origSequence);
  $scope.availableActions = availableActions;

  $scope.isActionVisible = function(action) {
    return $scope.availableActions.indexOf(action) >= 0;
  }

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

function supports_html5_storage() {
  try {
    return 'localStorage' in window && window['localStorage'] !== null;
  } catch (e) {
    return false;
  }
}

function saveSettings($scope) {
  if (!supports_html5_storage()) {
    return false;
  }

  localStorage['settings.crafter'] = JSON.stringify($scope.crafter);
  localStorage['settings.recipe'] = JSON.stringify($scope.recipe);
  localStorage['settings.sequence'] = JSON.stringify($scope.sequence);
  localStorage['settings.sequenceSettings'] = JSON.stringify($scope.sequenceSettings);
  localStorage['settings.simulation'] = JSON.stringify($scope.simulation);
  localStorage['settings.solver'] = JSON.stringify($scope.solver);

  return true;
}

function loadSettings($scope) {
  if (!supports_html5_storage()) {
    return false;
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

  var recipe = localStorage['settings.recipe'];
  if (recipe) {
    $scope.recipe = JSON.parse(recipe);
  }
  else {
    $scope.recipe = {
      level: 1,
      difficulty: 9,
      durability: 40,
      startQuality: 0,
      maxQuality: 312,
    };
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
