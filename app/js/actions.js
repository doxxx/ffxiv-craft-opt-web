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
    standardSynthesis: new Action(  'standardSynthesis',    'Basic Synthesis',      10,      0,  1.0, 0.0, 1.2, 'immediate',   1,  'All',          31),
    carefulSynthesis: new Action(   'carefulSynthesis',     'Careful Synthesis',    10,      7,  1.0, 0.0, 1.5, 'immediate',   1,  'All',          62),
    // carefulSynthesis2: new Action(  'carefulSynthesis2',    'Careful Synthesis II', 10,      0,  1.0, 0.0, 1.2, 'immediate',   1,  'All',          50),
    rapidSynthesis: new Action(     'rapidSynthesis',       'Rapid Synthesis',      10,      0,  0.5, 0.0, 2.5, 'immediate',   1,  'All',          15),
    flawlessSynthesis: new Action(  'flawlessSynthesis',    'Flawless Synthesis',   10,     15,  0.9, 0.0, 1.0, 'immediate',   1,  'All',          37),
    // pieceByPiece: new Action(       'pieceByPiece',         'Piece by Piece',       10,     15,  0.9, 0.0, 1.0, 'immediate',   1,  'All',          50),

    basicTouch: new Action(         'basicTouch',           'Basic Touch',          10,     18,  1.0, 1.0, 0.0, 'immediate',   1,  'All',           5),
    standardTouch: new Action(      'standardTouch',        'Standard Touch',       10,     32,  1.0, 1.25,0.0, 'immediate',   1,  'All',          18),
    // advancedTouch: new Action(      'advancedTouch',        'Advanced Touch',       10,     48,  0.9, 1.5, 0.0, 'immediate',   1,  'All',          43),
    hastyTouch: new Action(         'hastyTouch',           'Hasty Touch',          10,      0,  0.6, 1.0, 0.0, 'immediate',   1,  'All',           9),
    byregotsBlessing: new Action(   'byregotsBlessing',     'Byregot\'s Blessing',  10,     24,  1.0, 1.0, 0.0, 'immediate',   1,  'All',          50),

    mastersMend: new Action(        'mastersMend',          'Master\'s Mend',        0,     88,  1.0, 0.0, 0.0, 'immediate',   1,  'All',           7),
    // mastersMend2: new Action(       'mastersMend2',         'Master\'s Mend II',     0,    160,  1.0, 0.0, 0.0, 'immediate',   1,  'All',          25),
    // rumination: new Action(         'rumination',           'Rumination',            0,      0,  1.0, 0.0, 0.0, 'immediate',   1,  'All',          15),
    tricksOfTheTrade: new Action(   'tricksOfTheTrade',     'Tricks of the Trade',   0,      0,  1.0, 0.0, 0.0, 'immediate',   1,  'All',          13,  true,       true),

    innerQuiet: new Action(         'innerQuiet',           'Inner Quiet',           0,     18,  1.0, 0.0, 0.0, 'countup',     1,  'All',          11),
    manipulation: new Action(       'manipulation',         'Manipulation',          0,     96,  1.0, 0.0, 0.0, 'countdown',   5,  'All',          65),
    // comfortZone: new Action(        'comfortZone',          'Comfort Zone',          0,     66,  1.0, 0.0, 0.0, 'countdown',   10, 'All',          50),
    // steadyHand: new Action(         'steadyHand',           'Steady Hand',           0,     22,  1.0, 0.0, 0.0, 'countdown',   5,  'All',           9),
    // steadyHand2: new Action(        'steadyHand2',          'Steady Hand II',        0,     25,  1.0, 0.0, 0.0, 'countdown',   5,  'All',          37),
    wasteNot: new Action(           'wasteNot',             'Waste Not',             0,     56,  1.0, 0.0, 0.0, 'countdown',   4,  'All',          15),
    wasteNot2: new Action(          'wasteNot2',            'Waste Not II',          0,     98,  1.0, 0.0, 0.0, 'countdown',   8,  'All',          47),
    innovation: new Action(         'innovation',           'Innovation',            0,     18,  1.0, 0.0, 0.0, 'countdown',   4,  'All',          26),
    greatStrides: new Action(       'greatStrides',         'Great Strides',         0,     32,  1.0, 0.0, 0.0, 'countdown',   3,  'All',          21),
    ingenuity: new Action(          'ingenuity',            'Ingenuity',             0,     22,  1.0, 0.0, 0.0, 'countdown',   5,  'All',          15),
    // ingenuity2: new Action(         'ingenuity2',           'Ingenuity II',          0,     32,  1.0, 0.0, 0.0, 'countdown',   5,  'All',          50),

    // Heavensward actions
    //                              shortName,              fullName,              dur,     cp, Prob, QIM, PIM, Type,          t,  cls,           lvl,  onGood,     onExcl,     onPoor
    preciseTouch: new Action(       'preciseTouch',         'Precise Touch',        10,     18,  1.0, 1.5, 0.0, 'immediate',   1,  'All',          53,  true,       true),
    // makersMark: new Action(         'makersMark',           'Maker\'s Mark',         0,     20,  0.7, 0.0, 0.0, 'countdown',   1,  'All',          54), // based on description of behaviour here: http://redd.it/3ckrmk
    muscleMemory: new Action(       'muscleMemory',         'Muscle Memory',        10,      6,  1.0, 0.0, 3.0, 'countdown',   5,  'All',          54),

    // Specialist Actions
    //whistle: new Action(            'whistle',           'Whistle While You Work',   0,     36,  1.0, 0.0, 0.0, 'countdown',  11,  'All',          55),
    //satisfaction: new Action(       'satisfaction',         'Satisfaction',          0,      0,  1.0, 0.0, 0.0, 'immediate',   1,  'All',          55),
    // innovativeTouch: new Action(    'innovativeTouch',      'Innovative Touch',     10,      8,  0.4, 1.0, 0.0, 'immediate',   1,  'All',          56),
    //nymeiasWheel: new Action(       'nymeiasWheel',         'Nymeia\'s Wheel',       0,     18,  1.0, 0.0, 0.0, 'immediate',   1,  'All',          54),
    // byregotsMiracle: new Action(    'byregotsMiracle',      'Byregot\'s Miracle',   10,     10,  0.7, 1.0, 0.0, 'immediate',   1,  'All',          58),
    //trainedHand: new Action(        'trainedHand',          'Trained Hand',         10,     16,  1.0, 1.5, 1.5, 'immediate',   1,  'All',          58),

    // Elemental Aspect Actions
    brandOfTheElements: new Action( 'brandOfTheElements',   'Brand of the Elements', 10,     6,  1.0, 0.0, 1.0, 'immediate',   1,  'All',          37),
    nameOfTheElements: new Action(  'nameOfTheElements',    'Name of the Elements',   0,    30,  1.0, 0.0, 0.0, 'countdown',   3,  'All',          37),

    // Stormblood actions
    //   
    // hastyTouch2: new Action(        'hastyTouch2',          'Hasty Touch II',       10,      5,  0.6, 1.0, 0.0, 'immediate',   1,  'All',          61),
    // carefulSynthesis3: new Action(  'carefulSynthesis3',    'Careful Synthesis III',10,      7,  1.0, 0.0, 1.5, 'immediate',   1,  'All',          62),
    rapidSynthesis2: new Action(    'rapidSynthesis2',      'Rapid Synthesis',      10,      0,  0.5, 0.0, 5.0, 'immediate',   1,  'All',          63),
    patientTouch: new Action(       'patientTouch',         'Patient Touch',        10,      6,  0.5, 1.0, 0.0, 'immediate',   1,  'All',          64),
    // manipulation2: new Action(      'manipulation2',        'Manipulation II',       0,     96,  1.0, 0.0, 0.0, 'countdown',   8,  'All',          65),
    prudentTouch: new Action(       'prudentTouch',         'Prudent Touch',         5,     25,  1.0, 1.0, 0.0, 'immediate',   1,  'All',          66),
    focusedSynthesis: new Action(   'focusedSynthesis',     'Focused Synthesis',    10,      5,  0.5, 0.0, 2.0, 'immediate',   1,  'All',          67),
    focusedTouch: new Action(       'focusedTouch',         'Focused Touch',        10,     18,  0.5, 1.5, 0.0, 'immediate',   1,  'All',          68),
    reflect: new Action(            'reflect',              'Reflect',               10,     24,  1.0, 1.0, 0.0, 'immediate',   1,  'All',          69),
    // initialPreparations: new Action('initialPreparations',  'Initial Preparations',  0,     50,  1.0, 0.0, 0.0, 'indefinite',  1,  'All',          69),
    // specialtyReinforce: new Action( 'specialtyReinforce',   'Specialty: Reinforce',  0,      0,  1.0, 0.0, 0.0, 'immediate',   1,  'All',          70),
    // specialtyRefurbish: new Action( 'specialtyRefurbish',   'Specialty: Refurbish',  0,      0,  1.0, 0.0, 0.0, 'immediate',   1,  'All',          70),
    // strokeOfGenius: new Action(     'strokeOfGenius',       'Stroke of Genius',      0,      0,  1.0, 0.0, 0.0, 'indefinite',  1,  'All',          70),

    // ShadowBringers actions
    //
    preparatoryTouch: new Action(   'preparatoryTouch',     'Preparatory Touch',    20,     40,  1.0, 2.0, 0.0, 'immediate',   1,  'All',          71),
    // rapidSynthesis3: new Action(    'rapidSynthesis3',      'Rapid Synthesis III',  20,     24,  0.6, 0.0, 6.0, 'immediate',   1,  'All',          72),
    //reuse: new Action(              'reuse',                'Reuse',                 0,     60,  0.0, 0.0, 0.0, 'immediate',   1,  'All',          74),
    delicateSynthesis: new Action(  'delicateSynthesis',    'Delicate Synthesis',   10,     32,  1.0, 1.0, 1.0, 'immediate',   1,  'All',          76),
    intensiveSynthesis: new Action( 'intensiveSynthesis',   'Intensive Synthesis',  10,     6,  1.0, 0.0, 3.0, 'immediate',   1,  'All',          78,  true,       true),
    trainedEye: new Action(         'trainedEye',           'Trained Eye',          10,    250,  1.0, 0.0, 0.0, 'immediate',   1,  'All',          80),
    //trainedInstinct: new Action(    'trainedInstinct',      'Trained Instinct',     10,    250,  1.0, 1.0, 0.0, 'immediate',   1,  'All',          80),

    // Special Actions - not selectable
    finishingTouches: new Action(   'finishingTouches',     'Finishing Touches',    10,      0,  0.5, 0.0, 2.0, 'immediate',   1,  'All',          55),
    dummyAction: new Action(        'dummyAction',          '______________',        0,      0,  1.0, 0.0, 0.0, 'immediate',   1,  'All',           1)
};
