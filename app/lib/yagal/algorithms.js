var yagal_algorithms = (function() {
  function isFitnessInvalid(ind) {
    return !ind.fitness.valid();
  }

  function varAnd(population, toolbox, cxpb, mutpb) {
    var offspring = toolbox.map(toolbox.clone, population);

    for (var i = 1; i < offspring.length; i += 2) {
      if (Math.random() < cxpb) {
        var mated = toolbox.mate(offspring[i-1], offspring[i]);
        mated[0].fitness.clearValues();
        mated[1].fitness.clearValues();
        offspring[i-1] = mated[0];
        offspring[i] = mated[1];
      }
    }

    for (var j = 0; j < offspring.length; j++) {
      if (Math.random() < mutpb) {
        var mutated = toolbox.mutate(offspring[j]);
        mutated[0].fitness.clearValues();
        offspring[j] = mutated[0];
      }
    }

    return offspring;
  }

  function eaSimple(population, toolbox, cxpb, mutpb, ngen, hof, feedback) {
    // evaluate fitness of starting population
    var fitnessesValues = toolbox.map(toolbox.evaluate, population);
    for (var i = 0; i < population.length; i++) {
      population[i].fitness.setValues(fitnessesValues[i]);
    }

    if (hof !== undefined) {
      hof.update(population);
    }

    for (var gen = 1; gen <= ngen; gen++) {
      if (feedback !== undefined) {
        feedback(gen, hof.entries[0]);
      }

      var offspring = toolbox.select(population.length, population);

      offspring = varAnd(offspring, toolbox, cxpb, mutpb);

      // evaluate individuals with invalid fitness
      var invalidInd = offspring.filter(isFitnessInvalid);
      fitnessesValues = toolbox.map(toolbox.evaluate, invalidInd);
      for (var j = 0; j < invalidInd.length; j++) {
        invalidInd[j].fitness.setValues(fitnessesValues[j]);
      }

      if (hof !== undefined) {
        hof.update(offspring);
      }

      population = offspring;
    }

    return population;
  }

  return {
    eaSimple: eaSimple,
    varAnd: varAnd
  };
}());
