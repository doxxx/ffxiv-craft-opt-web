"use strict";

angular.module('ffxivCraftOptWeb.controllers').controller('CharImportController', function ($scope, $modalInstance, $timeout, _xivsync) {
  $scope.servers = _xivsync.getServers();
  $scope.searchVars = {
    server: $scope.servers[0],
    name: ""
  };
  $scope.searchErrors = [];
  $scope.chars = {};

  $scope.search = function () {
    $scope.searching = true;
    delete $scope.results;
    delete $scope.selected;

    _xivsync.search($scope.searchVars.name, $scope.searchVars.server).then(function (results) {
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
  };

  $scope.selectResult = function (index) {
    $scope.selected = index;
    $scope.selectedChar = $scope.chars[$scope.results[index].id];
  };

  $scope.dismissSearchError = function (index) {
    $scope.searchErrors.splice(index, 1);
  };

  $scope.dismissCharError = function (id) {
    delete $scope.chars[id].error;
  };

  $scope.import = function () {
    cancelLoaders();
    $modalInstance.close($scope.selectedChar);
  };

  $scope.cancel = function () {
    cancelLoaders();
    $modalInstance.dismiss('cancel');
  };

  function loadCharacter(id) {
    var promise = _xivsync.getCharacter(id).then(function (char) {
      console.log("Found character data:", char);
      char.ok = true;
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
});
