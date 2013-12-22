'use strict';

/* Services */


var services = angular.module('ffxivCraftOptWeb.services', []);

services.value('_version', '0.1');
services.factory('_getSolverServiceURL', function($location) {
  return function() {
    if ($location.host() == 'localhost') {
      return 'http://localhost:8080/'
    }
    else {
      return 'http://ffxiv-craft-opt.appspot.com/'
    }
  }
});
services.value('_allClasses', [
  "Alchemist",
  "Armorer",
  "Blacksmith",
  "Carpenter",
  "Culinarian",
  "Goldsmith",
  "Leatherworker",
  "Weaver",
])
services.value('_allActions', [
  { shortName: "basicSynth", name: "Basic Synthesis" },
  { shortName: "standardSynthesis", name: "Standard Synthesis" },
  { shortName: "flawlessSynthesis", name: "Flawless Synthesis" },
  { shortName: "carefulSynthesis", name: "Careful Synthesis" },
  { shortName: "carefulSynthesis2", name: "Careful Synthesis 2" },
  { shortName: "pieceByPiece", name: "Piece by Piece" },
  { shortName: "rapidSynthesis", name: "Rapid Synthesis" },
  { shortName: "brandOfEarth", name: "Brand of Earth" },
  { shortName: "basicTouch", name: "Basic Touch" },
  { shortName: "standardTouch", name: "Standard Touch" },
  { shortName: "advancedTouch", name: "Advanced Touch" },
  { shortName: "hastyTouch", name: "Hasty Touch" },
  { shortName: "byregotsBlessing", name: "Byregot's Blessing" },
  { shortName: "comfortZone", name: "Comfort Zone" },
  { shortName: "rumination", name: "Rumination" },
  { shortName: "mastersMend", name: "Master's Mend" },
  { shortName: "mastersMend2", name: "Master's Mend 2" },
  { shortName: "wasteNot", name: "Waste Not" },
  { shortName: "wasteNot2", name: "Waste Not 2" },
  { shortName: "manipulation", name: "Manipulation" },
  { shortName: "innerQuiet", name: "Inner Quiet" },
  { shortName: "steadyHand", name: "Steady Hand" },
  { shortName: "steadyHand2", name: "Steady Hand 2" },
  { shortName: "ingenuity", name: "Ingenuity" },
  { shortName: "ingenuity2", name: "Ingenuity 2" },
  { shortName: "greatStrides", name: "Great Strides" },
  { shortName: "innovation", name: "Innovation" },
  { shortName: "tricksOfTheTrade", name: "Tricks of the Trade" },
  
//  "Observe",
//  "Reclaim",
]);
services.value('_actionGroups', [
  { name: "Synthesis", actions: [
    "basicSynth",
    "standardSynthesis",
    "flawlessSynthesis",
    "carefulSynthesis",
    "carefulSynthesis2",
    "pieceByPiece",
    "rapidSynthesis",
    "brandOfEarth",
  ]},
  { name: "Quality", actions: [
    "basicTouch",
    "standardTouch",
    "advancedTouch",
    "hastyTouch",
    "byregotsBlessing",
  ]},
  { name: "CP", actions: [
    "comfortZone",
    "rumination",
    "tricksOfTheTrade",
  ]},
  { name: "Durability", actions: [
    "mastersMend",
    "mastersMend2",
    "wasteNot",
    "wasteNot2",
    "manipulation",
  ]},
  { name: "Buffs", actions: [
    "innerQuiet",
    "steadyHand",
    "steadyHand2",
    "ingenuity",
    "ingenuity2",
    "greatStrides",
    "innovation",
  ]}
]);
