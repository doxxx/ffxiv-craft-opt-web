importScripts('../lib/string/String.js');
importScripts('ffxivcraftmodel.js');
importScripts('../lib/yagal/creator.js');
importScripts('../lib/yagal/tools.js');
importScripts('../lib/yagal/fitness.js');
importScripts('../lib/yagal/toolbox.js');
importScripts('../lib/yagal/algorithms.js');

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
  var synth = new Synth(crafter, recipe, settings.maxTricksUses, settings.reliabilityPercent/100.0, true);

  var sequence = [];

  for (var j = 0; j < settings.sequence.length; j++) {
    sequence.push(AllActions[settings.sequence[j]]);
  }

  var seqMaxLength = Math.max(50, sequence.length);

  function evalSeqWrapper(synth, penaltyWeight, individual) {
    return evalSeq(individual, synth, penaltyWeight);
  }

  var creator = new yagal_creator.Creator();
  creator.create('FitnessMax', yagal_fitness.defineFitnessClass([1.0, 1.0]));
  creator.create("Individual", Array, {fitness: creator.FitnessMax});

  var toolbox = new yagal_toolbox.Toolbox();
  toolbox.register("randomAction", randomChoice, crafterActions);
  toolbox.register("randomActionSeq", randomSeq, seqMaxLength, toolbox.randomAction);
  toolbox.register("randomLength", randomInt, seqMaxLength);
  toolbox.register("individual", yagal_tools.initRepeat, creator.Individual, toolbox.randomAction, toolbox.randomLength);
  toolbox.register("population", yagal_tools.initRepeat, Array, toolbox.individual);

  toolbox.register("evaluate", evalSeqWrapper, synth, settings.solver.penaltyWeight);
  toolbox.register("mate", yagal_tools.cxRandomSubSeq, 0.5);
  toolbox.register("mutate", yagal_tools.mutRandomSubSeq, 0.5, toolbox.randomActionSeq);
  toolbox.register("select", yagal_tools.selTournament, 7);

  var pop = toolbox.population(settings.solver.population-1);
  var iniGuess = creator.Individual.apply(null, sequence);
  pop.push(iniGuess);

  var hof = new yagal_tools.HallOfFame(1);

  function feedback(gen, best) {
    self.postMessage({
      progress: {
        generationsCompleted: gen,
        state: simSynth(best, synth, false, false)
      }
    });
  }

  var logOutput = {
    log: '',
    write: function(msg) {
      logOutput.log += msg;
    }
  };

  logOutput.write("Seed: %d, Use Conditions: %s\n\n".sprintf(settings.seed, synth.useConditions));

  logOutput.write("Genetic Algorithm Result\n");
  logOutput.write("========================\n");

  yagal_algorithms.eaSimple(pop, toolbox, 0.5, 0.2, settings.solver.generations, hof, feedback);

  var best = hof.entries[0];
  var finalState = simSynth(best, synth, true, false, logOutput);

  var bestSequence = [];
  for (var k = 0; k < best.length; k++) {
    bestSequence.push(best[k].shortName);
  }

  logOutput.write("\nMonte Carlo Result\n");
  logOutput.write("==================\n");

  MonteCarloSim(best, synth, settings.maxMontecarloRuns, settings.seed, false, false, logOutput);

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
      },
      bestSequence: bestSequence
    }
  };

  self.postMessage(result);
};

function randomInt(max) {
  return Math.floor(Math.random() * max);
}

function randomChoice(items) {
  return items[randomInt(items.length)];
}

function randomSeq(maxLen, elementFunc) {
  var len = Math.floor(Math.random() * maxLen);
  var seq = [];
  for (var i = 0; i < len; i++) {
    seq.push(elementFunc());
  }
  return seq;
}
