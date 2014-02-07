'use strict';

var SolverService = function() {
};

SolverService.prototype.start = function(sequence, settings, progress, success, error) {
  if (sequence.length <= 0) {
    error({log: '', error: 'Must provide non-empty sequence'});
    return;
  }
  var worker = this.worker = new Worker('js/solverworker.js');
  this.worker.onmessage = function(e) {
    if (e.data.progress) {
      progress(e.data.progress);
    }
    else if (e.data.success) {
      success(e.data.success);
      worker.terminate();
    }
    else if (e.data.error) {
      error(e.data.error);
      worker.terminate();
    }
    else {
      console.error('unexpected message from solver worker: %O', e.data);
      error({log: '', error: 'unexpected message from solver worker: ' + e.data});
      worker.terminate();
    }
  };
  this.worker.postMessage(settings);
};

SolverService.prototype.stop = function() {
  this.worker.terminate();
};

angular.module('ffxivCraftOptWeb.services.solver', []).
  service('_solver', SolverService);
