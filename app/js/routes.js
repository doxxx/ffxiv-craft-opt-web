(function () {
  'use strict';

  angular
    .module('ffxivCraftOptWeb')
    .config(Routes);

  function Routes($stateProvider, $urlRouterProvider) {
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
  }
})();
