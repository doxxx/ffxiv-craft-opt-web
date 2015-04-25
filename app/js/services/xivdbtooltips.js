'use strict';

const languageIndex = {
  ja: 0,
  en: 1,
  de: 2,
  fr: 3
};

var XIVDBTooltips = function($http) {
  this.$http = $http;
};

XIVDBTooltips.$inject = ['$http'];

XIVDBTooltips.prototype.fetch = function(lang, id) {
  var url = 'http://xivdb.com/modules/fpop/fpop.php?version=1.6';
  var config = { params: { lang: languageIndex[lang], type: 'skill', id: id } };
  return this.$http.get(url, config).then(function(data, status, headers, config) {
    return data.data.html;
  });
};

angular.module('ffxivCraftOptWeb.services.xivdbtooltips', []).
  service('_xivdbtooltips', XIVDBTooltips);
