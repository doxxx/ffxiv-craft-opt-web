import assert from "assert";
import CarpenterRecipes from "../app/data/recipedb/Carpenter";
import simFinalState from "./simFinalState";

const CARPENTER = new Crafter('Carpenter', 80, 2632, 2269, 505, false, AllActions);

// Zelcova Fishing Rod
const RECIPE = {
  startQuality: 0,
  ...CarpenterRecipes.find( ({id}) => id === 'f500a787ca2' ),
};
RECIPE.suggestedCraftsmanship = RECIPE.suggestedCraftsmanship || SuggestedCraftsmanship[RECIPE.level];
RECIPE.suggestedControl = RECIPE.suggestedControl || SuggestedControl[RECIPE.level];

describe("Muscle Memory", () => {

  it("Can craft Zelkova Fishing Rod with single Muscle Memory", () => {
    var sequence = [ AllActions.muscleMemory ];
    var finalState = simFinalState( CARPENTER, RECIPE, sequence );

    assert.deepEqual(finalState.wastedActions, []);
    assert.ok(finalState.progressState >= RECIPE.difficulty);
  });

  it("Muscle Memory on SECOND step shall make no sence", () => {
    var sequence = [ AllActions.basicSynth, AllActions.muscleMemory, AllActions.basicSynth ];
    var finalState = simFinalState( CARPENTER, RECIPE, sequence );

    assert.deepEqual(finalState.wastedActions, [2]);
    assert.ok(finalState.progressState < RECIPE.difficulty);
  });

});
