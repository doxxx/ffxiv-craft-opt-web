(function () {
  'use strict';

  // From http://indiegamr.com/generate-repeatable-random-numbers-in-js/

  Math.seed = Date.now();
  Math._originalRandom = Math.random;
  Math.random = function(max, min) {
    max = max || 1;
    min = min || 0;

    Math.seed = (Math.seed * 9301 + 49297) % 233280;
    var rnd = Math.seed / 233280;

    return min + rnd * (max - min);
  };
})();
