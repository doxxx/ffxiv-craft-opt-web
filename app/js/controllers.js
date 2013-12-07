'use strict';

/* Controllers */

var controllers = angular.module('ffxivCraftOptWeb.controllers', []);

controllers.controller('MainCtrl', function($scope, _allActions) {
  $scope.navBarCollapsed = true;
  
  // variables to track which sections are open
  $scope.sections = {
    crafterDetails: { open: true, title: 'Crafter Details' },
    recipeDetails: { open: true, title: 'Recipe Details' },
    sequence: { open: true, title: 'Sequence'},
    macro: { open: false, title: 'Macro'},
  };
  
  // fields
  $scope.crafter = {
    level: 15,
    craftsmanship: 56,
    control: 67,
    cp: 234
  };
  $scope.allActions = _allActions;
  $scope.selectedActions = [];
  $scope.recipeLevel = 12;
  $scope.recipe = {
    level: 12,
    difficulty: 123,
    durability: 60,
    startQuality: 0,
    maxQuality: 456
  };
  $scope.sequence = [ "Inner Quiet", "Basic Touch", "Basic Synth" ];
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
