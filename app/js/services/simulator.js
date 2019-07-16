(function () {
  'use strict';

  angular
    .module('ffxivCraftOptWeb.services.simulator', [])
    .service('_simulator', SimulatorService);

  function SimulatorService($timeout) {
    this.$timeout = $timeout;

    var worker = new Worker('js/simulationworker.js');

    var self = this;
    worker.onmessage = function (e) {
      if (e.data.success) {
        self.$timeout(function () {
          self.callbacks[e.data.id].success(e.data.success);
        });
      }
      else if (e.data.error) {
        self.$timeout(function () {
          self.callbacks[e.data.id].error(e.data.error);
        });
      }
      else {
        console.error('unexpected message from simulation worker: %O', e.data);
        if (e.data && e.data.id) {
          self.$timeout(function () {
            self.callbacks[e.data.id].error({log: '', error: 'unexpected message from simulation worker: ' + e.data});
          });
        }
      }
    };

    this.worker = worker;

    this.currentId = 0;
    this.callbacks = {};
  }

  SimulatorService.$inject = ['$timeout'];

  SimulatorService.prototype.runMonteCarloSim = function(settings, success, error) {
    if (settings.sequence.length <= 0) {
      error({log: '', error: 'empty sequence'});
      return;
    }
    if (settings.recipe.startQuality === undefined) {
      settings.recipe = angular.copy(settings.recipe);
      settings.recipe.startQuality = 0;
    }

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

  SimulatorService.prototype.runProbabilisticSim = function (settings, success, error) {
    if (settings.sequence.length <= 0) {
      error({log: '', error: 'empty sequence'});
      return;
    }
    if (settings.recipe.startQuality === undefined) {
      settings.recipe = angular.copy(settings.recipe);
      settings.recipe.startQuality = 0;
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

  SimulatorService.prototype.calculateBaseValues = function (settings, success, error) {
    var id = this.nextId();
    this.callbacks[id] = {
      success: success,
      error: error
    };
    this.worker.postMessage({
      id: id,
      type: 'baseValues',
      settings: settings,
    });
  };

  SimulatorService.prototype.nextId = function () {
    this.currentId += 1;
    return this.currentId;
  };
})();
