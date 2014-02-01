var yagal_tools = (function() {
  function _newContainerWithArgs(container, args) {
    var instance = Object.create(container.prototype);
    var result = container.apply(instance, args);
    return typeof result === 'object' ? result : instance;
  }

  function initRepeat(container, func, n) {
    var values = [];
    for (var i = 0; i < n; i++) {
      values.push(func());
    }
    return _newContainerWithArgs(container, values);
  }

  function initIterate(container, generator) {
    return _newContainerWithArgs(container, generator());
  }

  function maxByFitness(arr) {
    var r = null;
    for (var i = 0; i < arr.length; i++) {
      var e = arr[i];
      if (r === null || e.fitness.gt(r.fitness)) {
        r = e;
      }
    }
    return r;
  }

  function selRandom(k, individuals) {
    var r = [];
    for (var i = 0; i < k; i++) {
      r.push(individuals[Math.floor(Math.random() * individuals.length)]);
    }
    return r;
  }

  function selTournament(size, k, individuals) {
    var r = [];
    for (var i = 0; i < k; i++) {
      var aspirants = selRandom(size, individuals);
      r.push(maxByFitness(aspirants));
    }
    return r;
  }

  function cxOnePoint(ind1, ind2) {
    var size = Math.min(ind1.length, ind2.length);
    var cxPoint = Math.floor(Math.random() * size);
    var ind1Gene = ind1[cxPoint];
    ind1[cxPoint] = ind2[cxPoint];
    ind2[cxPoint] = ind1Gene;
    return [ind1, ind2];
  }

  function mutShuffleIndexes(probability, individual) {
    var size = individual.length;
    for (var i = 0; i < size; i++) {
      if (Math.random() < probability) {
        var swapIndex = Math.floor(Math.random() * (size - 1));
        if (swapIndex >= i) {
          swapIndex += 1;
          var gene = individual[i];
          individual[i] = individual[swapIndex];
          individual[swapIndex] = gene;
        }
      }
    }
    return [individual];
  }

  function indComp(a, b) {
    return b.fitness.compare(a.fitness);
  }

  function indBisectRight(a, x) {
    var lo = 0;
    var hi = a.length;
    while (lo < hi) {
      var mid = Math.floor((lo + hi) / 2);
      if (x.fitness.lt(a[mid].fitness)) {
        hi = mid;
      }
      else {
        lo = mid + 1;
      }
    }
    return lo;
  }

  function HallOfFame(maxSize) {
    this.maxSize = maxSize;
    this.entries = [];
  }

  HallOfFame.prototype.update = function(pop) {
    this.entries = this.entries.concat(pop);
    this.entries.sort(indComp);
    this.entries.length = this.maxSize;
    /*
    if (this.entries.length < this.maxSize) {
      this.entries = this.entries.concat(pop);
      this.entries.sort(indComp);
      this.entries.length = this.maxSize;
    }
    else {
      for (var i = 0; i < pop.length; i++) {
        var ind = pop[i];
        var lastIndex = this.entries.length - 1;
        if (ind.fitness.gt(this.entries[lastIndex].fitness)) {
          this.remove(lastIndex);
          this.insert(ind);
        }
      }
    }
    */
  };

  /*
  HallOfFame.prototype.insert = function(ind) {
    var i = indBisectRight(this.entries, ind);
    this.entries.splice(this.entries.length - i, 0, ind);
  };

  HallOfFame.prototype.remove = function(index) {
    var len = this.entries.length;
    this.entries.splice(len - (index % len + 1), 1);
  };
  */

  return {
    initRepeat: initRepeat,
    initIterate: initIterate,
    maxByFitness: maxByFitness,
    selRandom: selRandom,
    selTournament: selTournament,
    cxOnePoint: cxOnePoint,
    mutShuffleIndexes: mutShuffleIndexes,
    HallOfFame: HallOfFame,
  };
}());
