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
    basicSynth2: {                                       skillID: {"Alchemist": 100090, "Armorer": 100030, "Blacksmith": 100015, "Carpenter": 100001, "Culinarian": 100105, "Goldsmith": 100075, "Leatherworker": 100045, "Weaver": 100060} },
    carefulSynthesis: {        common: true,             skillID: {"Weaver": 100063} },
    rapidSynthesis: {          common: true,             skillID: {"Armorer": 100033} },
    basicTouch: {                                        skillID: {"Alchemist": 100091, "Armorer": 100031, "Blacksmith": 100016, "Carpenter": 100002, "Culinarian": 100106, "Goldsmith": 100076, "Leatherworker": 100046, "Weaver": 100061} },
    standardTouch: {                                     skillID: {"Alchemist": 100093, "Armorer": 100034, "Blacksmith": 100018, "Carpenter": 100004, "Culinarian": 100109, "Goldsmith": 100078, "Leatherworker": 100048, "Weaver": 100064} },
    hastyTouch: {              common: true,             skillID: {"Culinarian": 100108} },
    byregotsBlessing: {        common: true,             skillID: {"Alchemist": 0, "Armorer": 0, "Blacksmith": 0, "Carpenter": 0, "Culinarian": 0, "Goldsmith": 0, "Leatherworker": 0, "Weaver": 0} },
    mastersMend: {             common: true,             skillID: {"Alchemist": 100092, "Armorer": 100032, "Blacksmith": 100017, "Carpenter": 100003, "Culinarian": 100107, "Goldsmith": 100077, "Leatherworker": 100047, "Weaver": 100062} },
    wasteNot: {                common: true, buff: true, skillID: {"Leatherworker": 279} },
    wasteNot2: {               common: true, buff: true, skillID: {"Leatherworker": 285} },
    manipulation: {            common: true, buff: true, skillID: {"Goldsmith": 278} },
    innerQuiet: {              common: true, buff: true, skillID: {"Alchemist": 258, "Armorer": 254, "Blacksmith": 253, "Carpenter": 252, "Culinarian": 259, "Goldsmith": 255, "Leatherworker": 257, "Weaver": 256} },
    greatStrides: {            common: true, buff: true, skillID: {"Alchemist": 266, "Armorer": 262, "Blacksmith": 261, "Carpenter": 260, "Culinarian": 267, "Goldsmith": 263, "Leatherworker": 265, "Weaver": 264} },
    innovation: {              common: true, buff: true, skillID: {"Goldsmith": 284} },
    tricksOfTheTrade: {        common: true,             skillID: {"Alchemist": 100098} },

    // Heavensward
    preciseTouch: {                                      skillID: {"Alchemist": 100134, "Armorer": 100130, "Blacksmith": 100129, "Carpenter": 100128, "Culinarian": 100135, "Goldsmith": 100131, "Leatherworker": 100132, "Weaver": 100133} },
    muscleMemory: {            common: true,             skillID: {"Culinarian": 100136} },

    brandOfTheElements: {      common: true,             skillID: {"Alchemist": 0, "Armorer": 0, "Blacksmith": 0, "Carpenter": 0, "Culinarian": 0, "Goldsmith": 0, "Leatherworker": 0, "Weaver": 0} },
    nameOfTheElements: {       common: true, buff: true, skillID: {"Alchemist": 0, "Armorer": 0, "Blacksmith": 0, "Carpenter": 0, "Culinarian": 0, "Goldsmith": 0, "Leatherworker": 0, "Weaver": 0} },

    // Stormblood
    rapidSynthesis2: {         common: true,             skillID: {"Alchemist": 100217, "Armorer": 100213, "Blacksmith": 100212, "Carpenter": 100211, "Culinarian": 100218, "Goldsmith": 100214, "Leatherworker": 100215, "Weaver": 100216} },
    patientTouch: {                                      skillID: {"Alchemist": 100225, "Armorer": 100221, "Blacksmith": 100220, "Carpenter": 100219, "Culinarian": 100226, "Goldsmith": 100222, "Leatherworker": 100223, "Weaver": 100224} },
    prudentTouch: {                                      skillID: {"Alchemist": 100233, "Armorer": 100229, "Blacksmith": 100228, "Carpenter": 100227, "Culinarian": 100234, "Goldsmith": 100230, "Leatherworker": 100231, "Weaver": 100232} },
    focusedSynthesis: {                                  skillID: {"Alchemist": 100241, "Armorer": 100237, "Blacksmith": 100236, "Carpenter": 100235, "Culinarian": 100242, "Goldsmith": 100238, "Leatherworker": 100239, "Weaver": 100240} },
    focusedTouch: {                                      skillID: {"Alchemist": 100249, "Armorer": 100245, "Blacksmith": 100244, "Carpenter": 100243, "Culinarian": 100250, "Goldsmith": 100246, "Leatherworker": 100247, "Weaver": 100248} },
    reflect: {                 common: true,             skillID: {"Alchemist": 100281, "Armorer": 100277, "Blacksmith": 100276, "Carpenter": 100275, "Culinarian": 100282, "Goldsmith": 100278, "Leatherworker": 100279, "Weaver": 100280} },

    // Shadowbringers
    preparatoryTouch: {                                  skillID: {"Alchemist": 100305, "Armorer": 100301, "Blacksmith": 100300, "Carpenter": 100299, "Culinarian": 100306, "Goldsmith": 100302, "Leatherworker": 100303, "Weaver": 100304} },    
    delicateSynthesis: {                                 skillID: {"Alchemist": 100329, "Armorer": 100325, "Blacksmith": 100324, "Carpenter": 100323, "Culinarian": 100330, "Goldsmith": 100326, "Leatherworker": 100327, "Weaver": 100328} },
    intensiveSynthesis: {                                skillID: {"Alchemist": 100321, "Armorer": 100317, "Blacksmith": 100316, "Carpenter": 100315, "Culinarian": 100322, "Goldsmith": 100318, "Leatherworker": 100319, "Weaver": 100320} },
    trainedEye: {              common: true,             skillID: {"Alchemist": 100289, "Armorer": 100285, "Blacksmith": 100284, "Carpenter": 100283, "Culinarian": 100290, "Goldsmith": 100286, "Leatherworker": 100287, "Weaver": 100288} },

    observe: {                 common: true,             skillID: {"Alchemist": 100099, "Armorer": 100040, "Blacksmith": 100023, "Carpenter": 100010, "Culinarian": 100113, "Goldsmith": 100082, "Leatherworker": 100053, "Weaver": 100070} }
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
      name: "First Turn Only", actions: [
        "muscleMemory",
        "reflect",
        "trainedEye"
      ]
    },
    {
      name: "Synthesis", actions: [
        "basicSynth",
        "rapidSynthesis",
        "basicSynth2",
        "brandOfTheElements",
        "carefulSynthesis",
        "rapidSynthesis2",
        "focusedSynthesis",
        "intensiveSynthesis"
      ]
    },
    {
      name: "Synthesis + Quality", actions: [
        "delicateSynthesis"
      ]
    },
    {
      name: "Quality", actions: [
        "basicTouch",
        "hastyTouch",
        "standardTouch",
        "byregotsBlessing",
        "preciseTouch",
        "patientTouch",
        "prudentTouch",
        "focusedTouch",
        "preparatoryTouch"
      ]
    },
    {
      name: "CP", actions: [
        "tricksOfTheTrade"
      ]
    },
    {
      name: "Durability", actions: [
        "mastersMend",
        "wasteNot",
        "wasteNot2",
        "manipulation"
      ]
    },
    {
      name: "Buffs", actions: [
        "innerQuiet",
        "greatStrides",
        "innovation",
        "nameOfTheElements"
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

  angular.module('ffxivCraftOptWeb.services.actions', []).
    value('_allClasses', allClasses).
    value('_allActions', allActions).
    value('_actionsByName', actionsByName).
    value('_actionGroups', actionGroups).
    value('_getActionImagePath', getActionImagePath).
    value('_iActionClassSpecific', iActionClassSpecific)

})();
