'use strict';

function recipeForLang(lang, recipe) {
  return {
    name: recipe.name[lang],
    level: recipe.level,
    durability: recipe.durability,
    difficulty: recipe.difficulty,
    maxQuality: recipe.maxQuality
  }
}

var cache = {};

function RecipeLibrary($http, $q) {
  this.$http = $http;
  this.$q = $q;
}

RecipeLibrary.$inject = ['$http', '$q'];

var cache_key = function (lang, cls) {
  return lang + ":" + cls
};

RecipeLibrary.prototype.recipesForClass = function(lang, cls) {
  if (!angular.isDefined(lang)) lang = 'en';
  var key = cache_key(lang, cls);
  var promise = cache[key];
  if (!promise) {
    promise = this.$http.get('../../data/recipedb/' + cls + '.json').then(
      function (r) {
        var result = [];
        for (var i = 0; i < r.data.length; i++) {
          var recipe = r.data[i];
          result.push(recipeForLang(lang, recipe));
        }
        return result;
      }
    );
    cache[key] = promise;
  }

  return promise;
};
RecipeLibrary.prototype.recipeForClassByName = function (lang, cls, name) {
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

angular.module('ffxivCraftOptWeb.services.recipelibrary', []).
  service('_recipeLibrary', RecipeLibrary);
