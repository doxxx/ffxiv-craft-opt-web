//require('./String.js');
/* Adding new actions search for STEP_##
    * Add action to AllActions object STEP_01
    * Add action effect to ApplySpecialActionEffects STEP_02
    * Add action counter to UpdateEffectCounters STEP_03
*/

/* ToDo
    * Implement Heavensward actions
 */

function LogOutput() {
  this.log = '';
}

LogOutput.prototype.write = function (s) {
  this.log += s;
};

LogOutput.prototype.clear = function () {
  this.log = '';
};

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

function Crafter(cls, level, craftsmanship, control, craftPoints, specialist, actions) {
    this.cls = cls;
    this.craftsmanship = craftsmanship;
    this.control = control;
    this.craftPoints = craftPoints;
    this.level = level;
    this.specialist = specialist;
    if (actions === null) {
        this.actions = [];
    }
    else {
        this.actions = actions;
    }
}

function Recipe(level, difficulty, durability, startQuality, maxQuality, aspect) {
    this.level = level;
    this.difficulty = difficulty;
    this.durability = durability;
    this.startQuality = startQuality;
    this.maxQuality = maxQuality;
    this.aspect = aspect;
}

function Synth(crafter, recipe, maxTrickUses, reliabilityIndex, useConditions, maxLength) {
    this.crafter = crafter;
    this.recipe = recipe;
    this.maxTrickUses = maxTrickUses;
    this.useConditions = useConditions;
    this.reliabilityIndex = reliabilityIndex;
    this.maxLength = maxLength;
}

Synth.prototype.calculateBaseProgressIncrease = function (levelDifference, craftsmanship, crafterLevel, recipeLevel) {
    var baseProgress = 0;
    var levelCorrectionFactor = 0;
    var levelCorrectedProgress = 0;
    var recipeLevelPenalty = 0;

    if (crafterLevel > 320) {
        baseProgress = 1.834712812e-5 * craftsmanship * craftsmanship + 1.904074773e-1 * craftsmanship + 1.544103837;
    }
    else if (crafterLevel > 250) {
        baseProgress = 1.834712812e-5 * craftsmanship * craftsmanship + 1.904074773e-1 * craftsmanship + 1.544103837;
    }
    else if (crafterLevel > 110) {
        baseProgress = 2.09860e-5 * craftsmanship * craftsmanship + 0.196184 * craftsmanship + 2.68452;
    }
    else {
        baseProgress = 0.214959 * craftsmanship + 1.6;
    }

    // Level boost for recipes below crafter level
    if (levelDifference > 0) {
        levelCorrectionFactor += (0.25 / 5) * Math.min(levelDifference, 5);
    }
    if (levelDifference > 5) {
        levelCorrectionFactor += (0.10 / 5) * Math.min(levelDifference - 5, 10);
    }
    if (levelDifference > 15) {
        levelCorrectionFactor += (0.05 / 5) * Math.min(levelDifference - 15, 5);
    }
    if (levelDifference > 20) {
        levelCorrectionFactor += 0.0006 * (levelDifference - 20);
    }

    // Level penalty for recipes above crafter level
    if (levelDifference < 0) {
        levelCorrectionFactor += 0.025 * Math.max(levelDifference, -10);
        if (ProgressPenaltyTable[recipeLevel]) {
            recipeLevelPenalty += ProgressPenaltyTable[recipeLevel];
        }
    }

    // Level factor is rounded to nearest percent
    levelCorrectionFactor = Math.floor(levelCorrectionFactor * 100) / 100;

    levelCorrectedProgress = baseProgress * (1 + levelCorrectionFactor) * (1 + recipeLevelPenalty);

    return levelCorrectedProgress;
};

Synth.prototype.calculateBaseQualityIncrease = function (levelDifference, control, crafterLevel, recipeLevel) {
    var baseQuality = 0;
    var recipeLevelPenalty = 0;
    var levelCorrectionFactor = 0;
    var levelCorrectedQuality = 0;

    baseQuality = 3.46e-5 * control * control + 0.3514 * control + 34.66;

    if (recipeLevel > 50) {
        // Starts at base penalty amount depending on recipe tier
        var recipeLevelPenaltyLevel = 0;
        for (var penaltyLevel in QualityPenaltyTable) {
            penaltyLevel = parseInt(penaltyLevel);
            var penaltyValue = QualityPenaltyTable[penaltyLevel];
            if (recipeLevel >= penaltyLevel && penaltyLevel >= recipeLevelPenaltyLevel) {
                recipeLevelPenalty = penaltyValue;
                recipeLevelPenaltyLevel = penaltyLevel;
            }
        }
        // Smaller penalty applied for additional recipe levels within the tier
        recipeLevelPenalty += (recipeLevel - recipeLevelPenaltyLevel) * -0.0002;
    }
    else {
        recipeLevelPenalty += recipeLevel * -0.00015 + 0.005;
    }

    // Level penalty for recipes above crafter level
    if (levelDifference < 0) {
        levelCorrectionFactor = 0.05 * Math.max(levelDifference, -10);
    }

    levelCorrectedQuality = baseQuality * (1 + levelCorrectionFactor) * (1 + recipeLevelPenalty);

    return levelCorrectedQuality;
};

function isActionEq(action1, action2) {
    return action1.shortName === action2.shortName;
}

function isActionNe(action1, action2) {
    return action1.shortName !== action2.shortName;
}

function EffectTracker() {
    this.countUps = {};
    this.countDowns = {};
    this.indefinites = {};
}

function State(synth, step, lastStep, action, durabilityState, cpState, bonusMaxCp, qualityState, progressState, wastedActions, trickUses, nameOfElementUses, reliability, crossClassActionList, effects, condition) {
    this.synth = synth;
    this.step = step;
    this.lastStep = lastStep;
    this.action = action;   // the action leading to this State
    this.durabilityState = durabilityState;
    this.cpState = cpState;
    this.bonusMaxCp = bonusMaxCp;
    this.qualityState = qualityState;
    this.progressState = progressState;
    this.wastedActions = wastedActions;
    this.trickUses = trickUses;
    this.nameOfElementUses = nameOfElementUses;
    this.reliability = reliability;
    if (crossClassActionList === null) {
        this.crossClassActionList = {};
    }
    else {
        this.crossClassActionList = crossClassActionList;
    }
    this.effects = effects;
    this.condition =  condition;

    // Internal state variables set after each step.
    this.iqCnt = 0;
    this.wwywCnt = 0;
    this.control = 0;
    this.qualityGain = 0;
    this.bProgressGain = 0;
    this.bQualityGain = 0;
    this.success = 0;
}

State.prototype.clone = function () {
    return new State(this.synth, this.step, this.lastStep, this.action, this.durabilityState, this.cpState, this.bonusMaxCp, this.qualityState, this.progressState, this.wastedActions, this.trickUses, this.nameOfElementUses, this.reliability, clone(this.crossClassActionList), clone(this.effects), this.condition);
};

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
    var lastStep = 0;
    var durabilityState = synth.recipe.durability;
    var cpState = synth.crafter.craftPoints;
    var bonusMaxCp = 0;
    var qualityState = synth.recipe.startQuality;
    var progressState = 0;
    var wastedActions = 0;
    var trickUses = 0;
    var nameOfElementUses = 0;
    var reliability = 1;
    var crossClassActionList = {};
    var effects = new EffectTracker();
    var condition = 'Normal';

    return new State(synth, step, lastStep, '', durabilityState, cpState, bonusMaxCp, qualityState, progressState, wastedActions, trickUses, nameOfElementUses, reliability, crossClassActionList, effects, condition);
}

function probGoodForSynth(synth) {
    var recipeLevel = synth.recipe.level;
    var qualityAssurance = synth.crafter.level >= 63;
    if (recipeLevel >= 300) { // 70*+
        return qualityAssurance ? 0.11 : 0.10;
    }
    else if (recipeLevel >= 276) { // 65+
        return qualityAssurance ? 0.17 : 0.15;
    }
    else if (recipeLevel >= 255) { // 61+
        return qualityAssurance ? 0.22 : 0.20;
    }
    else if (recipeLevel >= 150) { // 60+
        return qualityAssurance ? 0.11 : 0.10;
    }
    else if (recipeLevel >= 136) { // 55+
        return qualityAssurance ? 0.17 : 0.15;
    }
    else {
        return qualityAssurance ? 0.27 : 0.25;
    }
}

function probExcellentForSynth(synth) {
    var recipeLevel = synth.recipe.level;
    if (recipeLevel >= 300) { // 70*+
        return 0.01;
    }
    else if (recipeLevel >= 255) { // 61+
        return 0.02;
    }
    else if (recipeLevel >= 150) { // 60+
        return 0.01;
    }
    else {
        return 0.02;
    }
}

function calcNameOfMultiplier(s) {
    /* From http://redd.it/3ejmp2 and http://redd.it/3d3meb
     Assume for now that the function is linear, but capped with a minimum of 110%
     */
    var percentComplete = Math.floor(s.progressState / s.synth.recipe.difficulty * 100) / 100;
    var nameOfMultiplier = -2 * percentComplete + 3;
    nameOfMultiplier = Math.max(nameOfMultiplier, 1.1);

    return nameOfMultiplier;
}

function ApplyModifiers(s, action, condition) {

    // Effect Modifiers
    //=================
    var craftsmanship = s.synth.crafter.craftsmanship;
    var control = s.synth.crafter.control;

    // Effects modifying control
    if (AllActions.innerQuiet.shortName in s.effects.countUps) {
        control += (0.2 * s.effects.countUps[AllActions.innerQuiet.shortName]) * s.synth.crafter.control;
    }

    if (AllActions.innovation.shortName in s.effects.countDowns) {
        control += 0.5 * s.synth.crafter.control;
    }

    // Effects modifying level difference
    var effCrafterLevel = s.synth.crafter.level;
    if (LevelTable[s.synth.crafter.level]) {
        effCrafterLevel = LevelTable[s.synth.crafter.level];
    }
    var effRecipeLevel = s.synth.recipe.level;
    var levelDifference = effCrafterLevel - effRecipeLevel;

    if (AllActions.ingenuity2.shortName in s.effects.countDowns) {
        if (Ing2RecipeLevelTable[s.synth.recipe.level]) {
            effRecipeLevel = Ing2RecipeLevelTable[s.synth.recipe.level];
            levelDifference = effCrafterLevel - effRecipeLevel;
        }
        else {
            levelDifference = effCrafterLevel - (effRecipeLevel - 7); // fall back on 2.2 estimate
        }

        if (levelDifference < 0) {
            levelDifference = Math.max(levelDifference, -5);
        }
    }
    else if (AllActions.ingenuity.shortName in s.effects.countDowns) {
        if (Ing1RecipeLevelTable[s.synth.recipe.level]) {
            effRecipeLevel = Ing1RecipeLevelTable[s.synth.recipe.level];
            levelDifference = effCrafterLevel - effRecipeLevel;
        }
        else {
            levelDifference = effCrafterLevel - (effRecipeLevel - 5); // fall back on 2.2 estimate
        }

        if (levelDifference < 0) {
            levelDifference = Math.max(levelDifference, -6);
        }
    }

    // Effects modfiying probability
    var successProbability = action.successProbability;
    var ftSuccessProbability = AllActions.finishingTouches.successProbability;
    if (isActionEq(action, AllActions.focusedSynthesis) || isActionEq(action, AllActions.focusedTouch)) {
        if (s.action === AllActions.observe.shortName) {
            successProbability = 1.0;
        }
    }
    if (AllActions.steadyHand2.shortName in s.effects.countDowns) {
        successProbability += 0.3;        // Assume 2 always overrides 1
        ftSuccessProbability += 0.3;
    }
    else if (AllActions.steadyHand.shortName in s.effects.countDowns) {
        successProbability += 0.2;
        ftSuccessProbability += 0.2;
    }
    successProbability = Math.min(successProbability, 1);
    ftSuccessProbability = Math.min(ftSuccessProbability, 1);

    // Effects modifying progress increase multiplier
    var progressIncreaseMultiplier = action.progressIncreaseMultiplier;

    var ftMultiplier = 1.0;

    // Brand actions
    if (isActionEq(action, AllActions.brandOfTheElements)) {
        var nameOfMultiplier = 1;
        if (s.effects.countDowns.hasOwnProperty(AllActions.nameOfTheElements.shortName)) {
            nameOfMultiplier = calcNameOfMultiplier(s);
        }
        progressIncreaseMultiplier *= nameOfMultiplier;
    }

    // Effects modified by Whistle While You Work
    // if (AllActions.whistle.shortName in s.effects.countDowns && (s.effects.countDowns[AllActions.whistle.shortName] % 3 == 0)) {
    //     if (progressIncreaseMultiplier > 0) {
    //         progressIncreaseMultiplier += 0.5;
    //     }
    // }

    // Effects modifying quality increase multiplier
    var qualityIncreaseMultiplier = action.qualityIncreaseMultiplier;

    // We can only use Byregot actions when we have at least 2 stacks of inner quiet
    if (isActionEq(action, AllActions.byregotsBlessing)) {
        if ((AllActions.innerQuiet.shortName in s.effects.countUps) && s.effects.countUps[AllActions.innerQuiet.shortName] >= 1) {
            qualityIncreaseMultiplier += 0.2 * s.effects.countUps[AllActions.innerQuiet.shortName];
        } else {
            qualityIncreaseMultiplier = 0;
        }
    }
    if (isActionEq(action, AllActions.byregotsMiracle)) {
        if ((AllActions.innerQuiet.shortName in s.effects.countUps) && s.effects.countUps[AllActions.innerQuiet.shortName] >= 1) {
            qualityIncreaseMultiplier += 0.15 * s.effects.countUps[AllActions.innerQuiet.shortName];
        } else {
            qualityIncreaseMultiplier = 0;
        }
    }

    if (AllActions.greatStrides.shortName in s.effects.countDowns) {
        qualityIncreaseMultiplier *= 2;
    }

    // Effects modifying progress
    s.baseProgress = s.synth.calculateBaseProgressIncrease(levelDifference, craftsmanship, effCrafterLevel, s.synth.recipe.level);
    var bProgressGain = progressIncreaseMultiplier * s.baseProgress;
    if (isActionEq(action, AllActions.flawlessSynthesis)) {
        bProgressGain = 40;
    }
    else if (isActionEq(action, AllActions.pieceByPiece)) {
        bProgressGain = Math.min((s.synth.recipe.difficulty - s.progressState) * 0.33, 1000);
    }

    if (isActionEq(action, AllActions.muscleMemory)) {
        if (s.step == 1) {
            bProgressGain = Math.min((s.synth.recipe.difficulty - s.progressState) * 0.33, 1000);
        }
        else {
            bProgressGain = 0;
        }
    }

    // if (isActionEq(action, AllActions.trainedHand) && !condition.checkInnerQuietEqWhistle()) {
    //     bProgressGain = 0;
    // }

    // Effects modifying quality
    s.baseQuality = s.synth.calculateBaseQualityIncrease(levelDifference, control, effCrafterLevel, s.synth.recipe.level);
    var bQualityGain = qualityIncreaseMultiplier * s.baseQuality;

    // We can only use Precise Touch when state material condition is Good or Excellent. Default is true for probabilistic method.
    if (isActionEq(action, AllActions.preciseTouch)) {
        if (condition.checkGoodOrExcellent()) {
            bQualityGain *= condition.pGoodOrExcellent();
        } else {
            bQualityGain = 0;
        }
    }
    // if (isActionEq(action, AllActions.trainedHand) && !condition.checkInnerQuietEqWhistle()) {
    //     bQualityGain = 0;
    // }

    // Effects modifying durability cost
    var durabilityCost = action.durabilityCost;
    var ftDurabilityCost = AllActions.finishingTouches.durabilityCost;
    if ((AllActions.wasteNot.shortName in s.effects.countDowns) || (AllActions.wasteNot2.shortName in s.effects.countDowns)) {
        if (isActionEq(action, AllActions.prudentTouch)) {
            bQualityGain = 0;
        }
        else {
            durabilityCost *= 0.5;
            ftDurabilityCost *= 0.5;
        }
    }
    if ((AllActions.makersMark.shortName in s.effects.countDowns) && (isActionEq(action, AllActions.flawlessSynthesis))) {
        durabilityCost *= 0;
    }

    // Effects modifying cp cost
    var cpCost = action.cpCost;
    if ((AllActions.makersMark.shortName in s.effects.countDowns) && (isActionEq(action, AllActions.flawlessSynthesis))) {
        cpCost *= 0;
    }

    /*
    If Whistle is at 1 and a good/excellent occurs, at the end of the action, whistle will decrement and Finishing Touches will occur
    Finishing Touches is 200% efficiency, 50% success (?) and 10 (?) durability
    */
    // if ((AllActions.whistle.shortName in s.effects.countDowns && s.effects.countDowns[AllActions.whistle.shortName] == 1) && condition.checkGoodOrExcellent()) {
    //     // Cheat to see if we are dealing with MontecarloStep
    //     if (condition.pGoodOrExcellent() == 1) {
    //         // Success or Failure
    //         var successRand = Math.random();
    //         if (0 <= successRand && successRand <= ftSuccessProbability) {
    //             ftSuccessProbability = 1;
    //         }
    //         else {
    //             ftSuccessProbability = 0;
    //         }
    //     }
    //     bProgressGain += AllActions.finishingTouches.progressIncreaseMultiplier * condition.pGoodOrExcellent() * ftSuccessProbability * ftMultiplier *
    //         s.synth.calculateBaseProgressIncrease(levelDifference, craftsmanship, effCrafterLevel, s.synth.recipe.level);
    //     durabilityCost += ftDurabilityCost * condition.pGoodOrExcellent();
    // }

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
        durabilityCost: durabilityCost,
        cpCost: cpCost
    };
}

function useConditionalAction (s, condition) {
    if (s.cpState > 0 && condition.checkGoodOrExcellent()) {
        s.trickUses += 1;
        return true;
    }
    else {
        s.wastedActions += 1;
        return false;
    }
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

    if ((AllActions.manipulation.shortName in s.effects.countDowns) && (s.durabilityState > 0) && !isActionEq(action, AllActions.manipulation) && !isActionEq(action, AllActions.manipulation2)) {
        s.durabilityState += 10;
    }

    if ((AllActions.manipulation2.shortName in s.effects.countDowns) && (s.durabilityState > 0) && !isActionEq(action, AllActions.manipulation) && !isActionEq(action, AllActions.manipulation2)) {
        s.durabilityState += 5;
    }

    if (isActionEq(action, AllActions.specialtyReinforce) && (s.durabilityState > 0)) {
        if (AllActions.initialPreparations.shortName in s.effects.indefinites) {
            s.durabilityState += 25;
            delete s.effects.indefinites[AllActions.initialPreparations.shortName];
        }
        else {
            s.wastedActions += 1;
        }
    }

    // if (isActionEq(action, AllActions.nymeiasWheel)) {
    //     if (AllActions.whistle.shortName in s.effects.countDowns) {
    //         s.durabilityState += NymeaisWheelTable[s.effects.countDowns[AllActions.whistle.shortName]];
    //         delete s.effects.countDowns[AllActions.whistle.shortName];
    //     }
    //     else {
    //         s.wastedActions += 1;
    //     }
    // }

    if (isActionNe(action, AllActions.comfortZone) && AllActions.comfortZone.shortName in s.effects.countDowns && s.cpState >= 0) {
        s.cpState += 8;
    }

    if (isActionEq(action, AllActions.rumination) && s.cpState >= 0) {
        if (AllActions.innerQuiet.shortName in s.effects.countUps && s.effects.countUps[AllActions.innerQuiet.shortName] > 0) {
            s.cpState += (21 * s.effects.countUps[AllActions.innerQuiet.shortName] - Math.pow(s.effects.countUps[AllActions.innerQuiet.shortName], 2) + 10) / 2;
            delete s.effects.countUps[AllActions.innerQuiet.shortName];
        }
        else {
            s.wastedActions += 1;
        }
    }

    if (isActionEq(action, AllActions.specialtyRefurbish) && s.cpState >= 0) {
        if (AllActions.initialPreparations.shortName in s.effects.indefinites) {
            s.cpState += 65;
            delete s.effects.indefinites[AllActions.initialPreparations.shortName];
        }
        else {
            s.wastedActions += 1;
        }
    }

    if (isActionEq(action, AllActions.byregotsBlessing)) {
        if (AllActions.innerQuiet.shortName in s.effects.countUps) {
            delete s.effects.countUps[AllActions.innerQuiet.shortName];
        }
        else {
            s.wastedActions += 1;
        }
    }

    if (isActionEq(action, AllActions.byregotsMiracle)) {
        // We can only use Byregot's Miracle when we have at least 2 stacks of inner quiet
        if ((AllActions.innerQuiet.shortName in s.effects.countUps) && s.effects.countUps[AllActions.innerQuiet.shortName] >= 1) {
            s.effects.countUps[AllActions.innerQuiet.shortName] = Math.ceil((s.effects.countUps[AllActions.innerQuiet.shortName]+1) / 2) - 1;
        }
        else {
            s.wastedActions += 1;
        }
    }

    if (isActionEq(action, AllActions.specialtyReflect)) {
        if (AllActions.initialPreparations.shortName in s.effects.indefinites) {
            s.effects.countUps[AllActions.innerQuiet.shortName] += 3;
            delete s.effects.indefinites[AllActions.initialPreparations.shortName];
        }
        else {
            s.wastedActions += 1;
        }
    }

    if ((action.qualityIncreaseMultiplier > 0) && (AllActions.greatStrides.shortName in s.effects.countDowns)) {
        delete s.effects.countDowns[AllActions.greatStrides.shortName];
    }

    // Manage effects with conditional requirements
    if (action.onExcellent || action.onGood) {
        if (useConditionalAction(s, condition)) {
            if (isActionEq(action, AllActions.tricksOfTheTrade)) {
                s.cpState += 20 * condition.pGoodOrExcellent();
            }
        }
    }

    // Effects modified by Whistle While You Work
    // if (isActionEq(action, AllActions.satisfaction) && s.cpState > 0) {
    //     if (condition.checkWhistleThrees()) {
    //         s.cpState += 15;
    //     }
    //     else {
    //         s.wastedActions += 1;
    //     }
    // }

    if (s.step == 1 && s.synth.crafter.specialist && s.synth.crafter.level >= 70 && s.cpState > 0) {
        s.effects.indefinites[AllActions.strokeOfGenius.shortName] = true;
        s.bonusMaxCp = 15;
        s.cpState += 15;
    }
}

function UpdateEffectCounters(s, action, condition, successProbability) {
    // STEP_03
    // Countdown / Countup Management
    //===============================
    // Decrement countdowns
    for (var countDown in s.effects.countDowns) {
        // if (countDown == AllActions.whistle.shortName) {
        //     if (condition.checkGoodOrExcellent()) {
        //         s.effects.countDowns[AllActions.whistle.shortName] -= 1 * condition.pGoodOrExcellent();
        //     }
        // }
        // else {
        //     s.effects.countDowns[countDown] -= 1;
        // }
        s.effects.countDowns[countDown] -= 1;

        if (s.effects.countDowns[countDown] === 0) {
            delete s.effects.countDowns[countDown];
        }
    }

    if (AllActions.innerQuiet.shortName in s.effects.countUps) {
        // Increment inner quiet countups that have conditional requirements
        if (isActionEq(action, AllActions.patientTouch) || isActionEq(action, AllActions.preparatoryTouch)) {
            s.effects.countUps[AllActions.innerQuiet.shortName] = //+= 2 * successProbability;
                ((s.effects.countUps[AllActions.innerQuiet.shortName] + 2) * successProbability) +
                ((Math.ceil((s.effects.countUps[AllActions.innerQuiet.shortName]+1) / 2) - 1)  * (1 - successProbability));
        }
        // Increment inner quiet countups that have conditional requirements
        else if (isActionEq(action, AllActions.preciseTouch) && condition.checkGoodOrExcellent()) {
            s.effects.countUps[AllActions.innerQuiet.shortName] += 2 * successProbability * condition.pGoodOrExcellent();
        }
        else if (isActionEq(action, AllActions.byregotsMiracle)) {
            // Do nothing in the event that the conditions fo Byregot's Miracle are not met
        }
        // else if (isActionEq(action, AllActions.trainedHand) && condition.checkInnerQuietEqWhistle()) {
        //     s.effects.countUps[AllActions.innerQuiet.shortName] += 1 * successProbability;
        // }
        // Increment all other inner quiet count ups
        else if (action.qualityIncreaseMultiplier > 0) {
            s.effects.countUps[AllActions.innerQuiet.shortName] += 1 * successProbability;
        }

        // Cap inner quiet stacks at 10 (11)
        s.effects.countUps[AllActions.innerQuiet.shortName] = Math.min(s.effects.countUps[AllActions.innerQuiet.shortName], 10);
    }

    // Initialize new effects after countdowns are managed to reset them properly
    if (action.type === 'countup') {
        s.effects.countUps[action.shortName] = 0;
    }

    if (action.type === 'indefinite') {
        if (isActionEq(action, AllActions.initialPreparations)) {
            if (s.step == 1) {
                s.effects.indefinites[action.shortName] = true;
            }
            else {
                s.wastedActions += 1;
            }
        }
        else {
            s.effects.indefinites[action.shortName] = true;
        }
    }

    if (action.type === 'countdown') {
        if (action.shortName.indexOf('nameOf') >= 0) {
            if (s.nameOfElementUses == 0) {
                s.effects.countDowns[action.shortName] = action.activeTurns;
                s.nameOfElementUses += 1;
            }
            else {
                s.wastedActions += 1;
            }
        }
        else if (isActionEq(action, AllActions.manipulation) || isActionEq(action, AllActions.manipulation2)) {
            if (AllActions.manipulation.shortName in s.effects.countDowns) {
                delete s.effects.countDowns[AllActions.manipulation.shortName];
            }
            if (AllActions.manipulation2.shortName in s.effects.countDowns) {
                delete s.effects.countDowns[AllActions.manipulation2.shortName];
            }
            s.effects.countDowns[action.shortName] = action.activeTurns;
        }
        else if (isActionEq(action, AllActions.ingenuity) || isActionEq(action, AllActions.ingenuity2)) {
            if (AllActions.ingenuity.shortName in s.effects.countDowns) {
                delete s.effects.countDowns[AllActions.ingenuity.shortName];
            }
            if (AllActions.ingenuity2.shortName in s.effects.countDowns) {
                delete s.effects.countDowns[AllActions.ingenuity2.shortName];
            }
            s.effects.countDowns[action.shortName] = action.activeTurns;
        }
        else if (isActionEq(action, AllActions.makersMark)) {
            if (s.step == 1 ) {
                // Maker's Mark has stacks equal to difficulty divided by 100 rounded up http://redd.it/3ckrmk
                var makersMarkStacks = Math.ceil(s.synth.recipe.difficulty / 100);
                if (makersMarkStacks == 0) {
                    makersMarkStacks = 1;
                }
                s.effects.countDowns[action.shortName] = makersMarkStacks;
            }
            else {
                s.wastedActions += 1;
            }
        }
        else {
            s.effects.countDowns[action.shortName] = action.activeTurns;
        }
    }

    // Innovative Touch activates innovation
    if (isActionEq(action, AllActions.innovativeTouch)) {
        s.effects.countDowns[AllActions.innovation.shortName] = AllActions.innovation.activeTurns;
    }
}

function UpdateState(s, action, progressGain, qualityGain, durabilityCost, cpCost, condition, successProbability) {
    // State tracking
    s.progressState += progressGain;
    s.qualityState += qualityGain;
    s.durabilityState -= durabilityCost;
    s.cpState -= cpCost;
    s.lastStep += 1;

    ApplySpecialActionEffects(s, action, condition);
    UpdateEffectCounters(s, action, condition, successProbability);

    // Sanity checks for state variables
    if ((s.durabilityState >= -5) && (s.progressState >= s.synth.recipe.difficulty)) {
        s.durabilityState = 0;
    }
    s.durabilityState = Math.min(s.durabilityState, s.synth.recipe.durability);
    s.cpState = Math.min(s.cpState, s.synth.crafter.craftPoints + s.bonusMaxCp);
    s.baseProgress = 1;
    s.baseQuality = 2;
}

function simSynth(individual, startState, assumeSuccess, verbose, debug, logOutput) {
    verbose = verbose !== undefined ? verbose : true;
    debug = debug !== undefined ? debug : false;
    logOutput = logOutput !== undefined ? logOutput : null;

    var logger = new Logger(logOutput);

    // Clone startState to keep startState immutable
    var s = startState.clone();

    // Conditions
    var pGood = probGoodForSynth(s.synth);
    var pExcellent = probExcellentForSynth(s.synth);
    var ignoreConditionReq = !s.synth.useConditions;

    // Step 1 is always normal
    var ppGood = 0;
    var ppExcellent = 0;
    var ppPoor = 0;
    var ppNormal = 1 - (ppGood + ppExcellent + ppPoor);

    var SimCondition = {
        checkGoodOrExcellent: function () {
            return true;
        },
        pGoodOrExcellent: function () {
            if (ignoreConditionReq) {
                return 1;
            }
            else {
                return ppGood + ppExcellent;
            }
        }
        // checkInnerQuietEqWhistle: function () {
        //     if (ignoreConditionReq) {
        //         return true;
        //     }
        //     else if (s.effects.countUps[AllActions.innerQuiet.shortName] + 1 == s.effects.countDowns[AllActions.whistle.shortName]) {
        //         // Until we figure out how to model this
        //         return true;
        //     }
        //     else {
        //         return false;
        //     }
        // },
        // checkWhistleThrees: function () {
        //     if (ignoreConditionReq) {
        //         return true;
        //     }
        //     else if (AllActions.whistle.shortName in s.effects.countDowns && (s.effects.countDowns[AllActions.whistle.shortName] % 3 == 0)) {
        //         // Until we figure out how to model this
        //         return true;
        //     }
        //     else {
        //         return false;
        //     }
        // }
    };

    // Initialize counters
    var crossClassActionCounter = 0;

    // Check for null or empty individuals
    if (individual === null || individual.length === 0) {
        return NewStateFromSynth(s.synth);
    }

    if (debug) {
        logger.log('%-2s %30s %-5s %-5s %-8s %-8s %-5s %-5s %-8s %-8s %-5s %-5s %-5s', '#', 'Action', 'DUR', 'CP', 'EQUA', 'EPRG', 'IQ', 'WWYW', 'CTL', 'QINC', 'BPRG', 'BQUA', 'WAC');
        logger.log('%2d %30s %5.0f %5.0f %8.1f %8.1f %5.1f %5.1f %8.1f %8.1f %5.0f %5.0f %5.0f', s.step, '', s.durabilityState, s.cpState, s.qualityState, s.progressState, 0, 0, s.synth.crafter.control, 0, 0, 0, 0);
    }
    else if (verbose) {
        logger.log('%-2s %30s %-5s %-5s %-8s %-8s %-5s %-5s', '#', 'Action', 'DUR', 'CP', 'EQUA', 'EPRG', 'IQ', 'WWYW');
        logger.log('%2d %30s %5.0f %5.0f %8.1f %8.1f %5.1f %5.1f', s.step, '', s.durabilityState, s.cpState, s.qualityState, s.progressState, 0, 0);

    }

    for (var i = 0; i < individual.length; i++) {
        var action = individual[i];

        // Occur regardless of dummy actions
        //==================================
        s.step += 1;

        // Condition Calculation
        var condQualityIncreaseMultiplier = 1;
        if (!ignoreConditionReq) {
            condQualityIncreaseMultiplier *= (ppNormal + 1.5 * ppGood * Math.pow(1 - (ppGood + pGood) / 2, s.synth.maxTrickUses) + 4 * ppExcellent + 0.5 * ppPoor);
        }

        // Calculate Progress, Quality and Durability gains and losses under effect of modifiers
        var r = ApplyModifiers(s, action, SimCondition);

        // Calculate final gains / losses
        var successProbability = r.successProbability;
        if (assumeSuccess) {
            successProbability = 1;
        }
        var progressGain = r.bProgressGain;
        if (progressGain > 0) {
            s.reliability = s.reliability * successProbability;
        }

        var qualityGain = condQualityIncreaseMultiplier * r.bQualityGain;

        // Floor gains at final stage before calculating expected value
        progressGain = successProbability * Math.floor(progressGain);
        qualityGain = successProbability * Math.floor(qualityGain);

        // Occur if a wasted action
        //==================================
        if (((s.progressState >= s.synth.recipe.difficulty) || (s.durabilityState <= 0) || (s.cpState < 0)) && (action != AllActions.dummyAction)) {
            s.wastedActions += 1;
        }

        // Occur if not a wasted action
        //==================================
        else {

            UpdateState(s, action, progressGain, qualityGain, r.durabilityCost, r.cpCost, SimCondition, successProbability);

            // Count cross class actions
            if (!(action.cls === 'All' || action.cls === s.synth.crafter.cls || action.shortName in s.crossClassActionList)) {
                s.crossClassActionList[action.shortName] = true;
                crossClassActionCounter += 1;
            }

            // Ending condition update
            if (!ignoreConditionReq) {
                ppPoor = ppExcellent;
                ppGood = pGood * ppNormal;
                ppExcellent = pExcellent * ppNormal;
                ppNormal = 1 - (ppGood + ppExcellent + ppPoor);
            }

        }

        var iqCnt = 0;
        var wwywCnt = 0;
        if (AllActions.innerQuiet.shortName in s.effects.countUps) {
            iqCnt = s.effects.countUps[AllActions.innerQuiet.shortName];
        }
        // if (AllActions.whistle.shortName in s.effects.countDowns) {
        //     wwywCnt = s.effects.countDowns[AllActions.whistle.shortName];
        // }

        if (debug) {
            logger.log('%2d %30s %5.0f %5.0f %8.1f %8.1f %5.1f %5.1f %8.1f %8.1f %5.0f %5.0f %5.0f', s.step, action.name, s.durabilityState, s.cpState, s.qualityState, s.progressState, iqCnt, wwywCnt, r.control, qualityGain, Math.floor(r.bProgressGain), Math.floor(r.bQualityGain), s.wastedActions);
        }
        else if (verbose) {
            logger.log('%2d %30s %5.0f %5.0f %8.1f %8.1f %5.1f %5.1f', s.step, action.name, s.durabilityState, s.cpState, s.qualityState, s.progressState, iqCnt, wwywCnt);
        }

        s.action = action.shortName
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
    s.action = individual[individual.length-1].shortName;
    return s;

}

function MonteCarloStep(startState, action, assumeSuccess, verbose, debug, logOutput) {
    verbose = verbose !== undefined ? verbose : true;
    debug = debug !== undefined ? debug : false;
    logOutput = logOutput !== undefined ? logOutput : null;

    var logger = new Logger(logOutput);

    // Clone startState to keep startState immutable
    var s = startState.clone();

    // Conditions
    var pGood = probGoodForSynth(s.synth);
    var pExcellent = probExcellentForSynth(s.synth);
    var ignoreConditionReq = !s.synth.useConditions;
    var randomizeConditions = !ignoreConditionReq;

    var MonteCarloCondition = {
        checkGoodOrExcellent: function () {
            if (ignoreConditionReq) {
                return true;
            }
            else {
                return (s.condition == 'Good' || s.condition == 'Excellent');
            }
        },
        pGoodOrExcellent: function () {
            return 1;
        }
        // checkInnerQuietEqWhistle: function () {
        //     if (ignoreConditionReq) {
        //         return true;
        //     }
        //     else if (s.effects.countUps[AllActions.innerQuiet.shortName] + 1 == s.effects.countDowns[AllActions.whistle.shortName]) {
        //         // Until we figure out how to model this
        //         return true;
        //     }
        //     else {
        //         return false;
        //     }
        // },
        // checkWhistleThrees: function () {
        //     if (ignoreConditionReq) {
        //         return true;
        //     }
        //     else if (AllActions.whistle.shortName in s.effects.countDowns && (s.effects.countDowns[AllActions.whistle.shortName] % 3 == 0)) {
        //         // Until we figure out how to model this
        //         return true;
        //     }
        //     else {
        //         return false;
        //     }
        // }
    };

    // Initialize counters
    s.step += 1;

    // Condition Evaluation
    var condQualityIncreaseMultiplier = 1;
    if (s.condition === 'Excellent') {
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

        UpdateState(s, action, progressGain, qualityGain, r.durabilityCost, r.cpCost, MonteCarloCondition, success);

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
        if (randomizeConditions) {
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
        else {
            s.condition = 'Normal';
        }
    }

    // Check for feasibility violations
    var chk = s.checkViolations();

    var iqCnt = 0;
    var wwywCnt = 0;
    if (AllActions.innerQuiet.shortName in s.effects.countUps) {
        iqCnt = s.effects.countUps[AllActions.innerQuiet.shortName];
    }
    // if (AllActions.whistle.shortName in s.effects.countDowns) {
    //     wwywCnt = s.effects.countDowns[AllActions.whistle.shortName];
    // }

    // Add internal state variables for later output of best and worst cases
    s.action = action.shortName;
    s.iqCnt = iqCnt;
    s.wwywCnt = wwywCnt;
    s.control = r.control;
    s.qualityGain = qualityGain;
    s.bProgressGain = Math.floor(r.bProgressGain);
    s.bQualityGain = Math.floor(r.bQualityGain);
    s.success = success;

    if (debug) {
        logger.log('%2d %30s %5.0f %5.0f %8.0f %8.0f %5.0f %5.0f %5.0f %5.0f %5.0f %5.0f %5.0f %-10s %5.0f', s.step, action.name, s.durabilityState, s.cpState, s.qualityState, s.progressState, s.iqCnt, s.wwywCnt, s.control, s.qualityGain, s.bProgressGain, s.bQualityGain, s.wastedActions, s.condition, s.success);
    }
    else if (verbose) {
        logger.log('%2d %30s %5.0f %5.0f %8.0f %8.0f %5.0f %5.0f %-10s %-5s', s.step, action.name, s.durabilityState, s.cpState, s.qualityState, s.progressState, s.iqCnt, s.wwywCnt, s.condition, s.success);
    }

    // Return final state
    return s;

}

function MonteCarloSequence(individual, startState, assumeSuccess, conditionalActionHandling, verbose, debug, logOutput) {
    verbose = verbose !== undefined ? verbose : true;
    debug = debug !== undefined ? debug : false;
    logOutput = logOutput !== undefined ? logOutput : null;

    if (conditionalActionHandling !== 'reposition' && conditionalActionHandling !== 'skipUnusable' && conditionalActionHandling !== 'ignoreUnusable') {
        throw new Error("invalid conditionalActionHandling value: " + conditionalActionHandling);
    }

    var logger = new Logger(logOutput);

    var s = startState;

    // Initialize counters
    var maxConditionUses = 0;
    var crossClassActionCounter = 0;

    // Check for null or empty individuals
    if (individual === null || individual.length === 0) {
        return startState;
    }

    // Strip Tricks of the Trade from individual
    if (conditionalActionHandling === 'reposition') {
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
        logger.log('%-2s %30s %-5s %-5s %-8s %-8s %-5s %-5s %-5s %-5s %-5s %-5s %-5s %-10s %-5s', '#', 'Action', 'DUR', 'CP', 'QUA', 'PRG', 'IQ', 'WWYW', 'CTL', 'QINC', 'BPRG', 'BQUA', 'WAC', 'Cond', 'S/F');
        logger.log('%2d %30s %5.0f %5.0f %8.0f %8.0f %5.0f %5.0f %5.0f %5.0f %5.0f %5.0f %5.0f %-10s %5.0f', s.step, '', s.durabilityState, s.cpState, s.qualityState, s.progressState, 0, 0, s.synth.crafter.control, 0, 0, 0, 0, 'Normal', '');
    }
    else if (verbose) {
        logger.log('%-2s %30s %-5s %-5s %-8s %-8s %-5s %-5s %-10s %-5s', '#', 'Action', 'DUR', 'CP', 'QUA', 'PRG', 'IQ', 'WWYW', 'Cond', 'S/F');
        logger.log('%2d %30s %5.0f %5.0f %8.0f %8.0f %5.0f %5.0f %-10s %5.0f', s.step, '', s.durabilityState, s.cpState, s.qualityState, s.progressState, 0, 0, 'Normal', 0);

    }

    var states = [];

    states.push(s);

    for (i=0; i < individual.length; i++) {
        var action = individual[i];

        // Determine if action is usable
        var usable = action.onExcellent && s.condition === 'Excellent' ||
                     action.onGood && s.condition === 'Good' ||
                     action.onPoor && s.condition === 'Poor' ||
                     (!action.onExcellent && !action.onGood && !action.onPoor);

        if (conditionalActionHandling === 'reposition') {
            // Manually re-add condition dependent action when conditions are met
            if (s.condition === 'Excellent' && s.trickUses < maxConditionUses) {
                if (onExcellentOnlyActions.length > 0) {
                    s = MonteCarloStep(s, onExcellentOnlyActions.shift(), assumeSuccess, verbose, debug, logOutput);
                    states.push(s);
                }
                else if (onGoodOrExcellentActions.length > 0) {
                    s = MonteCarloStep(s, onGoodOrExcellentActions.shift(), assumeSuccess, verbose, debug, logOutput);
                    states.push(s);
                }
            }
            if (s.condition === 'Good' && s.trickUses < maxConditionUses) {
                if (onGoodOnlyActions.length > 0) {
                    s = MonteCarloStep(s, onGoodOnlyActions.shift(), assumeSuccess, verbose, debug, logOutput);
                    states.push(s);
                }
                else if (onGoodOrExcellentActions.length > 0) {
                    s = MonteCarloStep(s, onGoodOrExcellentActions.shift(), assumeSuccess, verbose, debug, logOutput);
                    states.push(s);
                }
            }
            if (s.condition === 'Poor' && s.trickUses < maxConditionUses) {
                if (onPoorOnlyActions.length > 0) {
                    s = MonteCarloStep(s, onPoorOnlyActions.shift(), assumeSuccess, verbose, debug, logOutput);
                    states.push(s);
                }
            }

            // Process the original action as another step
            s = MonteCarloStep(s, action, assumeSuccess, verbose, debug, logOutput);
            states.push(s);
        }
        else if (conditionalActionHandling === 'skipUnusable') {
            // If not usable, record a skipped action without progressing other status counters
            if (!usable) {
                s = s.clone();
                s.action = action.shortName;
                s.wastedActions += 1;
                states.push(s);
            }
            // Otherwise, process action as normal
            else {
                s = MonteCarloStep(s, action, assumeSuccess, verbose, debug, logOutput);
                states.push(s);
            }
        }
        else if (conditionalActionHandling === 'ignoreUnusable') {
            // If not usable, skip action effect, progress other status counters
            s = MonteCarloStep(s, action, assumeSuccess, verbose, debug, logOutput);
            states.push(s);
        }
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

    return states;
}

function MonteCarloSim(individual, synth, nRuns, assumeSuccess, conditionalActionHandling, verbose, debug, logOutput) {
    verbose = verbose !== undefined ? verbose : false;
    debug = debug !== undefined ? debug : false;
    logOutput = logOutput !== undefined ? logOutput : null;

    var logger = new Logger(logOutput);

    var startState = NewStateFromSynth(synth);

    var bestSequenceStates;
    var worseSequenceStates;
    var finalStateTracker = [];
    for (var i=0; i < nRuns; i++) {
        var states = MonteCarloSequence(individual, startState, assumeSuccess, conditionalActionHandling, false, false, logOutput);
        var finalState = states[states.length-1];

        if (!bestSequenceStates || finalState.qualityState > bestSequenceStates[bestSequenceStates.length-1].qualityState) {
            bestSequenceStates = states;
        }

        if (!worseSequenceStates || finalState.qualityState < worseSequenceStates[worseSequenceStates.length-1].qualityState) {
            worseSequenceStates = states;
        }

        finalStateTracker.push(finalState);

        if (verbose) {
            logger.log('%2d %-20s %5d %5d %8.1f %5.1f %5d', i, 'MonteCarlo', finalState.durabilityState, finalState.cpState, finalState.qualityState, finalState.progressState, finalState.wastedActions);
        }
    }

    var avgDurability = getAverageProperty(finalStateTracker, 'durabilityState', nRuns);
    var avgCp = getAverageProperty(finalStateTracker, 'cpState', nRuns);
    var avgQuality = getAverageProperty(finalStateTracker, 'qualityState', nRuns);
    var avgProgress = getAverageProperty(finalStateTracker, 'progressState', nRuns);
    var avgHqPercent = getAverageHqPercent(finalStateTracker);
    var avgStats = {
        durability: avgDurability,
        cp: avgCp,
        quality: avgQuality,
        progress: avgProgress,
        hqPercent: avgHqPercent
    };

    var successRate = getSuccessRate(finalStateTracker);

    logger.log('%-2s %20s %-5s %-5s %-8s %-5s %-5s','', '', 'DUR', 'CP', 'QUA', 'PRG', 'HQ%');
    logger.log('%2s %-20s %5.0f %5.0f %8.1f %5.1f %5.1f', '##', 'Expected Value: ', avgDurability, avgCp, avgQuality, avgProgress, avgHqPercent);

    var mdnDurability = getMedianProperty(finalStateTracker, 'durabilityState', nRuns);
    var mdnCp = getMedianProperty(finalStateTracker, 'cpState', nRuns);
    var mdnQuality = getMedianProperty(finalStateTracker, 'qualityState', nRuns);
    var mdnProgress = getMedianProperty(finalStateTracker, 'progressState', nRuns);
    var mdnHqPercent = getMedianHqPercent(finalStateTracker);
    var mdnStats = {
        durability: mdnDurability,
        cp: mdnCp,
        quality: mdnQuality,
        progress: mdnProgress,
        hqPercent: mdnHqPercent
    };

    logger.log('%2s %-20s %5.0f %5.0f %8.1f %5.1f %5.1f', '##', 'Median Value: ', mdnDurability, mdnCp, mdnQuality, mdnProgress, mdnHqPercent   );

    var minDurability = getMinProperty(finalStateTracker, 'durabilityState');
    var minCp = getMinProperty(finalStateTracker, 'cpState');
    var minQuality = getMinProperty(finalStateTracker, 'qualityState');
    var minProgress = getMinProperty(finalStateTracker, 'progressState');
    var minQualityPercent = Math.min(synth.recipe.maxQuality, minQuality)/synth.recipe.maxQuality * 100;
    var minHqPercent = hqPercentFromQuality(minQualityPercent);
    var minStats = {
        durability: minDurability,
        cp: minCp,
        quality: minQuality,
        progress: minProgress,
        hqPercent: minHqPercent
    };

    logger.log('%2s %-20s %5.0f %5.0f %8.1f %5.1f %5.1f', '##', 'Min Value: ', minDurability, minCp, minQuality, minProgress, minHqPercent);

    var maxDurability = getMaxProperty(finalStateTracker, 'durabilityState');
    var maxCp = getMaxProperty(finalStateTracker, 'cpState');
    var maxQuality = getMaxProperty(finalStateTracker, 'qualityState');
    var maxProgress = getMaxProperty(finalStateTracker, 'progressState');
    var maxQualityPercent = Math.max(synth.recipe.maxQuality, maxQuality)/synth.recipe.maxQuality * 100;
    var maxHqPercent = hqPercentFromQuality(maxQualityPercent);
    var maxStats = {
        durability: maxDurability,
        cp: maxCp,
        quality: maxQuality,
        progress: maxProgress,
        hqPercent: maxHqPercent
    };

    logger.log('%2s %-20s %5.0f %5.0f %8.1f %5.1f %5.1f', '##', 'Max Value: ', maxDurability, maxCp, maxQuality, maxProgress, maxHqPercent);

    logger.log('\n%2s %-20s %5.1f %%', '##', 'Success Rate: ', successRate);

    logger.log('');

    logger.log("Monte Carlo Random Example");
    logger.log("==========================");
    MonteCarloSequence(individual, startState, assumeSuccess, conditionalActionHandling, false, true, logOutput);

    logger.log('');

    logger.log("Monte Carlo Best Example");
    logger.log("==========================");
    logger.log('%-2s %30s %-5s %-5s %-8s %-8s %-5s %-5s %-5s %-5s %-5s %-5s %-5s %-10s %-5s', '#', 'Action', 'DUR', 'CP', 'QUA', 'PRG', 'IQ', 'WWYW', 'CTL', 'QINC', 'BPRG', 'BQUA', 'WAC', 'Cond', 'S/F');

    for (var i = 0; i < bestSequenceStates.length; i++) {
        var s = bestSequenceStates[i];
        var action = AllActions[s.action];
        var actionName = action ? action.name : '';
        logger.log('%2d %30s %5.0f %5.0f %8.0f %8.0f %5.0f %5.0f %5.0f %5.0f %5.0f %5.0f %5.0f %-10s %5.0f', s.step, actionName, s.durabilityState, s.cpState, s.qualityState, s.progressState, s.iqCnt, s.wwywCnt, s.control, s.qualityGain, s.bProgressGain, s.bQualityGain, s.wastedActions, s.condition, s.success);
    }

    logger.log('');

    logger.log("Monte Carlo Worst Example");
    logger.log("==========================");
    logger.log('%-2s %30s %-5s %-5s %-8s %-8s %-5s %-5s %-5s %-5s %-5s %-5s %-5s %-10s %-5s', '#', 'Action', 'DUR', 'CP', 'QUA', 'PRG', 'IQ', 'WWYW', 'CTL', 'QINC', 'BPRG', 'BQUA', 'WAC', 'Cond', 'S/F');

    for (var i = 0; i < worseSequenceStates.length; i++) {
        var s = worseSequenceStates[i];
        var action = AllActions[s.action];
        var actionName = action ? action.name : '';
        logger.log('%2d %30s %5.0f %5.0f %8.0f %8.0f %5.0f %5.0f %5.0f %5.0f %5.0f %5.0f %5.0f %-10s %5.0f', s.step, actionName, s.durabilityState, s.cpState, s.qualityState, s.progressState, s.iqCnt, s.wwywCnt, s.control, s.qualityGain, s.bProgressGain, s.bQualityGain, s.wastedActions, s.condition, s.success);
    }

    logger.log('');

    return {
        successPercent: successRate,
        average: avgStats,
        median: mdnStats,
        min: minStats,
        max: maxStats,
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

function getMedianProperty(stateArray, propName, nRuns) {
    var listProperty = [];
    for (var i=0; i < stateArray.length; i++) {
        var chk = stateArray[i].checkViolations();
        var progressOk = chk.progressOk;
        var durabilityOk = chk.durabilityOk;
        var cpOk = chk.cpOk;

        if (progressOk && durabilityOk && cpOk) {
            listProperty.push(stateArray[i][propName]);
        }
    }

    listProperty.sort(function(a, b){return a-b});
    var medianPropIdx = Math.ceil(listProperty.length/2);

    return listProperty[medianPropIdx];
}

function getAverageHqPercent(stateArray) {
    // Because quality can exceed maxQuality, the average will be skewed high and we cannot use average quality as the input to the hqPercentFromQuality function
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

function getMedianHqPercent(stateArray) {
    // Because quality can exceed maxQuality, the median will be skewed high and we cannot use median quality as the input to the hqPercentFromQuality function
    var hqPercents = [];
    for (var i=0; i < stateArray.length; i++) {
        var chk = stateArray[i].checkViolations();
        var progressOk = chk.progressOk;
        var durabilityOk = chk.durabilityOk;
        var cpOk = chk.cpOk;

        if (progressOk && durabilityOk && cpOk) {
            var qualityPercent = Math.min(stateArray[i].synth.recipe.maxQuality, stateArray[i]['qualityState']) / stateArray[i].synth.recipe.maxQuality * 100;
            var hqProbability = hqPercentFromQuality(qualityPercent);
            hqPercents.push(hqProbability);
        }
    }

    hqPercents.sort(function(a, b){return a-b});
    var medianPropIdx = Math.ceil(hqPercents.length/2);

    return hqPercents[medianPropIdx];
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

function getMaxProperty(stateArray, propName) {
    var maxProperty = null;
    for (var i=0; i < stateArray.length; i++) {
        if (maxProperty === null) {
            maxProperty = stateArray[i][propName];
        }
        else {
            if (maxProperty < stateArray[i][propName]) {
                maxProperty = stateArray[i][propName];
            }
        }
    }
    return maxProperty;
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

    var result = simSynth(individual, startState, false, false, false);
    var penalties = 0;
    var fitness = 0;
    var fitnessProg = 0;

    // Sum the constraint violations
    penalties += result.wastedActions / 100;

    // Check for feasibility violations
    var chk = result.checkViolations();

    if (!chk.durabilityOk) {
       penalties += Math.abs(result.durabilityState);
    }

    if (!chk.progressOk) {
        penalties += Math.abs(mySynth.recipe.difficulty - Math.min(result.progressState, mySynth.recipe.difficulty));
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

    if (mySynth.maxLength > 0) {
        var maxActionsExceeded = individual.length - mySynth.maxLength;
        if (maxActionsExceeded > 0) {
            penalties += 0.1 * maxActionsExceeded;
        }
    }

    fitness += result.qualityState;
    fitness -= penaltyWeight * penalties;
    fitnessProg += result.progressState;

    return [fitness, fitnessProg, result.cpState, individual.length];
}

evalSeq.weights = [1.0, 1.0, 1.0, -1.0];

function heuristicSequenceBuilder(synth) {
    var sequence = [];
    var subSeq1 = [];
    var subSeq2 = [];
    var subSeq3 = [];
    var aa = AllActions;

    var cp = synth.crafter.craftPoints;
    var dur = synth.recipe.durability;
    var progress = 0;

    // Build a list of actions by short name so that we can easily perform lookups
    var actionsByName = {};
    for (var i = 0; i < synth.crafter.actions.length; i++) {
        var action = synth.crafter.actions[i];
        if (action) {
            actionsByName[action.shortName] = true;
        }
    }

    var hasAction = function(actionName) {
        return (actionName in actionsByName);
    };

    var tryAction = function(actionName) {
        return (hasAction(actionName) && cp >= aa[actionName].cpCost && dur - aa[actionName].durabilityCost >= 0);
    };

    var useAction = function(actionName) {
        cp -= aa[actionName].cpCost;
        dur -= aa[actionName].durabilityCost;
    };

    var pushAction = function(seq, actionName) {
        seq.push(aa[actionName]);
        useAction(actionName);
    };

    var unshiftAction = function(seq, actionName) {
        seq.unshift(aa[actionName]);
        useAction(actionName);
    };

    /* Progress to completion
        -- Use ingenuity if available and if recipe is higher level
        -- Determine base progress
        -- Determine best action to use from available list
        -- Steady hand if CS is not available
        -- Master's mend if more steps are needed
    */

    // If crafter level < recipe level and ingenuity 1/2 is available, use it.
    var effCrafterLevel = synth.crafter.level;
    if (LevelTable[synth.crafter.level]) {
        effCrafterLevel = LevelTable[synth.crafter.level];
    }
    var effRecipeLevel = synth.recipe.level;

    if ((effCrafterLevel < effRecipeLevel) && tryAction('ingenuity2')) {
        pushAction(subSeq1, 'ingenuity2');
        if (Ing2RecipeLevelTable[effRecipeLevel]) {
            //effRecipeLevel = Ing2RecipeLevelTable[effRecipeLevel];
        }
    }
    else if ((effCrafterLevel < effRecipeLevel) && tryAction('ingenuity')) {
        pushAction(subSeq1, 'ingenuity');
        if (Ing1RecipeLevelTable[synth.recipe.level]) {
            //effRecipeLevel = Ing1RecipeLevelTable[effRecipeLevel];
        }
    }

    // If Careful Synthesis 1/2 is available, use it
    var preferredAction = 'basicSynth';
    if (hasAction('carefulSynthesis2')) {
        preferredAction = 'carefulSynthesis2';
    }
    else if (hasAction('carefulSynthesis')) {
        preferredAction = 'carefulSynthesis';
    }
    else if (tryAction('steadyHand')) {
        pushAction(subSeq1,'steadyHand');
    }

    // Determine base progress
    var levelDifference = effCrafterLevel - effRecipeLevel;
    var bProgressGain = synth.calculateBaseProgressIncrease(levelDifference, synth.crafter.craftsmanship, effCrafterLevel, effRecipeLevel);
    var progressGain =  bProgressGain;
    progressGain *= aa[preferredAction].progressIncreaseMultiplier;
    progressGain = Math.floor(progressGain);

    var nProgSteps = Math.ceil(synth.recipe.difficulty / progressGain);
    var steps = 0;
    // Final step first
    if (tryAction(preferredAction)) {
        pushAction(subSeq3, preferredAction);
        progress += progressGain;
        steps += 1;
    }

    subSeq2 = [];
    while (progress < synth.recipe.difficulty && steps < nProgSteps) {
        // Don't want to increase progress at 5 durability unless we are able to complete the synth
        if (tryAction(preferredAction) && (dur >= 10)) {
            unshiftAction(subSeq2, preferredAction);
            progress += progressGain;
            steps += 1;
        }
        else if (synth.recipe.durability > 40 && tryAction('mastersMend2')) {
            unshiftAction(subSeq2, 'mastersMend2');
            dur += 60;
        }
        else if (tryAction('manipulation')) {
            unshiftAction(subSeq2, 'manipulation');
            dur += 30;
        }
        else if (tryAction('mastersMend')) {
            unshiftAction(subSeq2, 'mastersMend');
            dur += 30;
        }
        else {
            break;
        }
    }

    sequence = subSeq2.concat(subSeq3);
    sequence = subSeq1.concat(sequence);

    if (dur <= 20) {
        if (synth.recipe.durability > 40 && tryAction('mastersMend2')) {
            unshiftAction(sequence, 'mastersMend2');
            dur += 60;
        }
        else if (tryAction('manipulation')) {
            unshiftAction(sequence, 'manipulation');
            dur += 30;
        }
        else if (tryAction('mastersMend')) {
            unshiftAction(sequence, 'mastersMend');
            dur += 30;
        }
    }

    subSeq1 = [];
    subSeq2 = [];
    subSeq3 = [];
    /* Improve Quality
     -- Inner quiet at start
     -- Byregot's at end or other Inner Quiet consumer
    */

    // If we have inner quiet put it next
    if (tryAction('innerQuiet')) {
        pushAction(subSeq1, 'innerQuiet');
    }

    preferredAction = 'basicTouch';
    // If we have steady hand 2 and hasty touch use that combo
    if (hasAction('hastyTouch') && tryAction('steadyHand2')) {
        pushAction(subSeq1, 'steadyHand2');
        preferredAction = 'hastyTouch';
    }

    // else use steady hand + basic touch
    else if (tryAction('steadyHand') && cp >= aa.steadyHand.cpCost + aa.basicTouch.cpCost) {
        pushAction(subSeq1, 'steadyHand')
    }

    // ... and put in at least one quality improving action
    if (tryAction(preferredAction)) {
        pushAction(subSeq2, preferredAction);
    }

    subSeq1 = subSeq1.concat(subSeq2);

    // Now add in Byregot's Blessing at the end of the quality improving stage if we can
    if (tryAction('byregotsBlessing')) {
        unshiftAction(sequence, 'byregotsBlessing');
    }

    // ... and what the hell, throw in a great strides just before it
    if (tryAction('greatStrides')) {
        unshiftAction(sequence, 'greatStrides');
    }

    subSeq2 = [];
    // Use up any remaining durability and cp with quality / durability improving actions
    while (cp > 0 && dur > 0) {
        if (tryAction(preferredAction) && dur > 10) {
            pushAction(subSeq2, preferredAction);
        }
        else if (dur < 20) {
            if (synth.recipe.durability > 40 && tryAction('mastersMend2')) {
                pushAction(subSeq2, 'mastersMend2');
                dur += 60;
            }
            else if (tryAction('manipulation')) {
                unshiftAction(subSeq2, 'manipulation');
                dur += 30;
            }
            else if (tryAction('mastersMend')) {
                pushAction(subSeq2, 'mastersMend');
                dur += 30;
            }
            else {
                break;
            }
        }
        else {
            break;
        }
    }

    sequence = subSeq2.concat(sequence);
    sequence = subSeq1.concat(sequence);

    // If we have comfortzone and sequence is >= 10 actions put it at the start
    // No need to check cp since it is a net positive if there are more than 10 steps
    if (hasAction('comfortZone') && sequence.length >= 10) {
        unshiftAction(sequence, 'comfortZone');
        cp += 14;
    }

    // Pray
    return sequence;
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

var LevelTable = {
    51: 120, // 120
    52: 125, // 125
    53: 130, // 130
    54: 133, // 133
    55: 136, // 136
    56: 139, // 139
    57: 142, // 142
    58: 145, // 145
    59: 148, // 148
    60: 150, // 150
    61: 260,
    62: 265,
    63: 270,
    64: 273,
    65: 276,
    66: 279,
    67: 282,
    68: 285,
    69: 288,
    70: 290,
    71: 330,
    72: 343,
    73: 357,
    74: 370,
    75: 380,
    76: 390,
    77: 400,
    78: 410,
    79: 420,
    80: 430
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
    70: 51,     // 50_2star     *** unverified
    90: 58,     // 50_3star     *** unverified
    110: 59,    // 50_4star     *** unverified
    115: 100,   // 51 @ 169/339 difficulty
    120: 101,   // 51 @ 210/410 difficulty
    125: 102,   // 52
    130: 110,   // 53
    133: 111,   // 54
    136: 112,   // 55
    139: 126,   // 56
    142: 131,   // 57
    145: 134,   // 58
    148: 137,   // 59
    150: 140,   // 60
    160: 151,   // 60_1star
    180: 152,   // 60_2star
    210: 153,   // 60_3star
    220: 153,   // 60_3star
    250: 154,   // 60_4star
    255: 238,   // 61 @ 558/1116 difficulty
    260: 240,   // 61 @ 700/1400 difficulty
    265: 242,   // 62
    270: 250,   // 63
    273: 251,   // 64
    276: 252,   // 65
    279: 266,   // 66
    282: 271,   // 67
    285: 274,   // 68
    288: 277,   // 69
    290: 280,   // 70
    300: 291,   // 70_1star
    320: 292,   // 70_2star
    350: 293,   // 70_3star
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
    50: 42,
    55: 47,     // 50_1star     *** unverified
    70: 48,     // 50_2star     *** unverified
    90: 56,     // 50_3star     *** unverified
    110: 57,    // 50_4star     *** unverified
    115: 97,    // 51 @ 169/339 difficulty
    120: 99,    // 51 @ 210/410 difficulty
    125: 101,   // 52
    130: 109,   // 53
    133: 110,   // 54
    136: 111,   // 55
    139: 125,   // 56
    142: 130,   // 57
    145: 133,   // 58
    148: 136,   // 59
    150: 139,   // 60
    160: 150,   // 60_1star
    180: 151,   // 60_2star
    210: 152,   // 60_3star
    220: 152,   // 60_3star
    250: 153,   // 60_4star
    255: 237,   // 61 @ 558/1116 difficulty
    260: 239,   // 61 @ 700/1400 difficulty
    265: 241,   // 62
    270: 249,   // 63
    273: 250,   // 64
    276: 251,   // 65
    279: 265,   // 66
    282: 270,   // 67
    285: 273,   // 68
    288: 276,   // 69
    290: 279,   // 70
    300: 290,   // 70_1star
    320: 291,   // 70_2star
    350: 292,   // 70_3star
};

var NymeaisWheelTable = {
    1: 30,
    2: 30,
    3: 30,
    4: 20,
    5: 20,
    6: 20,
    7: 10,
    8: 10,
    9: 10,
    10: 10,
    11: 10
};

var ProgressPenaltyTable = {
    180: -0.02,
    210: -0.035,
    220: -0.035,
    250: -0.04,
    320: -0.02,
    350: -0.035,
};

var QualityPenaltyTable = {
    0: -0.02,
    90: -0.03,
    160: -0.05,
    180: -0.06,
    200: -0.07,
    245: -0.08,
    300: -0.09,
    310: -0.10,
    340: -0.11,
};

// Test objects
//cls, level, craftsmanship, control, craftPoints, actions
/*
var myWeaverActions = [basicSynth];
var myWeaver = new Crafter('Weaver', 20, 119, 117, 243, false, myWeaverActions);
var initiatesSlops = new Recipe(20,74,70,0,1053);
var mySynth = new Synth(myWeaver, initiatesSlops, maxTrickUses=1, useConditions=true);
var actionSequence = [innerQuiet, steadyHand, wasteNot, basicSynth, hastyTouch, hastyTouch, hastyTouch, steadyHand, hastyTouch, tricksOfTheTrade, standardTouch, standardTouch, standardTouch, tricksOfTheTrade, rumination, mastersMend, hastyTouch, basicSynth, basicTouch, basicSynth];

simSynth(actionSequence, mySynth, false, true);
MonteCarloSynth(actionSequence, mySynth, false, true);
MonteCarloSim(actionSequence, mySynth, 500);
evalSeq(actionSequence, mySynth);
*/