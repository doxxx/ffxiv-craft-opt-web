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
      .state('recipe', {
        url: '/recipe?class&name&lang',
        onEnter: function ($transition$, $state, $rootScope, $translate, _recipeLibrary) {
          var params = $transition$.params();
          var cls = params.class;
          var name = params.name;
          var lang = params.lang || $translate.use();
          return _recipeLibrary.recipeForClassByName(lang, cls, name)
            .then(function (recipe) {
              if (lang != $translate.use()) $translate.use(lang);
              recipe = angular.copy(recipe);
              recipe.cls = cls;
              recipe.startQuality = 0;
              $rootScope.$broadcast('recipe.selected', recipe);
              return $state.target('simulator');
            })
            .catch(function (err) {
              console.error("Failed to load recipe: class={0} name={1} lang={2}".format(cls, name, lang), err);
              return $state.target('simulator');
            });
        }
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
