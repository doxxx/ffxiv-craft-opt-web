'use strict';

var ProfileService = function() {
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
};

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

ProfileService.prototype.persist = function() {
  localStorage['synths'] = JSON.stringify(this.synths);
};

angular.module('ffxivCraftOptWeb.services.profile', []).
  service('_profile', ProfileService);
