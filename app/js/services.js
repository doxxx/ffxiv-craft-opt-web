'use strict';

/* Services */


var services = angular.module('ffxivCraftOptWeb.services', []);

services.value('_version', '0.1');
services.factory('_getSolverServiceURL', function($location) {
  return function() {
    if ($location.host() == 'localhost') {
      return 'http://localhost:8080/'
    }
    else {
      return 'http://ffxiv-craft-opt.appspot.com/'
    }
  }
});
