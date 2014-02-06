'use strict';

angular.module('ffxivCraftOptWeb.services.simulator', []).
  factory('_runSimulation', function() {
    return function(sequence, settings, success, error) {
      if (sequence.length <= 0) {
        error({log: '', error: 'Must provide non-empty sequence'});
        return;
      }
      var worker = new Worker('js/simulationworker.js');
      worker.onmessage = function(e) {
        if (e.data.success) {
          success(e.data.success);
        }
        else if (e.data.error) {
          error(e.data.error);
        }
        else {
          console.error('unexpected message from simulation worker: %O', e.data);
          worker.terminate();
          error({log: '', error: 'unexpected message from simulation worker: ' + e.data});
        }
      };
      worker.postMessage(settings);
    }
  });
