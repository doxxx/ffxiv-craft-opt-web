'use strict';

var ProfileService = function() {
  this.savedSettings = JSON.parse(localStorage['savedSettings'] || '{}');
};

ProfileService.prototype.settingsNames = function () {
  return Object.keys(this.savedSettings);
};

ProfileService.prototype.loadSettings = function (name) {
  return angular.copy(this.savedSettings[name]);
};

ProfileService.prototype.saveSettings = function(name, settings) {
  this.savedSettings[name] = angular.copy(settings);
  this.persist();
};

ProfileService.prototype.deleteSettings = function (name) {
  delete this.savedSettings[name];
  this.persist();
};

ProfileService.prototype.renameSettings = function(oldName, newName) {
  this.savedSettings[newName] = this.savedSettings[oldName];
  delete this.savedSettings[oldName];
  this.persist();
};

ProfileService.prototype.persist = function() {
  localStorage['savedSettings'] = JSON.stringify(this.savedSettings);
};

angular.module('ffxivCraftOptWeb.services.profile', []).
  service('_profile', ProfileService);
