'use strict';

var SimulationService = function($timeout) {
  this.$timeout = $timeout;

  var worker = new Worker('js/simulationworker.js');

  var self = this;
  worker.onmessage = function(e) {
    if (e.data.success) {
      self.$timeout(function() {
        self.callbacks.success(e.data.success);
      });
    }
    else if (e.data.error) {
      self.$timeout(function() {
        self.callbacks.error(e.data.error);
      });
    }
    else {
      console.error('unexpected message from simulation worker: %O', e.data);
      self.$timeout(function() {
        self.callbacks.error({log: '', error: 'unexpected message from simulation worker: ' + e.data});
      });
    }
  };

  this.worker = worker;
};

SimulationService.$inject = ['$timeout'];

SimulationService.prototype.start = function(settings, success, error) {
  if (settings.sequence.length <= 0) {
    error({log: '', error: 'empty sequence'});
    return;
  }
  if (settings.recipe.startQuality === undefined) {
    settings.recipe = angular.copy(settings.recipe);
    settings.recipe.startQuality = 0;
  }

  this.callbacks = {
    success: success,
    error: error
  };

  this.worker.postMessage(settings);
};

angular.module('ffxivCraftOptWeb.services.simulator', []).
  service('_simulator', SimulationService);
