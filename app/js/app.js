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
  $urlRouterProvider.when('/solver', '/solver/sequence');
  $stateProvider
    .state('crafter', {
      url: '/crafter',
      templateUrl: 'partials/crafter.html'
    })
    .state('synth', {
      url: '/synth',
      templateUrl: 'partials/synth.html'
    })
    .state('solver', {
      url: '/solver',
      templateUrl: 'partials/solver.html'
    })
    .state('solver.solver-sequence', {
      url: '/sequence',
      templateUrl: 'partials/solver_sequence.html'
    })
    .state('solver.solver-options', {
      url: '/options',
      templateUrl: 'partials/solver_options.html'
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

