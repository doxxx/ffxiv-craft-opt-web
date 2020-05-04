import assert from "assert";
import CarpenterRecipes from "../app/data/recipedb/Carpenter";
import simFinalState from "./simFinalState";

const INIT_CP = 180;
const CARPENTER = new Crafter('Carpenter', 80, 2000, 0, INIT_CP, false, AllActions);

// Zelcova Fishing Rod
const RECIPE = {
  startQuality: 0,
  ...CarpenterRecipes.find( ({id}) => id === 'f500a787ca2' ),
};
RECIPE.suggestedCraftsmanship = RECIPE.suggestedCraftsmanship || SuggestedCraftsmanship[RECIPE.level];
RECIPE.suggestedControl = RECIPE.suggestedControl || SuggestedControl[RECIPE.level];

describe("FFXIV Crafting Model", () => {

  it("Can craft Zelkova Fishing Rod with 3 basic synth", () => {
    var sequence = [ AllActions.basicSynth2, AllActions.basicSynth2, AllActions.basicSynth2 ];
    var finalState = simFinalState( CARPENTER, RECIPE, sequence );

    assert.equal(finalState.cpState, INIT_CP);
    assert.equal(finalState.lastStep, 3);
    assert.equal(finalState.progressState, 2466);
    assert.equal(finalState.step, 3);
  });

  it("Will not craft Zelkova Fishing Rod with only 2 basic synth", () => {
    var sequence = [ AllActions.basicSynth2, AllActions.basicSynth2 ];
    var finalState = simFinalState( CARPENTER, RECIPE, sequence );

    assert.equal(finalState.cpState, INIT_CP);
    assert.equal(finalState.lastStep, 2);
    assert.equal(finalState.progressState, 1644);
    assert.equal(finalState.step, 2);
  });

});
