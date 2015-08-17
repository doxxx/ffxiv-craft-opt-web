'use strict';

var allClasses = [
  "Alchemist",
  "Armorer",
  "Blacksmith",
  "Carpenter",
  "Culinarian",
  "Goldsmith",
  "Leatherworker",
  "Weaver"
];

var allActions = [
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
  {"shortName": "comfortZone", "name": "Comfort Zone", "cls": "Alchemist", "level": 50, buff: true, "skillID": {"Alchemist": 286}},
  {"shortName": "rumination", "name": "Rumination", "cls": "Carpenter", "level": 15, "skillID": {"Carpenter": 276}},
  {"shortName": "mastersMend", "name": "Master's Mend", "cls": "All", "level": 7, "common": true, "skillID": {"Alchemist": 100092, "Armorer": 100032, "Blacksmith": 100017, "Carpenter": 100003, "Culinarian": 100107, "Goldsmith": 100077, "Leatherworker": 100047, "Weaver": 100062}},
  {"shortName": "mastersMend2", "name": "Master's Mend II", "cls": "All", "level": 25, "common": true, "skillID": {"Alchemist": 100094, "Armorer": 100035, "Blacksmith": 100019, "Carpenter": 100005, "Culinarian": 100110, "Goldsmith": 100079, "Leatherworker": 100049, "Weaver": 100065}},
  {"shortName": "wasteNot", "name": "Waste Not", "cls": "Leatherworker", "level": 15, buff: true, "skillID": {"Leatherworker": 279}},
  {"shortName": "wasteNot2", "name": "Waste Not II", "cls": "Leatherworker", "level": 50, buff: true, "skillID": {"Leatherworker": 285}},
  {"shortName": "manipulation", "name": "Manipulation", "cls": "Goldsmith", "level": 15, buff: true, "skillID": {"Goldsmith": 278}},
  {"shortName": "innerQuiet", "name": "Inner Quiet", "cls": "All", "level": 11, "common": true, buff: true, "skillID": {"Alchemist": 258, "Armorer": 254, "Blacksmith": 253, "Carpenter": 252, "Culinarian": 259, "Goldsmith": 255, "Leatherworker": 257, "Weaver": 256}},
  {"shortName": "steadyHand", "name": "Steady Hand", "cls": "All", "level": 9, "common": true, buff: true, "skillID": {"Alchemist": 250, "Armorer": 246, "Blacksmith": 245, "Carpenter": 244, "Culinarian": 251, "Goldsmith": 247, "Leatherworker": 249, "Weaver": 248}},
  {"shortName": "steadyHand2", "name": "Steady Hand II", "cls": "Culinarian", "level": 37, buff: true, "skillID": {"Culinarian": 281}},
  {"shortName": "ingenuity", "name": "Ingenuity", "cls": "Blacksmith", "level": 15, buff: true, "skillID": {"Blacksmith": 277}},
  {"shortName": "ingenuity2", "name": "Ingenuity II", "cls": "Blacksmith", "level": 50, buff: true, "skillID": {"Blacksmith": 283}},
  {"shortName": "greatStrides", "name": "Great Strides", "cls": "All", "level": 21, "common": true, buff: true, "skillID": {"Alchemist": 266, "Armorer": 262, "Blacksmith": 261, "Carpenter": 260, "Culinarian": 267, "Goldsmith": 263, "Leatherworker": 265, "Weaver": 264}},
  {"shortName": "innovation", "name": "Innovation", "cls": "Goldsmith", "level": 50, buff: true, "skillID": {"Goldsmith": 284}},
  {"shortName": "tricksOfTheTrade", "name": "Tricks of the Trade", "cls": "Alchemist", "level": 15, "skillID": {"Alchemist": 100098}},

  // Heavensward
  {"shortName": "byregotsBrow", "name": "Byregot's Brow", "cls": "All", "level": 51, "common": true, "skillID": {"Alchemist": 100126, "Armorer": 100122, "Blacksmith": 100121, "Carpenter": 100120, "Culinarian": 100127, "Goldsmith": 100123, "Leatherworker": 100124, "Weaver": 100125}},
  {"shortName": "preciseTouch", "name": "Precise Touch", "cls": "All", "level": 53, "skillID": {"Alchemist": 100134, "Armorer": 100130, "Blacksmith": 100129, "Carpenter": 100128, "Culinarian": 100135, "Goldsmith": 100131, "Leatherworker": 100132, "Weaver": 100133}},
  {"shortName": "makersMark", "name": "Maker's Mark", "cls": "Goldsmith", "level": 54, buff: true, "skillID": {"Goldsmith": 100178}},
  {"shortName": "muscleMemory", "name": "Muscle Memory", "cls": "Culinarian", "level": 54, "skillID": {"Culinarian": 100136}},
  //{"shortName": "satisfaction", "name": "Satisfaction", "cls": "All", "level": 55, "common": true, "skillID": {"Alchemist": 100175, "Armorer": 100171, "Blacksmith": 100170, "Carpenter": 100169, "Culinarian": 100176, "Goldsmith": 100172, "Leatherworker": 100173, "Weaver": 100174}},
  {"shortName": "whistle", "name": "Whistle While You Work", "cls": "All", "level": 55, "common": true, buff: true, "skillID": {"Alchemist": 100193, "Armorer": 100189, "Blacksmith": 100188, "Carpenter": 100187, "Culinarian": 100194, "Goldsmith": 100190, "Leatherworker": 100191, "Weaver": 100192}},
  {"shortName": "innovativeTouch", "name": "Innovative Touch", "cls": "All", "level": 56, "common": true, "skillID": {"Alchemist": 100143, "Armorer": 100139, "Blacksmith": 100138, "Carpenter": 100137, "Culinarian": 100144, "Goldsmith": 100140, "Leatherworker": 100141, "Weaver": 100142}},
  {"shortName": "nymeiasWheel", "name": "Nymeia's Wheel", "cls": "All", "level": 57, "common": true, "skillID": {"Alchemist": 100159, "Armorer": 100155, "Blacksmith": 100154, "Carpenter": 100153, "Culinarian": 100160, "Goldsmith": 100156, "Leatherworker": 100157, "Weaver": 100158}},
  {"shortName": "byregotsMiracle", "name": "Byregot's Miracle", "cls": "All", "level": 58, "common": true, "skillID": {"Alchemist": 100151, "Armorer": 100147, "Blacksmith": 100146, "Carpenter": 100145, "Culinarian": 100152, "Goldsmith": 100148, "Leatherworker": 100149, "Weaver": 100150}},
  {"shortName": "trainedHand", "name": "Trained Hand", "cls": "All", "level": 59, "common": true, "skillID": {"Alchemist": 100167, "Armorer": 100163, "Blacksmith": 100162, "Carpenter": 100161, "Culinarian": 100168, "Goldsmith": 100164, "Leatherworker": 100165, "Weaver": 100166}},

  {"shortName": "brandOfEarth", "name": "Brand Of Earth", "cls": "Leatherworker", "level": 37, "skillID": {"Leatherworker": 100050}},
  {"shortName": "brandOfFire", "name": "Brand Of Fire", "cls": "Blacksmith", "level": 37, "skillID": {"Blacksmith": 100020}},
  {"shortName": "brandOfIce", "name": "Brand Of Ice", "cls": "Armorer", "level": 37, "skillID": {"Armorer": 100036}},
  {"shortName": "brandOfLightning", "name": "Brand Of Lightning", "cls": "Weaver", "level": 37, "skillID": {"Weaver": 100066}},
  {"shortName": "brandOfWater", "name": "Brand of Water", "cls": "Alchemist", "level": 37, "skillID": {"Alchemist": 100095}},
  {"shortName": "brandOfWind", "name": "Brand Of the Wind", "cls": "Carpenter", "level": 37, "skillID": {"Carpenter": 100006}},

  {"shortName": "nameOfEarth", "name": "Name Of Earth", "cls": "Leatherworker", "level": 54, buff: true, "skillID": {"Leatherworker": 4571}},
  {"shortName": "nameOfFire", "name": "Name Of Fire", "cls": "Blacksmith", "level": 54, buff: true, "skillID": {"Blacksmith": 4569}},
  {"shortName": "nameOfIce", "name": "Name Of Ice", "cls": "Armorer", "level": 54, buff: true, "skillID": {"Armorer": 4570}},
  {"shortName": "nameOfLightning", "name": "Name Of Lightning", "cls": "Weaver", "level": 54, buff: true, "skillID": {"Weaver": 4572}},
  {"shortName": "nameOfWater", "name": "Name of Water", "cls": "Alchemist", "level": 54, buff: true, "skillID": {"Alchemist": 4573}},
  {"shortName": "nameOfWind", "name": "Name Of the Wind", "cls": "Carpenter", "level": 54, buff: true, "skillID": {"Carpenter": 4568}},

  //{"shortName": "heartOfTheAlchemist", "name": "Heart of the Alchemist", "cls": "Alchemist", "level": 60, "common": true, buff: true, "skillID": {"Alchemist": 100185}},
  //{"shortName": "heartOfTheArmorer", "name": "Heart of the Armorer", "cls": "Armorer", "level": 60, "common": true, buff: true, "skillID": {"Armorer": 100181}},
  //{"shortName": "heartOfTheBlacksmith", "name": "Heart of the Blacksmith", "cls": "Blacksmith", "level": 60, "common": true, buff: true, "skillID": {"Blacksmith": 100180}},
  //{"shortName": "heartOfTheCarpenter", "name": "Heart of the Carpenter", "cls": "Carpenter", "level": 60, "common": true, buff: true, "skillID": {"Carpenter": 100179}},
  //{"shortName": "heartOfTheCulinarian", "name": "Heart of the Culinarian", "cls": "Culinarian", "level": 60, "common": true, buff: true, "skillID": {"Culinarian": 100186}},
  //{"shortName": "heartOfTheGoldsmith", "name": "Heart of the Goldsmith", "cls": "Goldsmith", "level": 60, "common": true, buff: true, "skillID": {"Goldsmith": 100182}},
  //{"shortName": "heartOfTheLeatherworker", "name": "Heart of the Leatherworker", "cls": "Leatherworker", "level": 60, "common": true, buff: true, "skillID": {"Leatherworker": 100183}},
  //{"shortName": "heartOfTheWeaver", "name": "Heart of the Weaver", "cls": "Weaver", "level": 60, "common": true, buff: true, "skillID": {"Weaver": 100184}},

  {"shortName": "observe", "name": "Observe", "cls": "All", "level": 13, "common": true, "skillID": {"Alchemist": 100099, "Armorer": 100040, "Blacksmith": 100023, "Carpenter": 100010, "Culinarian": 100113, "Goldsmith": 100082, "Leatherworker": 100053, "Weaver": 100070}}

  // Reclaim is omitted because it has no bearing on the success of the result of the synthesis, as far as we care.
];

var actionsByName = {};
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

var actionGroups = [
  {
    name: "Synthesis", actions: [
    "basicSynth",
    "standardSynthesis",
    "flawlessSynthesis",
    "carefulSynthesis",
    "carefulSynthesis2",
    "pieceByPiece",
    "rapidSynthesis",
    "muscleMemory",
    "trainedHand",
    "brandOfEarth",
    "brandOfFire",
    "brandOfIce",
    "brandOfLightning",
    "brandOfWater",
    "brandOfWind"
  ]
  },
  {
    name: "Quality", actions: [
    "basicTouch",
    "standardTouch",
    "advancedTouch",
    "hastyTouch",
    "byregotsBlessing",
    "byregotsBrow",
    "preciseTouch",
    "innovativeTouch",
    "byregotsMiracle",
    "trainedHand"
  ]
  },
  {
    name: "CP", actions: [
    "comfortZone",
    "rumination",
    "tricksOfTheTrade",
    //"satisfaction"
  ]
  },
  {
    name: "Durability", actions: [
    "mastersMend",
    "mastersMend2",
    "wasteNot",
    "wasteNot2",
    "manipulation",
    "nymeiasWheel"
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
    "innovation",
    "makersMark",
    "whistle",
    //"heartOfTheAlchemist"
    //"heartOfTheArmorer",
    //"heartOfTheBlacksmith",
    //"heartOfTheCarpenter",
    //"heartOfTheCulinarian",
    //"heartOfTheGoldsmith",
    //"heartOfTheLeatherworker",
    //"heartOfTheWeaver",
    "nameOfEarth",
    "nameOfFire",
    "nameOfIce",
    "nameOfLightning",
    "nameOfWater",
    "nameOfWind"
  ]
  },
  {
    name: "Other", actions: [
    "observe"
  ]
  }
];

function getActionImagePath(action, cls) {
  if (!angular.isDefined(action)) {
    console.error('undefined action param');
    return 'img/actions/empty.png';
  }
  var info = actionsByName[action];
  if (!angular.isDefined(info)) {
    console.error('unknown action: %s', action);
    return 'img/actions/empty.png';
  }
  return info.imagePaths[cls];
}


angular.module('ffxivCraftOptWeb.services.actions', []).
  value('_allClasses', allClasses).
  value('_allActions', allActions).
  value('_actionsByName', actionsByName).
  value('_actionGroups', actionGroups).
  value('_getActionImagePath', getActionImagePath);
