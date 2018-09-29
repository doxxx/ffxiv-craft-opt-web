(function () {
  'use strict';

  angular
    .module('ffxivCraftOptWeb.services.buffsdb', ['ffxivCraftOptWeb.services.locale'])
    .service('_buffsDatabase', BuffsDatabaseService);

  function BuffsDatabaseService($http, $q, _languages) {
    this.$http = $http;
    this.$q = $q;
    this._languages = _languages;
    this.cache = {}
  }

  BuffsDatabaseService.$inject = ['$http', '$q', '_languages'];

  BuffsDatabaseService.prototype.buffs = function (lang, type) {
    if (!angular.isDefined(lang)) lang = 'en';
    if (!this._languages[lang]) {
      return this.$q.reject(new Error('invalid language: ' + lang));
    }
    var key = cache_key(lang, type);
    var promise = this.cache[key];
    if (!promise) {
      promise = this.$http.get('data/buffs/' + type + '.json').then(
        function (r) {
          var result = r.data.map(buffForLang.bind(this, lang));
          result.sort(function (a, b) {
            if (a.name < b.name) return -1;
            else if (a.name > b.name) return 1;
            if (!a.hq && b.hq) return -1;
            else if (a.hq && !b.hq) return 1;
            return 0;
          });
          result = result.map(function (buff) {
            var r = angular.copy(buff);
            r.id = r.name + (r.hq ? ':hq' : '');
            return r;
          });
          result.unshift();
          return result;
        }
      );
      this.cache[key] = promise;
    }
    return promise;
  };

  function buffForLang(lang, buff) {
    if (typeof buff.name !== 'object') return buff;

    var r = {};
    for (var p in buff) {
      if (buff.hasOwnProperty(p) && p !== "name") {
        r[p] = buff[p];
      }
    }
    r.name = buff.name[lang] || buff.name['en'];
    return r;
  }


  function cache_key(lang, type) {
    return lang + ':' + type;
  }
})();
