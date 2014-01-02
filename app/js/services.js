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
  { shortName: "basicSynth", name: "Basic Synthesis", cls: "All", level: 1 },
  { shortName: "standardSynthesis", name: "Standard Synthesis", cls: "All", level: 31 },
  { shortName: "flawlessSynthesis", name: "Flawless Synthesis", cls: "Goldsmith", level: 37 },
  { shortName: "carefulSynthesis", name: "Careful Synthesis", cls: "Weaver", level: 15 },
  { shortName: "carefulSynthesis2", name: "Careful Synthesis 2", cls: "Culinarian", level: 15 },
  { shortName: "pieceByPiece", name: "Piece by Piece", cls: "Armorer", level: 50 },
  { shortName: "rapidSynthesis", name: "Rapid Synthesis", cls: "Armorer", level: 15 },
  { shortName: "brandOfEarth", name: "Brand of Earth", cls: "Leatherworker", level: 37 },
  { shortName: "basicTouch", name: "Basic Touch", cls: "All", level: 5 },
  { shortName: "standardTouch", name: "Standard Touch", cls: "All", level: 18 },
  { shortName: "advancedTouch", name: "Advanced Touch", cls: "All", level: 43 },
  { shortName: "hastyTouch", name: "Hasty Touch", cls: "Culinarian", level: 15 },
  { shortName: "byregotsBlessing", name: "Byregot's Blessing", cls: "Carpenter", level: 50 },
  { shortName: "comfortZone", name: "Comfort Zone", cls: "Alchemist", level: 50 },
  { shortName: "rumination", name: "Rumination", cls: "Carpenter", level: 15 },
  { shortName: "mastersMend", name: "Master's Mend", cls: "All", level: 7 },
  { shortName: "mastersMend2", name: "Master's Mend 2", cls: "All", level: 25 },
  { shortName: "wasteNot", name: "Waste Not", cls: "Leatherworker", level: 15 },
  { shortName: "wasteNot2", name: "Waste Not 2", cls: "Leatherworker", level: 50 },
  { shortName: "manipulation", name: "Manipulation", cls: "Goldsmith", level: 15 },
  { shortName: "innerQuiet", name: "Inner Quiet", cls: "All", level: 11 },
  { shortName: "steadyHand", name: "Steady Hand", cls: "All", level: 9 },
  { shortName: "steadyHand2", name: "Steady Hand 2", cls: "Culinarian", level: 37 },
  { shortName: "ingenuity", name: "Ingenuity", cls: "Blacksmith", level: 15 },
  { shortName: "ingenuity2", name: "Ingenuity 2", cls: "Blacksmith", level: 50 },
  { shortName: "greatStrides", name: "Great Strides", cls: "All", level: 21 },
  { shortName: "innovation", name: "Innovation", cls: "Goldsmith", level: 50 },
  { shortName: "tricksOfTheTrade", name: "Tricks of the Trade", cls: "Alchemist", level: 15 },

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
