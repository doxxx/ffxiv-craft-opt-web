(function () {
  'use strict';

  angular
    .module('ffxivCraftOptWeb.services.profile', [])
    .service('_profile', ProfileService);

  function ProfileService($timeout, _allClasses, _actionsByName) {
    this.$timeout = $timeout;
    this._allClasses = _allClasses;
    this._actionsByName = _actionsByName;
    return this;
  }

  ProfileService.$inject = ['$timeout', '_allClasses', '_actionsByName'];

  ProfileService.prototype.useStorage = function (storage) {
    if (storage === undefined || storage === null) {
      throw new TypeError('storage may not be undefined or null');
    }
    this.storage = storage;
  };

  ProfileService.prototype.load = function () {
    return this.$timeout(function () {
      this.synths = this.storage.get('synths') || {};

      var modified = false;
      var name;

      if (Object.keys(this.synths).length === 0) {
        var oldSavedSettings = this.storage.get('savedSettings');
        if (oldSavedSettings) {
          // Import old saved settings as synths
          for (name in oldSavedSettings) {
            this.synths[name] = oldSavedSettings[name];
          }
          modified = true;
          this.storage.remove('savedSettings');
        }
      }

      // Upgrade existing synths with new settings
      for (name in this.synths) {
        var synth = this.synths[name];
        // Nothing to do here
      }

      if (this.storage.hasKey('crafterStats')) {
        this.crafterStats = this.storage.get('crafterStats');
      }
      else {
        var oldCrafterSettings = this.storage.get('settings.crafter');
        if (oldCrafterSettings) {
          // Import old crafter stats
          this.crafterStats = oldCrafterSettings.stats;
          modified = true;
          this.storage.remove('settings.crafter');
        }
        else {
          // Initialize default stats
          var crafterStats = {};

          for (var i = 0; i < this._allClasses.length; i++) {
            var c = this._allClasses[i];
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

      for (var i = 0; i < this._allClasses.length; i++) {
        var c = this._allClasses[i];
        var sanitizedActions = [];
        for (var j = 0; j < this.crafterStats[c].actions.length; j++) {
          var action = this.crafterStats[c].actions[j];
          if (!angular.isDefined(action)) continue;
          var info = this._actionsByName[action];
          if (!angular.isDefined(info)) continue;
          sanitizedActions.push(action);
        }

        if (!angular.equals(sanitizedActions, this.crafterStats[c].actions)) {
          this.crafterStats[c].actions = sanitizedActions;
          modified = true;
        }
      }

      if (modified) {
        this.persist();
      }

        return this;
    }.bind(this));
  };

  ProfileService.prototype.userInfo = function () {
    return null;
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

  ProfileService.prototype.getCrafterStats = function () {
    return angular.copy(this.crafterStats);
  };

  ProfileService.prototype.persist = function() {
    this.storage.put('synths', this.synths);
    this.storage.put('crafterStats', this.crafterStats);
  };

  ProfileService.prototype.setCharacter = function (obj) {
    this.storage.put('character', obj);
  };

  ProfileService.prototype.getCharacter = function () {
    return this.storage.get('character');
  };

  ProfileService.prototype.isLoaded = function () {
    return this.synths || this.crafterStats;
  };

})();
