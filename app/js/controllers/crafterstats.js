"use strict";

angular.module('ffxivCraftOptWeb.controllers').controller('CrafterStatsController', function ($scope, $modal, _allClasses, _allActions, _xivsync) {
  // Initialize tab names and initial active state
  $scope.tabs = [];
  for (var i = 0; i < _allClasses.length; i++) {
    var cls = _allClasses[i];
    $scope.tabs.push({ name: cls, active: cls === $scope.recipe.cls });
  }

  $scope.crafterActionClasses = function (action, cls) {
    return {
      'faded': !$scope.isActionSelected(action, cls),
    }
  };

  $scope.toggleAction = function (action, cls) {
    var i = $scope.crafter.stats[cls].actions.indexOf(action);
    if (i >= 0) {
      $scope.crafter.stats[cls].actions.splice(i, 1);
    }
    else {
      $scope.crafter.stats[cls].actions.push(action);
    }
  };

  $scope.onTabSelect = function (tab) {
    $scope.currentClass = tab.name;
  };

  $scope.selectNoActions = function (cls) {
    var clsActions = $scope.crafter.stats[cls].actions;
    clsActions.splice(0, clsActions.length);
  };

  $scope.selectAllActions = function (cls) {
    var clsActions = $scope.crafter.stats[cls].actions;
    clsActions.splice(0, clsActions.length);
    for (var i = 0; i < _allActions.length; i++) {
      var action = _allActions[i];
      clsActions.push(action.shortName);
    }
  };

  $scope.showCharImportModal = function () {
    var modalInstance = $modal.open({
      templateUrl: 'modals/charimport.html',
      controller: 'CharImportController',
      windowClass: 'charimport-modal'
    });
    modalInstance.result.then(function (result) {
      console.log("import character:", result);
      $scope.importCharacter(result);
    });
  };

  $scope.importCharacter = function (char) {
    for (var className in char.classes) {
      if (char.classes.hasOwnProperty(className)) {
        var stats = $scope.crafter.stats[className];
        var newStats = char.classes[className];
        stats.level = newStats.level > 0 ? newStats.level : stats.level;
        stats.craftsmanship = newStats.craftsmanship > 0 ? newStats.craftsmanship : stats.craftsmanship;
        stats.control = newStats.control > 0 ? newStats.control : stats.control;
        stats.cp = newStats.cp > 0 ? newStats.cp : stats.cp;
      }
    }

    for (var i = 0; i < _allClasses.length; i++) {
      var cls = _allClasses[i];
      $scope.selectActionsByLevel(cls);
    }

    $scope.lodestoneID = Number(char.id);
    $scope.profile.setLodestoneID($scope.lodestoneID);
  };

  $scope.refreshChar = function () {
    if (!$scope.lodestoneID) return;

    $scope.refreshing = true;

    _xivsync.getCharacter($scope.lodestoneID).then(function (result) {
      $scope.importCharacter(result);
    }, function (err) {
      console.error(err);
    }).finally(function () {
      $scope.refreshing = false;
    });
  };

  $scope.selectActionsByLevel = function (cls) {
    var stats = $scope.crafter.stats[cls];
    var actions = [];

    for (var i = 0; i < _allActions.length; i++) {
      var action = _allActions[i];
      var actionClass = action.cls === "All" ? cls : action.cls;
      if (action.level <= $scope.crafter.stats[actionClass].level) {
        actions.push(action.shortName);
      }
    }

    stats.actions = actions;
  };

  $scope.$on('profile.loaded', function () {
    $scope.lodestoneID = $scope.profile.getLodestoneID();
  });

  $scope.lodestoneID = $scope.profile.getLodestoneID();
});
