'use strict';

var SolverService = function($timeout) {
  this.$timeout = $timeout;
};

SolverService.$inject = ['$timeout'];

SolverService.prototype.start = function(sequence, settings, progress, success, error) {
  this.stopRequested = false;
  var worker = this.worker = new Worker('js/solverworker.js');
  var self = this;
  worker.onmessage = function(e) {
    if (e.data.progress) {
      self.$timeout(function() {
        progress(e.data.progress);
      });
      if (!self.stopRequested && e.data.progress.generationsCompleted < settings.solver.generations) {
        worker.postMessage('rungen');
      }
      else {
        worker.postMessage('finish');
      }
    }
    else if (e.data.success) {
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
      console.error('unexpected message from solver worker: %O', e.data);
      worker.terminate();
      self.$timeout(function() {
        error({log: '', error: 'unexpected message from solver worker: ' + e.data});
      });
    }
  };
  worker.postMessage({start: settings});
};

SolverService.prototype.stop = function() {
  this.stopRequested = true;
};

angular.module('ffxivCraftOptWeb.services.solver', []).
  service('_solver', SolverService);
