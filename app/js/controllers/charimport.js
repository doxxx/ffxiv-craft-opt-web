(function () {
  'use strict';

  angular
    .module('ffxivCraftOptWeb.controllers')
    .controller('CharImportController', controller);

  function controller($scope, $modalInstance, server) {
    $scope.search = search;
    $scope.selectResult = selectResult;
    $scope.dismissSearchError = dismissSearchError;
    $scope.importCharacter = importCharacter;
    $scope.cancel = cancel;

    $scope.searchVars = {
      server: server,
      name: ""
    };
    $scope.searchErrors = [];
    $scope.chars = {};

    //////////////////////////////////////////////////////////////////////////

    function search() {
      $scope.searching = true;
      delete $scope.results;
      delete $scope.selected;
    }

    function selectResult(id) {
      $scope.selected = id;
      $scope.selectedChar = $scope.chars[id];
    }

    function dismissSearchError(index) {
      $scope.searchErrors.splice(index, 1);
    }

    function importCharacter() {
      cancelLoaders();
      $modalInstance.close($scope.selectedChar);
    }

    function cancel() {
      cancelLoaders();
      $modalInstance.dismiss('cancel');
    }

    function cancelLoaders() {
      for (var char in $scope.chars) {
        if ($scope.chars.hasOwnProperty(char)) {
          if (char.loading) {
            char.loading.cancel();
          }
        }
      }
    }
  }

})();
