(function () {
  'use strict';

  angular
    .module('ffxivCraftOptWeb.controllers')
    .controller('CrafterStatsController', controller);

  function controller($scope, $modal, _actionGroups, _allClasses, _actionsByName, _profile) {
    $scope.crafterActionClasses = crafterActionClasses;
    $scope.toggleAction = toggleAction;
    $scope.onTabSelect = onTabSelect;
    $scope.selectNoActions = selectNoActions;
    $scope.selectAllActions = selectAllActions;
    $scope.showCharImportModal = showCharImportModal;
    $scope.refreshChar = refreshChar;
    $scope.selectActionsByLevel = selectActionsByLevel;

    // Keep list of specialist actions
    var specialistActions = [];
    for (var i = 0; i < _actionGroups.length; i++) {
      var group = _actionGroups[i];
      if (group.name === "Specialist") {
        specialistActions = group.actions;
        break;
      }
    }

    // Initialize tab names and initial active state
    $scope.tabs = [];
    for (var i = 0; i < _allClasses.length; i++) {
      var cls = _allClasses[i];
      $scope.tabs.push({name: cls, active: cls === $scope.recipe.cls});
    }

    $scope.$on('profile.loaded', onProfileLoaded);
    if (_profile.isLoaded()) {
      onProfileLoaded();
    }

    //////////////////////////////////////////////////////////////////////////

    function onProfileLoaded() {
      $scope.character = _profile.getCharacter();
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
      for (var i = 0; i < _actionGroups.length; i++) {
        var actions = _actionGroups[i].actions;
        for (var j = 0; j < actions.length; j++) {
          var action = _actionsByName[actions[j]];
          clsActions.push(action.shortName);
        }
      }
    }

    function showCharImportModal() {
      var modalInstance = $modal.open({
        templateUrl: 'modals/charimport.html',
        controller: 'CharImportController',
        windowClass: 'charimport-modal',
        resolve: {
          server: function () {
            return $scope.character && $scope.character.server || undefined;
          }
        }
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

      $scope.character = {
        id: char.id,
        name: char.name,
        server: char.server
      };

      $scope.profile.setCharacter($scope.character);
    }

    function refreshChar() {
      if (!$scope.character) return;

      $scope.character.refreshing = true;
    }

    function selectActionsByLevel(cls) {
      var stats = $scope.crafter.stats[cls];
      var selectedActions = [];

      for (var i = 0; i < _actionGroups.length; i++) {
        var actions = _actionGroups[i].actions;
        for (var j = 0; j < actions.length; j++) {
          var action = _actionsByName[actions[j]];
          var actionClass = action.cls === "All" ? cls : action.cls;

          // Skip specialist actions if the class is not marked as a specialist
          if (specialistActions.indexOf(action.shortName) >= 0 && !$scope.crafter.stats[actionClass].specialist) {
            continue;
          }

          if (action.level <= $scope.crafter.stats[actionClass].level) {
            selectedActions.push(action.shortName);
          }
        }
      }

      stats.actions = selectedActions;
    }
  }
})();
