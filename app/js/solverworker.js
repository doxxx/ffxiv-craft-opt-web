importScripts('seededrandom.js');
importScripts('../lib/string/String.js');
importScripts('ffxivcraftmodel.js');
importScripts('../lib/yagal/creator.js');
importScripts('../lib/yagal/tools.js');
importScripts('../lib/yagal/fitness.js');
importScripts('../lib/yagal/toolbox.js');
importScripts('../lib/yagal/algorithms.js');

var state = {};

self.onmessage = function(e) {
  if (e.data.start) {
    start(e.data.start);
  }
  else if (e.data == 'resume') {
    if (state.gen >= state.maxGen) {
      state.maxGen += state.settings.solver.generations;
    }
    state.logOutput.clear();
    runOneGen();
  }
  else if (e.data == 'rungen') {
    runOneGen();
  }
  else if (e.data == 'finish') {
    finish();
  }
};

function start(settings) {
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

  var logOutput = {
    log: '',
    write: function(msg) {
      logOutput.log += msg;
    },
    clear: function() {
      logOutput.log = '';
    }
  };

  var startTime = Date.now();

  logOutput.write("Seed: %d, Use Conditions: %s\n\n".sprintf(seed, synth.useConditions));

  eaSimple_setup(pop, toolbox, hof);

  state = {
    settings: settings,
    logOutput: logOutput,
    startTime: startTime,
    synth: synth,
    synthNoConditions: synthNoConditions,
    pop: pop,
    toolbox: toolbox,
    hof: hof,
    maxGen: settings.solver.generations,
    gen: 0
  };

  runOneGen();
}

function runOneGen() {
  state.gen += 1;
  state.pop = eaSimple_gen(state.pop, state.toolbox, 0.5, 0.2, state.hof);

  postProgress(state.gen, state.maxGen, state.hof.entries[0], state.synthNoConditions);
}

function finish() {
  var logOutput = state.logOutput;
  var best = state.hof.entries[0];
  var debug = state.settings.debug;

  var startState = NewStateFromSynth(state.synth);

  logOutput.write("Genetic Algorithm Result\n");
  logOutput.write("========================\n");

  simSynth(best, state.synth, true, debug, logOutput);

  logOutput.write("\nMonte Carlo Result\n");
  logOutput.write("==================\n");

  var mcSimResult = MonteCarloSim(best, state.synth, state.settings.maxMontecarloRuns, false, debug, logOutput);

  if (debug) {
    logOutput.write("\nMonte Carlo Example");
    logOutput.write("\n===================\n");
    MonteCarloSequence(best, state.synth, startState, false, true, false, true, logOutput);
  }

  // Don't use conditions for final state to avoid random results
  var finalState = MonteCarloSequence(best, state.synthNoConditions, startState, true, false, false, false, logOutput);

  var elapsedTime = Date.now() - state.startTime;

  logOutput.write("\nElapsed time: %d ms".sprintf(elapsedTime));

  self.postMessage({
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
      },
      bestSequence: actionSequenceToShortNames(best)
    }
  });
}

function eaSimple_setup(population, toolbox, hof) {
  // evaluate fitness of starting population
  var fitnessesValues = toolbox.map(toolbox.evaluate, population);
  for (var i = 0; i < population.length; i++) {
    population[i].fitness.setValues(fitnessesValues[i]);
  }

  if (hof !== undefined) {
    hof.update(population);
  }
}

function eaSimple_gen(population, toolbox, cxpb, mutpb, hof) {
  var offspring = toolbox.select(population.length, population);

  offspring = yagal_algorithms.varAnd(offspring, toolbox, cxpb, mutpb);

  // evaluate individuals with invalid fitness
  var invalidInd = offspring.filter(isFitnessInvalid);
  var fitnessesValues = toolbox.map(toolbox.evaluate, invalidInd);
  for (var j = 0; j < invalidInd.length; j++) {
    invalidInd[j].fitness.setValues(fitnessesValues[j]);
  }

  if (hof !== undefined) {
    hof.update(offspring);
  }

  return offspring;
}

function postProgress(gen, maxGen, best, synthNoConditions) {
  var startState = NewStateFromSynth(synthNoConditions);

  var currentState = MonteCarloSequence(best, synthNoConditions, startState, true, false, false, false);
  self.postMessage({
    progress: {
      generationsCompleted: gen,
      maxGenerations: maxGen,
      state: {
        quality: currentState.qualityState,
        durabilityOk: currentState.durabilityOk,
        durability: currentState.durabilityState,
        cpOk: currentState.cpOk,
        cp: currentState.cpState,
        progressOk: currentState.progressOk,
        progress: currentState.progressState
      },
      bestSequence: actionSequenceToShortNames(best)
    }
  });
}

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

function actionSequenceToShortNames(sequence) {
  var nameSequence = [];
  for (var k = 0; k < sequence.length; k++) {
    nameSequence.push(sequence[k].shortName);
  }
  return nameSequence;
}

function isFitnessInvalid(ind) {
  return !ind.fitness.valid();
}
