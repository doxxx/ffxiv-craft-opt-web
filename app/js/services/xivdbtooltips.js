'use strict';

var languageIndex = {
  ja: 0,
  en: 1,
  de: 2,
  fr: 3
};

var XIVDBTooltips = function($http, _allActions, _allClasses, _actionsByName) {
  this.$http = $http;
  this._allActions = _allActions;
  this._allClasses = _allClasses;
  this._actionsByName = _actionsByName;

  this.actionTooltips = {};
};

XIVDBTooltips.$inject = ['$http', '_allActions', '_allClasses', '_actionsByName'];

XIVDBTooltips.prototype.onLanguageChange = function (lang) {
  console.log("XIVDBTooltips language -> ", lang);
  this._buildTooltipsCache(lang);
};

XIVDBTooltips.prototype.actionTooltip = function (action, cls) {
  if (!angular.isDefined(action)) {
    console.error('undefined action param');
    return undefined;
  }
  var info = this._actionsByName[action];
  if (!angular.isDefined(info)) {
    console.error('unknown action: %s', action);
    return undefined;
  }
  var tooltipClass = info.cls;
  if (tooltipClass == 'All') {
    tooltipClass = cls;
  }
  var tooltip = this.actionTooltips[tooltipClass + action];
  return tooltip ? tooltip : action.name;
};

XIVDBTooltips.prototype._fetch = function (lang, cls, action) {
  var url = 'http://xivdb.com/modules/fpop/fpop.php?version=1.6';
  var config = {
    params: {
      lang: languageIndex[lang],
      type: 'skill',
      id: action.skillID[cls]
    },
    cls: cls,
    action: action
  };
  return this.$http.get(url, config);
};

XIVDBTooltips.prototype._updateCache = function (data) {
  var cls = data.config.cls;
  var action = data.config.action;
  this.actionTooltips[cls + action.shortName] = data.data.html;
};

XIVDBTooltips.prototype._buildTooltipsCache = function (lang) {
  if (!lang) return;

  for (var i = 0; i < this._allActions.length; i++) {
    var action = this._allActions[i];
    if (action.skillID) {
      if (action.cls == 'All') {
        for (var j = 0; j < this._allClasses.length; j++) {
          var cls = this._allClasses[j];
          this._fetch(lang, cls, action).then(this._updateCache.bind(this));
        }
      }
      else {
        this._fetch(lang, action.cls, action).then(this._updateCache.bind(this));
      }
    }
  }
}

angular.module('ffxivCraftOptWeb.services.xivdbtooltips', []).
  service('_xivdbtooltips', XIVDBTooltips);
