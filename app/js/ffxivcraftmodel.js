//require('./String.js');
/* Adding new actions search for STEP_##
    * Add action to AllActions object STEP_01
    * Add action effect to ApplySpecialActionEffects STEP_02
    * Add action counter to UpdateEffectCounters STEP_03
*/

/* ToDo
    * Implement Heavensward actions
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

Synth.prototype.calculateBaseProgressIncrease = function (levelDifference, craftsmanship, crafterLevel, recipeLevel) {
    var baseProgress = 0;
    var levelCorrectionFactor = 0;
    var levelCorrectedProgress = 0;

    if (crafterLevel >= 120){
        baseProgress = 0.216733 * craftsmanship - 2.12243;

        // Level boost for recipes below crafter level
        // Level boost arbitrarily capped at 100 levels for now because of limited data
        if (levelDifference > 0) {
            levelCorrectionFactor += 0.0511341 * Math.min(levelDifference, 5);
        }
        if (levelDifference > 5) {
            levelCorrectionFactor += 0.0200853 * Math.min(levelDifference - 5, 10);
        }
        if (levelDifference > 15) {
            levelCorrectionFactor += 0.0104176 * Math.min(levelDifference - 15, 5);
        }
        if (levelDifference > 20) {
            levelCorrectionFactor += 6.68438e-4 * Math.min(levelDifference - 20, 100);
        }

        // Level penalty for recipes above crafter level
        // Level difference penalty appears to be capped at -6
        levelDifference = Math.max(levelDifference, -6);
        if (levelDifference < 0){
            levelCorrectionFactor += 0.080554 * Math.max(levelDifference, -5);
        }
        if (levelDifference < -5){
            levelCorrectionFactor += 0.0487896 * Math.max(levelDifference - (-5), -1);
        }

        levelCorrectedProgress = (1 + levelCorrectionFactor) * baseProgress;
    }
    else if (crafterLevel < 120) {
        baseProgress = 0.214959 * craftsmanship + 1.6;

        // Level boost for recipes below crafter level
        // Level boost arbitrarily capped at 100 levels for now because of limited data
        if (levelDifference > 0) {
            levelCorrectionFactor += 0.0495218 * Math.min(levelDifference, 5);
        }
        if (levelDifference > 5) {
            levelCorrectionFactor += 0.0221127 * Math.min(levelDifference - 5, 10);
        }
        if (levelDifference > 15) {
            levelCorrectionFactor += 0.0103120 * Math.min(levelDifference - 15, 5);
        }
        if (levelDifference > 20) {
            levelCorrectionFactor += 6.68438e-4 * Math.min(levelDifference - 20, 100);
        }

        // Level penalty for recipes above crafter level
        // Level difference penalty was capped at -9 in 2.2
        levelDifference = Math.max(levelDifference, -9);
        /*
        if (levelDifference < 0){
            levelCorrectionFactor += 0.080554 * Math.max(levelDifference, -5);
        }
        if (levelDifference < -5){
            levelCorrectionFactor += 0.0487896 * Math.max(levelDifference - (-5), -1);
        }
        */

        if ((levelDifference < -5)) {
            levelCorrectionFactor = 0.0501 * levelDifference;
        }
        else if ((-5 <= levelDifference) && (levelDifference < 0)) {
            levelCorrectionFactor = 0.10 * levelDifference;
        }

        levelCorrectedProgress = (1 + levelCorrectionFactor) * baseProgress;
    }

    return levelCorrectedProgress;
};

Synth.prototype.calculateBaseQualityIncrease = function (levelDifference, control, crafterLevel, recipeLevel) {
    var baseQuality = 0;
    var recipeLevelFactor = 0;
    var levelCorrectionFactor = 0;
    var levelCorrectedQuality = 0;

    if (recipeLevel >= 115) {
        baseQuality = 3.38494e-5 * control * control + 0.338692 * control + 33.2217;

        recipeLevelFactor = 3.42807e-4 * (115 - recipeLevel);

        // Level penalty for recipes above crafter level
        // Level difference penalty appears to be capped at -6
        levelDifference = Math.max(levelDifference, -6);
        if (levelDifference < 0) {
            levelCorrectionFactor = 0.0407512 * levelDifference;
        }

        levelCorrectedQuality = baseQuality * (1 + levelCorrectionFactor) * (1 + recipeLevelFactor);
    }
    else if (recipeLevel > 50) {
        baseQuality = 3.46e-5 * control * control + 0.3514 * control + 34.66;

        levelDifference = Math.max(levelDifference, -5);
        if (levelDifference <= -5) {
            levelCorrectionFactor = 0.05374 * levelDifference;
        }
        else {
            //if levelDifference > -5
            // Ingenuity does not quite reduce LDiff to 0
            levelCorrectionFactor = 0.05 * -0.5;
        }

        levelCorrectedQuality = baseQuality * (1 + levelCorrectionFactor);
    }
    else {
        baseQuality = 3.46e-5 * control * control + 0.3514 * control + 34.66;

        levelDifference = Math.max(levelDifference, -5);
        if (levelDifference < 0) {
            levelCorrectionFactor = 0.05 * levelDifference;
        }

        levelCorrectedQuality = baseQuality * (1 + levelCorrectionFactor);
    }

    return levelCorrectedQuality;
};

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

function State(synth, step, action, durabilityState, cpState, qualityState, progressState, wastedActions, trickUses, reliability, crossClassActionList, effects, condition) {
    this.synth = synth;
    this.step = step;
    this.action = action;
    this.durabilityState = durabilityState;
    this.cpState = cpState;
    this.qualityState = qualityState;
    this.progressState = progressState;
    this.wastedActions = wastedActions;
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

State.prototype.checkViolations = function () {
    // Check for feasibility violations
    var progressOk = false;
    var cpOk = false;
    var durabilityOk = false;
    var trickOk = false;
    var reliabilityOk = false;

    if (this.progressState >= this.synth.recipe.difficulty) {
        progressOk = true;
    }

    if (this.cpState >= 0) {
        cpOk = true;
    }

    // Consider removing sanity check in UpdateState
    if ((this.durabilityState >= 0) && (this.progressState >= this.synth.recipe.difficulty)) {
        durabilityOk = true;
    }

    if (this.trickUses <= this.synth.maxTrickUses) {
        trickOk = true;
    }

    if (this.reliability >= this.synth.reliabilityIndex) {
        reliabilityOk = true;
    }
    
    return {
        progressOk: progressOk,
        cpOk: cpOk,
        durabilityOk: durabilityOk,
        trickOk: trickOk,
        reliabilityOk: reliabilityOk
    };
};

function NewStateFromSynth(synth) {
    var step = 0;
    var durabilityState = synth.recipe.durability;
    var cpState = synth.crafter.craftPoints;
    var qualityState = synth.recipe.startQuality;
    var progressState = 0;
    var wastedActions = 0;
    var trickUses = 0;
    var reliability = 1;
    var crossClassActionList = {};
    var effects = new EffectTracker();
    var condition = 'Normal';

    return new State(synth, step, '', durabilityState, cpState, qualityState, progressState, wastedActions, trickUses, reliability, crossClassActionList, effects, condition);
}

function ApplyModifiers(s, action, condition) {

    // Effect Modifiers
    //=================
    var craftsmanship = s.synth.crafter.craftsmanship;
    var control = s.synth.crafter.control;

    // Effects modifying control
    if (AllActions.innerQuiet.name in s.effects.countUps) {
        control += (0.2 * s.effects.countUps[AllActions.innerQuiet.name]) * s.synth.crafter.control;
    }

    if (AllActions.innovation.name in s.effects.countDowns) {
        control += 0.5 * s.synth.crafter.control;
    }

    // Effects modifying level difference
    var effCrafterLevel = s.synth.crafter.level;
    if (LevelTable[s.synth.crafter.level]) {
        effCrafterLevel += LevelTable[s.synth.crafter.level];
    }
    var effRecipeLevel = s.synth.recipe.level;
    var levelDifference = effCrafterLevel - effRecipeLevel;

    if (AllActions.ingenuity2.name in s.effects.countDowns) {
        if (Ing2RecipeLevelTable[s.synth.recipe.level]) {
            effRecipeLevel = Ing2RecipeLevelTable[s.synth.recipe.level];
            levelDifference = effCrafterLevel - effRecipeLevel;
        }
        else {
            levelDifference = effCrafterLevel - (effRecipeLevel - 7); // fall back on 2.2 estimate
        }

        if (levelDifference > 0) {
            levelDifference = Math.min(levelDifference, 20);
        }

        if (levelDifference < 0) {
            levelDifference = Math.max(levelDifference, -5);
        }

    }
    else if (AllActions.ingenuity.name in s.effects.countDowns) {
        if (Ing1RecipeLevelTable[s.synth.recipe.level]) {
            effRecipeLevel = Ing1RecipeLevelTable[s.synth.recipe.level];
            levelDifference = effCrafterLevel - effRecipeLevel;
        }
        else {
            levelDifference = effCrafterLevel - (effRecipeLevel - 5); // fall back on 2.2 estimate
        }

        if (levelDifference > 0) {
            levelDifference = Math.min(levelDifference, 20);
        }

        if (levelDifference < 0) {
            levelDifference = Math.max(levelDifference, -5);
        }
    }

    // Effects modfiying probability
    var successProbability = action.successProbability;
    if (AllActions.steadyHand2.name in s.effects.countDowns) {
        successProbability = action.successProbability + 0.3;        // Assume 2 always overrides 1
    }
    else if (AllActions.steadyHand.name in s.effects.countDowns) {
        successProbability = action.successProbability + 0.2;
    }
    successProbability = Math.min(successProbability, 1);

    // Effects modifying quality increase multiplier
    var qualityIncreaseMultiplier = action.qualityIncreaseMultiplier;
    if (AllActions.greatStrides.name in s.effects.countDowns) {
        qualityIncreaseMultiplier *= 2;
    }

    // Effects modifying progress
    var bProgressGain = action.progressIncreaseMultiplier * s.synth.calculateBaseProgressIncrease(levelDifference, craftsmanship, effCrafterLevel, s.synth.recipe.level);
    if (isActionEq(action, AllActions.flawlessSynthesis)) {
        bProgressGain = 40;
    }
    else if (isActionEq(action, AllActions.pieceByPiece)) {
        bProgressGain = (s.synth.recipe.difficulty - s.progressState) * 0.33;
    }

    // Effects modifying quality
    var bQualityGain = qualityIncreaseMultiplier * s.synth.calculateBaseQualityIncrease(levelDifference, control, effCrafterLevel, s.synth.recipe.level);
    if (isActionEq(action, AllActions.byregotsBlessing) && AllActions.innerQuiet.name in s.effects.countUps) {
        bQualityGain *= (1 + 0.2 * s.effects.countUps[AllActions.innerQuiet.name]);
    }
    if ((isActionEq(action, AllActions.byregotsBrow) && AllActions.innerQuiet.name in s.effects.countUps) && condition.checkGoodOrExcellent()) {
        bQualityGain *= (1.5 + 0.1 * s.effects.countUps[AllActions.innerQuiet.name]) * condition.pGoodOrExcellent();
    }

    // Effects modifying durability cost
    var durabilityCost = action.durabilityCost;
    if ((AllActions.wasteNot.name in s.effects.countDowns) || (AllActions.wasteNot2.name in s.effects.countDowns)) {
        durabilityCost = 0.5 * action.durabilityCost;
    }
    return {
        craftsmanship: craftsmanship,
        control: control,
        effCrafterLevel: effCrafterLevel,
        effRecipeLevel: effRecipeLevel,
        levelDifference: levelDifference,
        successProbability: successProbability,
        qualityIncreaseMultiplier: qualityIncreaseMultiplier,
        bProgressGain: bProgressGain,
        bQualityGain: bQualityGain,
        durabilityCost: durabilityCost
    };

}

function ApplySpecialActionEffects(s, action, condition) {
    // STEP_02
    // Effect management
    //==================================
    // Special Effect Actions
    if (isActionEq(action, AllActions.mastersMend)) {
        s.durabilityState += 30;
    }

    if (isActionEq(action, AllActions.mastersMend2)) {
        s.durabilityState += 60;
    }

    if ((AllActions.manipulation.name in s.effects.countDowns) && (s.durabilityState > 0)) {
        s.durabilityState += 10;
    }

    if (isActionNe(action, AllActions.comfortZone) && AllActions.comfortZone.name in s.effects.countDowns && s.cpState > 0) {
        s.cpState += 8;
    }

    if (isActionEq(action, AllActions.rumination) && s.cpState >= 0) {
        if (AllActions.innerQuiet.name in s.effects.countUps && s.effects.countUps[AllActions.innerQuiet.name] > 0) {
            s.cpState += (21 * s.effects.countUps[AllActions.innerQuiet.name] - Math.pow(s.effects.countUps[AllActions.innerQuiet.name], 2) + 10) / 2;
            delete s.effects.countUps[AllActions.innerQuiet.name];
        }
        else {
            s.wastedActions += 1;
        }
    }

    if (isActionEq(action, AllActions.byregotsBlessing)) {
        if (AllActions.innerQuiet.name in s.effects.countUps) {
            delete s.effects.countUps[AllActions.innerQuiet.name];
        }
        else {
            s.wastedActions += 1;
        }
    }

    if ((action.qualityIncreaseMultiplier > 0) && (AllActions.greatStrides.name in s.effects.countDowns)) {
        delete s.effects.countDowns[AllActions.greatStrides.name];
    }

    // Manage effects with random component
    if (isActionEq(action, AllActions.tricksOfTheTrade) && s.cpState > 0 && condition.checkGoodOrExcellent()) {
        s.trickUses += 1;
        s.cpState += 20 * condition.pGoodOrExcellent();
    }
    else if (isActionEq(action, AllActions.tricksOfTheTrade) && s.cpState > 0) {
        s.wastedActions += 1;
    }

    if (isActionEq(action, AllActions.byregotsBrow) && condition.checkGoodOrExcellent()) {
        if (AllActions.innerQuiet.name in s.effects.countUps) {
            s.trickUses += 1;
            s.effects.countUps[AllActions.innerQuiet.name] *= (1 - condition.pGoodOrExcellent());
        }
        else {
            s.wastedActions += 1;
        }
    }
}

function UpdateEffectCounters(s, action, successProbability) {
    // STEP_03
    // Countdown / Countup Management
    //===============================
    // Decrement countdowns
    for (var countDown in s.effects.countDowns) {
        s.effects.countDowns[countDown] -= 1;
        if (s.effects.countDowns[countDown] === 0) {
            delete s.effects.countDowns[countDown];
        }
    }

    // Increment countups that depend on random component
    if ((action.qualityIncreaseMultiplier > 0) && (AllActions.innerQuiet.name in s.effects.countUps) && s.effects.countUps[AllActions.innerQuiet.name] < 10) {
        s.effects.countUps[AllActions.innerQuiet.name] += 1 * successProbability;
    }

    // Initialize new effects after countdowns are managed to reset them properly
    if (action.type === 'countup') {
        s.effects.countUps[action.name] = 0;
    }

    if (action.type === 'countdown') {
        s.effects.countDowns[action.name] = action.activeTurns;
    }
}

function UpdateState(s, action, progressGain, qualityGain, durabilityCost, condition, successProbability) {
    // State tracking
    s.progressState += progressGain;
    s.qualityState += qualityGain;
    s.durabilityState -= durabilityCost;
    s.cpState -= action.cpCost;

    ApplySpecialActionEffects(s, action, condition);
    UpdateEffectCounters(s, action, successProbability);

    // Sanity checks for state variables
    if ((s.durabilityState >= -5) && (s.progressState >= s.synth.recipe.difficulty)) {
        s.durabilityState = 0;
    }
    s.durabilityState = Math.min(s.durabilityState, s.synth.recipe.durability);
    s.cpState = Math.min(s.cpState, s.synth.crafter.craftPoints);
}

function simSynth(individual, startState, verbose, debug, logOutput) {
    verbose = verbose !== undefined ? verbose : true;
    debug = debug !== undefined ? debug : false;
    logOutput = logOutput !== undefined ? logOutput : null;

    var logger = new Logger(logOutput);

    // Clone startState to keep startState immutable
    var s = clone(startState);

    // Conditions
    var useConditions = s.synth.useConditions;
    var pGood = 0.23;
    var pExcellent = 0.01;

    // Step 1 is always normal
    var ppGood = 0;
    var ppExcellent = 0;
    var ppPoor = 0;
    var ppNormal = 1 - (ppGood + ppExcellent + ppPoor);

    var SimCondition = {
        checkGoodOrExcellent: function () {
            return true;
        },
        checkPoor: function () {
            return true;
        },
        pGoodOrExcellent: function () {
            return ppGood + ppExcellent;
        },
        pPoor: function () {
            return ppPoor;
        }
    };

    // Initialize counters
    var crossClassActionCounter = 0;

    // Check for null or empty individuals
    if (individual === null || individual.length === 0) {
        return NewStateFromSynth(s.synth);
    }

    if (debug) {
        logger.log('%-2s %20s %-5s %-5s %-8s %-5s %-5s %-5s %-5s %-5s %-5s %-5s', '#', 'Action', 'DUR', 'CP', 'EQUA', 'EPRG', 'WAC', 'IQ', 'CTL', 'QINC', 'BPRG', 'BQUA');
        logger.log('%2d %20s %5.0f %5.0f %8.1f %5.1f %5.0f %5.1f %5.0f %5.0f', s.step, '', s.durabilityState, s.cpState, s.qualityState, s.progressState, s.wastedActions, 0, s.synth.crafter.control, 0);
    }
    else if (verbose) {
        logger.log('%-2s %20s %-5s %-5s %-8s %-5s %-5s' , '#', 'Action', 'DUR', 'CP', 'EQUA', 'EPRG', 'WAC');
        logger.log('%2d %20s %5.0f %5.0f %8.1f %5.1f %5.0f', s.step, '', s.durabilityState, s.cpState, s.qualityState, s.progressState, s.wastedActions);

    }

    for (var i = 0; i < individual.length; i++) {
        var action = individual[i];

        // Occur regardless of dummy actions
        //==================================
        s.step += 1;

        // Condition Calculation
        var condQualityIncreaseMultiplier = 1;
        if (useConditions) {
            condQualityIncreaseMultiplier *= (1 * ppNormal + 1.5 * ppGood * Math.pow(1 - (ppGood + pGood) / 2, s.synth.maxTrickUses) + 4 * ppExcellent + 0.5 * ppPoor);
        }

        // Calculate Progress, Quality and Durability gains and losses under effect of modifiers
        var r = ApplyModifiers(s, action, SimCondition);

        // Calculate final gains / losses
        var progressGain = r.bProgressGain;
        if (progressGain > 0) {
            s.reliability = s.reliability * r.successProbability;
        }

        var qualityGain = condQualityIncreaseMultiplier * r.bQualityGain;

        // Floor gains at final stage before calculating expected value
        progressGain = r.successProbability * Math.floor(progressGain);
        qualityGain = r.successProbability * Math.floor(qualityGain);

        // Occur if a wasted action
        //==================================
        if (((s.progressState >= s.synth.recipe.difficulty) || (s.durabilityState <= 0) || (s.cpState < 0)) && (action != AllActions.dummyAction)) {
            s.wastedActions += 1;
        }

        // Occur if not a wasted action
        //==================================
        else {

            UpdateState(s, action, progressGain, qualityGain, r.durabilityCost, SimCondition, r.successProbability);

            // Count cross class actions
            if (!(action.cls === 'All' || action.cls === s.synth.crafter.cls || action.shortName in s.crossClassActionList)) {
                s.crossClassActionList[action.shortName] = true;
                crossClassActionCounter += 1;
            }

            // Ending condition update
            if (useConditions) {
                ppPoor = ppExcellent;
                ppGood = pGood * ppNormal;
                ppExcellent = pExcellent * ppNormal;
                ppNormal = 1 - (ppGood + ppExcellent + ppPoor);
            }

        }

        if (debug) {
            var iqCnt = 0;
            if (AllActions.innerQuiet.name in s.effects.countUps) {
                iqCnt = s.effects.countUps[AllActions.innerQuiet.name];
            }
            logger.log('%2d %20s %5.0f %5.0f %8.1f %5.1f %5.0f %5.1f %5.0f %5.0f %5.0f %5.1f', s.step, action.name, s.durabilityState, s.cpState, s.qualityState, s.progressState, s.wastedActions, iqCnt, r.control, qualityGain, r.bProgressGain, r.bQualityGain);
        }
        else if (verbose) {
            logger.log('%2d %20s %5.0f %5.0f %8.1f %5.1f %5.0f', s.step, action.name, s.durabilityState, s.cpState, s.qualityState, s.progressState, s.wastedActions);
        }

    }

    // Check for feasibility violations
    var chk = s.checkViolations();

    if (debug) {
        logger.log('Progress Check: %s, Durability Check: %s, CP Check: %s, Tricks Check: %s, Reliability Check: %s, Cross Class Skills: %d, Wasted Actions: %d', chk.progressOk, chk.durabilityOk, chk.cpOk, chk.trickOk, chk.reliabilityOk, crossClassActionCounter, s.wastedActions);
    }
    else if (verbose) {
        logger.log('Progress Check: %s, Durability Check: %s, CP Check: %s, Tricks Check: %s, Reliability Check: %s, Cross Class Skills: %d, Wasted Actions: %d', chk.progressOk, chk.durabilityOk, chk.cpOk, chk.trickOk, chk.reliabilityOk, crossClassActionCounter, s.wastedActions);
    }

    // Return final state
    return new State(s.synth, s.step, individual[individual.length-1].name, s.durabilityState, s.cpState, s.qualityState, s.progressState,
        s.wastedActions, s.trickUses, s.reliability, s.crossClassActionList);

}

function MonteCarloStep(startState, action, assumeSuccess, verbose, debug, logOutput) {
    verbose = verbose !== undefined ? verbose : true;
    debug = debug !== undefined ? debug : false;
    logOutput = logOutput !== undefined ? logOutput : null;

    var logger = new Logger(logOutput);

    // Clone startState to keep startState immutable
    var s = clone(startState);

    // Conditions
    var pGood = 0.23;
    var pExcellent = 0.01;

    var MonteCarloCondition = {
        checkGoodOrExcellent: function () {
            return (s.condition == 'Good' || s.condition == 'Excellent' || assumeSuccess);
        },
        checkPoor: function () {
            return (s.condition == 'Poor' || assumeSuccess);
        },
        pGoodOrExcellent: function () {
            return 1;
        },
        pGood: function () {
            return 1;
        }
    };

    // Initialize counters
    s.step += 1;

    // Condition Evaluation
    var condQualityIncreaseMultiplier = 1;
    if (!s.synth.useConditions) {
        condQualityIncreaseMultiplier *= 1.0;
    }
    else if (s.condition === 'Excellent') {
        condQualityIncreaseMultiplier *= 4.0;
    }
    else if (s.condition === 'Good' ) {
        condQualityIncreaseMultiplier *= 1.5;
    }
    else if (s.condition === 'Poor' ) {
        condQualityIncreaseMultiplier *= 0.5;
    }
    else {
        condQualityIncreaseMultiplier *= 1.0;
    }

    // Calculate Progress, Quality and Durability gains and losses under effect of modifiers
    var r = ApplyModifiers(s, action, MonteCarloCondition);

    // Success or Failure
    var success = 0;
    var successRand = Math.random();
    if (0 <= successRand && successRand <= r.successProbability) {
        success = 1;
    }

    if (assumeSuccess) {
        success = 1;
    }

    // Calculate final gains / losses
    var progressGain = success * r.bProgressGain;
    if (progressGain > 0) {
        s.reliability = s.reliability * r.successProbability;
    }

    var qualityGain = success * condQualityIncreaseMultiplier * r.bQualityGain;

    // Floor gains at final stage before calculating expected value
    progressGain = Math.floor(progressGain);
    qualityGain = Math.floor(qualityGain);

    // Occur if a dummy action
    //==================================
    if ((s.progressState >= s.synth.recipe.difficulty || s.durabilityState <= 0 || s.cpState < 0) && action != AllActions.dummyAction) {
        s.wastedActions += 1;
    }

    // Occur if not a dummy action
    //==================================
    else {

        UpdateState(s, action, progressGain, qualityGain, r.durabilityCost, MonteCarloCondition, success);

        // Count cross class actions
        if (!((action.cls === 'All') || (action.cls === s.synth.crafter.cls) || (action.shortName in s.crossClassActionList))) {
            s.crossClassActionList[action.shortName] = true;
        }

    }

    // Ending condition update
    if (s.condition === 'Excellent') {
        s.condition = 'Poor';
    }
    else if (s.condition === 'Good' || s.condition === 'Poor') {
        s.condition = 'Normal';
    }
    else if (s.condition === 'Normal') {
        var condRand = Math.random();
        if (0 <= condRand && condRand < pExcellent) {
            s.condition = 'Excellent';
        }
        else if (pExcellent <= condRand && condRand < (pExcellent + pGood)) {
            s.condition = 'Good';
        }
        else {
            s.condition = 'Normal';
        }
    }

    // Check for feasibility violations
    var chk = s.checkViolations();

    if (debug) {
        var iqCnt = 0;
        if (AllActions.innerQuiet.name in s.effects.countUps) {
            iqCnt = s.effects.countUps[AllActions.innerQuiet.name];
        }
        logger.log('%2d %20s %5.0f %5.0f %8.1f %5.1f %5.0f %5.1f %5.0f %5.0f %5.0f %7.1f %-10s %-5s', s.step, action.name, s.durabilityState, s.cpState, s.qualityState, s.progressState, s.wastedActions, iqCnt, r.control, qualityGain, r.bProgressGain, r.bQualityGain, s.condition, success);
    }
    else if (verbose) {
        logger.log('%2d %20s %5.0f %5.0f %8.1f %5.1f %5.0f %-10s %-5s', s.step, action.name, s.durabilityState, s.cpState, s.qualityState, s.progressState, s.wastedActions, s.condition, success);
    }

    // Return final state
    return new State(s.synth, s.step, action.name, s.durabilityState, s.cpState, s.qualityState, s.progressState, s.wastedActions, s.trickUses, s.reliability, s.crossClassActionList, s.effects, s.condition);

}

function MonteCarloSequence(individual, startState, assumeSuccess, overrideOnCondition, verbose, debug, logOutput) {
    overrideOnCondition = overrideOnCondition !== undefined ? overrideOnCondition : true;
    verbose = verbose !== undefined ? verbose : true;
    debug = debug !== undefined ? debug : false;
    logOutput = logOutput !== undefined ? logOutput : null;

    var logger = new Logger(logOutput);

    var s = clone(startState);

    // Initialize counters
    var maxConditionUses = 0;
    var crossClassActionCounter = 0;

    // Check for null or empty individuals
    if (individual === null || individual.length === 0) {
        return s;
    }

    // Strip Tricks of the Trade from individual
    if (overrideOnCondition) {
        var onExcellentOnlyActions = [];
        var onGoodOnlyActions = [];
        var onGoodOrExcellentActions = [];
        var onPoorOnlyActions = [];
        var tempIndividual = [];
        for (var i=0; i < individual.length; i++) {
            if (individual[i].onExcellent && !individual[i].onGood) {
                onExcellentOnlyActions.push(individual[i]);
                maxConditionUses += 1;
            }
            else if ((individual[i].onGood && !individual[i].onExcellent) && !individual[i].onPoor) {
                onGoodOnlyActions.push(individual[i]);
                maxConditionUses += 1;
            }
            else if (individual[i].onGood || individual[i].onExcellent) {
                onGoodOrExcellentActions.push(individual[i]);
                maxConditionUses += 1;
            }
            else if (individual[i].onPoor && !(individual[i].onExcellent || individual[i].onGood)) {
                onPoorOnlyActions.push(individual[i]);
                maxConditionUses += 1;
            }
            else {
                tempIndividual.push(individual[i]);
            }
        }
        individual = tempIndividual;
    }

    if (debug) {
        logger.log('%-2s %20s %-5s %-5s %-8s %-5s %-5s %-5s %-5s %-5s %-5s %-7s %-10s %-5s', '#', 'Action', 'DUR', 'CP', 'QUA', 'PRG', 'WAC', 'IQ', 'CTL', 'QINC', 'BPRG', 'BQUA', 'Cond', 'S/F');
        logger.log('%2d %20s %5.0f %5.0f %8.1f %5.1f %5.0f %5.1f %5.0f %5.0f %-5s %-7s %-10s %-5s', s.step, '', s.durabilityState, s.cpState, s.qualityState, s.progressState, s.wastedActions, 0, s.synth.crafter.control, 0, '', '', 'Normal', '-');
    }
    else if (verbose) {
        logger.log('%-2s %20s %-5s %-5s %-8s %-5s %-5s %-10s %-5s', '#', 'Action', 'DUR', 'CP', 'QUA', 'PRG', 'WAC', 'Cond', 'S/F');
        logger.log('%2d %20s %5.0f %5.0f %8.1f %5.1f %5.0f %-10s %-5s', s.step, '', s.durabilityState, s.cpState, s.qualityState, s.progressState, s.wastedActions, 'Normal', '');

    }

    for (i=0; i < individual.length; i++) {
        var action = individual[i];

        if (overrideOnCondition) {
            // Manually re-add condition dependent action when conditions are met
            if (s.condition == 'Excellent' && s.trickUses < maxConditionUses) {
                if (onExcellentOnlyActions.length > 0) {
                    s = MonteCarloStep(s, onExcellentOnlyActions.shift(), assumeSuccess, verbose, debug, logOutput);

                }
                else if (onGoodOrExcellentActions.length > 0) {
                    s = MonteCarloStep(s, onGoodOrExcellentActions.shift(), assumeSuccess, verbose, debug, logOutput);
                }
            }
            if (s.condition == 'Good' && s.trickUses < maxConditionUses) {
                if (onGoodOnlyActions.length > 0) {
                    s = MonteCarloStep(s, onGoodOnlyActions.shift(), assumeSuccess, verbose, debug, logOutput);

                }
                else if (onGoodOrExcellentActions.length > 0) {
                    s = MonteCarloStep(s, onGoodOrExcellentActions.shift(), assumeSuccess, verbose, debug, logOutput);
                }
            }
            if (s.condition == 'Poor' && s.trickUses < maxConditionUses) {
                if (onPoorOnlyActions.length > 0) {
                    s = MonteCarloStep(s, onPoorOnlyActions.shift(), assumeSuccess, verbose, debug, logOutput);

                }
            }
        }
        s = MonteCarloStep(s, action, assumeSuccess, verbose, debug, logOutput);
    }

    // Check for feasibility violations
    var chk = s.checkViolations();

    for (var crossClassAction in s.crossClassActionList) {
        crossClassActionCounter += 1;
    }

    if (debug) {
        logger.log('Progress Check: %s, Durability Check: %s, CP Check: %s, Tricks Check: %s, Reliability Check: %s, Cross Class Skills: %d, Wasted Actions: %d', chk.progressOk, chk.durabilityOk, chk.cpOk, chk.trickOk, chk.reliabilityOk, crossClassActionCounter, s.wastedActions);
    }
    else if (verbose) {
        logger.log('Progress Check: %s, Durability Check: %s, CP Check: %s, Tricks Check: %s, Reliability Check: %s, Cross Class Skills: %d, Wasted Actions: %d', chk.progressOk, chk.durabilityOk, chk.cpOk, chk.trickOk, chk.reliabilityOk, crossClassActionCounter, s.wastedActions);
    }

    return s;
}

function MonteCarloSim(individual, synth, nRuns, verbose, debug, logOutput) {
    verbose = verbose !== undefined ? verbose : false;
    debug = debug !== undefined ? debug : false;
    logOutput = logOutput !== undefined ? logOutput : null;

    var logger = new Logger(logOutput);

    var startState = NewStateFromSynth(synth);

    var finalStateTracker = [];
    for (var i=0; i < nRuns; i++) {
        var runSynth = MonteCarloSequence(individual, startState, false, true, false, false, logOutput);
        finalStateTracker[finalStateTracker.length] = runSynth;

        if (verbose) {
            logger.log('%2d %-20s %5d %5d %8.1f %5.1f %5d', i, 'MonteCarlo', runSynth.durabilityState, runSynth.cpState, runSynth.qualityState, runSynth.progressState, runSynth.wastedActions);
        }
    }

    var avgDurability = getAverageProperty(finalStateTracker, 'durabilityState', nRuns);
    var avgCp = getAverageProperty(finalStateTracker, 'cpState', nRuns);
    var avgQuality = getAverageProperty(finalStateTracker, 'qualityState', nRuns);
    var avgProgress = getAverageProperty(finalStateTracker, 'progressState', nRuns);
    var avgHqPercent = getAverageHqPercent(finalStateTracker);
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
        var chk = stateArray[i].checkViolations();
        var progressOk = chk.progressOk;
        var durabilityOk = chk.durabilityOk;
        var cpOk = chk.cpOk;

        if (progressOk && durabilityOk && cpOk) {
            nSuccesses += 1;
            sumProperty += stateArray[i][propName];
        }
    }

    return sumProperty / nSuccesses;
}

function getAverageHqPercent(stateArray) {
    var nHQ = 0;
    var nSuccesses = 0;
    for (var i=0; i < stateArray.length; i++) {
        var chk = stateArray[i].checkViolations();
        var progressOk = chk.progressOk;
        var durabilityOk = chk.durabilityOk;
        var cpOk = chk.cpOk;

        if (progressOk && durabilityOk && cpOk) {
            nSuccesses += 1;

            var qualityPercent = stateArray[i]['qualityState'] / stateArray[i].synth.recipe.maxQuality * 100;
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
        var chk = stateArray[i].checkViolations();
        var progressOk = chk.progressOk;
        var durabilityOk = chk.durabilityOk;
        var cpOk = chk.cpOk;

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

    var result = simSynth(individual, startState, false, false);
    var penalties = 0;
    var fitness = 0;
    var fitnessProg = 0;

    // Sum the constraint violations
    penalties += result.wastedActions;

    // Check for feasibility violations
    var chk = result.checkViolations();

    if (!chk.durabilityOk) {
       penalties += Math.abs(result.durabilityState);
    }

    if (!chk.progressOk) {
        penalties += Math.abs(result.progressState);
    }

    if (!chk.cpOk) {
        penalties += Math.abs(result.cpState);
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


// Helper Functions
//=================

function _typeof(x) {
    if (Array.isArray(x)) {
        return 'array';
    }
    else {
        return typeof x;
    }
}

function clone(x) {
    var seen = {};
    function _clone(x) {
        if (x === null) {
            return null;
        }
        for (var s in seen) {
            if (s === x) {
                return seen[s];
            }
        }
        switch(_typeof(x)) {
            case 'object':
                var newObject = Object.create(Object.getPrototypeOf(x));
                seen[x] = newObject;
                for (var p in x) {
                    newObject[p] = _clone(x[p]);
                }
                return newObject;
            case 'array':
                var newArray = [];
                seen[x] = newArray;
                for (var pp in x) {
                    newArray[pp] = _clone(x[pp]);
                }
                return newArray;
            case 'number':
                return x;
            case 'string':
                return x;
            case 'boolean':
                return x;
            default:
                return x;
        }
    }
    return _clone(x);
}

// STEP_01
// Actions Table
//==============
//parameters: shortName,  name, durabilityCost, cpCost, successProbability, qualityIncreaseMultiplier, progressIncreaseMultiplier, aType, activeTurns, cls, level
var AllActions = {
    //                            shortName,              fullName,              dur,   cp, Prob, QIM, PIM, Type,          t,  cls,           lvl,  onGood,     onExcl,     onPoor
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
    tricksOfTheTrade: new Action(  'tricksOfTheTrade',     'Tricks Of The Trade',  0,   0,   1.0, 0.0, 0.0, 'immediate',   1,  'Alchemist',    15,  true,       true),

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

    // Heavensward actions
    //                            shortName,              fullName,              dur,   cp, Prob, QIM, PIM, Type,          t,  cls,           lvl,
    byregotsBrow: new Action(     'byregotsBrow',         'Byregot\'s Brow',      10,   18,  0.7, 1.5, 0.0, 'immediate',   1,  'All',          51,  true,       true),
    preciseTouch: new Action(     'preciseTouch',         'Precise Touch',        10,   18,  0.7, 1.0, 0.0, 'immediate',   1,  'All',          53,  true,       true),
    makersMark: new Action(       'makersMark',           'Maker\'s Mark',         0,   20,  0.7, 1.0, 0.0, 'countdown',   1,  'Goldsmith',    54),
    muscleMemory: new Action(     'muscleMemory',         'Muscle Memory',        10,    6,  1.0, 0.0, 1.0, 'immediate',   1,  'Culinarian',   54),

    /* TODO
    nameofElement: new Action(    'nameofElement',        'Name of Element',       0,   15,  1.0, 0.0, 0.0, 'countdown',   5,  'Armorer',      54),
    heartOfTheClass: new Action(  'heartOfTheClass',      'Heart of the Class',    0,   45,  1.0, 0.0, 0.0, 'immediate',   1,  'All',          60),

    // Specialist Actions
    satisfaction: new Action(     'satisfaction',         'Satisfaction',          0,    0,  1.0, 0.0, 0.0, 'immediate',   1,  'All',          55),
    whistleWhileYouWork: new Action(     'whistleWhileYouWork',         'Whistle While You Work',          0,    36,  1.0, 0.0, 0.0, 'immediate',   1,  'All',          55),
    innovativeTouch: new Action(  'innovativeTouch',      'Innovative Touch',     10,    8,  0.4, 1.0, 0.0, 'immediate',   1,  'All',          56),
    nymeiasWheel: new Action(     'nymeiasWheel',         'Nymeia\'s Wheel',       0,   18,  1.0, 0.0, 0.0, 'immediate',   1,  'All',          54),
    byregotsMiracle: new Action(  'byregotsMiracle',      'Byregot\'s Miracle',   10,   16,  0.7, 1.0, 0.0, 'immediate',   1,  'All',          58),
    trainedHand: new Action(      'trainedHand',          'Trained Hand',         10,   32,  0.8, 1.0, 0.0, 'immediate',   1,  'All',          58),
    */

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

var Ing1RecipeLevelTable = {
    40: 36,
    41: 36,
    42: 37,
    43: 38,
    44: 39,
    45: 40,
    46: 41,
    47: 42,
    48: 43,
    49: 44,
    50: 45,
    55: 50,     // 50_1star     *** unverified
    70: 50,     // 50_2star     *** unverified
    90: 58,     // 50_3star     *** unverified
    110: 58,    // 50_4star     *** unverified
    115: 100,   // 51 @ 169/339 difficulty
    120: 100,   // 51 @ 210/410 difficulty
    125: 100,   // 52
    130: 110,   // 53
    133: 110,   // 54
    136: 110,   // 55
    139: 124,   // 56
    142: 129.5, // 57
    145: 134.5, // 58
    148: 139,   // 59
    150: 140,   // 60
    160: 151    // 60_1star
};

var Ing2RecipeLevelTable = {
    40: 33,
    41: 34,
    42: 35,
    43: 36,
    44: 37,
    45: 38,
    46: 39,
    47: 40,
    48: 40,
    49: 41,
    40: 42,
    55: 47,     // 50_1star     *** unverified
    70: 47,     // 50_2star     *** unverified
    90: 56,     // 50_3star     *** unverified
    110: 56,    // 50_4star     *** unverified
    115: 100,   // 51 @ 169/339 difficulty
    120: 100,   // 51 @ 210/410 difficulty
    125: 100,   // 52
    130: 110,   // 53
    133: 110,   // 54
    136: 110,   // 55
    139: 124,   // 56
    142: 129.5, // 57
    145: 133,   // 58
    148: 136,   // 59
    150: 139,   // 60
    160: 150    // 60_1star
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
