import assert from "assert";
import simFinalState from "./simFinalState";

const INIT_CP = 180;

describe("FFXIV Crafting Model", () => {

  it("Can craft Zelkova Fishing Rod with 3 basic synth", () => {
    var crafter = new Crafter('Carpenter', 80, 2000, 0, INIT_CP, false, AllActions);
    // Zelkova Fishing Rod
    var recipe = new Recipe(70, 290, 2214, 80, 0, 11736, 1076, undefined);
    var sequence = [ AllActions.basicSynth2, AllActions.basicSynth2, AllActions.basicSynth2 ];
    var finalState = simFinalState( crafter, recipe, sequence );

    assert.equal(finalState.cpState, INIT_CP);
    assert.equal(finalState.lastStep, 3);
    assert.equal(finalState.progressState, 2466);
    assert.equal(finalState.step, 3);
  });

  it("Will not craft Zelkova Fishing Rod with only 2 basic synth", () => {
    var crafter = new Crafter('Carpenter', 80, 2000, 0, INIT_CP, false, AllActions);
    // Zelkova Fishing Rod
    var recipe = new Recipe(70, 290, 2214, 80, 0, 11736, 1076, undefined);
    var sequence = [ AllActions.basicSynth2, AllActions.basicSynth2 ];
    var finalState = simFinalState( crafter, recipe, sequence );

    assert.equal(finalState.cpState, INIT_CP);
    assert.equal(finalState.lastStep, 2);
    assert.equal(finalState.progressState, 1644);
    assert.equal(finalState.step, 2);
  });
});
