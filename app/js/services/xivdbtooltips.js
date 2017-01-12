(function () {
  'use strict';

  var languageIndex = {
    ja: 0,
    en: 1,
    de: 2,
    fr: 3
  };

  var hostnameRE = /\/\/xivdb\.com/;

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

  XIVDBTooltipsService.prototype.onLanguageChange = function (lang) {
    this.langIndex = languageIndex[lang];
    this._buildTooltipsCache();
  };

  XIVDBTooltipsService.prototype._fetch = function (cls, action) {
    var baseURL = 'http://legacy.xivdb.com/modules/fpop/fpop.php?version=1.6';

    // We can't use the $http module because each HTTP response triggers a digest update, which
    // causes significant lag when the app is loading because we're caching a couple hundred tooltips.
    var deferred = this.$q.defer();
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (xhr.readyState == XMLHttpRequest.DONE) {
        deferred.resolve({
          config: {
            cls: cls,
            action: action
          },
          data: xhr.response
        });
      }
    };
    xhr.responseType = "json";
    xhr.open("GET", baseURL + '&lang=' + this.langIndex + '&type=skill&id=' + action.skillID[cls], true);
    xhr.send();

    return deferred.promise;
  };

  XIVDBTooltipsService.prototype._buildTooltipsCache = function () {
    var fetches = [];

    for (var i = 0; i < this._allActions.length; i++) {
      var action = this._allActions[i];
      if (action.skillID) {
        if (action.cls == 'All') {
          for (var j = 0; j < this._allClasses.length; j++) {
            var cls = this._allClasses[j];
            fetches.push(this._fetch(cls, action));
          }
        }
        else {
          fetches.push(this._fetch(action.cls, action));
        }
      }
    }

    this.$q.all(fetches).then(function(responses) {
      var newTooltips = {};

      for (var i = 0; i < responses.length; i++) {
        var response = responses[i];
        var cls = response.config.cls;
        var action = response.config.action;
        var html = response.data.html;
        html = html.replace(hostnameRE, '//legacy.xivdb.com');
        newTooltips[cls + action.shortName] = html;
      }

      this.actionTooltips = newTooltips;

      this.$rootScope.$broadcast("tooltipCacheUpdated");
    }.bind(this));
  };
})();
