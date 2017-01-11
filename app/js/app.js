(function () {
  'use strict';

  angular
    .module('ffxivCraftOptWeb', [
      'ui.bootstrap',
      'ui.router',
      'pascalprecht.translate',
      'lvl.directives.dragdrop',
      'ffxivCraftOptWeb.services.actions',
      'ffxivCraftOptWeb.services.localprofile',
      'ffxivCraftOptWeb.services.recipelibrary',
      'ffxivCraftOptWeb.services.simulator',
      'ffxivCraftOptWeb.services.solver',
      'ffxivCraftOptWeb.services.translateLocalStorage',
      'ffxivCraftOptWeb.services.xivdbtooltips',
      'ffxivCraftOptWeb.services.xivdb',
      'ffxivCraftOptWeb.directives',
      'ffxivCraftOptWeb.controllers',
      'ffxivCraftOptWeb.components'
    ], config);

  function config($stateProvider, $urlRouterProvider, $translateProvider) {
    $urlRouterProvider.otherwise('/simulator');

    $stateProvider
      .state('crafter-attributes', {
        url: '/crafter-attributes',
        templateUrl: 'views/crafter-attributes.html',
        controller: 'CrafterStatsController'
      })
      .state('simulator', {
        url: '/simulator',
        templateUrl: 'views/simulator.html',
        controller: 'SimulatorController'
      })
      .state('solver', {
        url: '/solver',
        templateUrl: 'views/solver.html',
        controller: 'SolverController',
        params: {
          autoStart: null
        }
      })
      .state('instructions', {
        url: '/instructions',
        templateUrl: 'views/instructions.html'
      })
      .state('about', {
        url: '/about',
        templateUrl: 'views/about.html'
      });

    // Define the English translations here so that they are immediately
    // available without requiring a network round-trip.
    // Translation keys should be the actual English so that they can be used
    // as-is without having to redefine it here. The exception is when
    // interpolation is required: then the key should be an all uppercase token.
    $translateProvider.translations('en', {});

    $translateProvider.useStaticFilesLoader({
      prefix: 'locale/',
      suffix: '.json'
    });

    $translateProvider.useLoaderCache(true);

    // Backwards compatibility with v13.
    if (localStorage['lang']) {
      $translateProvider.preferredLanguage(localStorage['lang']);
      localStorage.removeItem('lang');
    }
    else {
      $translateProvider.preferredLanguage('en');
    }

    $translateProvider.useStorage('_translateLocalStorage');
  }
})();
