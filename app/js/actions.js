function Action(shortName, name, durabilityCost, cpCost, successProbability, qualityIncreaseMultiplier, progressIncreaseMultiplier, aType, activeTurns, cls, level, onGood, onExcellent, onPoor) {
    this.shortName = shortName;
    this.name = name;
    this.durabilityCost = durabilityCost;
    this.cpCost = cpCost;
    this.successProbability = successProbability;
    this.qualityIncreaseMultiplier = qualityIncreaseMultiplier;
    this.progressIncreaseMultiplier = progressIncreaseMultiplier;
    this.type = aType;

    if (aType != 'immediate') {
        this.activeTurns = activeTurns;      // Save some space
    }
    else {
        this.activeTurns = 1;
    }

    this.cls = cls;
    this.level = level;
    this.onGood = onGood;
    this.onExcellent = onExcellent;
    this.onPoor = onPoor;
}

// Actions Table
//==============
//parameters: shortName,  name, durabilityCost, cpCost, successProbability, qualityIncreaseMultiplier, progressIncreaseMultiplier, aType, activeTurns, cls, level,onGood, onExcl, onPoor
var AllActions = {
    //                              shortName,              fullName,              dur,     cp, Prob, QIM, PIM, Type,          t,  cls,           lvl,  onGood,     onExcl,     onPoor
    observe: new Action(            'observe',              'Observe',               0,      7,  1.0, 0.0, 0.0, 'immediate',   1,  'All',           1),

    basicSynth: new Action(         'basicSynth',           'Basic Synthesis',      10,      0,  0.9, 0.0, 1.0, 'immediate',   1,  'All',           1),
    standardSynthesis: new Action(  'standardSynthesis',    'Standard Synthesis',   10,     15,  0.9, 0.0, 1.5, 'immediate',   1,  'All',          31),
    carefulSynthesis: new Action(   'carefulSynthesis',     'Careful Synthesis',    10,      0,  1.0, 0.0, 0.9, 'immediate',   1,  'Weaver',       15),
    carefulSynthesis2: new Action(  'carefulSynthesis2',    'Careful Synthesis II', 10,      0,  1.0, 0.0, 1.2, 'immediate',   1,  'Weaver',       50),
    rapidSynthesis: new Action(     'rapidSynthesis',       'Rapid Synthesis',      10,      0,  0.5, 0.0, 2.5, 'immediate',   1,  'Armorer',      15),
    flawlessSynthesis: new Action(  'flawlessSynthesis',    'Flawless Synthesis',   10,     15,  0.9, 0.0, 1.0, 'immediate',   1,  'Goldsmith',    37),
    pieceByPiece: new Action(       'pieceByPiece',         'Piece by Piece',       10,     15,  0.9, 0.0, 1.0, 'immediate',   1,  'Armorer',      50),

    basicTouch: new Action(         'basicTouch',           'Basic Touch',          10,     18,  0.7, 1.0, 0.0, 'immediate',   1,  'All',           5),
    standardTouch: new Action(      'standardTouch',        'Standard Touch',       10,     32,  0.8, 1.25,0.0, 'immediate',   1,  'All',          18),
    advancedTouch: new Action(      'advancedTouch',        'Advanced Touch',       10,     48,  0.9, 1.5, 0.0, 'immediate',   1,  'All',          43),
    hastyTouch: new Action(         'hastyTouch',           'Hasty Touch',          10,      0,  0.5, 1.0, 0.0, 'immediate',   1,  'Culinarian',   15),
    byregotsBlessing: new Action(   'byregotsBlessing',     'Byregot\'s Blessing',  10,     24,  0.9, 1.0, 0.0, 'immediate',   1,  'Carpenter',    50),

    mastersMend: new Action(        'mastersMend',          'Master\'s Mend',        0,     92,  1.0, 0.0, 0.0, 'immediate',   1,  'All',           7),
    mastersMend2: new Action(       'mastersMend2',         'Master\'s Mend II',     0,    160,  1.0, 0.0, 0.0, 'immediate',   1,  'All',          25),
    rumination: new Action(         'rumination',           'Rumination',            0,      0,  1.0, 0.0, 0.0, 'immediate',   1,  'Carpenter',    15),
    tricksOfTheTrade: new Action(   'tricksOfTheTrade',     'Tricks of the Trade',   0,      0,  1.0, 0.0, 0.0, 'immediate',   1,  'Alchemist',    15,  true,       true),

    innerQuiet: new Action(         'innerQuiet',           'Inner Quiet',           0,     18,  1.0, 0.0, 0.0, 'countup',     1,  'All',          11),
    manipulation: new Action(       'manipulation',         'Manipulation',          0,     88,  1.0, 0.0, 0.0, 'countdown',   3,  'Goldsmith',    15),
    comfortZone: new Action(        'comfortZone',          'Comfort Zone',          0,     66,  1.0, 0.0, 0.0, 'countdown',   10, 'Alchemist',    50),
    steadyHand: new Action(         'steadyHand',           'Steady Hand',           0,     22,  1.0, 0.0, 0.0, 'countdown',   5,  'All',           9),
    steadyHand2: new Action(        'steadyHand2',          'Steady Hand II',        0,     25,  1.0, 0.0, 0.0, 'countdown',   5,  'Culinarian',   37),
    wasteNot: new Action(           'wasteNot',             'Waste Not',             0,     56,  1.0, 0.0, 0.0, 'countdown',   4,  'Leatherworker',15),
    wasteNot2: new Action(          'wasteNot2',            'Waste Not II',          0,     98,  1.0, 0.0, 0.0, 'countdown',   8,  'Leatherworker',50),
    innovation: new Action(         'innovation',           'Innovation',            0,     18,  1.0, 0.0, 0.0, 'countdown',   3,  'Goldsmith',    50),
    greatStrides: new Action(       'greatStrides',         'Great Strides',         0,     32,  1.0, 0.0, 0.0, 'countdown',   3,  'All',          21),
    ingenuity: new Action(          'ingenuity',            'Ingenuity',             0,     24,  1.0, 0.0, 0.0, 'countdown',   5,  'Blacksmith',   15),
    ingenuity2: new Action(         'ingenuity2',           'Ingenuity II',          0,     32,  1.0, 0.0, 0.0, 'countdown',   5,  'Blacksmith',   50),

    // Heavensward actions
    //                              shortName,              fullName,              dur,     cp, Prob, QIM, PIM, Type,          t,  cls,           lvl,  onGood,     onExcl,     onPoor
    byregotsBrow: new Action(       'byregotsBrow',         'Byregot\'s Brow',      10,     18,  0.7, 1.5, 0.0, 'immediate',   1,  'All',          51),
    preciseTouch: new Action(       'preciseTouch',         'Precise Touch',        10,     18,  0.7, 1.0, 0.0, 'immediate',   1,  'All',          53,  true,       true),
    makersMark: new Action(         'makersMark',           'Maker\'s Mark',         0,     20,  0.7, 0.0, 0.0, 'countdown',   1,  'Goldsmith',    54), // based on description of behaviour here: http://redd.it/3ckrmk
    muscleMemory: new Action(       'muscleMemory',         'Muscle Memory',        10,      6,  1.0, 0.0, 1.0, 'immediate',   1,  'Culinarian',   54),

    // Specialist Actions
    whistle: new Action(            'whistle',           'Whistle While You Work',   0,     36,  1.0, 0.0, 0.0, 'countdown',  11,  'All',          55),
    satisfaction: new Action(       'satisfaction',         'Satisfaction',          0,      0,  1.0, 0.0, 0.0, 'immediate',   1,  'All',          55),
    innovativeTouch: new Action(    'innovativeTouch',      'Innovative Touch',     10,      8,  0.4, 1.0, 0.0, 'immediate',   1,  'All',          56),
    nymeiasWheel: new Action(       'nymeiasWheel',         'Nymeia\'s Wheel',       0,     18,  1.0, 0.0, 0.0, 'immediate',   1,  'All',          54),
    byregotsMiracle: new Action(    'byregotsMiracle',      'Byregot\'s Miracle',   10,     10,  0.7, 1.0, 0.0, 'immediate',   1,  'All',          58),
    trainedHand: new Action(        'trainedHand',          'Trained Hand',         10,     16,  1.0, 1.5, 1.5, 'immediate',   1,  'All',          58),

    // Elemental Aspect Actions
    brandOfEarth: new Action(       'brandOfEarth',         'Brand of Earth',       10,      6,  0.9, 0.0, 1.0, 'immediate',   1,  'Leatherworker',37),
    brandOfFire: new Action(        'brandOfFire',          'Brand of Fire',        10,      6,  0.9, 0.0, 1.0, 'immediate',   1,  'Blacksmith',   37),
    brandOfIce: new Action(         'brandOfIce',           'Brand of Ice',         10,      6,  0.9, 0.0, 1.0, 'immediate',   1,  'Armorer',      37),
    brandOfLightning: new Action(   'brandOfLightning',     'Brand of Lightning',   10,      6,  0.9, 0.0, 1.0, 'immediate',   1,  'Weaver',       37),
    brandOfWater: new Action(       'brandOfWater',         'Brand of Water',       10,      6,  0.9, 0.0, 1.0, 'immediate',   1,  'Alchemist',    37),
    brandOfWind: new Action(        'brandOfWind',          'Brand of Wind',        10,      6,  0.9, 0.0, 1.0, 'immediate',   1,  'Carpenter',    37),

    nameOfEarth: new Action(        'nameOfEarth',          'Name of Earth',         0,     15,  1.0, 0.0, 0.0, 'countdown',   5,  'Leatherworker',54),
    nameOfFire: new Action(         'nameOfFire',           'Name of Fire',          0,     15,  1.0, 0.0, 0.0, 'countdown',   5,  'Blacksmith',   54),
    nameOfIce: new Action(          'nameOfIce',            'Name of Ice',           0,     15,  1.0, 0.0, 0.0, 'countdown',   5,  'Armorer',      54),
    nameOfLightning: new Action(    'nameOfLightning',      'Name of Lightning',     0,     15,  1.0, 0.0, 0.0, 'countdown',   5,  'Weaver',       54),
    nameOfWater: new Action(        'nameOfWater',          'Name of Water',         0,     15,  1.0, 0.0, 0.0, 'countdown',   5,  'Alchemist',    54),
    nameOfWind: new Action(         'nameOfWind',           'Name of the Wind',      0,     15,  1.0, 0.0, 0.0, 'countdown',   5,  'Carpenter',    54),

    // Stormblood actions
    //   
    hastyTouch2: new Action(        'hastyTouch2',          'Hasty Touch II',       10,      5,  0.6, 1.0, 0.0, 'immediate',   1,  'All',          61),
    carefulSynthesis3: new Action(  'carefulSynthesis3',    'Careful Synthesis III',10,      7,  1.0, 0.0, 1.5, 'immediate',   1,  'All',          62),
    rapidSynthesis2: new Action(    'rapidSynthesis2',      'Rapid Synthesis II',   10,     12,  0.6, 0.0, 3.0, 'immediate',   1,  'All',          63),
    patientTouch: new Action(       'patientTouch',         'Patient Touch',        10,      6,  0.5, 1.0, 0.0, 'immediate',   1,  'All',          64),
    manipulation2: new Action(      'manipulation2',        'Manipulation II',       0,     96,  1.0, 0.0, 0.0, 'countdown',   8,  'All',          65),
    prudentTouch: new Action(       'prudentTouch',         'Prudent Touch',         5,     21,  0.7, 1.0, 0.0, 'immediate',   1,  'All',          66),
    focusedSynthesis: new Action(   'focusedSynthesis',     'Focused Synthesis',    10,      5,  0.5, 0.0, 2.0, 'immediate',   1,  'All',          67),
    focusedTouch: new Action(       'focusedTouch',         'Focused Touch',        10,     18,  0.5, 1.5, 0.0, 'immediate',   1,  'All',          68),
    initialPreparations: new Action('initialPreparations',  'Initial Preparations',  0,     50,  1.0, 0.0, 0.0, 'indefinite',  1,  'All',          69),
    specialtyReinforce: new Action( 'specialtyReinforce',   'Specialty: Reinforce',  0,      0,  1.0, 0.0, 0.0, 'immediate',   1,  'All',          70),
    specialtyRefurbish: new Action( 'specialtyRefurbish',   'Specialty: Refurbish',  0,      0,  1.0, 0.0, 0.0, 'immediate',   1,  'All',          70),
    specialtyReflect: new Action(   'specialtyReflect',     'Specialty: Reflect',    0,      0,  1.0, 0.0, 0.0, 'immediate',   1,  'All',          70),
    strokeOfGenius: new Action(     'strokeOfGenius',       'Stroke of Genius',      0,      0,  1.0, 0.0, 0.0, 'indefinite',  1,  'All',          70),

    // Special Actions - not selectable
    finishingTouches: new Action(   'finishingTouches',     'Finishing Touches',    10,      0,  0.5, 0.0, 2.0, 'immediate',   1,  'All',          55),
    dummyAction: new Action(        'dummyAction',          '______________',        0,      0,  1.0, 0.0, 0.0, 'immediate',   1,  'All',           1)
};
