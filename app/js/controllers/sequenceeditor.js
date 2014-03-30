"use strict";

var controllers = angular.module('ffxivCraftOptWeb.controllers');

controllers.controller('SequenceEditorCtrl', function($scope, $modalInstance, $http,
    _actionGroups, _allActions, _getActionImagePath, _simulator, origSequence, recipe, crafterStats,
    bonusStats, sequenceSettings)
{
  $scope.actionGroups = _actionGroups;
  $scope.allActions = {};
  for (var i = 0; i < _allActions.length; i++) {
    var action = _allActions[i];
    $scope.allActions[action.shortName] = action;
  }
  $scope.getActionImagePath = _getActionImagePath;
  $scope.sequence = angular.copy(origSequence);
  $scope.availableActions = crafterStats.actions;
  $scope.recipe = recipe;
  $scope.simulationResult = {};

  $scope.$watchCollection('sequence', function() {
    $scope.simulate();
  });

  $scope.isActionSelected = function(action) {
    return $scope.availableActions.indexOf(action) >= 0;
  };

  $scope.actionClasses = function(action, cls) {
    return {
      'action-cross-class': $scope.isActionCrossClass(action, cls),
      'invalid-action': !$scope.isActionSelected(action)
    }
  };

  $scope.isActionCrossClass = function(action, cls) {
    return $scope.allActions[action].cls != 'All' &&
           $scope.allActions[action].cls != cls;
  };

  $scope.actionTooltip = function(action, cls) {
    var info = $scope.allActions[action];
    var tooltip = info.name;
    if (info.cls != 'All' && info.cls != cls) {
      tooltip += ' (' + info.cls + ')';
    }
    return tooltip;
  };

  $scope.sequenceActionTooltip = function(action, cls) {
    var tooltip = $scope.actionTooltip(action, cls);
    if (!$scope.isActionSelected(action, cls)) {
      tooltip += '<br/><b>[Action Not Available]</b>';
    }
    return tooltip;
  };

  $scope.dropAction = function(dragEl, dropEl) {
    var drag = angular.element(dragEl);
    var drop = angular.element(dropEl);
    var newAction = drag.attr('data-new-action');
    var dropIndex = parseInt(drop.attr('data-index'));

    if (newAction) {

      // insert new action into the drop position
      $scope.sequence.splice(dropIndex, 0, newAction);
    }
    else {
      var dragIndex = parseInt(drag.attr('data-index'));

      // do nothing if dropped on itself
      if (dragIndex == dropIndex) return;

      // insert dragged action into the drop position
      $scope.sequence.splice(dropIndex, 0, $scope.sequence[dragIndex]);

      // remove dragged action from its original position
      if (dropIndex > dragIndex) {
        $scope.sequence.splice(dragIndex, 1);
      }
      else {
        $scope.sequence.splice(dragIndex + 1, 1);
      }
    }

    $scope.$apply();
  };

  $scope.addAction = function(action) {
    $scope.sequence.push(action);
  };

  $scope.removeAction = function(index) {
    $scope.sequence.splice(index, 1)
  };

  $scope.isValidSequence = function(sequence, cls) {
    return sequence.every(function(action) {
      return $scope.isActionSelected(action, cls);
    });
  };

  $scope.isSequenceDirty = function() {
    return !angular.equals($scope.sequence, origSequence);
  };

  $scope.simulate = function() {
    var settings = {
      crafter: addBonusStats(crafterStats, bonusStats),
      recipe: recipe,
      sequence: $scope.sequence,
      maxTricksUses: sequenceSettings.maxTricksUses,
      maxMontecarloRuns: sequenceSettings.maxMontecarloRuns
    };
    if (sequenceSettings.specifySeed) {
      settings.seed = sequenceSettings.seed;
    }

    $scope.simulationResult.running = true;
    _simulator.start(settings, $scope.simulationSuccess, $scope.simulationError);
  };

  $scope.simulationSuccess = function(data) {
    $scope.simulationResult.finalState = data.finalState;
    $scope.simulationResult.error = null;
    $scope.simulationResult.running = false;
  };

  $scope.simulationError = function(data) {
    $scope.simulationResult.finalState = null;
    $scope.simulationResult.error = data.error;
    $scope.simulationResult.running = false;
  };

  $scope.clear = function() {
    $scope.sequence = [];
  };

  $scope.revert = function() {
    $scope.sequence = angular.copy(origSequence);
  };

  $scope.save = function() {
    $modalInstance.close($scope.sequence);
  };

  $scope.cancel = function() {
    $modalInstance.dismiss('cancel');
  }
});

var StatBonusEditorCtrl = controllers.controller('StatBonusEditorCtrl', function($scope, $modalInstance, crafter, bonusStats) {
  $scope.crafter = crafter;
  if (bonusStats) {
    $scope.bonusStats = angular.copy(bonusStats);
  }
  else {
    $scope.bonusStats = newBonusStats();
  }

  $scope.clear = function() {
    $scope.bonusStats = newBonusStats();
  };

  $scope.save = function() {
    $modalInstance.close($scope.bonusStats);
  };

  $scope.cancel = function() {
    $modalInstance.dismiss('cancel');
  }
});
