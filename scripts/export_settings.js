(function () {
  'use strict';

  var settings = {};

  var keys = [
    'NG_TRANSLATE_LANG_KEY',
    'crafterStats',
    'pageStage_v2',
    'synths'
  ];
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    settings[key] = localStorage[key];
  }

  window.prompt('Copy the text below to the clipboard', JSON.stringify(settings));
})();
