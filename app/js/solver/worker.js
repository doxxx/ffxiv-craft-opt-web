importScripts('../../lib/string/String.js');

importScripts('../../lib/yagal/creator.js');
importScripts('../../lib/yagal/tools.js');
importScripts('../../lib/yagal/fitness.js');
importScripts('../../lib/yagal/toolbox.js');
importScripts('../../lib/yagal/algorithms.js');

importScripts('../seededrandom.js');
importScripts('../ffxivcraftmodel.js');

importScripts('easimple.js');

var state;

self.onmessage = function(e) {
  try {
    if (e.data.start) {
      start(e.data.start);
    }
    else if (e.data == 'resume') {
      if (state.gen >= state.maxGen) {
        state.maxGen += state.settings.solver.generations;
      }
      runOneGen();
    }
    else if (e.data == 'rungen') {
      runOneGen();
    }
    else if (e.data == 'finish') {
      finish();
    }
  } catch (ex) {
    console.error(ex);
    self.postMessage({
      error: {
        error: ex.toString()
      }
    })
  }
};

function start(settings) {
  var logOutput = new LogOutput();

  var seed = Math.seed;
  if (typeof settings.seed === 'number') {
    seed = settings.seed;
    Math.seed = seed;
  }

  logOutput.write("Seed: %d, Use Conditions: %s\n\n".sprintf(seed, settings.useConditions));

  var crafterActions = [];

  for (var i = 0; i < settings.crafter.actions.length; i++) {
    var actionName = settings.crafter.actions[i];
    var action = AllActions[actionName];
    if (action === undefined) {
      logOutput.write('Error: Action is unsupported: %s\n'.sprintf(actionName));
    }
    else {
      crafterActions.push(AllActions[actionName]);
    }
  }

  crafterActions.sort(function (a1, a2) {
    if (a1.shortName < a2.shortName) return -1;
    else if (a1.shortName > a2.shortName) return 1;
    else return 0;
  });

  if (settings.debug) {
    logOutput.write('Crafter Actions:\n');
    for (var i = 0; i < crafterActions.length; i++) {
      var action = crafterActions[i];
      logOutput.write('  ');
      logOutput.write(i);
      logOutput.write(': ');
      logOutput.write(action.shortName);
      logOutput.write('\n');
    }
    logOutput.write('\n');
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
                          settings.recipe.maxQuality,
                          settings.recipe.aspect);
  var synth = new Synth(crafter, recipe, settings.maxTricksUses, settings.reliabilityPercent/100.0, settings.useConditions);
  var synthNoConditions = new Synth(crafter, recipe, settings.maxTricksUses, settings.reliabilityPercent/100.0, false);

  var sequence = [];

  for (var j = 0; j < settings.sequence.length; j++) {
    var actionName = settings.sequence[j];
    var action = AllActions[actionName];
    if (action !== undefined) {
      sequence.push(action);
    }
  }

  if (sequence.length === 0) {
    sequence = heuristicSequenceBuilder(synth);

    logOutput.write('No initial sequence provided; seeding with the following heuristic sequence:\n\n');

    for (var i = 0; i < sequence.length; i++) {
      var action = sequence[i];
      logOutput.write(action.name);
      if (i < sequence.length - 1) {
        logOutput.write(' | ');
      }
    }

    logOutput.write('\n\n');

    var heuristcState = MonteCarloSequence(sequence, NewStateFromSynth(synth), true, false, false, settings.debug, logOutput);

    var chk = heuristcState.checkViolations();
    var feasibility = chk.progressOk && chk.durabilityOk && chk.cpOk && chk.trickOk && chk.reliabilityOk;

    logOutput.write("Heuristic sequence feasibility:\n");
    logOutput.write('Progress: %s, Durability: %s, CP: %s, Tricks: %s, Reliability: %s\n\n'.sprintf(chk.progressOk, chk.durabilityOk, chk.cpOk, chk.trickOk, chk.reliabilityOk));
  }

  var seqMaxLength = Math.max(50, sequence.length);

  function evalSeqWrapper(synth, penaltyWeight, individual) {
    return evalSeq(individual, synth, penaltyWeight);
  }

  var creator = new yagal_creator.Creator();
  creator.create('FitnessMax', yagal_fitness.defineFitnessClass([1.0, 1.0, 1.0]));
  creator.create("Individual", Array, {fitness: creator.FitnessMax});

  var toolbox = new yagal_toolbox.Toolbox();
  toolbox.register("randomAction", randomChoice, crafterActions);
  toolbox.register("randomActionSeq", randomSeq, seqMaxLength, toolbox.randomAction);
  toolbox.register("randomLength", randomInt, seqMaxLength);
  toolbox.register("individual", yagal_tools.initRepeat, creator.Individual, toolbox.randomAction, toolbox.randomLength);
  toolbox.register("population", yagal_tools.initRepeat, Array, toolbox.individual);
  toolbox.register("evaluate", evalSeqWrapper, synth, settings.solver.penaltyWeight);

  var pop = toolbox.population(settings.solver.population-1);
  var iniGuess = creator.Individual.apply(null, sequence);
  pop.push(iniGuess);

  var hof = new yagal_tools.HallOfFame(1);

  var startTime = Date.now();

  var algorithm = ALGORITHMS[settings.algorithm];
  if (algorithm === undefined) {
    self.postMessage({
      error: {
        error: 'No such algorithm: ' + settings.algorithm,
        log: logOutput.log
      }
    });
  }

  try {
    algorithm.setup(pop, toolbox, hof);
  } catch (e) {
    logOutput.write('\n\n');
    logOutput.write(e);
    self.postMessage({
      error: {
        error: 'Solver setup failed',
        log: logOutput.log
      }
    });
    return;
  }

  state = {
    settings: settings,
    logOutput: logOutput,
    algorithm: algorithm,
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
  state.pop = state.algorithm.gen(state.pop, state.toolbox, 0.5, 0.2, state.hof);

  if (state.settings.debug) {
    var fitness = evalSeq(state.hof.entries[0], state.synth, state.settings.penaltyWeight);
    var fitnessStr = '';
    for (var i = 0; i < fitness.length; i++) {
      var val = fitness[i];
      fitnessStr += '%.1f'.sprintf(val);
      if (i < fitness.length-1) {
        fitnessStr += ', ';
      }
    }
    state.logOutput.write('%d: best fitness=[%s]\n'.sprintf(state.gen, fitnessStr));
  }

  postProgress(state.gen, state.maxGen, state.hof.entries[0], state.synthNoConditions);
}

function finish() {
  var elapsedTime = Date.now() - state.startTime;

  var executionLog = state.logOutput;
  var best = state.hof.entries[0];

  self.postMessage({
    success: {
      executionLog: executionLog.log,
      elapsedTime: elapsedTime,
      bestSequence: actionSequenceToShortNames(best)
    }
  });
}

function postProgress(gen, maxGen, best, synthNoConditions) {
  var startState = NewStateFromSynth(synthNoConditions);

  var currentState = MonteCarloSequence(best, startState, true, false, false, false);
  var violations = currentState.checkViolations();

  self.postMessage({
    progress: {
      generationsCompleted: gen,
      maxGenerations: maxGen,
      state: {
        quality: currentState.qualityState,
        durability: currentState.durabilityState,
        cp: currentState.cpState,
        progress: currentState.progressState,
        hqPercent: hqPercentFromQuality(currentState.qualityState / synthNoConditions.recipe.maxQuality * 100),
        feasible: violations.progressOk && violations.durabilityOk && violations.cpOk && violations.trickOk && violations.reliabilityOk,
        violations: violations,
        condition: currentState.condition
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
