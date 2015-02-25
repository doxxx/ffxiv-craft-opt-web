'use strict';

// Declare app level module which depends on filters, and services
angular.module('ffxivCraftOptWeb', [
  'ngTouch',
  'ui.bootstrap',
  'ui.router',
  'lvl.directives.dragdrop',
  'ffxivCraftOptWeb.services',
  'ffxivCraftOptWeb.services.actions',
  'ffxivCraftOptWeb.services.localprofile',
  'ffxivCraftOptWeb.services.recipelibrary',
  'ffxivCraftOptWeb.services.simulator',
  'ffxivCraftOptWeb.services.solver',
  'ffxivCraftOptWeb.services.xivdbtooltips',
  'ffxivCraftOptWeb.directives',
  'ffxivCraftOptWeb.filters',
  'ffxivCraftOptWeb.controllers'
], function($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('/crafter');
  $stateProvider
    .state('crafter', {
      url: '/crafter',
      templateUrl: 'partials/crafter.html',
      controller: 'CrafterStatsController'
    })
    .state('solver', {
      url: '/solver',
      templateUrl: 'partials/solver.html',
      controller: 'SolverController'
    })
    .state('options', {
      url: '/options',
      templateUrl: 'partials/options.html'
    })
    .state('instructions', {
      url: '/instructions',
      templateUrl: 'partials/instructions.html'
    })
    .state('about', {
      url: '/about',
      templateUrl: 'partials/about.html'
    })
});

