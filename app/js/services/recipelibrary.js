'use strict';

function RecipeLibrary() {
}

RecipeLibrary.prototype.recipesForClass = function(cls) {
  return FFXIV_Recipe_DB[cls];
}

angular.module('ffxivCraftOptWeb.services.recipelibrary', []).
  service('_recipeLibrary', RecipeLibrary)
