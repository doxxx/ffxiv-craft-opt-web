(function () {
  'use strict';

  angular
    .module('ffxivCraftOptWeb.controllers')
    .controller('RecipeSearchController', controller);

  function controller($scope, $rootScope, $translate, $filter, _recipeLibrary) {
    $scope.updateRecipeSearchList = updateRecipeSearchList;
    $scope.recipeSelected = recipeSelected;
    $scope.onSearchKeyPress = onSearchKeyPress;
    $scope.onSearchKeyDown = onSearchKeyDown;

    $scope.recipeSearch = {
      loading: false,
      list: [],
      selected: 0,
      text: '',
      order: ['level', 'name']
    };

    $scope.$watch('recipeSearch.text', updateRecipeSearchList);
    $scope.$on('recipe.cls.changed', onRecipeClsChanged);
    $rootScope.$on('$translateChangeSuccess', updateRecipeSearchList);

    //////////////////////////////////////////////////////////////////////////

    function onRecipeClsChanged() {
      $scope.recipeSearch.text = '';
      updateRecipeSearchList();
    }

    function updateRecipeSearchList() {
      $scope.recipeSearch.loading = true;
      var p = _recipeLibrary.recipesForClass($translate.use(), $scope.recipe.cls);
      p.then(function (recipes) {
        // Restrict recipes to crafter level
        recipes = $filter('filter')(recipes, {baseLevel: $scope.crafter.stats[$scope.recipe.cls].level},
          function (recipeLevel, crafterLevel) {
            return !crafterLevel || crafterLevel >= recipeLevel - 5;
          });

        // Then filter on text search, ignoring case and accents
        $scope.recipeSearch.list =
          $filter('filter')(recipes, {name: $scope.recipeSearch.text}, function (recipeName, recipeSearch) {
            if (recipeName === undefined || recipeSearch === undefined)
              return true;

            return recipeName.removeAccent().toUpperCase().indexOf(recipeSearch.removeAccent().toUpperCase()) >= 0;
          });

        $scope.recipeSearch.selected = Math.min($scope.recipeSearch.selected, $scope.recipeSearch.list.length - 1);
        $scope.recipeSearch.loading = false;
      }, function (err) {
        console.error("Failed to retrieve recipes:", err);
        $scope.recipeSearch.list = [];
        $scope.recipeSearch.selected = -1;
        $scope.recipeSearch.loading = false;
      });
    }

    function recipeSelected(name) {
      // force menu to close and search field to lose focus
      // improves behaviour on touch devices
      var root = document.getElementById('recipe-menu-root');
      if (root.closeMenu) { // sometimes it's undefined? why???
        root.closeMenu();
      }
      document.getElementById('recipe-search-text').blur();

      var cls = $scope.recipe.cls;
      var p = angular.copy(_recipeLibrary.recipeForClassByName($translate.use(), cls, name));
      p.then(function (recipe) {
        recipe = angular.copy(recipe);
        recipe.cls = cls;
        recipe.startQuality = 0;
        $scope.$emit('recipe.selected', recipe);
      }, function (err) {
        console.error("Failed to load recipe:", err);
      });
    }

    function onSearchKeyPress(event) {
      if (event.which == 13) {
        event.preventDefault();
        recipeSelected($scope.recipeSearch.list[$scope.recipeSearch.selected].name);
      }
    }

    function onSearchKeyDown(event) {
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
    }
  }

})();
