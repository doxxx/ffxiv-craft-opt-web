importScripts('../lib/string/String.js');
importScripts('ffxivcraftmodel.js');
importScripts('seededrandom.js');

self.onmessage = function(e) {
  var settings = e.data;

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

  if (typeof settings.seed === 'number') {
    Math.seed = settings.seed;
  }

  logOutput.write('Seed: %d, Use Conditions: %s\n\n'.sprintf(Math.seed, synth.useConditions));

  logOutput.write("Probabilistic Result\n");
  logOutput.write("====================\n");

  var finalState = simSynth(sequence, synth, true, false, logOutput);

  logOutput.write("\nMonte Carlo Result\n");
  logOutput.write("==================\n");

  MonteCarloSim(sequence, synth, settings.maxMontecarloRuns, settings.seed, false, false, logOutput);

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
        progress: finalState.progressState
      }
    }
  };

  self.postMessage(result);
};
