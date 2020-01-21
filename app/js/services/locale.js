(function () {
  'use strict';

  angular
    .module('ffxivCraftOptWeb.services.locale', [])
    .constant('_languages', {
      ja: '日本語',
      en: 'English',
      de: 'Deutsch',
      fr: 'Français',
      cn: '简体中文',
      ko: '한국어',
      ar: 'عربى',
      es: 'Español'
    })
})();
