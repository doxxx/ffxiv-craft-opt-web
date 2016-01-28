'use strict';

var SimulationService = function($timeout) {
  this.$timeout = $timeout;

  var worker = new Worker('js/simulationworker.js');

  var self = this;
  worker.onmessage = function(e) {
    if (e.data.success) {
      self.$timeout(function() {
        self.callbacks[e.data.id].success(e.data.success);
      });
    }
    else if (e.data.error) {
      self.$timeout(function() {
        self.callbacks[e.data.id].error(e.data.error);
      });
    }
    else {
      console.error('unexpected message from simulation worker: %O', e.data);
      if (e.data && e.data.id) {
        self.$timeout(function() {
          self.callbacks[e.data.id].error({log: '', error: 'unexpected message from simulation worker: ' + e.data});
        });
      }
    }
  };

  this.worker = worker;

  this.currentId = 0;
  this.callbacks = {};
};

SimulationService.$inject = ['$timeout'];

SimulationService.prototype.runMonteCarloSim = function(settings, success, error) {
  /*if (settings.sequence.length <= 0) {
    error({log: '', error: 'empty sequence'});
    return;
  }*/

  var id = this.nextId();

  this.callbacks[id] = {
    success: success,
    error: error
  };

  this.worker.postMessage({
    id: id,
    type: 'montecarlo',
    settings: settings
  });
};

SimulationService.prototype.runProbabilisticSim = function (settings, success, error) {
  if (settings.sequence.length <= 0) {
    error({log: '', error: 'empty sequence'});
    return;
  }

  var id = this.nextId();

  this.callbacks[id] = {
    success: success,
    error: error
  };

  this.worker.postMessage({
    id: id,
    type: 'prob',
    settings: settings
  });
};

SimulationService.prototype.nextId = function () {
  this.currentId += 1;
  return this.currentId;
};

angular.module('ffxivCraftOptWeb.services.simulator', []).
  service('_simulator', SimulationService);
