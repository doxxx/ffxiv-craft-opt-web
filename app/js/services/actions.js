(function (){
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

  var extraActionInfo = {
    basicSynth: {                                        skillID: {"Alchemist": 100090, "Armorer": 100030, "Blacksmith": 100015, "Carpenter": 100001, "Culinarian": 100105, "Goldsmith": 100075, "Leatherworker": 100045, "Weaver": 100060} },
    standardSynthesis: {                                 skillID: {"Alchemist": 100096, "Armorer": 100037, "Blacksmith": 100021, "Carpenter": 100007, "Culinarian": 100111, "Goldsmith": 100080, "Leatherworker": 100051, "Weaver": 100067} },
    // flawlessSynthesis: {       common: true,             skillID: {"Goldsmith": 100083} },
    carefulSynthesis: {        common: true,             skillID: {"Weaver": 100063} },
    // carefulSynthesis2: {                                 skillID: {"Weaver": 100069} },
    // pieceByPiece: {                                      skillID: {"Armorer": 100039} },
    rapidSynthesis: {          common: true,             skillID: {"Armorer": 100033} },
    basicTouch: {                                        skillID: {"Alchemist": 100091, "Armorer": 100031, "Blacksmith": 100016, "Carpenter": 100002, "Culinarian": 100106, "Goldsmith": 100076, "Leatherworker": 100046, "Weaver": 100061} },
    standardTouch: {                                     skillID: {"Alchemist": 100093, "Armorer": 100034, "Blacksmith": 100018, "Carpenter": 100004, "Culinarian": 100109, "Goldsmith": 100078, "Leatherworker": 100048, "Weaver": 100064} },
    // advancedTouch: {                                     skillID: {"Alchemist": 100097, "Armorer": 100038, "Blacksmith": 100022, "Carpenter": 100008, "Culinarian": 100112, "Goldsmith": 100081, "Leatherworker": 100052, "Weaver": 100068} },
    hastyTouch: {              common: true,             skillID: {"Culinarian": 100108} },
    byregotsBlessing: {        common: true,             skillID: {"Alchemist": 0, "Armorer": 0, "Blacksmith": 0, "Carpenter": 0, "Culinarian": 0, "Goldsmith": 0, "Leatherworker": 0, "Weaver": 0} },
    // comfortZone: {                           buff: true, skillID: {"Alchemist": 286} },
    // rumination: {                                        skillID: {"Carpenter": 276} },
    mastersMend: {             common: true,             skillID: {"Alchemist": 100092, "Armorer": 100032, "Blacksmith": 100017, "Carpenter": 100003, "Culinarian": 100107, "Goldsmith": 100077, "Leatherworker": 100047, "Weaver": 100062} },
    // mastersMend2: {            common: true,             skillID: {"Alchemist": 100094, "Armorer": 100035, "Blacksmith": 100019, "Carpenter": 100005, "Culinarian": 100110, "Goldsmith": 100079, "Leatherworker": 100049, "Weaver": 100065} },
    wasteNot: {                common: true, buff: true, skillID: {"Leatherworker": 279} },
    wasteNot2: {               common: true, buff: true, skillID: {"Leatherworker": 285} },
    manipulation: {            common: true, buff: true, skillID: {"Goldsmith": 278} },
    innerQuiet: {              common: true, buff: true, skillID: {"Alchemist": 258, "Armorer": 254, "Blacksmith": 253, "Carpenter": 252, "Culinarian": 259, "Goldsmith": 255, "Leatherworker": 257, "Weaver": 256} },
    // steadyHand: {              common: true, buff: true, skillID: {"Alchemist": 250, "Armorer": 246, "Blacksmith": 245, "Carpenter": 244, "Culinarian": 251, "Goldsmith": 247, "Leatherworker": 249, "Weaver": 248} },
    // steadyHand2: {             common: true, buff: true, skillID: {"Alchemist": 0, "Armorer": 0, "Blacksmith": 0, "Carpenter": 0, "Culinarian": 0, "Goldsmith": 0, "Leatherworker": 0, "Weaver": 0} },
    ingenuity: {               common: true, buff: true, skillID: {"Blacksmith": 277} },
    // ingenuity2: {                            buff: true, skillID: {"Blacksmith": 283} },
    greatStrides: {            common: true, buff: true, skillID: {"Alchemist": 266, "Armorer": 262, "Blacksmith": 261, "Carpenter": 260, "Culinarian": 267, "Goldsmith": 263, "Leatherworker": 265, "Weaver": 264} },
    innovation: {              common: true, buff: true, skillID: {"Goldsmith": 284} },
    tricksOfTheTrade: {        common: true,             skillID: {"Alchemist": 100098} },

    // Heavensward
    preciseTouch: {                                      skillID: {"Alchemist": 100134, "Armorer": 100130, "Blacksmith": 100129, "Carpenter": 100128, "Culinarian": 100135, "Goldsmith": 100131, "Leatherworker": 100132, "Weaver": 100133} },
    // makersMark: {              common: true,             skillID: {"Goldsmith": 100178} },
    muscleMemory: {            common: true,             skillID: {"Culinarian": 100136} },

    // Specialist
    //whistle: {                 common: true, buff: true, skillID: {"Alchemist": 100193, "Armorer": 100189, "Blacksmith": 100188, "Carpenter": 100187, "Culinarian": 100194, "Goldsmith": 100190, "Leatherworker": 100191, "Weaver": 100192} },
    //satisfaction: {            common: true,             skillID: {"Alchemist": 100175, "Armorer": 100171, "Blacksmith": 100170, "Carpenter": 100169, "Culinarian": 100176, "Goldsmith": 100172, "Leatherworker": 100173, "Weaver": 100174} },
    // innovativeTouch: {         common: true,             skillID: {"Alchemist": 100143, "Armorer": 100139, "Blacksmith": 100138, "Carpenter": 100137, "Culinarian": 100144, "Goldsmith": 100140, "Leatherworker": 100141, "Weaver": 100142} },
    //nymeiasWheel: {            common: true,             skillID: {"Alchemist": 100159, "Armorer": 100155, "Blacksmith": 100154, "Carpenter": 100153, "Culinarian": 100160, "Goldsmith": 100156, "Leatherworker": 100157, "Weaver": 100158} },
    // byregotsMiracle: {         common: true,             skillID: {"Alchemist": 100151, "Armorer": 100147, "Blacksmith": 100146, "Carpenter": 100145, "Culinarian": 100152, "Goldsmith": 100148, "Leatherworker": 100149, "Weaver": 100150} },
    //trainedHand: {             common: true,             skillID: {"Alchemist": 100167, "Armorer": 100163, "Blacksmith": 100162, "Carpenter": 100161, "Culinarian": 100168, "Goldsmith": 100164, "Leatherworker": 100165, "Weaver": 100166} },

    brandOfTheElements: {      common: true,             skillID: {"Alchemist": 0, "Armorer": 0, "Blacksmith": 0, "Carpenter": 0, "Culinarian": 0, "Goldsmith": 0, "Leatherworker": 0, "Weaver": 0} },
    nameOfTheElements: {       common: true, buff: true, skillID: {"Alchemist": 0, "Armorer": 0, "Blacksmith": 0, "Carpenter": 0, "Culinarian": 0, "Goldsmith": 0, "Leatherworker": 0, "Weaver": 0} },

    //heartOfTheAlchemist: {     common: true, buff: true, skillID: {"Alchemist": 100185} },
    //heartOfTheArmorer: {       common: true, buff: true, skillID: {"Armorer": 100181} },
    //heartOfTheBlacksmith: {    common: true, buff: true, skillID: {"Blacksmith": 100180} },
    //heartOfTheCarpenter: {     common: true, buff: true, skillID: {"Carpenter": 100179} },
    //heartOfTheCulinarian: {    common: true, buff: true, skillID: {"Culinarian": 100186} },
    //heartOfTheGoldsmith: {     common: true, buff: true, skillID: {"Goldsmith": 100182} },
    //heartOfTheLeatherworker: { common: true, buff: true, skillID: {"Leatherworker": 100183} },
    //heartOfTheWeaver: {        common: true, buff: true, skillID: {"Weaver": 100184} },

    // Stormblood
    // hastyTouch2: {             common: true,             skillID: {"Alchemist": 100201, "Armorer": 100197, "Blacksmith": 100196, "Carpenter": 100195, "Culinarian": 100202, "Goldsmith": 100198, "Leatherworker": 100199, "Weaver": 100200} },
    // carefulSynthesis3: {       common: true,             skillID: {"Alchemist": 100209, "Armorer": 100205, "Blacksmith": 100204, "Carpenter": 100203, "Culinarian": 100210, "Goldsmith": 100206, "Leatherworker": 100207, "Weaver": 100208} },
    rapidSynthesis2: {         common: true,             skillID: {"Alchemist": 100217, "Armorer": 100213, "Blacksmith": 100212, "Carpenter": 100211, "Culinarian": 100218, "Goldsmith": 100214, "Leatherworker": 100215, "Weaver": 100216} },
    patientTouch: {                                      skillID: {"Alchemist": 100225, "Armorer": 100221, "Blacksmith": 100220, "Carpenter": 100219, "Culinarian": 100226, "Goldsmith": 100222, "Leatherworker": 100223, "Weaver": 100224} },
    // manipulation2: {           common: true, buff: true, skillID: {"Alchemist": 4580, "Armorer": 4576, "Blacksmith": 4575, "Carpenter": 4574, "Culinarian": 4581, "Goldsmith": 4577, "Leatherworker": 4578, "Weaver": 4579} },
    prudentTouch: {                                      skillID: {"Alchemist": 100233, "Armorer": 100229, "Blacksmith": 100228, "Carpenter": 100227, "Culinarian": 100234, "Goldsmith": 100230, "Leatherworker": 100231, "Weaver": 100232} },
    focusedSynthesis: {                                  skillID: {"Alchemist": 100241, "Armorer": 100237, "Blacksmith": 100236, "Carpenter": 100235, "Culinarian": 100242, "Goldsmith": 100238, "Leatherworker": 100239, "Weaver": 100240} },
    focusedTouch: {                                      skillID: {"Alchemist": 100249, "Armorer": 100245, "Blacksmith": 100244, "Carpenter": 100243, "Culinarian": 100250, "Goldsmith": 100246, "Leatherworker": 100247, "Weaver": 100248} },
    // initialPreparations: {     common: true,             skillID: {"Alchemist": 100257, "Armorer": 100253, "Blacksmith": 100252, "Carpenter": 100251, "Culinarian": 100258, "Goldsmith": 100254, "Leatherworker": 100255, "Weaver": 100256} },
    // specialtyReinforce: {      common: true,             skillID: {"Alchemist": 100265, "Armorer": 100261, "Blacksmith": 100260, "Carpenter": 100259, "Culinarian": 100266, "Goldsmith": 100262, "Leatherworker": 100263, "Weaver": 100264} },
    // specialtyRefurbish: {      common: true,             skillID: {"Alchemist": 100273, "Armorer": 100269, "Blacksmith": 100268, "Carpenter": 100267, "Culinarian": 100274, "Goldsmith": 100270, "Leatherworker": 100271, "Weaver": 100272} },
    reflect:          {        common: true,             skillID: {"Alchemist": 100281, "Armorer": 100277, "Blacksmith": 100276, "Carpenter": 100275, "Culinarian": 100282, "Goldsmith": 100278, "Leatherworker": 100279, "Weaver": 100280} },
    // strokeOfGenius: {          common: true, buff: true, skillID: {"Alchemist": 50356, "Armorer": 50352, "Blacksmith": 50351, "Carpenter": 50350, "Culinarian": 50357, "Goldsmith": 50353, "Leatherworker": 50354, "Weaver": 50355} },

    // Shadowbringers
    preparatoryTouch: {                                  skillID: {"Alchemist": 100305, "Armorer": 100301, "Blacksmith": 100300, "Carpenter": 100299, "Culinarian": 100306, "Goldsmith": 100302, "Leatherworker": 100303, "Weaver": 100304} },    
    // rapidSynthesis3: {         common: true,             skillID: {"Alchemist": 100313, "Armorer": 100309, "Blacksmith": 100308, "Carpenter": 100307, "Culinarian": 100314, "Goldsmith": 100310, "Leatherworker": 100311, "Weaver": 100312} },
    //reuse: {                   common: true,             skillID: {"Alchemist": 4603, "Armorer": 4599, "Blacksmith": 4598, "Carpenter": 4597, "Culinarian": 4604, "Goldsmith": 4600, "Leatherworker": 4602, "Weaver": 4601} },
    delicateSynthesis: {                                 skillID: {"Alchemist": 100329, "Armorer": 100325, "Blacksmith": 100324, "Carpenter": 100323, "Culinarian": 100330, "Goldsmith": 100326, "Leatherworker": 100327, "Weaver": 100328} },
    intensiveSynthesis: {                                skillID: {"Alchemist": 100321, "Armorer": 100317, "Blacksmith": 100316, "Carpenter": 100315, "Culinarian": 100322, "Goldsmith": 100318, "Leatherworker": 100319, "Weaver": 100320} },
    trainedEye: {              common: true,             skillID: {"Alchemist": 100289, "Armorer": 100285, "Blacksmith": 100284, "Carpenter": 100283, "Culinarian": 100290, "Goldsmith": 100286, "Leatherworker": 100287, "Weaver": 100288} },
    //trainedInstinct: {         common: true,             skillID: {"Alchemist": 100297, "Armorer": 100293, "Blacksmith": 100292, "Carpenter": 100291, "Culinarian": 100298, "Goldsmith": 100294, "Leatherworker": 100295, "Weaver": 100296} },
    
    observe: {                 common: true,             skillID: {"Alchemist": 100099, "Armorer": 100040, "Blacksmith": 100023, "Carpenter": 100010, "Culinarian": 100113, "Goldsmith": 100082, "Leatherworker": 100053, "Weaver": 100070} }

    // Reclaim is omitted because it has no bearing on the success of the result of the synthesis, as far as we care.
  };

  var obsoleteActions = {
    byregotsBrow: true,
    brandOfEarth: true,
    brandOfFire: true,
    brandOfIce: true,
    brandOfLightning: true,
    brandOfWater: true,
    brandOfWind: true,
    nameOfEarth: true,
    nameOfFire: true,
    nameOfIce: true,
    nameOfLightning: true,
    nameOfWater: true,
    nameOfWind: true,
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
      // "flawlessSynthesis",
      "carefulSynthesis",
      // "carefulSynthesis2",
      // "carefulSynthesis3",
      // "pieceByPiece",
      //"trainedInstinct",
      "rapidSynthesis",
      "rapidSynthesis2",
      // "rapidSynthesis3",
      "focusedSynthesis",
      "delicateSynthesis",
      "intensiveSynthesis",
      "muscleMemory",
      "brandOfTheElements"
    ]
    },
    {
      name: "Quality", actions: [
      "basicTouch",
      "standardTouch",
      // "advancedTouch",
      "hastyTouch",
      // "hastyTouch2",
      "byregotsBlessing",
      "preciseTouch",
      "focusedTouch",
      "patientTouch",
      "prudentTouch",
      "preparatoryTouch",
      "trainedEye"
    ]
    },
    {
      name: "CP", actions: [
      // "comfortZone",
      // "rumination",
      "tricksOfTheTrade"
    ]
    },
    {
      name: "Durability", actions: [
      "mastersMend",
      // "mastersMend2",
      "wasteNot",
      "wasteNot2",
      "manipulation",
      // "manipulation2"
    ]
    },
    {
      name: "Buffs", actions: [
      "innerQuiet",
      // "steadyHand",
      // "steadyHand2",
      "ingenuity",
      // "ingenuity2",
      "greatStrides",
      "innovation",
      "reflect",
      // "makersMark",
      // "initialPreparations",
      "nameOfTheElements"//,
      //"reuse"
    ]
    },
    {
      name: "Specialist", actions: [
      //"whistle",
      //"satisfaction",
      // "innovativeTouch",
      //"nymeiasWheel",
      // "byregotsMiracle",
      //"trainedHand",
      // "specialtyReinforce",
      // "specialtyRefurbish",
      // "specialtyReflect"
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
      return 'img/actions/unknown.svg';
    }
    var info = actionsByName[action];
    if (!angular.isDefined(info)) {
      if (!obsoleteActions[action])
        console.error('unknown action: %s', action);
      return 'img/actions/unknown.svg';
    }
    return info.imagePaths[cls];
  }

  function iActionClassSpecific(name) {
    if (!angular.isDefined(name)) {
      console.error('undefined action');
      return false;
    }
    var info = actionsByName[name];
    if (!angular.isDefined(info)) {
      if (!obsoleteActions[name])
        console.error('unknown action: %s', name);
      return false;
    }
    return info.cls !== 'All';
  }

  function isActionCrossClass(name, currentClass) {
    if (!angular.isDefined(name)) {
      console.error('undefined action');
      return false;
    }
    var info = actionsByName[name];
    if (!angular.isDefined(info)) {
      if (!obsoleteActions[action])
        console.error('unknown action: %s', name);
      return false;
    }
    return info.cls !== 'All' && info.cls !== currentClass;
  }


  angular.module('ffxivCraftOptWeb.services.actions', []).
    value('_allClasses', allClasses).
    value('_allActions', allActions).
    value('_actionsByName', actionsByName).
    value('_actionGroups', actionGroups).
    value('_getActionImagePath', getActionImagePath).
    value('_iActionClassSpecific', iActionClassSpecific).
    value('_isActionCrossClass', isActionCrossClass);

})();
