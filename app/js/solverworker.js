importScripts('../lib/string/String.js');
importScripts('ffxivcraftmodel.js');
importScripts('../lib/yagal/creator.js');
importScripts('../lib/yagal/tools.js');
importScripts('../lib/yagal/fitness.js');
importScripts('../lib/yagal/toolbox.js');
importScripts('../lib/yagal/algorithms.js');

this.onmessage = function(e) {
  var settings = e.data;

  var crafterActions = [];

  for (var i = 0; i < settings.crafter.actions.length; i++) {
    crafterActions.push(AllActions[settings.crafter.actions[i]]);
  }

  var crafter = new Crafter(settings.crafter.cls,
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
  var synth = new Synth(crafter, recipe, settings.maxTricksUses, true);

  var sequence = [];
  var seqMaxLength = Math.floor(settings.sequence.length * 1.5);

  for (var j = 0; j < settings.sequence.length; j++) {
    sequence.push(AllActions[settings.sequence[j]]);
  }

  function evalSeqWrapper(synth, penaltyWeight, individual) {
    return [evalSeq(individual, synth, penaltyWeight)];
  }

  var creator = new yagal_creator.Creator();
  creator.create('FitnessMax', yagal_fitness.defineFitnessClass([1.0]));
  creator.create("Individual", Array, {fitness: creator.FitnessMax});

  var toolbox = new yagal_toolbox.Toolbox();
  toolbox.register("attr_action", randomChoice, crafterActions);
  toolbox.register("individual", yagal_tools.initRepeat, creator.Individual, toolbox.attr_action, seqMaxLength);
  toolbox.register("population", yagal_tools.initRepeat, Array, toolbox.individual);

  toolbox.register("evaluate", evalSeqWrapper, synth, settings.solver.penaltyWeight);
  toolbox.register("mate", yagal_tools.cxOnePoint);
  toolbox.register("mutate", yagal_tools.mutShuffleIndexes, 0.05);
  toolbox.register("select", yagal_tools.selTournament, 3);

  var pop = toolbox.population(settings.solver.population-1);
  var iniGuess = creator.Individual.apply(null, sequence);
  pop.push(iniGuess);

  var hof = new yagal_tools.HallOfFame(1);

  console.debug("starting solver");
  yagal_algorithms.eaSimple(pop, toolbox, 0.5, 0.2, settings.solver.generations, hof, feedback);

  var best = hof.entries[0];
  var finalState = simSynth(best, synth, false, false);

  var bestSequence = [];
  for (var k = 0; k < best.length; k++) {
    bestSequence.push(best[k].shortName);
  }

  var result = {
    success: {
      log: '',
      finalState: {
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

  postMessage(result);
};

function randomChoice(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function feedback(gen) {
  postMessage({
    progress: {
      generationsCompleted: gen
    }
  });
}
