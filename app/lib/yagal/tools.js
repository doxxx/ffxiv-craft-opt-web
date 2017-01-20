var yagal_tools = (function() {
  function _newContainerWithArgs(container, args) {
    var instance = Object.create(container.prototype);
    var result = container.apply(instance, args);
    return typeof result === 'object' ? result : instance;
  }

  function initRepeat(container, func, n) {
    var values = [];
    var len = Math.max(1, typeof n === 'function' ? n() : n);
    for (var i = 0; i < len; i++) {
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
  
  function randInt(maxExcl) {
    return Math.floor(Math.random() * maxExcl);
  }
  
  function spliceArray(array, index, howMany, replacement) {
    var args = [index, howMany].concat(replacement);
    Array.prototype.splice.apply(array, args);    
  }

  function selRandom(k, individuals) {
    var r = [];
    for (var i = 0; i < k; i++) {
      r.push(individuals[randInt(individuals.length)]);
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

  function selBest(k, individuals) {
    var r = individuals.slice();
    r.sort(indComp);
    return r.slice(0, k);
  }

  function cxOnePoint(ind1, ind2) {
    var size = Math.min(ind1.length, ind2.length);
    var cxPoint = randInt(size);
    var ind1Gene = ind1[cxPoint];
    ind1[cxPoint] = ind2[cxPoint];
    ind2[cxPoint] = ind1Gene;
    sanityCheck(ind1);
    sanityCheck(ind2);
    return [ind1, ind2];
  }
  
  function cxRandomSubSeq(maxSubSeqLength, ind1, ind2) {
    var seqLength1 = Math.min(ind1.length, randInt(maxSubSeqLength + 1));
    var seqLength2 = Math.min(ind2.length, randInt(maxSubSeqLength + 1));
    var end1 = ind1.length - seqLength1;
    var end2 = ind2.length - seqLength2;
    var i1 = randInt(end1 + 1);
    var i2 = randInt(end2 + 1);
    var slice1 = ind1.slice(i1, i1 + seqLength1);
    var slice2 = ind2.slice(i2, i2 + seqLength2);
    spliceArray(ind1, i1, seqLength1, slice2);
    spliceArray(ind2, i2, seqLength2, slice1);
    sanityCheck(ind1);
    sanityCheck(ind2);
    return [ind1, ind2];
  }

  function mutShuffleIndexes(probability, individual) {
    var size = individual.length;
    for (var i = 0; i < size; i++) {
      if (Math.random() < probability) {
        var swapIndex = randInt(size - 1);
        if (swapIndex >= i) {
          swapIndex += 1;
          var gene = individual[i];
          individual[i] = individual[swapIndex];
          individual[swapIndex] = gene;
        }
      }
    }
    sanityCheck(individual);
    return [individual];
  }

  function mutRandomSub(probability, subFunc, individual) {
    var size = individual.length;
    for (var i = 0; i < size; i++) {
      if (Math.random() < probability) {
        individual[i] = subFunc();
      }
    }
    sanityCheck(individual);
    return [individual];
  }

  function mutRandomSubSeq(maxSubSeqLength, subFunc, individual) {
    var seqLength = Math.min(individual.length, Math.max(1, randInt(maxSubSeqLength + 1)));
    var end = individual.length - seqLength;
    var i = randInt(end + 1);
    var args = [i, seqLength].concat(subFunc());
    Array.prototype.splice.apply(individual, args);
    sanityCheck(individual);
    return [individual];
  }

  function mutSwap(individual) {
    if (individual.length >= 2) {
      var i = randInt(individual.length - 1);
      var first = individual[i];
      individual[i] = individual[i + 1];
      individual[i + 1] = first;
      sanityCheck(individual);
    }
    return [individual];
  }

  function randomMutation(mutations, individual) {
    return mutations[randInt(mutations.length)].call(undefined, individual);
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

  function sanityCheck(individual) {
    for (var i = 0; i < individual.length; i++) {
      console.assert(individual[i] !== undefined);
    }
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
    selBest: selBest,
    selRandom: selRandom,
    selTournament: selTournament,
    cxOnePoint: cxOnePoint,
    cxRandomSubSeq: cxRandomSubSeq,
    mutShuffleIndexes: mutShuffleIndexes,
    mutRandomSub: mutRandomSub,
    mutRandomSubSeq: mutRandomSubSeq,
    randomMutation: randomMutation,
    mutSwap: mutSwap,
    sanityCheck: sanityCheck,
    HallOfFame: HallOfFame,
  };
}());
