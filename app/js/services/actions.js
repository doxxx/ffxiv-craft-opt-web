'use strict';

(function (){

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

  var extraActionInfo = {
    basicSynth: {                                        skillID: {"Alchemist": 100090, "Armorer": 100030, "Blacksmith": 100015, "Carpenter": 100001, "Culinarian": 100105, "Goldsmith": 100075, "Leatherworker": 100045, "Weaver": 100060} },
    standardSynthesis: {                                 skillID: {"Alchemist": 100096, "Armorer": 100037, "Blacksmith": 100021, "Carpenter": 100007, "Culinarian": 100111, "Goldsmith": 100080, "Leatherworker": 100051, "Weaver": 100067} },
    flawlessSynthesis: {                                 skillID: {"Goldsmith": 100083} },
    carefulSynthesis: {                                  skillID: {"Weaver": 100063} },
    carefulSynthesis2: {                                 skillID: {"Weaver": 100069} },
    pieceByPiece: {                                      skillID: {"Armorer": 100039} },
    rapidSynthesis: {                                    skillID: {"Armorer": 100033} },
    basicTouch: {                                        skillID: {"Alchemist": 100091, "Armorer": 100031, "Blacksmith": 100016, "Carpenter": 100002, "Culinarian": 100106, "Goldsmith": 100076, "Leatherworker": 100046, "Weaver": 100061} },
    standardTouch: {                                     skillID: {"Alchemist": 100093, "Armorer": 100034, "Blacksmith": 100018, "Carpenter": 100004, "Culinarian": 100109, "Goldsmith": 100078, "Leatherworker": 100048, "Weaver": 100064} },
    advancedTouch: {                                     skillID: {"Alchemist": 100097, "Armorer": 100038, "Blacksmith": 100022, "Carpenter": 100008, "Culinarian": 100112, "Goldsmith": 100081, "Leatherworker": 100052, "Weaver": 100068} },
    hastyTouch: {                                        skillID: {"Culinarian": 100108} },
    byregotsBlessing: {                                  skillID: {"Carpenter": 100009} },
    comfortZone: {                           buff: true, skillID: {"Alchemist": 286} },
    rumination: {                                        skillID: {"Carpenter": 276} },
    mastersMend: {             common: true,             skillID: {"Alchemist": 100092, "Armorer": 100032, "Blacksmith": 100017, "Carpenter": 100003, "Culinarian": 100107, "Goldsmith": 100077, "Leatherworker": 100047, "Weaver": 100062} },
    mastersMend2: {            common: true,             skillID: {"Alchemist": 100094, "Armorer": 100035, "Blacksmith": 100019, "Carpenter": 100005, "Culinarian": 100110, "Goldsmith": 100079, "Leatherworker": 100049, "Weaver": 100065} },
    wasteNot: {                              buff: true, skillID: {"Leatherworker": 279} },
    wasteNot2: {                             buff: true, skillID: {"Leatherworker": 285} },
    manipulation: {                          buff: true, skillID: {"Goldsmith": 278} },
    innerQuiet: {              common: true, buff: true, skillID: {"Alchemist": 258, "Armorer": 254, "Blacksmith": 253, "Carpenter": 252, "Culinarian": 259, "Goldsmith": 255, "Leatherworker": 257, "Weaver": 256} },
    steadyHand: {              common: true, buff: true, skillID: {"Alchemist": 250, "Armorer": 246, "Blacksmith": 245, "Carpenter": 244, "Culinarian": 251, "Goldsmith": 247, "Leatherworker": 249, "Weaver": 248} },
    steadyHand2: {                           buff: true, skillID: {"Culinarian": 281} },
    ingenuity: {                             buff: true, skillID: {"Blacksmith": 277} },
    ingenuity2: {                            buff: true, skillID: {"Blacksmith": 283} },
    greatStrides: {            common: true, buff: true, skillID: {"Alchemist": 266, "Armorer": 262, "Blacksmith": 261, "Carpenter": 260, "Culinarian": 267, "Goldsmith": 263, "Leatherworker": 265, "Weaver": 264} },
    innovation: {                            buff: true, skillID: {"Goldsmith": 284} },
    tricksOfTheTrade: {                                  skillID: {"Alchemist": 100098} },

    // Heavensward
    byregotsBrow: {            common: true,             skillID: {"Alchemist": 100126, "Armorer": 100122, "Blacksmith": 100121, "Carpenter": 100120, "Culinarian": 100127, "Goldsmith": 100123, "Leatherworker": 100124, "Weaver": 100125} },
    preciseTouch: {                                      skillID: {"Alchemist": 100134, "Armorer": 100130, "Blacksmith": 100129, "Carpenter": 100128, "Culinarian": 100135, "Goldsmith": 100131, "Leatherworker": 100132, "Weaver": 100133} },
    makersMark: {                            buff: true, skillID: {"Goldsmith": 100178} },
    muscleMemory: {                                      skillID: {"Culinarian": 100136} },
    satisfaction: {            common: true,             skillID: {"Alchemist": 100175, "Armorer": 100171, "Blacksmith": 100170, "Carpenter": 100169, "Culinarian": 100176, "Goldsmith": 100172, "Leatherworker": 100173, "Weaver": 100174} },
    whistle: {                 common: true, buff: true, skillID: {"Alchemist": 100193, "Armorer": 100189, "Blacksmith": 100188, "Carpenter": 100187, "Culinarian": 100194, "Goldsmith": 100190, "Leatherworker": 100191, "Weaver": 100192} },
    innovativeTouch: {         common: true,             skillID: {"Alchemist": 100143, "Armorer": 100139, "Blacksmith": 100138, "Carpenter": 100137, "Culinarian": 100144, "Goldsmith": 100140, "Leatherworker": 100141, "Weaver": 100142} },
    nymeiasWheel: {            common: true,             skillID: {"Alchemist": 100159, "Armorer": 100155, "Blacksmith": 100154, "Carpenter": 100153, "Culinarian": 100160, "Goldsmith": 100156, "Leatherworker": 100157, "Weaver": 100158} },
    byregotsMiracle: {         common: true,             skillID: {"Alchemist": 100151, "Armorer": 100147, "Blacksmith": 100146, "Carpenter": 100145, "Culinarian": 100152, "Goldsmith": 100148, "Leatherworker": 100149, "Weaver": 100150} },
    trainedHand: {             common: true,             skillID: {"Alchemist": 100167, "Armorer": 100163, "Blacksmith": 100162, "Carpenter": 100161, "Culinarian": 100168, "Goldsmith": 100164, "Leatherworker": 100165, "Weaver": 100166} },

    brandOfEarth: {                                      skillID: {"Leatherworker": 100050} },
    brandOfFire: {                                       skillID: {"Blacksmith": 100020} },
    brandOfIce: {                                        skillID: {"Armorer": 100036} },
    brandOfLightning: {                                  skillID: {"Weaver": 100066} },
    brandOfWater: {                                      skillID: {"Alchemist": 100095} },
    brandOfWind: {                                       skillID: {"Carpenter": 100006} },

    nameOfEarth: {                           buff: true, skillID: {"Leatherworker": 4571} },
    nameOfFire: {                            buff: true, skillID: {"Blacksmith": 4569} },
    nameOfIce: {                             buff: true, skillID: {"Armorer": 4570} },
    nameOfLightning: {                       buff: true, skillID: {"Weaver": 4572} },
    nameOfWater: {                           buff: true, skillID: {"Alchemist": 4573} },
    nameOfWind: {                            buff: true, skillID: {"Carpenter": 4568} },

    //heartOfTheAlchemist: {     common: true, buff: true, skillID: {"Alchemist": 100185} },
    //heartOfTheArmorer: {       common: true, buff: true, skillID: {"Armorer": 100181} },
    //heartOfTheBlacksmith: {    common: true, buff: true, skillID: {"Blacksmith": 100180} },
    //heartOfTheCarpenter: {     common: true, buff: true, skillID: {"Carpenter": 100179} },
    //heartOfTheCulinarian: {    common: true, buff: true, skillID: {"Culinarian": 100186} },
    //heartOfTheGoldsmith: {     common: true, buff: true, skillID: {"Goldsmith": 100182} },
    //heartOfTheLeatherworker: { common: true, buff: true, skillID: {"Leatherworker": 100183} },
    //heartOfTheWeaver: {        common: true, buff: true, skillID: {"Weaver": 100184} },

    observe: {                 common: true,             skillID: {"Alchemist": 100099, "Armorer": 100040, "Blacksmith": 100023, "Carpenter": 100010, "Culinarian": 100113, "Goldsmith": 100082, "Leatherworker": 100053, "Weaver": 100070} }

    // Reclaim is omitted because it has no bearing on the success of the result of the synthesis, as far as we care.
  };

  var actionsByName = {};
  var allActions = [];

  for (var shortName in extraActionInfo) {
    if (extraActionInfo.hasOwnProperty(shortName)) {
      var extraInfo = extraActionInfo[shortName];
      var action = AllActions[shortName];

      action.buff = extraInfo.buff;
      action.skillID = extraInfo.skillID;
      var imagePaths = {};
      for (var j = 0; j < allClasses.length; j++) {
        var cls = allClasses[j];
        if (action.cls == 'All') {
          if (extraInfo.common) {
            imagePaths[cls] = 'img/actions/' + shortName + '.png';
          }
          else {
            imagePaths[cls] = 'img/actions/' + cls + '/' + shortName + '.png';
          }
        }
        else {
          imagePaths[cls] = 'img/actions/' + action.cls + '/' + shortName + '.png';
        }
        action.imagePaths = imagePaths;
      }

      actionsByName[shortName] = action;
      allActions.push(action);
    }
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
      "preciseTouch"
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
      "innovation",
      "makersMark",
      "nameOfEarth",
      "nameOfFire",
      "nameOfIce",
      "nameOfLightning",
      "nameOfWater",
      "nameOfWind"
    ]
    },
    {
      name: "Specialist", actions: [
      "whistle",
      "satisfaction",
      "innovativeTouch",
      "nymeiasWheel",
      "byregotsMiracle",
      "trainedHand"
      //"heartOfTheAlchemist"
      //"heartOfTheArmorer",
      //"heartOfTheBlacksmith",
      //"heartOfTheCarpenter",
      //"heartOfTheCulinarian",
      //"heartOfTheGoldsmith",
      //"heartOfTheLeatherworker",
      //"heartOfTheWeaver",
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

})();
