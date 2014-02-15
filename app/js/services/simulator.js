'use strict';

var SimulationService = function($timeout) {
  this.$timeout = $timeout;
};

SimulationService.$inject = ['$timeout'];

SimulationService.prototype.start = function(sequence, settings, success, error) {
  if (sequence.length <= 0) {
    error({log: '', error: 'empty sequence'});
    return;
  }
  var worker = this.worker = new Worker('js/simulationworker.js');
  var self = this;
  worker.onmessage = function(e) {
    if (e.data.success) {
      worker.terminate();
      self.$timeout(function() {
        success(e.data.success);
      });
    }
    else if (e.data.error) {
      worker.terminate();
      self.$timeout(function() {
        error(e.data.error);
      });
    }
    else {
      worker.terminate();
      console.error('unexpected message from simulation worker: %O', e.data);
      self.$timeout(function() {
        error({log: '', error: 'unexpected message from simulation worker: ' + e.data});
      });
    }
  };
  worker.postMessage(settings);
};

angular.module('ffxivCraftOptWeb.services.simulator', []).
  service('_simulator', SimulationService);
