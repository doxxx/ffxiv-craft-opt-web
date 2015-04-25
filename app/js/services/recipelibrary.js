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

function RecipeLibrary() {
}

RecipeLibrary.prototype.recipesForClass = function(lang, cls) {
  if (!angular.isDefined(lang)) lang = 'en';
  var recipes = FFXIV_Recipe_DB[cls];
  if (!angular.isDefined(recipes)) return null;
  var result = [];
  for (var i = 0; i < recipes.length; i++) {
    var recipe = recipes[i];
    result.push(recipeForLang(lang, recipe));
  }
  return result;
};

RecipeLibrary.prototype.recipeForClassByName = function(lang, cls, name) {
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

angular.module('ffxivCraftOptWeb.services.recipelibrary', []).
  service('_recipeLibrary', RecipeLibrary);
