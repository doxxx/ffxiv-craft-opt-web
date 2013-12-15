'use strict';

/* Controllers */

var controllers = angular.module('ffxivCraftOptWeb.controllers', []);

controllers.controller('MainCtrl', function($scope, $http, $location, $modal, _solverServiceURL, _allClasses, _actionGroups, _allActions) {
  $scope.solverServiceURL = _solverServiceURL;
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
    seed: 1337,
  }

  $scope.simulation = {
  };

  $scope.simulatorRunning = false;
  
  $scope.simulationResult = "";
  
  $scope.solver = {
    penaltyWeight: 10000,
    population: 300,
    generations: 100,
  };

  $scope.simulatorTabs = {
    simulation: { },
    solver: { },
  };

  $scope.solverResult = "";

  $scope.macro = {
    macros: [],
    waitTime: 3,
  };

  loadSettings($scope)

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

  // Web Service API
  
  $scope.runSimulation = function() {
    $scope.simulatorRunning = true;
    var settings = {
      crafter: $scope.currentClassStats,
      recipe: $scope.recipe,
      sequence: $scope.sequence,
      maxTricksUses: $scope.sequenceSettings.maxTricksUses,
      maxMontecarloRuns: $scope.sequenceSettings.maxMontecarloRuns,
      seed: $scope.sequenceSettings.seed,
    };
    $http.post($scope.solverServiceURL + 'simulation', settings).
      success(function(data, status, headers, config) {
        $scope.simulationResult = 'Probabilistic Result\n' +
                                  '====================\n' +
                                  data.probabilisticLog + '\n' +
                                  'Monte Carlo Result\n' +
                                  '==================\n' +
                                  data.monteCarloLog;
        $scope.simulatorTabs.simulation.active = true;
        $scope.simulatorRunning = false;
      }).
      error(function(data, status, headers, config) {
        $scope.simulationResult = "";
        $scope.simulatorTabs.simulation.active = true;
        $scope.simulatorRunning = false;
      });
  }
  
  $scope.runSolver = function() {
    $scope.simulatorRunning = true;
    var settings = {
      crafter: $scope.currentClassStats,
      recipe: $scope.recipe,
      sequence: $scope.sequence,
      maxTricksUses: $scope.sequenceSettings.maxTricksUses,
      maxMontecarloRuns: $scope.sequenceSettings.maxMontecarloRuns,
      seed: $scope.sequenceSettings.seed,
      solver: $scope.solver,
    };
    $http.post($scope.solverServiceURL + 'solver', settings).
      success(function(data, status, headers, config) {
        $scope.solverResult = data.log;
        $scope.sequence = data.bestSequence;
        $scope.simulatorTabs.solver.active = true;
        $scope.simulatorRunning = false;
      }).
      error(function(data, status, headers, config) {
        $scope.solverResult = "";
        $scope.simulatorTabs.solver.active = true;
        $scope.simulatorRunning = false;
      });
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

  return true;
}
