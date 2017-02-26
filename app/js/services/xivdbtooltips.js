(function () {
  'use strict';

  var baseURL = 'https://secure.xivdb.com/tooltip';

  angular
    .module('ffxivCraftOptWeb.services.xivdbtooltips', [])
    .service('_xivdbtooltips', XIVDBTooltipsService);

  function XIVDBTooltipsService($rootScope, $q, _allActions, _allClasses, _actionsByName) {
    this.$rootScope = $rootScope;
    this.$q = $q;
    this._allActions = _allActions;
    this._allClasses = _allClasses;
    this._actionsByName = _actionsByName;

    this.actionTooltips = {};
  }

  XIVDBTooltipsService.$inject = ['$rootScope', '$q', '_allActions', '_allClasses', '_actionsByName'];

  XIVDBTooltipsService.prototype.loadTooltips = function (lang) {
    var actions = [];
    for (var i = 0; i < this._allActions.length; i++) {
      var action = this._allActions[i];
      if (action.skillID) {
        if (action.cls == 'All') {
          for (var j = 0; j < this._allClasses.length; j++) {
            var cls = this._allClasses[j];
            actions.push({shortName: action.shortName, cls: cls, skillID: action.skillID[cls]});
          }
        }
        else {
          actions.push({shortName: action.shortName, cls: action.cls, skillID: action.skillID[action.cls]});
        }
      }
    }

    return this._fetch(actions, lang).then(function (response) {
      var newTooltips = {};
      var actions = response.config.actions;
      for (var i = 0; i < actions.length; i++) {
        var action = actions[i];
        newTooltips[action.cls + action.shortName] = response.data.action[i].html;
      }
      this.actionTooltips = newTooltips;
      this.$rootScope.$broadcast("tooltipCacheUpdated");
    }.bind(this));
  };

  XIVDBTooltipsService.prototype._fetch = function (actions, lang) {
    var url = baseURL + '?language=' + lang;
    var ids = actions.map(function (action) { return action.skillID });
    url += '&list[action]:=' + ids.join(',');

    // We can't use the $http module because each HTTP response triggers a digest update, which
    // causes significant lag when the app is loading because we're caching a couple hundred tooltips.
    var deferred = this.$q.defer();
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (xhr.readyState == XMLHttpRequest.DONE) {
        deferred.resolve({
          config: {
            actions: actions
          },
          data: xhr.response
        });
      }
    };
    xhr.responseType = "json";
    xhr.open("GET", url, true);
    xhr.send();

    return deferred.promise;
  };


})();
