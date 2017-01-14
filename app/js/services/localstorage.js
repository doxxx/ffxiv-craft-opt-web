(function () {
  'use strict';

  angular
    .module('ffxivCraftOptWeb.services.storage', [])
    .service('_localStorage', LocalStorageService);

  function LocalStorageService() {
  }

  LocalStorageService.prototype.get = function (key) {
    var value = localStorage.getItem(key);
    if (value !== null) value = JSON.parse(value);
    return value;
  };

  LocalStorageService.prototype.put = function (key, value) {
    if (value === undefined || value === null) {
      throw new TypeError('value may not be undefined or null');
    }
    localStorage.setItem(key, JSON.stringify(value));
  };

  LocalStorageService.prototype.remove = function (key) {
    localStorage.removeItem(key);
  };

  LocalStorageService.prototype.hasKey = function (key) {
    return localStorage.getItem(key) !== null;
  };

})();
