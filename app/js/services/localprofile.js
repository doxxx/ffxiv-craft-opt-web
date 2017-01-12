(function () {
  'use strict';

  angular
    .module('ffxivCraftOptWeb.services.localprofile', [])
    .service('_localProfile', LocalProfileService);

  function LocalProfileService(_allClasses, _actionsByName) {
    this.synths = JSON.parse(localStorage['synths'] || '{}');

    var modified = false;
    var name;

    if (Object.keys(this.synths).length === 0) {
      var oldSavedSettings = localStorage['savedSettings'];
      if (oldSavedSettings) {
        // Import old saved settings as synths
        oldSavedSettings = JSON.parse(oldSavedSettings);
        for (name in oldSavedSettings) {
          this.synths[name] = oldSavedSettings[name];
        }
        modified = true;
        localStorage.removeItem('savedSettings');
      }
    }

    // Upgrade existing synths with new settings
    for (name in this.synths) {
      var synth = this.synths[name];
      // Nothing to do here
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

    for (var i = 0; i < _allClasses.length; i++) {
      var c = _allClasses[i];
      var sanitizedActions = [];
      for (var j = 0; j < this.crafterStats[c].actions.length; j++) {
        var action = this.crafterStats[c].actions[j];
        if (!angular.isDefined(action)) continue;
        var info = _actionsByName[action];
        if (!angular.isDefined(info)) continue;
        sanitizedActions.push(action);
      }

      if (!angular.equals(sanitizedActions, this.crafterStats[c].actions)) {
        this.crafterStats[c].actions = sanitizedActions;
        modified = true;
      }
    }

    if (localStorage['lodestoneID']) {
      this.lodestoneID = JSON.parse(localStorage['lodestoneID']);
    }

    if (modified) {
      this.persist();
    }
  }

  LocalProfileService.$inject = ['_allClasses', '_actionsByName'];

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

  LocalProfileService.prototype.getLodestoneID = function () {
    return this.lodestoneID;
  };

  LocalProfileService.prototype.setLodestoneID = function (id) {
    this.lodestoneID = id;
    this.persist();
  };

  LocalProfileService.prototype.persist = function() {
    localStorage['synths'] = JSON.stringify(this.synths);
    localStorage['crafterStats'] = JSON.stringify(this.crafterStats);
    if (this.lodestoneID) localStorage['lodestoneID'] = JSON.stringify(this.lodestoneID);
  };
})();
