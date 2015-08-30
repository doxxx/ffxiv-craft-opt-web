//noinspection ThisExpressionReferencesGlobalObjectJS
if (this.ALGORITHMS === undefined) ALGORITHMS = {};

ALGORITHMS['eaSimple'] = {
  setup: function eaSimple_setup(population, toolbox, hof) {
    // initialize functions
    toolbox.register("mate", yagal_tools.cxRandomSubSeq, 3);
    toolbox.register("mutate", yagal_tools.mutRandomSubSeq, 3, toolbox.randomActionSeq);
    toolbox.register("select", yagal_tools.selTournament, 7);

    // evaluate fitness of starting population
    var fitnessesValues = toolbox.map(toolbox.evaluate, population);
    for (var i = 0; i < population.length; i++) {
      population[i].fitness.setValues(fitnessesValues[i]);
    }

    if (hof !== undefined) {
      hof.update(population);
    }
  },
  gen: function eaSimple_gen(population, toolbox, hof) {
    var offspring = toolbox.select(population.length, population);

    offspring = yagal_algorithms.varAnd(offspring, toolbox, 0.5, 0.2);

    function isFitnessInvalid(ind) {
      return !ind.fitness.valid();
    }

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
};
