'use strict';

angular.module('ffxivCraftOptWeb.services.actions', []).
  value('_allClasses', [
    "Alchemist",
    "Armorer",
    "Blacksmith",
    "Carpenter",
    "Culinarian",
    "Goldsmith",
    "Leatherworker",
    "Weaver"
  ]).
  value('_allActions', [
    { shortName: "basicSynth",        name: "Basic Synthesis",      cls: "All",           level: 1,  common: false },
    { shortName: "standardSynthesis", name: "Standard Synthesis",   cls: "All",           level: 31, common: false },
    { shortName: "flawlessSynthesis", name: "Flawless Synthesis",   cls: "Goldsmith",     level: 37 },
    { shortName: "carefulSynthesis",  name: "Careful Synthesis",    cls: "Weaver",        level: 15 },
    { shortName: "carefulSynthesis2", name: "Careful Synthesis II", cls: "Weaver",        level: 50 },
    { shortName: "pieceByPiece",      name: "Piece by Piece",       cls: "Armorer",       level: 50 },
    { shortName: "rapidSynthesis",    name: "Rapid Synthesis",      cls: "Armorer",       level: 15 },
  //  { shortName: "brandOfEarth",      name: "Brand of Earth",       cls: "Leatherworker", level: 37 },
    { shortName: "basicTouch",        name: "Basic Touch",          cls: "All",           level: 5,  common: false },
    { shortName: "standardTouch",     name: "Standard Touch",       cls: "All",           level: 18, common: false },
    { shortName: "advancedTouch",     name: "Advanced Touch",       cls: "All",           level: 43, common: false },
    { shortName: "hastyTouch",        name: "Hasty Touch",          cls: "Culinarian",    level: 15 },
    { shortName: "byregotsBlessing",  name: "Byregot's Blessing",   cls: "Carpenter",     level: 50 },
    { shortName: "comfortZone",       name: "Comfort Zone",         cls: "Alchemist",     level: 50 },
    { shortName: "rumination",        name: "Rumination",           cls: "Carpenter",     level: 15 },
    { shortName: "mastersMend",       name: "Master's Mend",        cls: "All",           level: 7,  common: true },
    { shortName: "mastersMend2",      name: "Master's Mend II",     cls: "All",           level: 25, common: true },
    { shortName: "wasteNot",          name: "Waste Not",            cls: "Leatherworker", level: 15 },
    { shortName: "wasteNot2",         name: "Waste Not II",         cls: "Leatherworker", level: 50 },
    { shortName: "manipulation",      name: "Manipulation",         cls: "Goldsmith",     level: 15 },
    { shortName: "innerQuiet",        name: "Inner Quiet",          cls: "All",           level: 11, common: true },
    { shortName: "steadyHand",        name: "Steady Hand",          cls: "All",           level: 9,  common: true },
    { shortName: "steadyHand2",       name: "Steady Hand II",       cls: "Culinarian",    level: 37 },
    { shortName: "ingenuity",         name: "Ingenuity",            cls: "Blacksmith",    level: 15 },
    { shortName: "ingenuity2",        name: "Ingenuity II",         cls: "Blacksmith",    level: 50 },
    { shortName: "greatStrides",      name: "Great Strides",        cls: "All",           level: 21, common: true },
    { shortName: "innovation",        name: "Innovation",           cls: "Goldsmith",     level: 50 },
    { shortName: "tricksOfTheTrade",  name: "Tricks of the Trade",  cls: "Alchemist",     level: 15 }

    // "Observe",
    // "Reclaim",
  ]).
  value('_actionGroups', [
    { name: "Synthesis", actions: [
      "basicSynth",
      "standardSynthesis",
      "flawlessSynthesis",
      "carefulSynthesis",
      "carefulSynthesis2",
      "pieceByPiece",
      "rapidSynthesis"
      // "brandOfEarth",
    ]},
    { name: "Quality", actions: [
      "basicTouch",
      "standardTouch",
      "advancedTouch",
      "hastyTouch",
      "byregotsBlessing"
    ]},
    { name: "CP", actions: [
      "comfortZone",
      "rumination",
      "tricksOfTheTrade"
    ]},
    { name: "Durability", actions: [
      "mastersMend",
      "mastersMend2",
      "wasteNot",
      "wasteNot2",
      "manipulation"
    ]},
    { name: "Buffs", actions: [
      "innerQuiet",
      "steadyHand",
      "steadyHand2",
      "ingenuity",
      "ingenuity2",
      "greatStrides",
      "innovation"
    ]}
  ]).
  factory('_getActionImagePath', function(_allActions) {
    return function(actionName, cls) {
      var actionInfo;
      for (var i = 0; i < _allActions.length; i++) {
        if (_allActions[i].shortName == actionName) {
          actionInfo = _allActions[i];
          break;
        }
      }
      if (actionInfo.cls == 'All') {
        if (actionInfo.common) {
          return 'img/actions/' + actionName + '.png'
        }
        else {
          return 'img/actions/' + cls + '/' + actionName + '.png'
        }
      }
      else {
        return 'img/actions/' + actionInfo.cls + '/' + actionName + '.png'
      }
    }
  });
