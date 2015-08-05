importScripts('../lib/string/String.js');
importScripts('ffxivcraftmodel.js');
importScripts('seededrandom.js');

self.onmessage = function(e) {
  switch (e.data.type) {
    case 'prob':
      runProbablisticSim(e.data.settings);
      break;
    case 'montecarlo':
      runMonteCarloSim(e.data.settings);
      break;
    default:
      console.error("unexpected message: %O", e.data);
  }
};

function setupSim(settings) {
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
  var synth = new Synth(crafter, recipe, settings.maxTricksUses, settings.reliabilityPercent / 100.0,
    settings.useConditions);
  var synthNoConditions = new Synth(crafter, recipe, settings.maxTricksUses, settings.reliabilityPercent / 100.0,
    false);

  var startState = NewStateFromSynth(synth);
  var startStateNoConditions = NewStateFromSynth(synthNoConditions);

  var sequence = [];

  for (var j = 0; j < settings.sequence.length; j++) {
    sequence.push(AllActions[settings.sequence[j]]);
  }
  return {
    seed: seed,
    synth: synth,
    startState: startState,
    startStateNoConditions: startStateNoConditions,
    sequence: sequence
  };
}

function runProbablisticSim(settings) {
  var sim = setupSim(settings);

  var logOutput = {
    log: '',
    write: function (msg) {
      logOutput.log += msg;
    }
  };

  logOutput.write('Use Conditions: %s\n\n'.sprintf(sim.synth.useConditions));

  logOutput.write("Probabilistic Result\n");
  logOutput.write("====================\n");

  simSynth(sim.sequence, sim.startState, true, settings.debug, logOutput);

  self.postMessage({
    success: {
      seed: sim.seed,
      sequence: settings.sequence,
      log: logOutput.log
    }
  });
}

function runMonteCarloSim(settings) {
  var sim = setupSim(settings);

  var logOutput = {
    log: '',
    write: function (msg) {
      logOutput.log += msg;
    }
  };

  logOutput.write('Seed: %d, Use Conditions: %s\n\n'.sprintf(sim.seed, sim.synth.useConditions));

  if (settings.debug) {
    logOutput.write("Monte Carlo Example\n");
    logOutput.write("===================\n");
    MonteCarloSequence(sim.sequence, sim.startState, false, true, false, true, logOutput);
  }

  logOutput.write("\n");

  var monteCarloSimHeader = "Monte Carlo Result of " + settings.maxMontecarloRuns + " runs";
  logOutput.write(monteCarloSimHeader + "\n");
  logOutput.write("=".repeat(monteCarloSimHeader.length));
  logOutput.write("\n");

  var mcSimResult = MonteCarloSim(sim.sequence, sim.synth, settings.maxMontecarloRuns, false, settings.debug, logOutput);

  // Don't use conditions for final state to avoid random results
  var finalState = MonteCarloSequence(sim.sequence, sim.startStateNoConditions, true, false, false, false, logOutput);

  var result = {
    success: {
      seed: sim.seed,
      sequence: settings.sequence,
      log: logOutput.log,
      state: {
        quality: finalState.qualityState,
        durability: finalState.durabilityState,
        cp: finalState.cpState,
        progress: finalState.progressState,
        successPercent: mcSimResult.successPercent,
        violations: finalState.checkViolations()
      }
    }
  };

  self.postMessage(result);
}

