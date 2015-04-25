"use strict";

angular.module('ffxivCraftOptWeb.controllers')
  .controller('SequenceEditorCtrl',
  function ($scope, $http, _actionGroups, _actionsByName, _simulator)
  {
    $scope.actionGroups = _actionGroups;
    $scope.allActions = _actionsByName;

    $scope.getActionImagePath = function(actionName, cls) {
      return _actionsByName[actionName].imagePaths[cls];
    };


    $scope.origSequence = [];
    $scope.sequence = [];
    $scope.availableActions = [];
    $scope.recipe = {};
    $scope.bonusStats = {};
    $scope.crafterStats = {};
    $scope.sequenceSettings = {};
    $scope.simulationResult = {};


    $scope.$on('sequence.editor.init', function (event, origSequence, recipe, crafterStats, bonusStats, sequenceSettings) {
      $scope.origSequence = origSequence;
      $scope.sequence = angular.copy(origSequence);
      $scope.availableActions = crafterStats.actions;
      $scope.recipe = recipe;
      $scope.bonusStats = bonusStats;
      $scope.crafterStats = crafterStats;
      $scope.sequenceSettings = sequenceSettings;
      $scope.simulationResult = {};

      $scope.unwatchSequence = $scope.$watchCollection('sequence', function () {
        $scope.simulate();
      });
    });

    $scope.isActionSelected = function (action) {
      return $scope.availableActions.indexOf(action) >= 0;
    };

    $scope.actionClasses = function (action, cls) {
      return {
        'action-cross-class': $scope.isActionCrossClass(action, cls),
        'invalid-action': !$scope.isActionSelected(action)
      }
    };

    $scope.isActionCrossClass = function (action, cls) {
      return $scope.allActions[action].cls != 'All' &&
             $scope.allActions[action].cls != cls;
    };

    $scope.actionTooltip = function (action, cls) {
      var info = $scope.allActions[action];
      var tooltipClass = info.cls;
      if (tooltipClass == 'All') {
        tooltipClass = cls;
      }
      var tooltip = $scope.actionTooltips[tooltipClass + action];
      if (tooltip) return tooltip;
    };

    $scope.sequenceActionTooltip = function (action, cls) {
      var tooltip = $scope.actionTooltip(action, cls);
      // TODO: Find some way to modify the tooltip to show it's unavailable
      //if (!$scope.isActionSelected(action, cls)) {
      //  tooltip += '<br/><b>[Action Not Available]</b>';
      //}
      return tooltip;
    };

    $scope.dropAction = function (dragEl, dropEl) {
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

    $scope.addAction = function (action) {
      $scope.sequence.push(action);
    };

    $scope.removeAction = function (index) {
      $scope.sequence.splice(index, 1)
    };

    $scope.isValidSequence = function (sequence, cls) {
      return sequence.every(function (action) {
        return $scope.isActionSelected(action, cls);
      });
    };

    $scope.isSequenceDirty = function () {
      return !angular.equals($scope.sequence, $scope.origSequence);
    };

    $scope.isSimulationResultOk = function () {
      var state = $scope.simulationResult.state;
      if (!state) return false;
      return state.cpOk && state.durabilityOk && state.progressOk;
    };

    $scope.simulate = function () {
      if ($scope.simulationResult.running) {
        return;
      }
      var settings = {
        crafter: addBonusStats($scope.crafterStats, $scope.bonusStats),
        recipe: $scope.recipe,
        sequence: $scope.sequence,
        maxTricksUses: $scope.sequenceSettings.maxTricksUses,
        maxMontecarloRuns: $scope.sequenceSettings.maxMontecarloRuns
      };
      if ($scope.sequenceSettings.specifySeed) {
        settings.seed = $scope.sequenceSettings.seed;
      }

      $scope.simulationResult.running = true;
      _simulator.start(settings, $scope.simulationSuccess, $scope.simulationError);
      $scope.$emit('sequence.editor.simulation.start', $scope.sequence)
    };

    $scope.simulationSuccess = function (data) {
      $scope.simulationResult.state = data.state;
      $scope.simulationResult.error = undefined;
      $scope.simulationResult.running = false;

      $scope.$emit('sequence.editor.simulation.success', data.state);
    };

    $scope.simulationError = function (data) {
      $scope.simulationResult.state = undefined;
      $scope.simulationResult.error = data.error;
      $scope.simulationResult.running = false;

      $scope.$emit('sequence.editor.simulation.error', data.error);
    };

    $scope.clear = function () {
      $scope.sequence = [];
    };

    $scope.revert = function () {
      $scope.sequence = angular.copy($scope.origSequence);
    };

    $scope.save = function () {
      $scope.$emit('sequence.editor.save', $scope.sequence);

      $scope.unwatchSequence();
    };

    $scope.cancel = function () {
      $scope.$emit('sequence.editor.cancel');

      $scope.unwatchSequence();
    }
  });

