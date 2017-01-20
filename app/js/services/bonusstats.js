(function () {
  'use strict';

  angular
    .module("ffxivCraftOptWeb.services.bonusStats", [])
    .factory("_bonusStats", factory);

  function factory() {
    return {
      newBonusStats: newBonusStats,
      addCrafterBonusStats: addCrafterBonusStats,
      addRecipeBonusStats: addRecipeBonusStats
    }
  }

  function newBonusStats() {
    return {
      craftsmanship: 0,
      control: 0,
      cp: 0,
      startQuality: 0
    }
  }

  function addCrafterBonusStats(crafter, bonusStats) {
    var newStats = angular.copy(crafter);
    newStats.craftsmanship += bonusStats.craftsmanship;
    newStats.control += bonusStats.control;
    newStats.cp += bonusStats.cp;
    return newStats;
  }

  function addRecipeBonusStats(recipe, bonusStats) {
    var newStats = angular.copy(recipe);
    newStats.startQuality += bonusStats.startQuality;
    return newStats;
  }
})();
