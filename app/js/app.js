(function () {
  'use strict';

  angular
    .module('ffxivCraftOptWeb', [
      'ui.bootstrap',
      'ui.router',
      'pascalprecht.translate',
      'lvl.directives.dragdrop',
      'cgBusy',
      'ffxivCraftOptWeb.services.locale',
      'ffxivCraftOptWeb.services.actions',
      'ffxivCraftOptWeb.services.bonusStats',
      'ffxivCraftOptWeb.services.buffsdb',
      'ffxivCraftOptWeb.services.storage',
      'ffxivCraftOptWeb.services.profile',
      'ffxivCraftOptWeb.services.recipelibrary',
      'ffxivCraftOptWeb.services.simulator',
      'ffxivCraftOptWeb.services.solver',
      'ffxivCraftOptWeb.services.translateLocalStorage',
      'ffxivCraftOptWeb.services.tooltips',
      'ffxivCraftOptWeb.directives',
      'ffxivCraftOptWeb.controllers',
      'ffxivCraftOptWeb.components'
    ], config);

  function config($translateProvider) {
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
