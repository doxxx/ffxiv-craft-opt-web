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
    level: 15,
    craftsmanship: 56,
    control: 67,
    cp: 234,
    actions: []
  };
  
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
  $scope.maxTricks = 0;

  $scope.simulation = {
    maxMontecarloRuns: 500,
  };

  $scope.simulatorRunning = false;
  
  $scope.simulationResult = "";
  
  $scope.solver = {
    seed: 1337,
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

  $scope.$watch('sequence', function(newValue, oldValue) {
    $scope.macro.macros = createMacros($scope.allActions, newValue, $scope.macro.waitTime)
  });

  $scope.$watch('macro.waitTime', function(newValue, oldValue) {
    $scope.macro.macros = createMacros($scope.allActions, $scope.sequence, newValue)
  });
  
  $scope.isActionSelected = function(action) {
    return $scope.crafter.actions.indexOf(action) >= 0;
  }

  $scope.toggleAction = function(action) {
    var i = $scope.crafter.actions.indexOf(action);
    if (i >= 0) {
      $scope.crafter.actions.splice(i, 1);
    }
    else {
      $scope.crafter.actions.push(action);
    }
  };

  $scope.editSequence = function() {
    var modalInstance = $modal.open({
      templateUrl: 'partials/sequence-editor.html',
      controller: 'SequenceEditorCtrl',
      resolve: {
        origSequence: function() { return $scope.sequence; },
        availableActions: function() { return $scope.crafter.actions; },
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
      crafter: $scope.crafter,
      recipe: $scope.recipe,
      sequence: $scope.sequence,
      maxTricksUses: $scope.maxTricks,
      simulation: $scope.simulation,
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
      crafter: $scope.crafter,
      recipe: $scope.recipe,
      sequence: $scope.sequence,
      maxTricksUses: $scope.maxTricks,
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
