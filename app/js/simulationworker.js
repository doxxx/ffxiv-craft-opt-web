importScripts('../lib/string/String.js');
importScripts('actions.js');
importScripts('ffxivcraftmodel.js');
importScripts('seededrandom.js');

self.onmessage = function(e) {
  try {
    switch (e.data.type) {
      case 'prob':
        runProbablisticSim(e.data.id, e.data.settings);
        break;
      case 'montecarlo':
        runMonteCarloSim(e.data.id, e.data.settings);
        break;
      case 'baseValues':
        calculateBaseValues(e.data.id, e.data.settings);
        break;
      default:
        console.error("unexpected message: %O", e.data);
    }
  } catch (ex) {
    console.error(ex);
    self.postMessage({
      id: e.data.id,
      error: {
        error: ex.toString()
      }
    })
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
    settings.crafter.specialist,
    crafterActions);
  var recipe = new Recipe(settings.recipe.baseLevel, settings.recipe.level, settings.recipe.difficulty,
      settings.recipe.durability, settings.recipe.startQuality, settings.recipe.maxQuality,
      settings.recipe.suggestedCraftsmanship, settings.recipe.suggestedControl);
  var synth = new Synth(crafter, recipe, settings.maxTricksUses, settings.reliabilityPercent / 100.0,
    settings.useConditions, 0);
  var synthNoConditions = new Synth(crafter, recipe, settings.maxTricksUses, settings.reliabilityPercent / 100.0,
    false, 0);

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

function runProbablisticSim(id, settings) {
  var sim = setupSim(settings);

  var logOutput = new LogOutput();

  logOutput.write('Use Conditions: %s\n\n'.sprintf(sim.synth.useConditions));

  logOutput.write("Probabilistic Result\n");
  logOutput.write("====================\n");

  simSynth(sim.sequence, sim.startState, false, true, settings.debug, logOutput);

  self.postMessage({
    id: id,
    success: {
      seed: sim.seed,
      sequence: settings.sequence,
      log: logOutput.log
    }
  });
}

function runMonteCarloSim(id, settings) {
  var sim = setupSim(settings);

  var logOutput = new LogOutput();

  logOutput.write('Seed: %d, Use Conditions: %s\n\n'.sprintf(sim.seed, sim.synth.useConditions));

  var monteCarloSimHeader = "Monte Carlo Result of " + settings.maxMontecarloRuns + " runs";
  logOutput.write(monteCarloSimHeader + "\n");
  logOutput.write("=".repeat(monteCarloSimHeader.length));
  logOutput.write("\n");

  var mcSimResult = MonteCarloSim(sim.sequence, sim.synth, settings.maxMontecarloRuns, false, settings.conditionalActionHandling, false, settings.debug, logOutput);

  // Don't use conditions for final state to avoid oscillating results in the simulation state UI
  var states = MonteCarloSequence(sim.sequence, sim.startStateNoConditions, true, 'skipUnusable', false, false, logOutput);
  var finalState = states[states.length - 1];

  var violations = finalState.checkViolations();

  var result = {
    id: id,
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
        hqPercent: hqPercentFromQuality(finalState.qualityState / settings.recipe.maxQuality * 100),
        feasible: violations.progressOk && violations.durabilityOk && violations.cpOk && violations.trickOk && violations.reliabilityOk,
        violations: violations,
        condition: finalState.condition,
        effects: finalState.effects,
        lastStep: finalState.lastStep,
        bonusMaxCp: finalState.bonusMaxCp
      }
    }
  };

  self.postMessage(result);
}

function calculateBaseValues(id, settings) {
  var sim = setupSim(settings);

  var effCrafterLevel = getEffectiveCrafterLevel(sim.synth);
  var levelDifference = effCrafterLevel - sim.synth.recipe.level;
  var baseProgress = Math.floor(sim.synth.calculateBaseProgressIncrease(levelDifference, sim.synth.crafter.craftsmanship));
  var baseQuality = Math.floor(sim.synth.calculateBaseQualityIncrease(levelDifference, sim.synth.crafter.control));

  self.postMessage({
    id: id,
    success: {
      baseValues: {
        progress: baseProgress,
        quality: baseQuality,
      },
    },
  });
}

