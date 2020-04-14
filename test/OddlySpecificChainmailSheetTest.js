import assert from "assert";
import ArmorerRecipes from "../app/data/recipedb/Armorer";
import simFinalState from "./simFinalState";

const CRAFTER = new Crafter('Armorer', 80, 2535, 2163, 486, false, AllActions);

const RECIPE = {
  startQuality: 0,
  ...ArmorerRecipes.find( ({id}) => id === 'af91eefbcf4' ),
};
RECIPE.suggestedCraftsmanship = RECIPE.suggestedCraftsmanship || SuggestedCraftsmanship[RECIPE.level];
RECIPE.suggestedControl = RECIPE.suggestedControl || SuggestedControl[RECIPE.level];

describe("Oddly Specific Chainmail Sheet", () => {
  it("First Reflect: Quality increases by 482", () => {
    var finalState = simFinalState( CRAFTER, RECIPE, [
      AllActions.reflect
    ] );
    assert.equal(482, finalState.qualityState);
  });
  it("Reflect, Groundwork increases progress by 1323", () => {
    var finalState = simFinalState( CRAFTER, RECIPE, [
      AllActions.reflect,
      AllActions.groundwork
    ] );
    assert.equal(1323, finalState.progressState);
  });
});
