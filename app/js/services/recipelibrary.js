'use strict';

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

var cache = {};

function RecipeLibrary($http, $q, _localProfile) {
  this.$http = $http;
  this.$q = $q;
  this._localProfile = _localProfile;
}

RecipeLibrary.$inject = ['$http', '$q', '_localProfile'];

var cache_key = function (lang, cls) {
  return lang + ":" + cls
};

RecipeLibrary.prototype.recipesForClass = function(lang, cls) {
  var userRecipes = this._localProfile.getUserRecipes(cls);
  var userRecipesArray = [];
  for (var name in userRecipes) {
    if (userRecipes.hasOwnProperty(name)) {
      var recipe = angular.copy(userRecipes[name]);
      recipe.user = true;
      userRecipesArray.push(recipe);
    }
  }

  if (!angular.isDefined(lang)) lang = 'en';
  var key = cache_key(lang, cls);
  var promise = cache[key];
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
    cache[key] = promise;
  }

  return promise.then(
    function (recipes) {
      return userRecipesArray.concat(recipes);
    }
  );
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

RecipeLibrary.prototype.saveUserRecipe = function (recipe) {
  this._localProfile.saveUserRecipe(recipe);
};

RecipeLibrary.prototype.deleteUserRecipe = function (cls, name) {
  this._localProfile.deleteUserRecipe(cls, name);
};

angular.module('ffxivCraftOptWeb.services.recipelibrary', ['ffxivCraftOptWeb.services.localprofile']).
  service('_recipeLibrary', RecipeLibrary);
