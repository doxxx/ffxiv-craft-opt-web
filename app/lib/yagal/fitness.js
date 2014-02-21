var yagal_fitness = (function() {
  function Fitness(values) {
    if (values !== undefined) {
      this.setValues(values);
    }
  }

  Fitness.prototype.weights = function() {
    return this._weights;
  };

  Fitness.prototype.weightedValues = function() {
    return this._weightedValues;
  };

  Fitness.prototype.setValues = function(values) {
    if (this._weights === undefined) {
      throw 'Fitness class has no weights defined; use defineFitnessClass([weights...])';
    }

    var weighted = values.slice();

    for (var i = 0; i < weighted.length; i++) {
      weighted[i] = weighted[i] * this._weights[i];
    }

    this._weightedValues = weighted;

    return this;
  };

  Fitness.prototype.clearValues = function() {
    delete this._weightedValues;
  };

  Fitness.prototype.values = function() {
    if (this._weights === undefined) {
      throw 'Fitness class has no weights defined';
    }

    if (this._weightedValues === undefined) {
      return undefined;
    }

    var unweighted = this._weightedValues.slice();

    for (var i = 0; i < unweighted.length; i++) {
      unweighted[i] = unweighted[i] / this._weights[i];
    }

    return unweighted;
  };

  Fitness.prototype.compare = function(other) {
    if (!this.valid()) {
      return -1;
    }
    else if (!other.valid()) {
      return 1;
    }

    if (this._weightedValues.length !== other._weightedValues.length) {
      throw 'Cannot compare Fitnesses with differing lengths';
    }

    for (var i = 0; i < this._weightedValues.length; i++) {
      if (this._weightedValues[i] < other._weightedValues[i]) {
        return -1;
      }
      else if (this._weightedValues[i] > other._weightedValues[i]) {
        return 1;
      }
    }

    return 0;
  };

  Fitness.prototype.eq = function(other) {
    return this.compare(other) === 0;
  };

  Fitness.prototype.lt = function(other) {
    return this.compare(other) < 0;
  };

  Fitness.prototype.gt = function(other) {
    return this.compare(other) > 0;
  };

  Fitness.prototype.lte = function(other) {
    return this.compare(other) <= 0;
  };

  Fitness.prototype.gte = function(other) {
    return this.compare(other) >= 0;
  };

  Fitness.prototype.valid = function() {
    if (this._weightedValues === undefined) {
      return false;
    }
    if (this._weightedValues.length !== this._weights.length) {
      return false;
    }
    for (var i = 0; i < this._weightedValues.length; i++) {
      if (isNaN(this._weightedValues[i])) {
        return false;
      }
    }
    return true;
  };

  function defineFitnessClass(weights) {
    var ctor = function(values) {
      Fitness.call(this, values);
    };

    ctor.prototype = Object.create(Fitness.prototype);
    ctor.prototype.constructor = ctor;
    ctor.prototype._weights = weights;

    return ctor;
  }

  return {
    defineFitnessClass: defineFitnessClass
  };
}());
