"use strict";

angular.module('ffxivCraftOptWeb.controllers')
  .controller('SequenceEditorCtrl',
  function ($scope, $http, $state, _actionGroups, _actionsByName, _simulator, _xivdbtooltips, _getActionImagePath)
  {
    $scope.actionGroups = _actionGroups;
    $scope.allActions = _actionsByName;

    $scope.getActionImagePath = _getActionImagePath;


    $scope.origSequence = [];
    $scope.editSequence = [];
    $scope.availableActions = [];
    $scope.recipe = {};
    $scope.recipeStartWith = {};


    $scope.$on('sequence.editor.init', function (event, origSequence, recipe, crafterStats, bonusStats, sequenceSettings, recipeStartWith) {
      $scope.origSequence = origSequence;
      $scope.editSequence = angular.copy(origSequence);
      $scope.availableActions = crafterStats.actions;
      $scope.recipe = recipe;
      $scope.recipeStartWith = recipeStartWith;

      $scope.unwatchSequence = $scope.$watchCollection('editSequence', function () {
        $scope.$emit('update.sequence', $scope.editSequence);
      });
    });

    $scope.isActionSelected = function (action) {
      return $scope.availableActions.indexOf(action) >= 0;
    };

    $scope.actionTableClasses = function (action, cls) {
      return {
        'action-no-cp': $scope.simulatorStatus.state && (_actionsByName[action].cpCost > $scope.simulatorStatus.state.cp),
        'faded-icon': !$scope.isActionSelected(action)
      };
    };

    $scope.actionClasses = function (action, cls, index) {
      var wastedAction = $scope.simulatorStatus.state && (index + 1 > $scope.simulatorStatus.state.lastStep);
      var cpExceeded = $scope.simulatorStatus.state && (_actionsByName[action].cpCost > $scope.simulatorStatus.state.cp);
      return {
        'faded-icon': !$scope.isActionSelected(action, cls),
        'wasted-action': wastedAction,
        'action-no-cp': wastedAction && cpExceeded
      };
    };

    $scope.isActionCrossClass = function (action, cls) {
      if (!angular.isDefined(action)) {
        console.error('undefined actionName');
        return undefined;
      }
      var info = _actionsByName[action];
      if (!angular.isDefined(info)) {
        console.error('unknown action: %s', action);
        return undefined;
      }
      return info.cls != 'All' &&
             info.cls != cls;
    };

    $scope.actionTooltip = _xivdbtooltips.actionTooltip.bind(_xivdbtooltips);

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

    $scope.clear = function () {
      $scope.editSequence = [];
    };

    $scope.revert = function () {
      $scope.editSequence = angular.copy($scope.origSequence);
    };

    $scope.save = function () {
      $scope.unwatchSequence();
      $scope.$emit('sequence.editor.close');
    };

    $scope.cancel = function () {
      $scope.$emit('update.sequence', $scope.origSequence);

      $scope.unwatchSequence();
      $scope.$emit('sequence.editor.close');
    };

    $scope.$on('$stateChangeStart', function (event) {
      if ($scope.editingSequence && $scope.isSequenceDirty()) {
        if (!window.confirm('Abandon changes to sequence?')) {
          event.preventDefault();
        }
      }
    });
  });
