'use strict';

var SolverService = function($timeout) {
  this.$timeout = $timeout;

  this.worker = new Worker('js/solver/worker.js');

  var self = this,
    worker = this.worker;

  worker.onmessage = function(e) {
    if (e.data.progress) {
      self.$timeout(function() {
        self.callbacks.progress(e.data.progress);
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
        self.callbacks.success(e.data.success);
      });
    }
    else if (e.data.error) {
      self.$timeout(function() {
        self.callbacks.error(e.data.error);
      });
    }
    else {
      console.error('unexpected message from solver worker: %O', e.data);
      self.$timeout(function() {
        self.callbacks.error({log: '', error: 'unexpected message from solver worker: ' + e.data});
      });
    }
  };
};

SolverService.$inject = ['$timeout'];

SolverService.prototype.start = function(sequence, settings, progress, success, error) {
  this.stopRequested = false;
  this.callbacks = {
    progress: progress,
    success: success,
    error: error
  };
  this.worker.postMessage({start: settings});
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

angular.module('ffxivCraftOptWeb.services.solver', []).
  service('_solver', SolverService);
