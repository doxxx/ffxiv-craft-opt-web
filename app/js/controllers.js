'use strict';

/* Controllers */

var controllers = angular.module('ffxivCraftOptWeb.controllers', []);

controllers.controller('MainCtrl', function($scope, _allActions) {
  // variables to track which sections are open
  $scope.crafterDetailsOpen = true;
  $scope.recipeDetailsOpen = true;
  $scope.sequenceOpen = true;
  $scope.macroOpen = false;
  
  // fields
  $scope.crafter = {
    level: 15,
    craftsmanship: 56,
    control: 67,
    cp: 234
  };
  $scope.allActions = _allActions;
  $scope.recipeLevel = 12;
  $scope.recipe = {
    level: 12,
    difficulty: 123,
    durability: 60,
    startQuality: 0,
    maxQuality: 456
  };
  $scope.sequence = [ "Inner Quiet", "Basic Touch", "Basic Synthesis" ];
  $scope.macroText = "/cast Action4\
/wait 3\n\
/cast Action2\n\
/wait 3\n\
/cast Action1\n\
/wait 3\n\
/cast Action7\n\
";
});
