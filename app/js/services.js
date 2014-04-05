'use strict';

/* Services */

angular.module('ffxivCraftOptWeb.services', [])
  .value('_version', '0.1')
  .factory('_getSolverServiceURL', function ($location) {
    return function () {
      if ($location.host() == 'localhost') {
        return 'http://localhost:8080/'
      }
      else {
        return 'http://ffxiv-craft-opt.appspot.com/'
      }
    }
  });
