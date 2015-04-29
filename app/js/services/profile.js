'use strict';

var ProfileService = function(_allClasses, _localStorage, _cloudStorage) {
  this._allClasses = _allClasses;
  this._localStorage = _localStorage;
  this._cloudStorage = _cloudStorage;

  this.synths = {};

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

  return this;
};

ProfileService.$inject = ['_allClasses', '_localStorage', '_cloudStorage'];

ProfileService.prototype.init = function (success, failure) {
  if (this._localStorage.hasKey('synths')) {
    this.loadFromLocal();
  }

  var cloudKey = localStorage.getItem('cloudKey');
  if (cloudKey) {
    this.importFromCloud(cloudKey, success, failure);
  }
  else {
    if (success) success();
  }
};

ProfileService.prototype.loadFromLocal = function () {
  this.synths = this._localStorage.get('synths');

  var modified = false;
  var name;

  if (Object.keys(this.synths).length === 0) {
    var oldSavedSettings = this._localStorage.get('savedSettings');
    if (oldSavedSettings) {
      // Import old saved settings as synths
      for (name in oldSavedSettings) {
        this.synths[name] = oldSavedSettings[name];
      }
      modified = true;
      this._localStorage.remove('savedSettings');
    }
  }

  // Upgrade existing synths with new settings
  for (name in this.synths) {
    var synth = this.synths[name];
    if (synth.sequenceSettings.useConditions === undefined) {
      synth.sequenceSettings.useConditions = true;
      modified = true;
    }
  }

  if (this._localStorage.hasKey('crafterStats')) {
    this.crafterStats = this._localStorage.get('crafterStats');
  }
  else {
    var oldCrafterSettings = this._localStorage.get('settings.crafter');
    if (oldCrafterSettings) {
      // Import old crafter stats
      this.crafterStats = oldCrafterSettings.stats;
      modified = true;
      this._localStorage.remove('settings.crafter');
    }
  }

  if (modified) {
    this.persist();
  }
};

ProfileService.prototype.importFromCloud = function (cloudKey, success, failure) {
  var self = this;
  this._cloudStorage.load(cloudKey,
    function () {
      self.synths = self._cloudStorage.get('synths');
      self.crafterStats = self._cloudStorage.get('crafterStats');
      if (success) success();
    },
    function () {
      if (failure) failure();
    }
  );
};

ProfileService.prototype.createInCloud = function (cloudKey, success, failure) {
  var data = {
    synths: this.synths,
    crafterStats: this.crafterStats
  };
  this._cloudStorage.create(cloudKey, data, success, failure);
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
  this._localStorage.put('synths', this.synths);
  this._localStorage.put('crafterStats', this.crafterStats);
  if (this._cloudStorage.loaded()) {
    this._cloudStorage.put('synths', this.synths);
    this._cloudStorage.put('crafterStats', this.crafterStats);
  }
};

angular.module('ffxivCraftOptWeb.services.profile', []).
  service('_profile', ProfileService);
