'use strict';

/* Controllers */

var controllers = angular.module('ffxivCraftOptWeb.controllers', []);

controllers.controller('MainCtrl', function($scope, _allActions) {
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
  $scope.allClasses = [
    "Alchemist",
    "Armorer",
    "Blacksmith",
    "Carpenter",
    "Culinarian",
    "Goldsmith",
    "Leatherworker",
    "Weaver",
  ];
  
  $scope.crafter = {
    cls: $scope.allClasses[0],
    level: 15,
    craftsmanship: 56,
    control: 67,
    cp: 234
  };
  
  $scope.allActions = _allActions;
  $scope.selectedActions = [];

  $scope.recipe = {
    level: 12,
    difficulty: 123,
    durability: 60,
    startQuality: 0,
    maxQuality: 456
  };

  $scope.sequence = [ "Inner Quiet", "Basic Touch", "Basic Synth" ];

  $scope.simulation = {
    maxTricks: 0,
    maxMontecarloRuns: 500,
  };
  
  $scope.solver = {
    seed: 1337,
    penaltyWeight: 10000,
    population: 300,
    generations: 200,
  };

  $scope.macroText = "/cast Action4\
/wait 3\n\
/cast Action2\n\
/wait 3\n\
/cast Action1\n\
/wait 3\n\
/cast Action7\n\
";
  
  $scope.isActionSelected = function(action) {
    return $scope.selectedActions.indexOf(action) >= 0;
  }

  $scope.toggleAction = function(action) {
    var i = $scope.selectedActions.indexOf(action);
    if (i >= 0) {
      $scope.selectedActions.splice(i, 1);
    }
    else {
      $scope.selectedActions.push(action);
    }
  };
  
});
