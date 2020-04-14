export default function simFinalState( crafter, recipe, sequence ) {
  var synth = new Synth(crafter, recipe, 0, 1.0, false, 0);
  var startState = NewStateFromSynth(synth);

  var synth = new Synth(crafter, recipe, 0, 1.0, true, 0);
  var synthNoConditions = new Synth(crafter, recipe, 0, 1.0, false, 0);

  var init = {
    seed: Math.seed,
    synth: synth,
    startState: NewStateFromSynth(synth),
    startStateNoConditions: NewStateFromSynth(synthNoConditions),
    sequence: sequence
  };
  return simSynth(sequence, startState, false, true, true, undefined);
}
