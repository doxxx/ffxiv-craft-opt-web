'use strict';

/* Controllers */

var controllers = angular.module('ffxivCraftOptWeb.controllers', []);

controllers.controller('MainCtrl', function($scope, $http, $location, $modal, $document, _getSolverServiceURL, _allClasses, _actionGroups, _allActions) {
  $scope.navBarCollapsed = true;
  
  // variables to track which sections are open
  $scope.sections = {
    synth: {
      open: true, title: 'Synth Details',
      actions: { open: true, title: 'Available Actions' },
    },
    simulator: {
      open: true, title: 'Simulator',
      options: { open: false, title: 'Options' }
    },
    macro: { open: false, title: 'Macro' },
  };
  
  // fields
  $scope.allClasses = _allClasses;
  
  $scope.crafter = {
    cls: $scope.allClasses[0],
    stats: {},
  };

  for (var i = 0; i < _allClasses.length; i++) {
    var c = _allClasses[i];
    $scope.crafter.stats[c] = {
      level: 15,
      craftsmanship: 56,
      control: 67,
      cp: 234,
      actions: [],
    }
  }

  $scope.clsStats = $scope.crafter.stats[$scope.crafter.cls];
  
  $scope.actionGroups = _actionGroups;
  $scope.allActions = {};
  for (var i = 0; i < _allActions.length; i++) {
    var action = _allActions[i];
    $scope.allActions[action.shortName] = action;
  }

  $scope.recipe = {
    level: 12,
    difficulty: 65,
    durability: 60,
    startQuality: 0,
    maxQuality: 456
  };

  $scope.sequence = [ "innerQuiet", "basicTouch", "basicSynth", "basicSynth", "basicSynth", "basicSynth", "basicSynth" ];
  $scope.sequenceSettings = {
    maxTricksUses: 0,
    maxMontecarloRuns: 500,
    specifySeed: false,
    seed: 1337,
  }

  $scope.simulation = {
  };

  $scope.simulatorRunning = false;
  
  $scope.simulationResult = {
    logText: '',
    quality: null,
  };
  
  $scope.solver = {
    penaltyWeight: 10000,
    population: 300,
    generations: 100,
  };

  $scope.simulatorTabs = {
    simulation: { },
    solver: { },
  };

  $scope.solverResult = {
    logText: '',
    sequence: [],
  };

  $scope.macro = {
    macros: [],
    waitTime: 3,
  };

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
  $scope.$watchCollection('sequence', function() {
    saveSettings($scope)
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

  $scope.solverSuccess = function(data, status, headers, config) {
    $scope.solverResult.logText = data.log;
    $scope.solverResult.sequence = data.bestSequence;
    $scope.simulatorTabs.solver.active = true;
    $scope.simulatorRunning = false;
  }

  $scope.solverError = function(data, status, headers, config) {
    $scope.solverResult.logText = data.log;
    $scope.solverResult.logText += '\n\nError: ' + data.error
    $scope.solverResult.sequence = []
    $scope.simulatorTabs.solver.active = true;
    $scope.simulatorRunning = false;
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
    $http.post(_getSolverServiceURL() + 'solver', settings).
      success(success).
      error(error);
  }

  loadSettings($scope)

  $document.ready(function() {
    $scope.runSimulation($scope.simulationSuccess, $scope.simulationError);
  });

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

function saveSettings(scope) {
  if (!supports_html5_storage()) {
    return false;
  }

  localStorage['settings.crafter'] = JSON.stringify(scope.crafter);
  localStorage['settings.recipe'] = JSON.stringify(scope.recipe);
  localStorage['settings.sequence'] = JSON.stringify(scope.sequence);
  localStorage['settings.sequenceSettings'] = JSON.stringify(scope.sequenceSettings);
  localStorage['settings.simulation'] = JSON.stringify(scope.simulation);
  localStorage['settings.solver'] = JSON.stringify(scope.solver);

  return true;
}

function loadSettings(scope) {
  if (!supports_html5_storage()) {
    return false;
  }

  try {
    var crafter = localStorage['settings.crafter'];
    if (crafter) scope.crafter = JSON.parse(crafter);

    var recipe = localStorage['settings.recipe'];
    if (recipe) scope.recipe = JSON.parse(recipe);

    var sequence = localStorage['settings.sequence'];
    if (sequence) scope.sequence = JSON.parse(sequence);

    var sequenceSettings = localStorage['settings.sequenceSettings'];
    if (sequenceSettings) scope.sequenceSettings = JSON.parse(sequenceSettings);

    var simulation = localStorage['settings.simulation'];
    if (simulation) scope.simulation = JSON.parse(simulation);

    var solver = localStorage['settings.solver'];
    if (solver) scope.solver = JSON.parse(solver);
  }
  catch (e) {
    console.log('Could not load settings from local storage', e)
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
