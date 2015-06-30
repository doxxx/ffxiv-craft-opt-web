importScripts('../lib/string/String.js');
importScripts('ffxivcraftmodel.js');
importScripts('seededrandom.js');

self.onmessage = function(e) {
  var settings = e.data;

  var seed = Math.seed;
  if (typeof settings.seed === 'number') {
    seed = settings.seed;
    Math.seed = seed;
  }

  var crafterActions = [];

  for (var i = 0; i < settings.crafter.actions.length; i++) {
    crafterActions.push(AllActions[settings.crafter.actions[i]]);
  }

  var crafter = new Crafter(settings.recipe.cls,
                            settings.crafter.level,
                            settings.crafter.craftsmanship,
                            settings.crafter.control,
                            settings.crafter.cp,
                            crafterActions);
  var recipe = new Recipe(settings.recipe.level,
                          settings.recipe.difficulty,
                          settings.recipe.durability,
                          settings.recipe.startQuality,
                          settings.recipe.maxQuality);
  var synth = new Synth(crafter, recipe, settings.maxTricksUses, settings.reliabilityPercent/100.0, settings.useConditions);
  var synthNoConditions = new Synth(crafter, recipe, settings.maxTricksUses, settings.reliabilityPercent/100.0, false);

  var startState = NewStateFromSynth(synth);

  var sequence = [];

  for (var j = 0; j < settings.sequence.length; j++) {
    sequence.push(AllActions[settings.sequence[j]]);
  }

  var logOutput = {
    log: '',
    write: function(msg) {
      logOutput.log += msg;
    }
  };

  logOutput.write('Seed: %d, Use Conditions: %s\n\n'.sprintf(seed, synth.useConditions));

  logOutput.write("Probabilistic Result\n");
  logOutput.write("====================\n");

  simSynth(sequence, synth, startState, true, settings.debug, logOutput);

  logOutput.write("\nMonte Carlo Result\n");
  logOutput.write("==================\n");

  var mcSimResult = MonteCarloSim(sequence, synth, settings.maxMontecarloRuns, false, settings.debug, logOutput);

  if (settings.debug) {
    logOutput.write("\nMonte Carlo Example");
    logOutput.write("\n===================\n");
    MonteCarloSequence(sequence, synth, startState, false, true, false, true, logOutput);
  }

  // Don't use conditions for final state to avoid random results
  var finalState = MonteCarloSequence(sequence, synthNoConditions, startState, true, false, false, false, logOutput);

  var result = {
    success: {
      log: logOutput.log,
      state: {
        quality: finalState.qualityState,
        durabilityOk: finalState.durabilityOk,
        durability: finalState.durabilityState,
        cpOk: finalState.cpOk,
        cp: finalState.cpState,
        progressOk: finalState.progressOk,
        progress: finalState.progressState,
        successPercent: mcSimResult.successPercent
      }
    }
  };

  self.postMessage(result);
};
