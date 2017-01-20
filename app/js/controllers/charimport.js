(function () {
  'use strict';

  angular
    .module('ffxivCraftOptWeb.controllers')
    .controller('CharImportController', controller);

  function controller($scope, $modalInstance, _xivdb, server) {
    $scope.search = search;
    $scope.selectResult = selectResult;
    $scope.dismissSearchError = dismissSearchError;
    $scope.importCharacter = importCharacter;
    $scope.cancel = cancel;

    $scope.servers = _xivdb.getServers();
    $scope.searchVars = {
      server: server || $scope.servers[0],
      name: ""
    };
    $scope.searchErrors = [];
    $scope.chars = {};

    //////////////////////////////////////////////////////////////////////////

    function search() {
      $scope.searching = true;
      delete $scope.results;
      delete $scope.selected;

      _xivdb.search($scope.searchVars.name, $scope.searchVars.server).then(function (results) {
        console.log(results);

        $scope.results = results;

        for (var i = 0; i < $scope.results.length; i++) {
          var result = $scope.results[i];
          loadCharacter(result.id);
        }
      }, function (err) {
        $scope.results = null;
        $scope.searchErrors.push(err);
      }).finally(function () {
        $scope.searching = false;
      });
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

    function loadCharacter(id) {
      var promise = _xivdb.getCharacter(id).then(function (char) {
        console.log("Found character data:", char);
        if (angular.equals(char.classes, {})) {
          char.error = "No data"
        }
        $scope.chars[id] = char;
      }, function (err) {
        console.log("No data available for character ID ", id);
        delete $scope.chars[id].loading;
        $scope.chars[id].error = err;
      });

      $scope.chars[id] = {
        loading: promise
      };
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
