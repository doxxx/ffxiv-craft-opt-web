(function () {
  'use strict';

  angular
    .module('ffxivCraftOptWeb.services.translateLocalStorage', [])
    .factory('_translateLocalStorage', translateLocalStorage);

  function translateLocalStorage() {
    return {
      put: put,
      get: get
    };

    //////////////////////////////////////////////////////////////////////////

    function get(name) {
      return localStorage[name];
    }

    function put(name, value) {
      localStorage[name] = value;
    }
  }
})();
