(function () {
  'use strict';

  angular
    .module('ffxivCraftOptWeb.controllers')
    .controller('CrafterStatsController', controller);

  function controller($scope, $modal, _allClasses, _allActions, _xivdb) {
    $scope.crafterActionClasses = crafterActionClasses;
    $scope.toggleAction = toggleAction;
    $scope.onTabSelect = onTabSelect;
    $scope.selectNoActions = selectNoActions;
    $scope.selectAllActions = selectAllActions;
    $scope.showCharImportModal = showCharImportModal;
    $scope.refreshChar = refreshChar;
    $scope.selectActionsByLevel = selectActionsByLevel;

    // Initialize tab names and initial active state
    $scope.tabs = [];
    for (var i = 0; i < _allClasses.length; i++) {
      var cls = _allClasses[i];
      $scope.tabs.push({name: cls, active: cls === $scope.recipe.cls});
    }

    $scope.$on('profile.loaded', onProfileLoaded);

    onProfileLoaded();

    //////////////////////////////////////////////////////////////////////////

    function onProfileLoaded() {
      $scope.lodestoneID = $scope.profile.getLodestoneID();
    }

    function crafterActionClasses(action, cls) {
      return {
        'faded': !$scope.isActionSelected(action, cls),
      }
    }

    function toggleAction(action, cls) {
      var i = $scope.crafter.stats[cls].actions.indexOf(action);
      if (i >= 0) {
        $scope.crafter.stats[cls].actions.splice(i, 1);
      }
      else {
        $scope.crafter.stats[cls].actions.push(action);
      }
    }

    function onTabSelect(tab) {
      $scope.currentClass = tab.name;
    }

    function selectNoActions(cls) {
      var clsActions = $scope.crafter.stats[cls].actions;
      clsActions.splice(0, clsActions.length);
    }

    function selectAllActions(cls) {
      var clsActions = $scope.crafter.stats[cls].actions;
      clsActions.splice(0, clsActions.length);
      for (var i = 0; i < _allActions.length; i++) {
        var action = _allActions[i];
        clsActions.push(action.shortName);
      }
    }

    function showCharImportModal() {
      var modalInstance = $modal.open({
        templateUrl: 'modals/charimport.html',
        controller: 'CharImportController',
        windowClass: 'charimport-modal'
      });
      modalInstance.result.then(function (result) {
        console.log("import character:", result);
        importCharacter(result);
      });
    }

    function importCharacter(char) {
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
        selectActionsByLevel(cls);
      }

      $scope.lodestoneID = Number(char.id);
      $scope.profile.setLodestoneID($scope.lodestoneID);
    }

    function refreshChar() {
      if (!$scope.lodestoneID) return;

      $scope.refreshing = true;

      _xivdb.getCharacter($scope.lodestoneID).then(function (result) {
        importCharacter(result);
      }, function (err) {
        console.error(err);
      }).finally(function () {
        $scope.refreshing = false;
      });
    }

    function selectActionsByLevel(cls) {
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
    }
  }
})();
