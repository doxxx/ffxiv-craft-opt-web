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

function RecipeLibrary(_localProfile) {
  this._localProfile = _localProfile;
}

RecipeLibrary.prototype.recipesForClass = function(lang, cls) {
  var result = [];
  var recipe;

  var userRecipes = this._localProfile.getUserRecipes(cls);
  for (var name in userRecipes) {
    if (userRecipes.hasOwnProperty(name)) {
      recipe = angular.copy(userRecipes[name]);
      recipe.user = true;
      result.push(recipe);
    }
  }

  if (!angular.isDefined(lang)) lang = 'en';
  var recipes = FFXIV_Recipe_DB[cls];
  if (!angular.isDefined(recipes)) return null;
  for (var i = 0; i < recipes.length; i++) {
    recipe = recipes[i];
    result.push(recipeForLang(lang, recipe));
  }
  return result;
};

RecipeLibrary.prototype.recipeForClassByName = function(lang, cls, name) {
  var userRecipes = this._localProfile.getUserRecipes(cls);
  if (userRecipes.hasOwnProperty(name)) {
    return userRecipes[name];
  }

  if (!angular.isDefined(lang)) lang = 'en';
  var recipes = FFXIV_Recipe_DB[cls];
  if (!angular.isDefined(recipes)) return null;
  for (var i = 0; i < recipes.length; i++) {
    var recipe = recipes[i];
    if (recipe.name[lang] == name) {
      return recipeForLang(lang, recipe);
    }
  }
  return null;
};

RecipeLibrary.prototype.saveUserRecipe = function (recipe) {
  this._localProfile.saveUserRecipe(recipe);
};

RecipeLibrary.prototype.deleteUserRecipe = function (cls, name) {
  this._localProfile.deleteUserRecipe(cls, name);
};

angular.module('ffxivCraftOptWeb.services.recipelibrary', ['ffxivCraftOptWeb.services.localprofile']).
  service('_recipeLibrary', RecipeLibrary);
