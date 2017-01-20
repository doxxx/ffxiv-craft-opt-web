var yagal_algorithms = (function() {
  function isFitnessInvalid(ind) {
    return !ind.fitness.valid();
  }

  function varCrossover(population, toolbox, cxpb) {
    var offspring = toolbox.map(toolbox.clone, population);

    for (var i = 1; i < offspring.length; i += 2) {
      if (Math.random() < cxpb) {
        var mated = toolbox.mate(offspring[i - 1], offspring[i]);
        mated[0].fitness.clearValues();
        mated[1].fitness.clearValues();
        offspring[i - 1] = mated[0];
        offspring[i] = mated[1];
      }
    }
    return offspring;
  }

  function varMutate(offspring, toolbox, mutpb) {
    for (var j = 0; j < offspring.length; j++) {
      if (Math.random() < mutpb) {
        var mutated = toolbox.mutate(offspring[j]);
        mutated[0].fitness.clearValues();
        offspring[j] = mutated[0];
      }
    }
  }

  function varAnd(population, toolbox, cxpb, mutpb) {
    var offspring = varCrossover(population, toolbox, cxpb);
    varMutate(offspring, toolbox, mutpb);

    return offspring;
  }

  return {
    varAnd: varAnd,
    varCrossover: varCrossover,
    varMutate: varMutate
  };
}());
