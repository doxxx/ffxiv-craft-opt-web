(function () {
  'use strict';

  angular
    .module("ffxivCraftOptWeb.services.bonusStats", [])
    .factory("_bonusStats", factory);

  function factory() {
    return {
      newBonusStats: newBonusStats,
      addCrafterBonusStats: addCrafterBonusStats,
      sumCrafterBonusStats: sumCrafterBonusStats,
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
      food: {},
      medicine: {}
    }
  }

  function addCrafterBonusStats(crafter, bonusStats) {
    var r = angular.copy(crafter);
    if (bonusStats.food) {
      r = sumCrafterBonusStats(r, calculateBuffBonusStats(crafter, bonusStats.food));
    }
    if (bonusStats.medicine) {
      r = sumCrafterBonusStats(r, calculateBuffBonusStats(crafter, bonusStats.medicine));
    }
    r = sumCrafterBonusStats(r, bonusStats);
    return r;
  }

  function sumCrafterBonusStats(a, b) {
    var r = angular.copy(a);
    r.craftsmanship += b.craftsmanship;
    r.control += b.control;
    r.cp += b.cp;
    return r;
  }

  function calculateBuffBonusStats(crafter, buff) {
    var r = {};
    r.craftsmanship = calcPercentMaxBonus(crafter.craftsmanship, buff.craftsmanship_percent, buff.craftsmanship_value);
    r.control = calcPercentMaxBonus(crafter.control, buff.control_percent, buff.control_value);
    r.cp = calcPercentMaxBonus(crafter.cp, buff.cp_percent, buff.cp_value);
    return r;
  }

  function calcPercentMaxBonus(base, percent, max) {
    if (!percent || !max) return 0;
    return Math.min(max, Math.floor(base * percent / 100));
  }

  function addRecipeBonusStats(recipe, bonusStats) {
    var r = angular.copy(recipe);
    r.startQuality += bonusStats.startQuality;
    return r;
  }
})();
