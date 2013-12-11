'use strict';

/* Controllers */

var controllers = angular.module('ffxivCraftOptWeb.controllers', []);

controllers.controller('MainCtrl', function($scope, $http, $location, _allClasses, _actionGroups, _allActions) {
  $scope.navBarCollapsed = true;
  
  // variables to track which sections are open
  $scope.sections = {
    synth: {
      open: true, title: 'Synth Details',
      actions: { open: true, title: 'Available Actions' },
    },
    simulator: { open: true, title: 'Simulator'},
    macro: { open: false, title: 'Macro'},
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
  
  $scope.simulationResult = "";
  
  $scope.solver = {
    seed: 1337,
    penaltyWeight: 10000,
    population: 300,
    generations: 200,
  };
  
  $scope.solverResult = "";

  $scope.macroText = "/cast Action4\
/wait 3\n\
/cast Action2\n\
/wait 3\n\
/cast Action1\n\
/wait 3\n\
/cast Action7\n\
";
  
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
  
  // Web Service API
  
  $scope.runSimulation = function() {
    var settings = {
      crafter: $scope.crafter,
      recipe: $scope.recipe,
      sequence: $scope.sequence,
      maxTricksUses: $scope.maxTricks,
      simulation: $scope.simulation,
    };
    $http.post('http://' + $location.host() + ':8080/simulation', settings).
      success(function(data, status, headers, config) {
        $scope.simulationResult = 'Probabilistic Result\n' +
                                  '====================\n' +
                                  data.probabilisticLog + '\n' +
                                  'Monte Carlo Result\n' +
                                  '==================\n' +
                                  data.monteCarloLog;
      });
  }
  
  $scope.runSolver = function() {
    var settings = {
      crafter: $scope.crafter,
      recipe: $scope.recipe,
      sequence: $scope.sequence,
      maxTricksUses: $scope.maxTricks,
      solver: $scope.solver,
    };
    $http.post('http://' + $location.host() + ':8080/solver', settings).
      success(function(data, status, headers, config) {
        $scope.solverResult = data.log;
      });
  }
  
});
