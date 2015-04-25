'use strict';

const allClasses = [
  "Alchemist",
  "Armorer",
  "Blacksmith",
  "Carpenter",
  "Culinarian",
  "Goldsmith",
  "Leatherworker",
  "Weaver"
];

const allActions = [
  {"shortName": "basicSynth", "name": "Basic Synthesis", "cls": "All", "level": 1, "common": false, "skillID": {"Alchemist": 100090, "Armorer": 100030, "Blacksmith": 100015, "Carpenter": 100001, "Culinarian": 100105, "Goldsmith": 100075, "Leatherworker": 100045, "Weaver": 100060}},
  {"shortName": "standardSynthesis", "name": "Standard Synthesis", "cls": "All", "level": 31, "common": false, "skillID": {"Alchemist": 100096, "Armorer": 100037, "Blacksmith": 100021, "Carpenter": 100007, "Culinarian": 100111, "Goldsmith": 100080, "Leatherworker": 100051, "Weaver": 100067}},
  {"shortName": "flawlessSynthesis", "name": "Flawless Synthesis", "cls": "Goldsmith", "level": 37, "skillID": {"Goldsmith": 100083}},
  {"shortName": "carefulSynthesis", "name": "Careful Synthesis", "cls": "Weaver", "level": 15, "skillID": {"Weaver": 100063}},
  {"shortName": "carefulSynthesis2", "name": "Careful Synthesis II", "cls": "Weaver", "level": 50, "skillID": {"Weaver": 100069}},
  {"shortName": "pieceByPiece", "name": "Piece by Piece", "cls": "Armorer", "level": 50, "skillID": {"Armorer": 100039}},
  {"shortName": "rapidSynthesis", "name": "Rapid Synthesis", "cls": "Armorer", "level": 15, "skillID": {"Armorer": 100033}},
  {"shortName": "basicTouch", "name": "Basic Touch", "cls": "All", "level": 5, "common": false, "skillID": {"Alchemist": 100091, "Armorer": 100031, "Blacksmith": 100016, "Carpenter": 100002, "Culinarian": 100106, "Goldsmith": 100076, "Leatherworker": 100046, "Weaver": 100061}},
  {"shortName": "standardTouch", "name": "Standard Touch", "cls": "All", "level": 18, "common": false, "skillID": {"Alchemist": 100093, "Armorer": 100034, "Blacksmith": 100018, "Carpenter": 100004, "Culinarian": 100109, "Goldsmith": 100078, "Leatherworker": 100048, "Weaver": 100064}},
  {"shortName": "advancedTouch", "name": "Advanced Touch", "cls": "All", "level": 43, "common": false, "skillID": {"Alchemist": 100097, "Armorer": 100038, "Blacksmith": 100022, "Carpenter": 100008, "Culinarian": 100112, "Goldsmith": 100081, "Leatherworker": 100052, "Weaver": 100068}},
  {"shortName": "hastyTouch", "name": "Hasty Touch", "cls": "Culinarian", "level": 15, "skillID": {"Culinarian": 100108}},
  {"shortName": "byregotsBlessing", "name": "Byregot's Blessing", "cls": "Carpenter", "level": 50, "skillID": {"Carpenter": 100009}},
  {"shortName": "comfortZone", "name": "Comfort Zone", "cls": "Alchemist", "level": 50, "skillID": {"Alchemist": 286}},
  {"shortName": "rumination", "name": "Rumination", "cls": "Carpenter", "level": 15, "skillID": {"Carpenter": 276}},
  {"shortName": "mastersMend", "name": "Master's Mend", "cls": "All", "level": 7, "common": true, "skillID": {"Alchemist": 100092, "Armorer": 100032, "Blacksmith": 100017, "Carpenter": 100003, "Culinarian": 100107, "Goldsmith": 100077, "Leatherworker": 100047, "Weaver": 100062}},
  {"shortName": "mastersMend2", "name": "Master's Mend II", "cls": "All", "level": 25, "common": true, "skillID": {"Alchemist": 100094, "Armorer": 100035, "Blacksmith": 100019, "Carpenter": 100005, "Culinarian": 100110, "Goldsmith": 100079, "Leatherworker": 100049, "Weaver": 100065}},
  {"shortName": "wasteNot", "name": "Waste Not", "cls": "Leatherworker", "level": 15, "skillID": {"Leatherworker": 279}},
  {"shortName": "wasteNot2", "name": "Waste Not II", "cls": "Leatherworker", "level": 50, "skillID": {"Leatherworker": 285}},
  {"shortName": "manipulation", "name": "Manipulation", "cls": "Goldsmith", "level": 15, "skillID": {"Goldsmith": 278}},
  {"shortName": "innerQuiet", "name": "Inner Quiet", "cls": "All", "level": 11, "common": true, "skillID": {"Alchemist": 258, "Armorer": 254, "Blacksmith": 253, "Carpenter": 252, "Culinarian": 259, "Goldsmith": 255, "Leatherworker": 257, "Weaver": 256}},
  {"shortName": "steadyHand", "name": "Steady Hand", "cls": "All", "level": 9, "common": true, "skillID": {"Alchemist": 250, "Armorer": 246, "Blacksmith": 245, "Carpenter": 244, "Culinarian": 251, "Goldsmith": 247, "Leatherworker": 249, "Weaver": 248}},
  {"shortName": "steadyHand2", "name": "Steady Hand II", "cls": "Culinarian", "level": 37, "skillID": {"Culinarian": 281}},
  {"shortName": "ingenuity", "name": "Ingenuity", "cls": "Blacksmith", "level": 15, "skillID": {"Blacksmith": 277}},
  {"shortName": "ingenuity2", "name": "Ingenuity II", "cls": "Blacksmith", "level": 50, "skillID": {"Blacksmith": 283}},
  {"shortName": "greatStrides", "name": "Great Strides", "cls": "All", "level": 21, "common": true, "skillID": {"Alchemist": 266, "Armorer": 262, "Blacksmith": 261, "Carpenter": 260, "Culinarian": 267, "Goldsmith": 263, "Leatherworker": 265, "Weaver": 264}},
  {"shortName": "innovation", "name": "Innovation", "cls": "Goldsmith", "level": 50, "skillID": {"Goldsmith": 284}},
  {"shortName": "tricksOfTheTrade", "name": "Tricks of the Trade", "cls": "Alchemist", "level": 15, "skillID": {"Alchemist": 100098}}
  //  { shortName: "brandOfEarth",      name: "Brand of Earth",       cls: "Leatherworker", level: 37 }

  // "Observe",
  // "Reclaim",
];

const actionsByName = {};
for (var i = 0; i < allActions.length; i++) {
  var action = allActions[i];

  var imagePaths = {};
  for (var j = 0; j < allClasses.length; j++) {
    var cls = allClasses[j];
    if (action.cls == 'All') {
      if (action.common) {
        imagePaths[cls] = 'img/actions/' + action.shortName + '.png';
      }
      else {
        imagePaths[cls] = 'img/actions/' + cls + '/' + action.shortName + '.png';
      }
    }
    else {
      imagePaths[cls] = 'img/actions/' + action.cls + '/' + action.shortName + '.png';
    }
    action.imagePaths = imagePaths;
  }

  actionsByName[action.shortName] = action;
}

const actionGroups = [
  {
    name: "Synthesis", actions: [
    "basicSynth",
    "standardSynthesis",
    "flawlessSynthesis",
    "carefulSynthesis",
    "carefulSynthesis2",
    "pieceByPiece",
    "rapidSynthesis"
    // "brandOfEarth",
  ]
  },
  {
    name: "Quality", actions: [
    "basicTouch",
    "standardTouch",
    "advancedTouch",
    "hastyTouch",
    "byregotsBlessing"
  ]
  },
  {
    name: "CP", actions: [
    "comfortZone",
    "rumination",
    "tricksOfTheTrade"
  ]
  },
  {
    name: "Durability", actions: [
    "mastersMend",
    "mastersMend2",
    "wasteNot",
    "wasteNot2",
    "manipulation"
  ]
  },
  {
    name: "Buffs", actions: [
    "innerQuiet",
    "steadyHand",
    "steadyHand2",
    "ingenuity",
    "ingenuity2",
    "greatStrides",
    "innovation"
  ]
  }
];

angular.module('ffxivCraftOptWeb.services.actions', []).
  value('_allClasses', allClasses).
  value('_allActions', allActions).
  value('_actionsByName', actionsByName).
  value('_actionGroups', actionGroups);
