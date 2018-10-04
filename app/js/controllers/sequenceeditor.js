(function () {
  'use strict';

  angular
    .module('ffxivCraftOptWeb.controllers')
    .controller('SequenceEditorController', controller);

  function controller($scope, $http, $state, _actionGroups, _actionsByName, _simulator, _getActionImagePath, _iActionClassSpecific, $translate) {
    $scope.actionGroups = _actionGroups;
    $scope.allActions = _actionsByName;
    $scope.getActionImagePath = _getActionImagePath;
    $scope.iActionClassSpecific = _iActionClassSpecific;

    $scope.origSequence = [];
    $scope.editSequence = [];
    $scope.availableActions = [];
    $scope.recipe = {};

    $scope.isActionSelected = isActionSelected;
    $scope.actionTableClasses = actionTableClasses;
    $scope.actionClasses = actionClasses;
    $scope.dropAction = dropAction;
    $scope.addAction = addAction;
    $scope.removeAction = removeAction;
    $scope.isValidSequence = isValidSequence;
    $scope.isSequenceDirty = isSequenceDirty;
    $scope.clear = clear;
    $scope.revert = revert;
    $scope.save = save;
    $scope.cancel = cancel;

    $scope.$on('sequence.editor.init', onSequenceEditorInit);
    $scope.$on('$stateChangeStart', onStateChangeStart);

    //////////////////////////////////////////////////////////////////////////

    function onSequenceEditorInit(event, origSequence, recipe, crafterStats, bonusStats, sequenceSettings) {
      $scope.origSequence = origSequence;
      $scope.editSequence = angular.copy(origSequence);
      $scope.availableActions = crafterStats.actions;
      $scope.recipe = recipe;

      $scope.unwatchSequence = $scope.$watchCollection('editSequence', function () {
        $scope.$emit('update.sequence', $scope.editSequence);
      });
    }

    function onStateChangeStart(event) {
      if ($scope.editingSequence && $scope.isSequenceDirty()) {
        if (!window.confirm($translate.instant('ABANDON_CHANGES'))) {
          event.preventDefault();
        }
      }
    }

    function isActionSelected(action) {
      return $scope.availableActions.indexOf(action) >= 0;
    }

    function actionTableClasses(action, cls) {
      return {
        'action-no-cp': $scope.simulatorStatus.state &&
                        (_actionsByName[action].cpCost > $scope.simulatorStatus.state.cp),
        'faded-icon': !isActionSelected(action)
      };
    }

    function actionClasses(action, cls, index) {
      var wastedAction = $scope.simulatorStatus.state && (index + 1 > $scope.simulatorStatus.state.lastStep);
      var cpExceeded = $scope.simulatorStatus.state && _actionsByName[action].cpCost > $scope.simulatorStatus.state.cp;
      return {
        'faded-icon': !isActionSelected(action, cls),
        'wasted-action': wastedAction,
        'action-no-cp': wastedAction && cpExceeded
      };
    }

    function dropAction(dragEl, dropEl) {
      var drag = angular.element(document.getElementById(dragEl));
      var drop = angular.element(document.getElementById(dropEl));
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
    }

    function addAction(action) {
      $scope.editSequence.push(action);
    }

    function removeAction(index) {
      $scope.editSequence.splice(index, 1)
    }

    function isValidSequence(sequence, cls) {
      return sequence.every(function (action) {
        return isActionSelected(action, cls);
      });
    }

    function isSequenceDirty() {
      return !angular.equals($scope.editSequence, $scope.origSequence);
    }

    function clear() {
      $scope.editSequence = [];
    }

    function revert() {
      $scope.editSequence = angular.copy($scope.origSequence);
    }

    function save() {
      if ($scope.unwatchSequence) {
        $scope.unwatchSequence();
      }

      $scope.$emit('sequence.editor.close');
    }

    function cancel() {
      $scope.$emit('update.sequence', $scope.origSequence);

      if ($scope.unwatchSequence) {
        $scope.unwatchSequence();
      }

      $scope.$emit('sequence.editor.close');
    }
  }

})();
