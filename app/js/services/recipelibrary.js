'use strict';

function RecipeLibrary(_localProfile) {
  this._localProfile = _localProfile;
}

RecipeLibrary.prototype.recipesForClass = function(cls) {
  var userRecipesArr = [];
  var userRecipes = this._localProfile.getUserRecipes(cls);
  for (var name in userRecipes) {
    if (userRecipes.hasOwnProperty(name)) {
      var recipe = angular.copy(userRecipes[name]);
      recipe.user = true;
      userRecipesArr.push(recipe);
    }
  }
  return FFXIV_Recipe_DB[cls].concat(userRecipesArr);
};

RecipeLibrary.prototype.recipeForClassByName = function(cls, name) {
  var userRecipes = this._localProfile.getUserRecipes(cls);
  if (userRecipes.hasOwnProperty(name)) {
    return userRecipes[name];
  }
  var recipes = FFXIV_Recipe_DB[cls];
  for (var i = 0; i < recipes.length; i++) {
    var recipe = recipes[i];
    if (recipe.name == name) {
      return recipe;
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
