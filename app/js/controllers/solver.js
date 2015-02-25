"use strict";

angular.module('ffxivCraftOptWeb.controllers').controller('SolverController', function ($scope, $filter, $modal,
    _recipeLibrary) {

  //
  // RECIPE SEARCH
  //

  $scope.recipeSearch = {
    list: [],
    selected: 0,
    text: '',
    order: ['level','name']
  };

  $scope.$watch('recipeSearch.text', function () {
    $scope.updateRecipeSearchList();
  });

  $scope.$on('recipe.cls.changed', function () {
    $scope.recipeSearch.text = '';
    $scope.updateRecipeSearchList();
  });

  $scope.updateRecipeSearchList = function() {
    var recipesForClass = $scope.recipesForClass($scope.recipe.cls) || [];
    $scope.recipeSearch.list = $filter('filter')(recipesForClass, {name: $scope.recipeSearch.text});
    $scope.recipeSearch.selected = Math.min($scope.recipeSearch.selected, $scope.recipeSearch.list.length - 1);
  };

  $scope.recipesForClass = function (cls) {
    /*var recipes = angular.copy(_recipeLibrary.recipesForClass(cls));
     recipes.sort(function(a,b) { return a.name.localeCompare(b.name); });
     return recipes;*/
    return _recipeLibrary.recipesForClass(cls);
  };

  $scope.recipeSelected = function (name) {
    var cls = $scope.recipe.cls;
    var recipe = angular.copy(_recipeLibrary.recipeForClassByName(cls, name));
    recipe.cls = cls;
    recipe.startQuality = 0;
    $scope.$emit('recipe.selected', recipe);
  };

  $scope.deleteUserRecipe = function (name) {
    _recipeLibrary.deleteUserRecipe($scope.recipe.cls, name);
    $scope.updateRecipeSearchList();
  };

  $scope.onSearchKeyPress = function (event) {
    if (event.which == 13) {
      event.preventDefault();
      $scope.recipeSelected($scope.recipeSearch.list[$scope.recipeSearch.selected].name);
      event.target.parentNode.parentNode.closeMenu();
    }
  };

  $scope.onSearchKeyDown = function (event) {
    if (event.which === 40) {
      // down
      $scope.recipeSearch.selected = Math.min($scope.recipeSearch.selected + 1, $scope.recipeSearch.list.length - 1);
      document.getElementById('recipeSearchElement' + $scope.recipeSearch.selected).scrollIntoViewIfNeeded(false);
    }
    else if (event.which === 38) {
      // up
      $scope.recipeSearch.selected = Math.max($scope.recipeSearch.selected - 1, 0);
      document.getElementById('recipeSearchElement' + $scope.recipeSearch.selected).scrollIntoViewIfNeeded(false);
    }
  };

  $scope.showAddRecipeModal = function () {
    var modalInstance = $modal.open({
      templateUrl: 'partials/add-recipe.html',
      controller: 'AddRecipeController',
      windowClass: 'add-recipe-modal',
      resolve: {
        cls: function() { return $scope.recipe.cls; },
        level: function () { return $scope.crafter.stats[$scope.recipe.cls].level; }
      }
    });
    modalInstance.result.then(function (result) {
      _recipeLibrary.saveUserRecipe(result);
      $scope.updateRecipeSearchList();
    });
  };

  //
  // SEQUENCE EDITOR
  //

  $scope.editingSequence = false;

  $scope.$on('sequence.editor.save', function () {
    $scope.editingSequence = false;
  });

  $scope.$on('sequence.editor.cancel', function () {
    $scope.editingSequence = false;
  });

  $scope.editSequenceInline = function () {
    $scope.editingSequence = true;
    $scope.$broadcast('sequence.editor.init', $scope.sequence,  $scope.recipe, $scope.crafter.stats[$scope.recipe.cls], $scope.bonusStats, $scope.sequenceSettings)
  };

});