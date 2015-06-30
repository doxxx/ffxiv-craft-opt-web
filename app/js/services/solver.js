'use strict';

var SolverService = function($timeout) {
  this.$timeout = $timeout;
};

SolverService.$inject = ['$timeout'];

SolverService.prototype.start = function(sequence, settings, progress, success, error) {
  if (this.worker) {
    this.worker.terminate();
  }
  this.stopRequested = false;
  var worker = this.worker = new Worker('js/solverworker.js');
  var self = this;
  worker.onmessage = function(e) {
    if (e.data.progress) {
      self.$timeout(function() {
        progress(e.data.progress);
      });
      if (!self.stopRequested && e.data.progress.generationsCompleted < e.data.progress.maxGenerations) {
        worker.postMessage('rungen');
      }
      else {
        worker.postMessage('finish');
      }
    }
    else if (e.data.success) {
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

SolverService.prototype.resume = function() {
  if (this.worker) {
    this.stopRequested = false;
    this.worker.postMessage('resume');
  }
};

SolverService.prototype.reset = function() {
  this.worker.terminate();
};

angular.module('ffxivCraftOptWeb.services.solver', []).
  service('_solver', SolverService);
