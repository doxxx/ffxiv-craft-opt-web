(function () {
  'use strict';

  angular
    .module('ffxivCraftOptWeb.services.recipelibrary', [])
    .service('_recipeLibrary', RecipeLibraryService);

  function RecipeLibraryService($http, $q) {
    this.$http = $http;
    this.$q = $q;
    this.cache = {}
  }

  RecipeLibraryService.$inject = ['$http', '$q'];

  RecipeLibraryService.prototype.recipesForClass = function(lang, cls) {
    if (!angular.isDefined(lang)) lang = 'en';
    var key = cache_key(lang, cls);
    var promise = this.cache[key];
    if (!promise) {
      promise = this.$http.get('data/recipedb/' + cls + '.json').then(
        function (r) {
          var result = r.data.map(recipeForLang.bind(this, lang));
          result.sort(function (a, b) {
            var diff = a.level - b.level;
            if (diff !== 0) return diff;
            if (a.name < b.name) return -1;
            else if (a.name > b.name) return 1;
            return 0;
          });
          return result;
        }
      );
      this.cache[key] = promise;
    }
    return promise;
  };

  RecipeLibraryService.prototype.recipeForClassByName = function (lang, cls, name) {
    if (!angular.isDefined(lang)) lang = 'en';
    return this.recipesForClass(lang, cls).then(
      function (recipes) {
        for (var i = 0; i < recipes.length; i++) {
          var recipe = recipes[i];
          if (recipe.name == name) {
            return recipe;
          }
        }
        return this.$q.reject();
      }.bind(this)
    );
  };

  function recipeForLang(lang, recipe) {
    var r = {};
    for (var p in recipe) {
      if (recipe.hasOwnProperty(p) && p != "name") {
        r[p] = recipe[p];
      }
    }
    r.name = recipe.name[lang];
    return r;
  }

  function cache_key(lang, cls) {
    return lang + ":" + cls
  }
})();
