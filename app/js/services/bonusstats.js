(function () {
  'use strict';

  angular
    .module("ffxivCraftOptWeb.services.bonusStats", [])
    .factory("_bonusStats", factory);

  function factory() {
    return {
      newBonusStats: newBonusStats,
      addCrafterBonusStats: addCrafterBonusStats,
      calculateBuffBonusStats: calculateBuffBonusStats,
      addRecipeBonusStats: addRecipeBonusStats
    }
  }

  function newBonusStats() {
    return {
      craftsmanship: 0,
      control: 0,
      cp: 0,
      startQuality: 0,
      food: {"name":"None"},
      medicine: {"name":"None"}
    }
  }

  function addCrafterBonusStats(crafter, bonusStats) {
    var r = angular.copy(crafter);
    r.craftsmanship += bonusStats.craftsmanship;
    r.control += bonusStats.control;
    r.cp += bonusStats.cp;
    return r;
  }

  function calculateBuffBonusStats(crafter, buff) {
    var r = newBonusStats();
    r.craftsmanship += calcPercentMaxBonus(crafter.craftsmanship, buff.craftsmanship_percent, buff.craftsmanship_value);
    r.control += calcPercentMaxBonus(crafter.control, buff.control_percent, buff.control_value);
    r.cp += calcPercentMaxBonus(crafter.cp, buff.cp_percent, buff.cp_value);
    return r;
  }

  function calcPercentMaxBonus(base, percent, max) {
    if (!percent || !max) return 0;
    return Math.min(max, base * percent / 100);
  }

  function addRecipeBonusStats(recipe, bonusStats) {
    var r = angular.copy(recipe);
    r.startQuality += bonusStats.startQuality;
    return r;
  }
})();
