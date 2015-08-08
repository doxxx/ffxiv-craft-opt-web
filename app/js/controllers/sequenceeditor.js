"use strict";

angular.module('ffxivCraftOptWeb.controllers')
  .controller('SequenceEditorCtrl',
  function ($scope, $http, _actionGroups, _actionsByName, _simulator, _xivdbtooltips)
  {
    $scope.actionGroups = _actionGroups;
    $scope.allActions = _actionsByName;

    $scope.getActionImagePath = function(actionName, cls) {
      return _actionsByName[actionName].imagePaths[cls];
    };


    $scope.origSequence = [];
    $scope.editSequence = [];
    $scope.availableActions = [];
    $scope.recipe = {};
    $scope.bonusStats = {};
    $scope.crafterStats = {};
    $scope.sequenceSettings = {};
    $scope.simulatorStatus = {};


    $scope.$on('sequence.editor.init', function (event, origSequence, recipe, crafterStats, bonusStats, sequenceSettings) {
      $scope.origSequence = origSequence;
      $scope.editSequence = angular.copy(origSequence);
      $scope.availableActions = crafterStats.actions;
      $scope.recipe = recipe;
      $scope.bonusStats = bonusStats;
      $scope.crafterStats = crafterStats;
      $scope.sequenceSettings = sequenceSettings;
      $scope.simulatorStatus = {};

      $scope.unwatchSequence = $scope.$watchCollection('editSequence', function () {
        $scope.simulate();
        $scope.$emit('sequence.changed', $scope.editSequence);
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
      return _xivdbtooltips.actionTooltip(action, cls);
    };

    $scope.dropAction = function (dragEl, dropEl) {
      var drag = angular.element(dragEl);
      var drop = angular.element(dropEl);
      var newAction = drag.attr('data-new-action');
      var dropIndex = parseInt(drop.attr('data-index'));

      if (newAction) {

        // insert new action into the drop position
        $scope.editSequence.splice(dropIndex, 0, newAction);
      }
      else {
        var dragIndex = parseInt(drag.attr('data-index'));

        // do nothing if dropped on itself
        if (dragIndex == dropIndex) return;

        // insert dragged action into the drop position
        $scope.editSequence.splice(dropIndex, 0, $scope.editSequence[dragIndex]);

        // remove dragged action from its original position
        if (dropIndex > dragIndex) {
          $scope.editSequence.splice(dragIndex, 1);
        }
        else {
          $scope.editSequence.splice(dragIndex + 1, 1);
        }
      }

      $scope.$apply();
    };

    $scope.addAction = function (action) {
      $scope.editSequence.push(action);
    };

    $scope.removeAction = function (index) {
      $scope.editSequence.splice(index, 1)
    };

    $scope.isValidSequence = function (sequence, cls) {
      return sequence.every(function (action) {
        return $scope.isActionSelected(action, cls);
      });
    };

    $scope.isSequenceDirty = function () {
      return !angular.equals($scope.editSequence, $scope.origSequence);
    };

    $scope.simulate = function () {
      if ($scope.simulatorStatus.running) {
        return;
      }

      if ($scope.editSequence.length === 0) {
        $scope.$emit('sequence.editor.simulation.empty');
        return;
      }

      var settings = {
        crafter: addCrafterBonusStats($scope.crafterStats, $scope.bonusStats),
        recipe: addRecipeBonusStats($scope.recipe, $scope.bonusStats),
        sequence: $scope.editSequence,
        maxTricksUses: $scope.sequenceSettings.maxTricksUses,
        maxMontecarloRuns: $scope.sequenceSettings.maxMontecarloRuns,
        reliabilityPercent: $scope.sequenceSettings.reliabilityPercent,
        useConditions: $scope.sequenceSettings.useConditions,
        debug: $scope.sequenceSettings.debug
      };

      if ($scope.sequenceSettings.specifySeed) {
        settings.seed = $scope.sequenceSettings.seed;
      }

      $scope.simulatorStatus.running = true;
      $scope.$emit('sequence.editor.simulation.start', $scope.editSequence);
      _simulator.runMonteCarloSim(settings, $scope.simulationSuccess, $scope.simulationError);
    };

    $scope.simulationSuccess = function (data) {
      $scope.simulatorStatus.running = false;

      data.sequence = $scope.editSequence;
      $scope.$emit('sequence.editor.simulation.success', data);
    };

    $scope.simulationError = function (data) {
      $scope.simulatorStatus.running = false;

      data.sequence = $scope.editSequence;
      $scope.$emit('sequence.editor.simulation.error', data);
    };

    $scope.clear = function () {
      $scope.editSequence = [];
    };

    $scope.revert = function () {
      $scope.editSequence = angular.copy($scope.origSequence);
    };

    $scope.save = function () {
      $scope.$emit('sequence.editor.save', $scope.editSequence);

      $scope.unwatchSequence();
    };

    $scope.cancel = function () {
      $scope.$emit('sequence.editor.cancel');

      $scope.unwatchSequence();
    }
  });
