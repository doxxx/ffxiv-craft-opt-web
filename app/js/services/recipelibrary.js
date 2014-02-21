'use strict';

function RecipeLibrary() {
}

RecipeLibrary.prototype.recipesForClass = function(cls) {
  return FFXIV_Recipe_DB[cls];
};

RecipeLibrary.prototype.recipeForClassByName = function(cls, name) {
  var recipes = FFXIV_Recipe_DB[cls];
  for (var i = 0; i < recipes.length; i++) {
    var recipe = recipes[i];
    if (recipe.name == name) {
      return recipe;
    }
  }
  return null;
};

angular.module('ffxivCraftOptWeb.services.recipelibrary', []).
  service('_recipeLibrary', RecipeLibrary);
