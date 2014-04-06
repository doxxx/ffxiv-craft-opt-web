'use strict';

var LocalProfileService = function(_allClasses) {
  this.synths = JSON.parse(localStorage['synths'] || '{}');

  var modified = false;

  if (Object.keys(this.synths).length == 0) {
    var oldSavedSettings = localStorage['savedSettings'];
    if (oldSavedSettings) {
      // Import old saved settings as synths
      oldSavedSettings = JSON.parse(oldSavedSettings);
      for (var name in oldSavedSettings) {
        this.synths[name] = oldSavedSettings[name];
      }
      modified = true;
      localStorage.removeItem('savedSettings');
    }
  }

  if (localStorage['crafterStats']) {
    this.crafterStats = JSON.parse(localStorage['crafterStats']);
  }
  else {
    var oldCrafterSettings = localStorage['settings.crafter'];
    if (oldCrafterSettings) {
      // Import old crafter stats
      oldCrafterSettings = JSON.parse(oldCrafterSettings);
      this.crafterStats = oldCrafterSettings.stats;
      modified = true;
      localStorage.removeItem('settings.crafter');
    }
    else {
      // Initialize default stats
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
  }

  if (modified) {
    this.persist();
  }
};

LocalProfileService.$inject = ['_allClasses'];

LocalProfileService.prototype.userInfo = function () {
  return null;
};

LocalProfileService.prototype.synthNames = function () {
  return Object.keys(this.synths);
};

LocalProfileService.prototype.loadSynth = function (name) {
  return angular.copy(this.synths[name]);
};

LocalProfileService.prototype.saveSynth = function (name, synth) {
  this.synths[name] = angular.copy(synth);
  this.persist();
};

LocalProfileService.prototype.deleteSynth = function (name) {
  delete this.synths[name];
  this.persist();
};

LocalProfileService.prototype.renameSynth = function (oldName, newName) {
  this.synths[newName] = this.synths[oldName];
  delete this.synths[oldName];
  this.persist();
};

LocalProfileService.prototype.bindCrafterStats = function ($scope, expr) {
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

LocalProfileService.prototype.getCrafterStats = function () {
  return angular.copy(this.crafterStats);
};

LocalProfileService.prototype.persist = function() {
  localStorage['synths'] = JSON.stringify(this.synths);
  localStorage['crafterStats'] = JSON.stringify(this.crafterStats);
};

angular.module('ffxivCraftOptWeb.services.localprofile', []).
  service('_localProfile', LocalProfileService);
