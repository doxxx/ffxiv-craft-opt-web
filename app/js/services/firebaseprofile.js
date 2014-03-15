'use strict';

var FirebaseProfileService = function(_allClasses, $q, $parse, $firebase, $firebaseSimpleLogin) {
  this._allClasses = _allClasses;
  this.$q = $q;
  this.$parse = $parse;

  var fbRoot = new Firebase('http://ffxiv-craft-opt.firebaseio.com/')
  this.fb = $firebase(fbRoot);
  this.fbAuth = $firebaseSimpleLogin(fbRoot);

  this.crafterStatsUnbind = null;
};

FirebaseProfileService.$inject = ['_allClasses', '$q', '$parse', '$firebase', '$firebaseSimpleLogin'];

FirebaseProfileService.prototype.check = function () {
  return this.fbAuth.$getCurrentUser().then(
    function(user) {
      if (user != null) {
        this.onLogin(user);
        return user;
      }
      else {
        return this.$q.reject();
      }
    }.bind(this)
  );
};

FirebaseProfileService.prototype.create = function (info) {
  return this.fbAuth.$createUser(info.email, info.password, true);
};

FirebaseProfileService.prototype.login = function (info) {
  return this.fbAuth.$login('password', info).then(
    function(user) {
      this.onLogin(user);
      // resolve promise to notify application
      return user;
    }.bind(this)
  );
};

FirebaseProfileService.prototype.logout = function () {
  this.crafterStatsUnbind();
  this.fbAuth.$logout();
};

FirebaseProfileService.prototype.userInfo = function () {
  return this.fbAuth.user;
};

FirebaseProfileService.prototype.onLogin = function (user) {
  // user authenticated with Firebase
  this.synths = this._userRoot().$child('synths');
};

FirebaseProfileService.prototype.initCrafterStats = function (stats) {
  for (var i = 0; i < this._allClasses.length; i++) {
    var c = this._allClasses[i];
    stats[c] = {
      level: 1,
      craftsmanship: 24,
      control: 0,
      cp: 180,
      actions: ['basicSynth']
    }
  }
};

FirebaseProfileService.prototype.synthNames = function () {
  if (!this.synths) {
    return [];
  }
  return this.synths.$getIndex();
};

FirebaseProfileService.prototype.loadSynth = function (name) {
  var synth = angular.copy(this.synths[name]);
  if (synth && synth.sequence === undefined) {
    synth.sequence = [];
  }
  return synth;
};

FirebaseProfileService.prototype.saveSynth = function (name, synth) {
  this.synths[name] = angular.copy(synth);
  this.synths.$save(name);
};

FirebaseProfileService.prototype.deleteSynth = function (name) {
  delete this.synths[name];
  this.synths.$remove(name);
};

FirebaseProfileService.prototype.renameSynth = function (oldName, newName) {
  this.synths[newName] = this.synths[oldName];
  delete this.synths[oldName];
  this.synths.$save(newName);
  this.synths.$remove(oldName);
};

FirebaseProfileService.prototype.bindCrafterStats = function ($scope, expr) {
  var fbCrafterStats = this._userRoot().$child('crafterStats');
  if (fbCrafterStats.$getIndex().length == 0) {
    this.initCrafterStats(fbCrafterStats);
    fbCrafterStats.$save();
    this.$parse(expr).assign($scope, fbCrafterStats);
  }
  else {
    this.$parse(expr).assign($scope, {})
  }
  fbCrafterStats.$bind($scope, expr).then(function(unbind) {
    this.crafterStatsUnbind = unbind;
  }.bind(this));
};

FirebaseProfileService.prototype._userRoot = function () {
  return this.fb.$child('users').$child(this.fbAuth.user.uid);
};

angular.module('ffxivCraftOptWeb.services.firebaseprofile', [
  'firebase',
]).service('_firebaseProfile', FirebaseProfileService);
