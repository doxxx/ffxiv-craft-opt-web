//noinspection ThisExpressionReferencesGlobalObjectJS
if (this.ALGORITHMS === undefined) ALGORITHMS = {};

ALGORITHMS['eaComplex'] = {
  setup: function (population, toolbox, hof) {
    // initialize functions
    toolbox.register("mate", yagal_tools.cxRandomSubSeq, 3);
    toolbox.register("mutate1", yagal_tools.mutRandomSubSeq, 3, toolbox.randomActionSeq);
    toolbox.register("mutate2", yagal_tools.mutSwap);
    toolbox.register("mutate", yagal_tools.randomMutation, [toolbox.mutate1, toolbox.mutate2]);
    toolbox.register("selectParents", yagal_tools.selTournament, 7);
    toolbox.register("selectOffspring", yagal_tools.selBest);
    toolbox.register("selectSurvivors", yagal_tools.selBest);

    // evaluate fitness of starting population
    var fitnessesValues = toolbox.map(toolbox.evaluate, population);
    for (var i = 0; i < population.length; i++) {
      population[i].fitness.setValues(fitnessesValues[i]);
    }

    if (hof !== undefined) {
      hof.update(population);
    }
  },
  gen: function (population, toolbox, hof) {
    // select parents
    var parents = toolbox.selectParents(population.length / 2, population);

    // breed offspring
    var offspring = yagal_algorithms.varAnd(parents, toolbox, 0.5, 0.2);

    function isFitnessInvalid(ind) {
      return !ind.fitness.valid();
    }

    // evaluate offspring with invalid fitness
    var invalidInd = offspring.filter(isFitnessInvalid);
    var fitnessesValues = toolbox.map(toolbox.evaluate, invalidInd);
    for (var j = 0; j < invalidInd.length; j++) {
      invalidInd[j].fitness.setValues(fitnessesValues[j]);
    }

    // select offspring
    offspring = toolbox.selectOffspring(offspring.length / 2, offspring);

    // select survivors
    var survivors = toolbox.selectSurvivors(population.length - offspring.length, population);

    var nextPop = offspring.concat(survivors);

    if (hof !== undefined) {
      hof.update(nextPop);
    }

    return nextPop;
  }
};
