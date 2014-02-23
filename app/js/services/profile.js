'use strict';

var ProfileService = function(_allClasses) {
  this.synths = JSON.parse(localStorage['synths'] || '{}');

  // Move old saved settings into the new synths.
  var oldSavedSettings = localStorage['savedSettings'];
  if (oldSavedSettings) {
    oldSavedSettings = JSON.parse(oldSavedSettings);
    localStorage.removeItem('savedSettings');
    for (var name in oldSavedSettings) {
      this.synths[name] = oldSavedSettings[name];
    }
    this.persist();
  }

  if (localStorage['crafterStats']) {
    this.crafterStats = JSON.parse(localStorage['crafterStats']);
  }
  else {
    var crafterStats = {};

    for (var i = 0; i < _allClasses.length; i++) {
      var c = _allClasses[i];
      crafterStats[c] = {
        level: 1,
        craftsmanship: 24,
        control: 0,
        cp: 180,
        actions: ['basicSynth']
      }
    }

    this.crafterStats = crafterStats;
  }
};

ProfileService.$inject = ['_allClasses'];

ProfileService.prototype.synthNames = function () {
  return Object.keys(this.synths);
};

ProfileService.prototype.loadSynth = function (name) {
  return angular.copy(this.synths[name]);
};

ProfileService.prototype.saveSynth = function (name, synth) {
  this.synths[name] = angular.copy(synth);
  this.persist();
};

ProfileService.prototype.deleteSynth = function (name) {
  delete this.synths[name];
  this.persist();
};

ProfileService.prototype.renameSynth = function (oldName, newName) {
  this.synths[newName] = this.synths[oldName];
  delete this.synths[oldName];
  this.persist();
};

ProfileService.prototype.bindCrafterStats = function ($scope, expr) {
  var self = this;
  var stats = $scope.$eval(expr);
  for (var cls in this.crafterStats) {
    stats[cls] = this.crafterStats[cls];
    $scope.$watchCollection(expr + '.' + cls, function() {
      self.persist();
    });
    $scope.$watchCollection(expr + '.' + cls + '.actions', function() {
      self.persist();
    });
  }
};

ProfileService.prototype.persist = function() {
  localStorage['synths'] = JSON.stringify(this.synths);
  localStorage['crafterStats'] = JSON.stringify(this.crafterStats);
};

angular.module('ffxivCraftOptWeb.services.profile', []).
  service('_profile', ProfileService);
