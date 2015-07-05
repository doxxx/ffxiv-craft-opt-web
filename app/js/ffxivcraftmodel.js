//require('./String.js');
/* Adding new actions search for STEP_##
    * Add action to AllActions object STEP_01
    * Add action effect to SimSynth function STEP_02
    * Add action effect to MonteCarloSynth function STEP_03
*/

function Logger(logOutput) {
    this.logOutput = logOutput;
}

Logger.prototype.log = function(myString) {
    var args = Array.prototype.slice.call(arguments, 1);
    var msg = String.prototype.sprintf.apply(myString, args);
    if (this.logOutput !== undefined && this.logOutput !== null) {
        this.logOutput.write(msg + '\n');
    }
    else {
        console.log(msg);
    }
};

function Crafter(cls, level, craftsmanship, control, craftPoints, actions) {
    this.cls = cls;
    this.craftsmanship = craftsmanship;
    this.control = control;
    this.craftPoints = craftPoints;
    this.level = level;
    if (actions === null) {
        this.actions = [];
    }
    else {
        this.actions = actions;
    }
}

function Recipe(level, difficulty, durability, startQuality, maxQuality) {
    this.level = level;
    this.difficulty = difficulty;
    this.durability = durability;
    this.startQuality = startQuality;
    this.maxQuality = maxQuality;
}

function Synth(crafter, recipe, maxTrickUses, reliabilityIndex, useConditions) {
    this.crafter = crafter;
    this.recipe = recipe;
    this.maxTrickUses = maxTrickUses;
    this.useConditions = useConditions;
    this.reliabilityIndex = reliabilityIndex;
}

Synth.prototype.calculateBaseProgressIncrease = function (levelDifference, craftsmanship) {
    var levelCorrectionFactor = 0;

    if (levelDifference < -9) {
        levelDifference = -9;
    }

    if ((levelDifference < -5)) {
        levelCorrectionFactor = 0.0501 * levelDifference;
    }
    else if ((-5 <= levelDifference) && (levelDifference <= 0)) {
        levelCorrectionFactor = 0.10 * levelDifference;
    }
    else if ((0 < levelDifference) && (levelDifference <= 5)) {
        levelCorrectionFactor = 0.0501 * levelDifference;
    }
    else if ((5 < levelDifference) && (levelDifference <= 15)) {
        levelCorrectionFactor = 0.022 * levelDifference + 0.15;
    }
    else {
        levelCorrectionFactor = 0.00134 * levelDifference + 0.466;
    }

    var baseProgress = 0.209 * craftsmanship + 2.51;
    var levelCorrectedProgress = baseProgress * (1 + levelCorrectionFactor);

    return levelCorrectedProgress;
};

Synth.prototype.calculateBaseQualityIncrease = function (levelDifference, control, recipeLevel) {
    var levelCorrectionFactor = 0;

    // Max penalty still appears to be -5 in Patch 2.2
    if (levelDifference < -5) {
        levelDifference = -5;
    }

    if (recipeLevel > 50) {
        if (levelDifference <= -5) {
            levelCorrectionFactor = 0.05374 * levelDifference;
        }
        else {
            //if levelDifference > -5
            // Ingenuity does not quite reduce LDiff to 0
            levelCorrectionFactor = 0.05 * -0.5;
        }
    }
    else {
        if (levelDifference < 0) {
            levelCorrectionFactor = 0.05 * levelDifference;
        }
        else {
            levelCorrectionFactor = 0;
        }
    }

    var baseQuality = 0;
    baseQuality = 3.46e-5 * control * control + 0.3514 * control + 34.66;
    var levelCorrectedQuality = baseQuality * (1 + levelCorrectionFactor);

    return levelCorrectedQuality;
};

function Action(shortName, name, durabilityCost, cpCost, successProbability, qualityIncreaseMultiplier, progressIncreaseMultiplier, aType, activeTurns, cls, level) {
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
        this.activeturns = 1;
    }

    this.cls = cls;
    this.level = level;
}

function isActionEq(action1, action2) {
    return action1.name === action2.name;
}

function isActionNe(action1, action2) {
    return action1.name !== action2.name;
}

function EffectTracker() {
    this.countUps = {};
    this.countDowns = {};
}

function State(step, action, durabilityState, cpState, qualityState, progressState, wastedActions, progressOk, cpOk, durabilityOk, trickUses, reliability, crossClassActionList, effects, condition) {
    this.step = step;
    this.action = action;
    this.durabilityState = durabilityState;
    this.cpState = cpState;
    this.qualityState = qualityState;
    this.progressState = progressState;
    this.wastedActions = wastedActions;
    this.progressOk = progressOk;
    this.cpOk = cpOk;
    this.durabilityOk = durabilityOk;
    this.trickUses = trickUses;
    this.reliability = reliability;
    if (crossClassActionList === null) {
        this.crossClassActionList = {};
    }
    else {
        this.crossClassActionList = crossClassActionList;
    }
    this.effects = effects;
    this.condition =  condition;

}

function NewStateFromSynth(synth) {
    var step = 0;
    var durabilityState = synth.recipe.durability;
    var cpState = synth.crafter.craftPoints;
    var qualityState = synth.recipe.startQuality;
    var progressState = 0;
    var wastedActions = 0;
    var progressOk = false;
    var cpOk = false;
    var durabilityOk = false;
    var trickUses = 0;
    var reliability = 1;
    var crossClassActionList = {};
    var effects = new EffectTracker();
    var condition = 'Normal';

    return new State(step, '', durabilityState, cpState, qualityState, progressState,
        wastedActions, progressOk, cpOk, durabilityOk, trickUses, reliability, crossClassActionList, effects, condition);
}

function simSynth(individual, synth, startState, verbose, debug, logOutput) {
    verbose = verbose !== undefined ? verbose : true;
    debug = debug !== undefined ? debug : false;
    logOutput = logOutput !== undefined ? logOutput : null;

    var logger = new Logger(logOutput);

    // Unpack state
    var stepCount = startState.step;
    var durabilityState = startState.durabilityState;
    var cpState = startState.cpState;
    var qualityState = startState.qualityState;
    var progressState = startState.progressState;
    var wastedActions = startState.wastedActions;
    var progressOk = startState.progressOk;
    var cpOk = startState.cpOk;
    var durabilityOk = startState.durabilityOk;
    var trickUses = startState.trickUses;
    var reliability = startState.reliability;
    var crossClassActionList = startState.crossClassActionList;
    var effects = startState.effects;
    var condition = startState.condition;

    // Conditions
    var useConditions = synth.useConditions;
    var pGood = 0.23;
    var pExcellent = 0.01;

    // Step 1 is always normal
    var ppGood = 0;
    var ppExcellent = 0;
    var ppPoor = 0;
    var ppNormal = 1 - (ppGood + ppExcellent + ppPoor);

    // End state checks
    var trickOk = false;
    var reliabilityOk = false;

    // Initialize counters
    var crossClassActionCounter = 0;

    // Check for null or empty individuals
    if (individual === null || individual.length === 0) {
        return NewStateFromSynth(synth);
    }

    if (debug) {
        logger.log('%-2s %20s %-5s %-5s %-8s %-5s %-5s %-5s %-5s %-5s %-5s %-5s', '#', 'Action', 'DUR', 'CP', 'EQUA', 'EPRG', 'WAC', 'IQ', 'CTL', 'QINC', 'BPRG', 'BQUA');
        logger.log('%2d %20s %5.0f %5.0f %8.1f %5.1f %5.0f %5.1f %5.0f %5.0f', stepCount, '', durabilityState, cpState, qualityState, progressState, wastedActions, 0, synth.crafter.control, 0);
    }
    else if (verbose) {
        logger.log('%-2s %20s %-5s %-5s %-8s %-5s %-5s' , '#', 'Action', 'DUR', 'CP', 'EQUA', 'EPRG', 'WAC');
        logger.log('%2d %20s %5.0f %5.0f %8.1f %5.1f %5.0f', stepCount, '', durabilityState, cpState, qualityState, progressState, wastedActions);

    }

    for (var i = 0; i < individual.length; i++) {
        var action = individual[i];

        // Occur regardless of dummy actions
        //==================================
        stepCount += 1;

        // STEP_02.a
        // Effect Modifiers
        //=================
        var craftsmanship = synth.crafter.craftsmanship;

        // Effects modifying control
        var control = synth.crafter.control;
        if (AllActions.innerQuiet.name in effects.countUps) {
            control += (0.2 * effects.countUps[AllActions.innerQuiet.name]) * synth.crafter.control;
        }

        if (AllActions.innovation.name in effects.countDowns) {
            control += 0.5 * synth.crafter.control;
        }

        // Effects modifying level difference
        var cAdjFactor = 0;
        if (LevelTable[synth.crafter.level]) {
            cAdjFactor = LevelTable[synth.crafter.level];
        }
        var levelDifference = (synth.crafter.level + cAdjFactor) - synth.recipe.level;
        if (AllActions.ingenuity2.name in effects.countDowns) {
            if (synth.crafter.level == 50) {
                if (levelDifference < -20) {
                    levelDifference = -6;
                }
                else if (-20 <= levelDifference && levelDifference <= -5) {
                    levelDifference = 3;
                }
                else {
                    levelDifference = levelDifference + 7; // Patch 2.2. This is a guess.
                }
            }
            else if (synth.crafter.level < 50) {
                levelDifference = levelDifference + 7; // Patch 2.2. Confirmed.
            }
        }
        else if (AllActions.ingenuity.name in effects.countDowns) {
            if (synth.crafter.level == 50) {
                if (levelDifference < -20) {
                    levelDifference = -8;
                }
                else if (-20 <= levelDifference && levelDifference <= -5) {
                    levelDifference = 0;
                }
                else {
                    levelDifference = levelDifference + 5; // Patch 2.2. This is a guess.
                }
            }
            else if (synth.crafter.level < 50) {
                levelDifference = levelDifference + 5; // Patch 2.2. Confirmed.
                //levelDifference = 0;
            }
        }

        // Effects modfiying probability
        var successProbability = action.successProbability;
        if (AllActions.steadyHand2.name in effects.countDowns) {
            successProbability = action.successProbability + 0.3;        // Assume 2 always overrides 1
        }
        else if (AllActions.steadyHand.name in effects.countDowns) {
            successProbability = action.successProbability + 0.2;
        }
        else {
            successProbability = action.successProbability;
        }
        successProbability = Math.min(successProbability, 1);

        // Effects modifying quality increase multiplier
        var qualityIncreaseMultiplier = action.qualityIncreaseMultiplier;
        if (AllActions.greatStrides.name in effects.countDowns) {
            qualityIncreaseMultiplier *= 2;
        }

        // Condition Calculation
        if (useConditions) {
            qualityIncreaseMultiplier *= (1*ppNormal + 1.5*ppGood * Math.pow(1 - (ppGood+pGood)/2, synth.maxTrickUses) + 4*ppExcellent + 0.5*ppPoor);
        }

        // Calculate final gains / losses
        // Effects modifying progress
        var bProgressGain = action.progressIncreaseMultiplier * synth.calculateBaseProgressIncrease(levelDifference, craftsmanship);
        if (isActionEq(action, AllActions.flawlessSynthesis)) {
            bProgressGain = 40;
        }
        else if (isActionEq(action, AllActions.pieceByPiece)) {
            bProgressGain = (synth.recipe.difficulty - progressState)*0.33;
        }
        var progressGain = bProgressGain;

        // Effects modifying quality
        var bQualityGain = qualityIncreaseMultiplier * synth.calculateBaseQualityIncrease(levelDifference, control, synth.recipe.level);
        var qualityGain = bQualityGain;
        if (isActionEq(action, AllActions.byregotsBlessing) && AllActions.innerQuiet.name in effects.countUps) {
            qualityGain *= (1 + 0.2 * effects.countUps[AllActions.innerQuiet.name]);
        }

        // Effects modifying durability cost
        var durabilityCost = action.durabilityCost;
        if ((AllActions.wasteNot.name in effects.countDowns) || (AllActions.wasteNot2.name in effects.countDowns)) {
            durabilityCost = 0.5 * action.durabilityCost;
        }

        if (progressGain > 0) {
            reliability = reliability * successProbability;
        }

        // Floor gains at final stage before calculating expected value
        progressGain = successProbability * Math.floor(progressGain);
        qualityGain = successProbability * Math.floor(qualityGain);

        // Occur if a wasted action
        //==================================
        if (((progressState >= synth.recipe.difficulty) || (durabilityState <= 0) || (cpState < 0)) && (action != AllActions.dummyAction)) {
            wastedActions += 1;
        }

        // Occur if not a wasted action
        //==================================
        else {
            // State tracking
            progressState += progressGain;
            qualityState += qualityGain;
            durabilityState -= durabilityCost;
            cpState -= action.cpCost;

            // STEP_02.b
            // Effect management
            //==================================
            // Special Effect Actions
            if (isActionEq(action, AllActions.mastersMend)) {
                durabilityState += 30;
            }

            if (isActionEq(action, AllActions.mastersMend2)) {
                durabilityState += 60;
            }

            if ((AllActions.manipulation.name in effects.countDowns) && (durabilityState > 0)) {
                durabilityState += 10;
            }

            if (isActionNe(action, AllActions.comfortZone) && AllActions.comfortZone.name in effects.countDowns && cpState > 0) {
                cpState += 8;
            }

            if (isActionEq(action, AllActions.rumination) && cpState >= 0) {
                if (AllActions.innerQuiet.name in effects.countUps && effects.countUps[AllActions.innerQuiet.name] > 0) {
                    cpState += (21 * effects.countUps[AllActions.innerQuiet.name] - Math.pow(effects.countUps[AllActions.innerQuiet.name],2) + 10)/2;
                    delete effects.countUps[AllActions.innerQuiet.name];
                }
                else {
                    wastedActions += 1;
                }
            }

            if (isActionEq(action, AllActions.byregotsBlessing)) {
                if (AllActions.innerQuiet.name in effects.countUps) {
                    delete effects.countUps[AllActions.innerQuiet.name];
                }
                else {
                    wastedActions += 1;
                }
            }

            if ((action.qualityIncreaseMultiplier > 0) && (AllActions.greatStrides.name in effects.countDowns)) {
                delete effects.countDowns[AllActions.greatStrides.name];
            }

            if ((isActionEq(action, AllActions.tricksOfTheTrade)) && (cpState > 0)) {
                trickUses += 1;
                cpState += 20;
            }

            // Conditions
            if (useConditions) {
                ppPoor = ppExcellent;
                ppGood = pGood * ppNormal;
                ppExcellent = pExcellent * ppNormal;
                ppNormal = 1 - (ppGood + ppExcellent + ppPoor);
            }

            // STEP_02.c
            // Countdown / Countup Management
            //===============================
            // Decrement countdowns
            for (var countDown in effects.countDowns) {
                effects.countDowns[countDown] -= 1;
                if (effects.countDowns[countDown] === 0) {
                    delete effects.countDowns[countDown];
                }
            }

            // Increment countups
            if ((action.qualityIncreaseMultiplier > 0) && (AllActions.innerQuiet.name in effects.countUps) && effects.countUps[AllActions.innerQuiet.name] < 10) {
                effects.countUps[AllActions.innerQuiet.name] += 1 * successProbability;
            }

            // Initialize new effects after countdowns are managed to reset them properly
            if (action.type === 'countup') {
                effects.countUps[action.name] = 0;
            }

            if (action.type === 'countdown') {
                effects.countDowns[action.name] = action.activeTurns;
            }

            // Sanity checks for state variables
            if ((durabilityState >= -5) && (progressState >= synth.recipe.difficulty)) {
                durabilityState = 0;
            }
            durabilityState = Math.min(durabilityState, synth.recipe.durability);
            cpState = Math.min(cpState, synth.crafter.craftPoints);

            // Count cross class actions
            if (!(action.cls === 'All' || action.cls === synth.crafter.cls || action.shortName in crossClassActionList)) {
                crossClassActionList[action.shortName] = true;
                crossClassActionCounter += 1;
            }

        }

        if (debug) {
            var iqCnt = 0;
            if (AllActions.innerQuiet.name in effects.countUps) {
                iqCnt = effects.countUps[AllActions.innerQuiet.name];
            }
            logger.log('%2d %20s %5.0f %5.0f %8.1f %5.1f %5.0f %5.1f %5.0f %5.0f %5.0f %5.1f', stepCount, action.name, durabilityState, cpState, qualityState, progressState, wastedActions, iqCnt, control, qualityGain, bProgressGain, bQualityGain);
        }
        else if (verbose) {
            logger.log('%2d %20s %5.0f %5.0f %8.1f %5.1f %5.0f', stepCount, action.name, durabilityState, cpState, qualityState, progressState, wastedActions);
        }

    }

    // Penalise failure outcomes
    if (progressState >= synth.recipe.difficulty) {
        progressOk = true;
    }

    if (cpState >= 0) {
        cpOk = true;
    }

    if ((durabilityState >= 0) && (progressState >= synth.recipe.difficulty)) {
        durabilityOk = true;
    }

    if (trickUses <= synth.maxTrickUses) {
        trickOk = true;
    }

    if (reliability >= synth.reliabilityIndex) {
        reliabilityOk = true;
    }

    var lastAction = individual[individual.length-1];

    var finalState = new State(stepCount, lastAction.name, durabilityState, cpState, qualityState, progressState,
                       wastedActions, progressOk, cpOk, durabilityOk, trickUses, reliability, crossClassActionList);

    if (debug) {
        logger.log('Progress Check: %s, Durability Check: %s, CP Check: %s, Tricks Check: %s, Reliability Check: %s, Cross Class Skills: %d, Wasted Actions: %d', progressOk, durabilityOk, cpOk, trickOk, reliabilityOk, crossClassActionCounter, wastedActions);
    }
    else if (verbose) {
        logger.log('Progress Check: %s, Durability Check: %s, CP Check: %s, Tricks Check: %s, Reliability Check: %s, Cross Class Skills: %d, Wasted Actions: %d', progressOk, durabilityOk, cpOk, trickOk, reliabilityOk, crossClassActionCounter, wastedActions);
    }

    return finalState;
}

function MonteCarloStep(synth, startState, action, assumeSuccess, verbose, debug, logOutput) {
    verbose = verbose !== undefined ? verbose : true;
    debug = debug !== undefined ? debug : false;
    logOutput = logOutput !== undefined ? logOutput : null;

    var logger = new Logger(logOutput);

    // Unpack state
    var stepCount = startState.step;
    var durabilityState = startState.durabilityState;
    var cpState = startState.cpState;
    var qualityState = startState.qualityState;
    var progressState = startState.progressState;
    var wastedActions = startState.wastedActions;
    var progressOk = startState.progressOk;
    var cpOk = startState.cpOk;
    var durabilityOk = startState.durabilityOk;
    var trickUses = startState.trickUses;
    var reliability = startState.reliability;
    var crossClassActionList = startState.crossClassActionList;
    var effects = startState.effects;
    var condition = startState.condition;

    // Conditions
    var pGood = 0.23;
    var pExcellent = 0.01;

    // Initialize counters
    var crossClassActionCounter = 0; // *** REVIEW ***

    stepCount += 1;

    // STEP_03.a
    // Effect modifiers
    //=================
    var craftsmanship = synth.crafter.craftsmanship;

    // Effects modifying control
    var control = synth.crafter.control;
    if (AllActions.innerQuiet.name in effects.countUps) {
        control += (0.2 * effects.countUps[AllActions.innerQuiet.name]) * synth.crafter.control;
    }

    if (AllActions.innovation.name in effects.countDowns) {
        control += 0.5 * synth.crafter.control;
    }

    // Control is floored before display based on IQ incremental observations
    control = Math.floor(control);

    // Effects modifying level difference
    var cAdjFactor = 0;
    if (LevelTable[synth.crafter.level]) {
        cAdjFactor = LevelTable[synth.crafter.level];
    }
    var levelDifference = (synth.crafter.level + cAdjFactor) - synth.recipe.level;
    if (AllActions.ingenuity2.name in effects.countDowns) {
        if (synth.crafter.level == 50) {
            if (levelDifference < -20) {
                levelDifference = -6;
            }
            else if (-20 <= levelDifference && levelDifference <= -5) {
                levelDifference = 3;
            }
            else {
                levelDifference = levelDifference + 7; // Patch 2.2. This is a guess.
            }
        }
        else if (synth.crafter.level < 50) {
            levelDifference = levelDifference + 7; // Patch 2.2. Confirmed.
        }
    }
    else if (AllActions.ingenuity.name in effects.countDowns) {
        if (synth.crafter.level == 50) {
            if (levelDifference < -20) {
                levelDifference = -8;
            }
            else if (-20 <= levelDifference && levelDifference <= -5) {
                levelDifference = 0;
            }
            else {
                levelDifference = levelDifference + 5; // Patch 2.2. This is a guess.
            }
        }
        else if (synth.crafter.level < 50) {
            levelDifference = levelDifference + 5; // Patch 2.2. Confirmed.
            //levelDifference = 0;
        }
    }

    // Effects modifying probability
    var successProbability = action.successProbability;
    if (AllActions.steadyHand2.name in effects.countDowns) {
        successProbability = action.successProbability + 0.3;        // Assume 2 always overrides 1
    }
    else if (AllActions.steadyHand.name in effects.countDowns) {
        successProbability = action.successProbability + 0.2;
    }
    successProbability = Math.min(successProbability, 1);

    // Effects modifying quality increase multiplier
    var qualityIncreaseMultiplier = action.qualityIncreaseMultiplier;
    if (AllActions.greatStrides.name in effects.countDowns) {
        qualityIncreaseMultiplier *= 2;
    }

    // Condition Evaluation
    if (!synth.useConditions) {
        qualityIncreaseMultiplier *= 1.0;
    }
    else if (condition === 'Excellent') {
        qualityIncreaseMultiplier *= 4.0;
    }
    else if (condition === 'Good' ) {
        qualityIncreaseMultiplier *= 1.5;
    }
    else if (condition === 'Poor' ) {
        qualityIncreaseMultiplier *= 0.5;
    }
    else {
        qualityIncreaseMultiplier *= 1.0;
    }

    // Calculate final gains / losses
    var success = 0;
    var successRand = Math.random();
    if (0 <= successRand && successRand <= successProbability) {
        success = 1;
    }

        if (assumeSuccess) {
            success = 1;
        }

    // Effects modifying progress
    var bProgressGain = action.progressIncreaseMultiplier * synth.calculateBaseProgressIncrease(levelDifference, craftsmanship);
    if (isActionEq(action, AllActions.flawlessSynthesis)) {
        bProgressGain = 40;
    }
    else if (isActionEq(action, AllActions.pieceByPiece)) {
        bProgressGain = (synth.recipe.difficulty - progressState)*0.33;
    }
    var progressGain = success * bProgressGain;

    // Effects modifying quality
    var bQualityGain = qualityIncreaseMultiplier * synth.calculateBaseQualityIncrease(levelDifference, control, synth.recipe.level);
    var qualityGain = success * bQualityGain;
    if (isActionEq(action, AllActions.byregotsBlessing) && AllActions.innerQuiet.name in effects.countUps) {
        qualityGain *= (1 + 0.2 * effects.countUps[AllActions.innerQuiet.name]);
    }

    // Effects modifying durability cost
    var durabilityCost = action.durabilityCost;
    if (AllActions.wasteNot.name in effects.countDowns || AllActions.wasteNot2.name in effects.countDowns) {
        durabilityCost = 0.5 * action.durabilityCost;
    }

    if (progressGain > 0) {
        reliability = reliability * successProbability;
    }

    // All gains are floored at final stage
    progressGain = Math.floor(progressGain);
    qualityGain = Math.floor(qualityGain);

    // Occur if a dummy action
    //==================================
    if ((progressState >= synth.recipe.difficulty || durabilityState <= 0 || cpState < 0) && action != AllActions.dummyAction) {
        wastedActions += 1;
    }

    // Occur if not a dummy action
    //==================================
    else {
        // State tracking
        progressState += progressGain;
        qualityState += qualityGain;
        durabilityState -= durabilityCost;
        cpState -= action.cpCost;

        // STEP_03.b
        // Effect management
        //==================================
        // Special Effect Actions
        if (isActionEq(action, AllActions.mastersMend)) {
            durabilityState += 30;
        }

        if (isActionEq(action, AllActions.mastersMend2)) {
            durabilityState += 60;
        }

        if (AllActions.manipulation.name in effects.countDowns && durabilityState > 0) {
            durabilityState += 10;
        }

        if (isActionNe(action, AllActions.comfortZone) && AllActions.comfortZone.name in effects.countDowns && cpState > 0) {
            cpState += 8;
        }

        if (isActionEq(action, AllActions.rumination) && cpState >= 0) {
            if (AllActions.innerQuiet.name in effects.countUps && effects.countUps[AllActions.innerQuiet.name] > 0) {
                cpState += (21 * effects.countUps[AllActions.innerQuiet.name] - Math.pow(effects.countUps[AllActions.innerQuiet.name],2) + 10)/2;
                delete effects.countUps[AllActions.innerQuiet.name];
            }
            else {
                wastedActions += 1;
            }
        }

        if (isActionEq(action, AllActions.byregotsBlessing)) {
            if (AllActions.innerQuiet.name in effects.countUps) {
                delete effects.countUps[AllActions.innerQuiet.name];
            }
            else {
                wastedActions += 1;
            }
        }

        if (action.qualityIncreaseMultiplier > 0 && AllActions.greatStrides.name in effects.countDowns) {
            delete effects.countDowns[AllActions.greatStrides.name];
        }

        if (isActionEq(action, AllActions.tricksOfTheTrade) && cpState > 0 && (condition == 'Good' || assumeSuccess)) {
            trickUses += 1;
            cpState += 20;
        }
        else if (isActionEq(action, AllActions.tricksOfTheTrade) && cpState > 0) {
            wastedActions += 1;
        }

        // Decrement countdowns
        for (var countDown in effects.countDowns) {
            effects.countDowns[countDown] -= 1;
            if (effects.countDowns[countDown] === 0) {
                delete effects.countDowns[countDown];
            }
        }

        // STEP_03.c
        // Countdown / Countup management
        //===============================
        // Increment countups
        if (action.qualityIncreaseMultiplier > 0 && AllActions.innerQuiet.name in effects.countUps && effects.countUps[AllActions.innerQuiet.name] < 10) {
            effects.countUps[AllActions.innerQuiet.name] += 1 * success;
        }

        // Initialize new effects after countdowns are managed to reset them properly
        if (action.type === 'countup') {
            effects.countUps[action.name] = 0;
        }

        if (action.type == 'countdown') {
            effects.countDowns[action.name] = action.activeTurns;
        }

        // Sanity checks for state variables
        if ((durabilityState >= -5) && (progressState >= synth.recipe.difficulty)) {
            durabilityState = 0;
        }
        durabilityState = Math.min(durabilityState, synth.recipe.durability);
        cpState = Math.min(cpState, synth.crafter.craftPoints);

        // Count cross class actions
        if (!((action.cls === 'All') || (action.cls === synth.crafter.cls) || (action.shortName in crossClassActionList))) {
            crossClassActionList[action.shortName] = true;
        }

    }

    // Penalise failure outcomes
    if (progressState >= synth.recipe.difficulty) {
        progressOk = true;
    }

    if (cpState >= 0) {
        cpOk = true;
    }

    if (durabilityState >= 0 && progressState >= synth.recipe.difficulty) {
        durabilityOk = true;
    }

    // Ending condition update
    if (condition === 'Excellent') {
        condition = 'Poor';
    }
    else if (condition === 'Good' || condition === 'Poor') {
        condition = 'Normal';
    }
    else if (condition === 'Normal') {
        var condRand = Math.random();
        if (0 <= condRand && condRand < pExcellent) {
            condition = 'Excellent';
        }
        else if (pExcellent <= condRand && condRand < (pExcellent + pGood)) {
            condition = 'Good';
        }
        else {
            condition = 'Normal';
        }
    }

    if (debug) {
        var iqCnt = 0;
        if (AllActions.innerQuiet.name in effects.countUps) {
            iqCnt = effects.countUps[AllActions.innerQuiet.name];
        }
        logger.log('%2d %20s %5.0f %5.0f %8.1f %5.1f %5.0f %5.1f %5.0f %5.0f %5.0f %7.1f %-10s %-5s', stepCount, action.name, durabilityState, cpState, qualityState, progressState, wastedActions, iqCnt, control, qualityGain, bProgressGain, bQualityGain, condition, success);
    }
    else if (verbose) {
        logger.log('%2d %20s %5.0f %5.0f %8.1f %5.1f %5.0f %-10s %-5s', stepCount, action.name, durabilityState, cpState, qualityState, progressState, wastedActions, condition, success);
    }

    var finalState = new State(stepCount, action.name, durabilityState, cpState, qualityState, progressState,
                       wastedActions, progressOk, cpOk, durabilityOk, trickUses, reliability, crossClassActionList, effects, condition);

    return finalState;
}

function MonteCarloSequence(individual, synth, startState, assumeSuccess, overrideTotT, verbose, debug, logOutput) {
    overrideTotT = overrideTotT !== undefined ? overrideTotT : true;
    verbose = verbose !== undefined ? verbose : true;
    debug = debug !== undefined ? debug : false;
    logOutput = logOutput !== undefined ? logOutput : null;

    var logger = new Logger(logOutput);

    // Unpack state
    var stepCount = startState.step;
    var durabilityState = startState.durabilityState;
    var cpState = startState.cpState;
    var qualityState = startState.qualityState;
    var progressState = startState.progressState;
    var wastedActions = startState.wastedActions;
    var progressOk = startState.progressOk;
    var cpOk = startState.cpOk;
    var durabilityOk = startState.durabilityOk;
    var trickUses = startState.trickUses;
    var reliability = startState.reliability;
    var crossClassActionList = startState.crossClassActionList;
    var effects = startState.effects;
    var condition = startState.condition;

    // Intialize final state checks
    var trickOk = false;
    var reliabilityOk = false;

    // Initialize counters
    var maxTricksUses = 0;
    var crossClassActionCounter = 0;
    var useConditions = synth.useConditions

    // Initialize state variables
    var finalState = startState;

    // Check for null or empty individuals
    if (individual === null || individual.length === 0) {
        return startState;
    }

    // Strip Tricks of the Trade from individual
    if (overrideTotT) {
        var tempIndividual = [];
        for (var i=0; i < individual.length; i++) {
            if (isActionNe(AllActions.tricksOfTheTrade, individual[i])) {
                tempIndividual[tempIndividual.length] = individual[i];
            }
            else {
                maxTricksUses += 1;
            }
        }
        individual = tempIndividual;
    }

    if (debug) {
        logger.log('%-2s %20s %-5s %-5s %-8s %-5s %-5s %-5s %-5s %-5s %-5s %-7s %-10s %-5s', '#', 'Action', 'DUR', 'CP', 'QUA', 'PRG', 'WAC', 'IQ', 'CTL', 'QINC', 'BPRG', 'BQUA', 'Cond', 'S/F');
        logger.log('%2d %20s %5.0f %5.0f %8.1f %5.1f %5.0f %5.1f %5.0f %5.0f %-5s %-7s %-10s %-5s', stepCount, '', durabilityState, cpState, qualityState, progressState, wastedActions, 0, synth.crafter.control, 0, '', '', 'Normal', '-');
    }
    else if (verbose) {
        logger.log('%-2s %20s %-5s %-5s %-8s %-5s %-5s %-10s %-5s', '#', 'Action', 'DUR', 'CP', 'QUA', 'PRG', 'WAC', 'Cond', 'S/F');
        logger.log('%2d %20s %5.0f %5.0f %8.1f %5.1f %5.0f %-10s %-5s', stepCount, '', durabilityState, cpState, qualityState, progressState, wastedActions, 'Normal', '');

    }

    for (i=0; i < individual.length; i++) {
        var action = individual[i];
        startState = finalState;

        if (overrideTotT) {
            // Manually re-add tricks of the trade when condition is good
            if (finalState.condition == 'Good' && finalState.trickUses < maxTricksUses) {
                finalState = MonteCarloStep(synth, startState, AllActions.tricksOfTheTrade, assumeSuccess, verbose, debug, logOutput);
                startState = finalState;
            }
        }
        finalState = MonteCarloStep(synth, startState, action, assumeSuccess, verbose, debug, logOutput);
    }

    // Penalise failure outcomes
    if (finalState.progressState >= synth.recipe.difficulty) {
        progressOk = true;
    }

    if (finalState.cpState >= 0) {
        cpOk = true;
    }

    if (finalState.durabilityState >= -5 && finalState.progressState >= synth.recipe.difficulty) {
        durabilityOk = true;
    }

    if (finalState.trickUses <= synth.maxTrickUses) {
        trickOk = true;
    }

    if (finalState.reliability >= synth.reliabilityIndex) {
        reliabilityOk = true;
    }

    for (var crossClassAction in finalState.crossClassActionList) {
        crossClassActionCounter += 1;
    }

    if (debug) {
        logger.log('Progress Check: %s, Durability Check: %s, CP Check: %s, Tricks Check: %s, Reliability Check: %s, Cross Class Skills: %d, Wasted Actions: %d', progressOk, durabilityOk, cpOk, trickOk, reliabilityOk, crossClassActionCounter, finalState.wastedActions);
    }
    else if (verbose) {
        logger.log('Progress Check: %s, Durability Check: %s, CP Check: %s, Tricks Check: %s, Reliability Check: %s, Cross Class Skills: %d, Wasted Actions: %d', progressOk, durabilityOk, cpOk, trickOk, reliabilityOk, crossClassActionCounter, finalState.wastedActions);
    }

    return finalState;
}

function MonteCarloSim(individual, synth, nRuns, verbose, debug, logOutput) {
    verbose = verbose !== undefined ? verbose : false;
    debug = debug !== undefined ? debug : false;
    logOutput = logOutput !== undefined ? logOutput : null;

    var logger = new Logger(logOutput);

    var startState = NewStateFromSynth(synth);

    var finalStateTracker = [];
    for (var i=0; i < nRuns; i++) {
        var runSynth = MonteCarloSequence(individual, synth, startState, false, true, false, false, logOutput);
        finalStateTracker[finalStateTracker.length] = runSynth;

        if (verbose) {
            logger.log('%2d %-20s %5d %5d %8.1f %5.1f %5d', i, 'MonteCarlo', runSynth.durabilityState, runSynth.cpState, runSynth.qualityState, runSynth.progressState, runSynth.wastedActions);
        }
    }

    var avgDurability = getAverageProperty(finalStateTracker, 'durabilityState', nRuns);
    var avgCp = getAverageProperty(finalStateTracker, 'cpState', nRuns);
    var avgQuality = getAverageProperty(finalStateTracker, 'qualityState', nRuns);
    var avgProgress = getAverageProperty(finalStateTracker, 'progressState', nRuns);
    var avgHqPercent = getAverageHqPercent(finalStateTracker, synth);
    var successRate = getSuccessRate(finalStateTracker);

    logger.log('%-2s %20s %-5s %-5s %-8s %-5s %-5s','', '', 'DUR', 'CP', 'QUA', 'PRG', 'HQ%');
    logger.log('%2s %-20s %5.0f %5.0f %8.1f %5.1f %5.1f', '##', 'Expected Value: ', avgDurability, avgCp, avgQuality, avgProgress, avgHqPercent);

    var minDurability = getMinProperty(finalStateTracker, 'durabilityState');
    var minCp = getMinProperty(finalStateTracker, 'cpState');
    var minQuality = getMinProperty(finalStateTracker, 'qualityState');
    var minProgress = getMinProperty(finalStateTracker, 'progressState');
    var minQualityPercent = Math.min(synth.recipe.maxQuality, minQuality)/synth.recipe.maxQuality * 100;
    var minHqPercent = hqPercentFromQuality(minQualityPercent);

    logger.log('%2s %-20s %5.0f %5.0f %8.1f %5.1f %5.1f', '##', 'Min Value: ', minDurability, minCp, minQuality, minProgress, minHqPercent);

    logger.log('\n%2s %-20s %5.1f %%', '##', 'Success Rate: ', successRate);

    return {
      successPercent: successRate
    }
}

function getAverageProperty(stateArray, propName, nRuns) {
    var sumProperty = 0;
    var nSuccesses = 0;
    for (var i=0; i < stateArray.length; i++) {
        var progressOk = stateArray[i]['progressOk'];
        var durabilityOk = stateArray[i]['durabilityOk'];
        var cpOk = stateArray[i]['cpOk'];

        if (progressOk && durabilityOk && cpOk) {
            nSuccesses += 1;
            sumProperty += stateArray[i][propName];
        }
    }

    return sumProperty / nSuccesses;
}

function getAverageHqPercent(stateArray, synth) {
    var nHQ = 0;
    var nSuccesses = 0;
    for (var i=0; i < stateArray.length; i++) {
        var progressOk = stateArray[i]['progressOk'];
        var durabilityOk = stateArray[i]['durabilityOk'];
        var cpOk = stateArray[i]['cpOk'];

        if (progressOk && durabilityOk && cpOk) {
            nSuccesses += 1;

            var qualityPercent = stateArray[i]['qualityState'] / synth.recipe.maxQuality * 100;
            var hqProbability = hqPercentFromQuality(qualityPercent) / 100;
            var hqRand = Math.random();
            if (hqRand <= hqProbability) {
                nHQ += 1;
            }
        }
    }

    return nHQ / nSuccesses * 100;
}

function getSuccessRate(stateArray) {
    var nSuccesses = 0;
    for (var i=0; i < stateArray.length; i++) {
        // Check progressOk, durabilityOk, cpOk
        var progressOk = stateArray[i]['progressOk'];
        var durabilityOk = stateArray[i]['durabilityOk'];
        var cpOk = stateArray[i]['cpOk'];

        if (progressOk && durabilityOk && cpOk) {
            nSuccesses += 1;
        }
    }

    return nSuccesses / stateArray.length * 100;
}

function getMinProperty(stateArray, propName) {
    var minProperty = null;
    for (var i=0; i < stateArray.length; i++) {
        if (minProperty === null) {
            minProperty = stateArray[i][propName];
        }
        else {
            if (minProperty > stateArray[i][propName]) {
                minProperty = stateArray[i][propName];
            }
        }
    }
    return minProperty;
}

function qualityFromHqPercent(hqPercent) {
    var x = hqPercent;
    return -5.6604E-6 * Math.pow(x, 4) + 0.0015369705 * Math.pow(x, 3) - 0.1426469573 * Math.pow(x, 2) + 5.6122722959 * x - 5.5950384565;
}

function hqPercentFromQuality(qualityPercent) {
    var hqPercent = 1;
    if (qualityPercent === 0) {
        hqPercent = 1;
    }
    else if (qualityPercent >= 100) {
        hqPercent = 100;
    }
    else {
        while (qualityFromHqPercent(hqPercent) < qualityPercent && hqPercent < 100) {
            hqPercent += 1;
        }
    }
    return hqPercent;
}

function maxCrossClassActions(level) {
    var maxActions = 1;             // level 1
    if (level >= 10) {
        maxActions += 1;            // level 10
        maxActions += Math.floor((level - 10)/5);
    }

    return maxActions;
}

function evalSeq(individual, mySynth, penaltyWeight) {
    penaltyWeight = penaltyWeight!== undefined ? penaltyWeight : 10000;

    var startState = NewStateFromSynth(mySynth);

    var result = simSynth(individual, mySynth, startState, false, false);
    var penalties = 0;
    var fitness = 0;
    var fitnessProg = 0;

    // Sum the constraint violations
    penalties += result.wastedActions;

    if (!result.durabilityOk) {
       penalties += Math.abs(result.durability);
    }

    if (!result.progressOk) {
        penalties += Math.abs(result.progress);
    }

    if (!result.cpOk) {
        penalties += Math.abs(result.cp);
    }

    if (result.trickUses > mySynth.maxTrickUses) {
        penalties += Math.abs(result.trickUses - mySynth.maxTrickUses);
    }

    if (result.reliability < mySynth.reliabilityIndex) {
        penalties += Math.abs(mySynth.reliabilityIndex - result.reliability);
    }

    var crossClassActionCounter = 0;
    for (var action in result.crossClassActionList) {
        crossClassActionCounter += 1;
    }
    var maxCrossClassActionsExceeded = crossClassActionCounter - maxCrossClassActions(mySynth.crafter.level);
    if (maxCrossClassActionsExceeded > 0) {
        penalties += maxCrossClassActionsExceeded;
    }

    fitness += result.qualityState;
    fitness -= penaltyWeight * penalties;
    fitnessProg += result.progressState;

    return [fitness, fitnessProg];
}

// STEP_01
// Actions Table
//==============
//parameters: shortName,  name, durabilityCost, cpCost, successProbability, qualityIncreaseMultiplier, progressIncreaseMultiplier, aType, activeTurns, cls, level
var AllActions = {
    //                            shortName,              fullName,              dur,   cp, Prob, QIM, PIM, Type,          t,  cls,           lvl,
    observe: new Action(           'observe',              'Observe',              0,  14,   1.0, 0.0, 0.0, 'immediate',   1,  'All',          1),

    basicSynth: new Action(        'basicSynth',           'Basic Synthesis',      10,  0,   0.9, 0.0, 1.0, 'immediate',   1,  'All',          1),
    standardSynthesis: new Action( 'standardSynthesis',    'Standard Synthesis',   10,  15,  0.9, 0.0, 1.5, 'immediate',   1,  'All',          31),
    carefulSynthesis: new Action(  'carefulSynthesis',     'Careful Synthesis',    10,  0,   1.0, 0.0, 0.9, 'immediate',   1,  'Weaver',       15),
    carefulSynthesis2: new Action( 'carefulSynthesis2',    'Careful Synthesis II', 10,  0,   1.0, 0.0, 1.2, 'immediate',   1,  'Weaver',       50),
    rapidSynthesis: new Action(    'rapidSynthesis',       'Rapid Synthesis',      10,  0,   0.5, 0.0, 2.5, 'immediate',   1,  'Armorer',      15),
    flawlessSynthesis: new Action( 'flawlessSynthesis',    'Flawless Synthesis',   10,  15,  0.9, 0.0, 1.0, 'immediate',   1,  'Goldsmith',    37),
    pieceByPiece: new Action(      'pieceByPiece',         'Piece By Piece',       10,  15,  0.9, 0.0, 1.0, 'immediate',   1,  'Armorer',      50),

    basicTouch: new Action(        'basicTouch',           'Basic Touch',          10,  18,  0.7, 1.0, 0.0, 'immediate',   1,  'All',          5),
    standardTouch: new Action(     'standardTouch',        'Standard Touch',       10,  32,  0.8, 1.25,0.0, 'immediate',   1,  'All',          18),
    advancedTouch: new Action(     'advancedTouch',        'Advanced Touch',       10,  48,  0.9, 1.5, 0.0, 'immediate',   1,  'All',          43),
    hastyTouch: new Action(        'hastyTouch',           'Hasty Touch',          10,  0,   0.5, 1.0, 0.0, 'immediate',   1,  'Culinarian',   15),
    byregotsBlessing: new Action(  'byregotsBlessing',     'Byregot\'s Blessing',  10,  24,  0.9, 1.0, 0.0, 'immediate',   1,  'Carpenter',    50),

    mastersMend: new Action(       'mastersMend',          'Master\'s Mend',       0,   92,  1.0, 0.0, 0.0, 'immediate',   1,  'All',          7),
    mastersMend2: new Action(      'mastersMend2',         'Master\'s Mend II',    0,   160, 1.0, 0.0, 0.0, 'immediate',   1,  'All',          25),
    rumination: new Action(        'rumination',           'Rumination',           0,   0,   1.0, 0.0, 0.0, 'immediate',   1,  'Carpenter',    15),
    tricksOfTheTrade: new Action(  'tricksOfTheTrade',     'Tricks Of The Trade',  0,   0,   1.0, 0.0, 0.0, 'immediate',   1,  'Alchemist',    15),

    innerQuiet: new Action(        'innerQuiet',           'Inner Quiet',          0,   18,  1.0, 0.0, 0.0, 'countup',     1,  'All',          11),
    manipulation: new Action(      'manipulation',         'Manipulation',         0,   88,  1.0, 0.0, 0.0, 'countdown',   3,  'Goldsmith',    15),
    comfortZone: new Action(       'comfortZone',          'Comfort Zone',         0,   66,  1.0, 0.0, 0.0, 'countdown',   10, 'Alchemist',    50),
    steadyHand: new Action(        'steadyHand',           'Steady Hand',          0,   22,  1.0, 0.0, 0.0, 'countdown',   5,  'All',          9),
    steadyHand2: new Action(       'steadyHand2',          'Steady Hand II',       0,   25,  1.0, 0.0, 0.0, 'countdown',   5,  'Culinarian',   37),
    wasteNot: new Action(          'wasteNot',             'Waste Not',            0,   56,  1.0, 0.0, 0.0, 'countdown',   4,  'Leatherworker',15),
    wasteNot2: new Action(         'wasteNot2',            'Waste Not II',         0,   98,  1.0, 0.0, 0.0, 'countdown',   8,  'Leatherworker',50),
    innovation: new Action(        'innovation',           'Innovation',           0,   18,  1.0, 0.0, 0.0, 'countdown',   3,  'Goldsmith',    50),
    greatStrides: new Action(      'greatStrides',         'Great Strides',        0,   32,  1.0, 0.0, 0.0, 'countdown',   3,  'All',          21),
    ingenuity: new Action(         'ingenuity',            'Ingenuity',            0,   24,  1.0, 0.0, 0.0, 'countdown',   5,  'Blacksmith',   15),
    ingenuity2: new Action(        'ingenuity2',           'Ingenuity II',         0,   32,  1.0, 0.0, 0.0, 'countdown',   5,  'Blacksmith',   50),

    dummyAction: new Action(       'dummyAction',          '______________',       0,  0,    1.0, 0.0, 0.0, 'immediate',   1,  'All',          1)
};

var LevelTable = {
    51: 69, // 120
    52: 74, // 125
    53: 77, // 130
    54: 79, // 133
    55: 81, // 136
    56: 83, // 139
    57: 85, // 142
    58: 87, // 145
    59: 89, // 148
    60: 90  // 150
};

// Test objects
//cls, level, craftsmanship, control, craftPoints, actions
/*
var myWeaverActions = [basicSynth];
var myWeaver = new Crafter('Weaver', 20, 119, 117, 243, myWeaverActions);
var initiatesSlops = new Recipe(20,74,70,0,1053);
var mySynth = new Synth(myWeaver, initiatesSlops, maxTrickUses=1, useConditions=true);
var actionSequence = [innerQuiet, steadyHand, wasteNot, basicSynth, hastyTouch, hastyTouch, hastyTouch, steadyHand, hastyTouch, tricksOfTheTrade, standardTouch, standardTouch, standardTouch, tricksOfTheTrade, rumination, mastersMend, hastyTouch, basicSynth, basicTouch, basicSynth];

simSynth(actionSequence, mySynth, false, true);
MonteCarloSynth(actionSequence, mySynth, false, true);
MonteCarloSim(actionSequence, mySynth, 500);
evalSeq(actionSequence, mySynth);
*/
