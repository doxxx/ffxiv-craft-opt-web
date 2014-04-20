//require('./String.js');

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
    this.condition = condition;

}

State.prototype.toString = function() {
    var iqCnt = 0;
    if (AllActions.innerQuiet.name in this.effects.countUps) {
        iqCnt = this.effects.countUps[AllActions.innerQuiet.name];
    }

    return this.durabilityState + ',' +
            this.cpState + ',' +
            this.qualityState + ',' +
            this.progressState + ',' +
            this.trickUses + ',' +
            iqCnt + ',' +
            this.condition;
}

function FeatureSet(myState, synth) {
    this.durabilityState = myState.durabilityState / synth.recipe.durability;
    this.cpState = myState.cpState / synth.crafter.craftPoints;
    this.qualityState = myState.qualityState / synth.recipe.maxQuality;
    this.progressState = myState.progressState / synth.recipe.difficulty;
    //this.wastedActions = wastedActions;
    //this.progressOk = progressOk;
    //this.cpOk = cpOk;
    //this.durabilityOk = durabilityOk;
    this.trickUses = myState.trickUses / synth.maxTrickUses;
    this.reliability = myState.reliability;
    //this.conditionGood = myState.conditionGood;
    //this.conditionPoor = myState.conditionPoor;
    //this.conditionExcellent = myState.conditionExcellent;

    //this.effects = effects;
    this.innerQuiet = myState.effects.countUps[AllActions.innerQuiet.name] || 0;
}

function Reward(state, synth) {
    var scalingFactor = 10;
    var reward = 0;

    // Penalize long sequences
    reward -= 1;

    // Termination state rewards
    if (IsTerminalState(state, synth)) {
        // Successful completion
        if (state.progressState >= synth.recipe.difficulty) {
            reward += 500;
        }

        // Failure due to loss of durability
        if (state.durabilityState <= 0 && state.progressState < synth.recipe.difficulty) {
            reward -= 500;
        }

    }
    else {
        reward += state.progressState / synth.recipe.difficulty;
        reward += state.qualityState / synth.recipe.maxQuality;
    }

    return reward;
}

function IsTerminalState(state, synth) {
    var isTerminalState = false;

    if (state.progressState >= synth.recipe.difficulty) {
        isTerminalState = true;
    }

    if (state.durabilityState <= 0) {

        isTerminalState = true;
    }

    return isTerminalState;
}

function QLearningAgent(synth, verbose, debug, logOutput) {
    verbose = verbose !== undefined ? verbose : true;
    debug = debug !== undefined ? debug : false;
    logOutput = logOutput !== undefined ? logOutput : null;

    var logger = new Logger(logOutput);

    this.epsilon = 0.05;
    this.gamma = 0.8;
    this.alpha = 0.2;
    this.numTraining = 0;
    this.synth = synth;
    this.discount = this.gamma;

    this.verbose = verbose;
    this.debug = debug;

    this.logOutput = logOutput;
    this.logger = logger;

    this.Q = {};

}

QLearningAgent.prototype.initialState = function(synth) {
    var durabilityState = synth.recipe.durability;
    var cpState = synth.crafter.craftPoints;
    var progressState = 0;
    var qualityState = synth.recipe.startQuality;
    var stepCount = 0;
    var wastedActions = 0;
    var effects = new EffectTracker();
    var maxTricksUses = 0;
    var trickUses = 0;
    var reliability = 1;
    var crossClassActionList = {};
    var crossClassActionCounter = 0;
    var useConditions = synth.useConditions;

    var condition = 'Normal';

    // Intialize final state checks
    var progressOk = false;
    var cpOk = false;
    var durabilityOk = false;
    var trickOk = false;
    var reliabilityOk = false;

    // Initialize state variables
    var startState = new State(stepCount, '', durabilityState, cpState, qualityState, progressState,
                       wastedActions, progressOk, cpOk, durabilityOk, trickUses, reliability, crossClassActionList, effects, condition);

    if (this.debug) {
        this.logger.log('%-2s %20s %-5s %-5s %-8s %-5s %-5s %-5s %-5s %-5s %-5s %-5s', '#', 'Action', 'DUR', 'CP', 'EQUA', 'EPRG', 'WAC', 'IQ', 'CTL', 'QINC', 'BPRG', 'BQUA');
        this.logger.log('%2d %20s %5.0f %5.0f %8.1f %5.1f %5.0f %5.1f %5.0f %5.0f', stepCount, '', durabilityState, cpState, qualityState, progressState, wastedActions, 0, synth.crafter.control, 0);
    }
    else if (this.verbose) {
        this.logger.log('%-2s %20s %-5s %-5s %-8s %-5s %-5s', '#', 'Action', 'DUR', 'CP', 'EQUA', 'EPRG', 'WAC');
        this.logger.log('%2d %20s %5.0f %5.0f %8.1f %5.1f %5.0f', stepCount, '', durabilityState, cpState, qualityState, progressState, wastedActions);

    }

    return startState;
}

QLearningAgent.prototype.getQValue = function(state, action) {
    var Q = this.Q;

    if (Q[state] === undefined) {
        Q[state] = {};
    }

    if (Q[state][action.name] === undefined) {
        Q[state][action.name] = 0;
    }

    //this.logger.log('Q[%s][%s]: %5.2f', state, action.name, Q[state][action.name])

    return Q[state][action.name];
}

QLearningAgent.prototype.getValue = function(state) {
    return this.computeValueFromQValues(state);
}

QLearningAgent.prototype.getPolicy = function(state) {
    return this.computeActionFromQValues(state);
}

function getMaxOfArray(numArray) {
    return Math.max.apply(null, numArray);
}

QLearningAgent.prototype.computeValueFromQValues = function(state) {
    // Return max_action Q (state, action)
    // where max is over all *legalActions*
    // If there are no legal actions then return 0.0

    var value = 0;
    var actions = this.getLegalActions(state);
    if (actions.length > 0) {
        var self = this;
        function fn(action) {
            return self.getQValue(state, action);
        }
        var myArray = [];
        for (var i = 0; i < actions.length; i++) {
            myArray.push(fn(actions[i]));
        }
        value = getMaxOfArray(myArray);
    }

    return value;
}

QLearningAgent.prototype.computeActionFromQValues = function(state) {
    // Return the best action to take in a state.
    // If there are no legal actions return null

    var actionMax = null;
    var actions = this.getLegalActions(state);
    if (actions.length > 0) {
        var self = this;
        function fn(action) {
            return self.getQValue(state, action);
        }
        var myArray = [];
        var myDict = {};
        for (var i = 0; i < actions.length; i++) {
            var Q = fn(actions[i])
            if (this.debug) {
                //this.logger.log('ComputeActionFromQValues [DUR: %5.2f  CP: %5.2f  QUA: %5.2f  PRG: %5.2f] [%s]: %5.2f', state.durabilityState, state.cpState, state.qualityState, state.progressState, actions[i].name, Q)
            }
            myArray.push(Q);
            // TIEBREAKER: if myDict Q currently exists, flip a coin to see if we replace the current action
            if (myDict[Q]) {
                if (getRandomInt(0, 1) > 0) {
                    myDict[Q] = actions[i];
                }
            }
            else {
                myDict[Q] = actions[i];
            }
        }
        var Qkey = getMaxOfArray(myArray);
        actionMax = myDict[Qkey];
    }

    return actionMax;
}

QLearningAgent.prototype.getObservation = function(state, action) {
    // Call exactly once per step through because it uses random and value will
    // change from function call to function call

    var newState = MonteCarloStep(this.synth, state, action, this.verbose, this.debug, this.logOutput);
    var rewardDelta = Reward(newState, this.synth) - Reward(state, this.synth);

    var observation = {};
    observation.startState = state;
    observation.action = action;
    observation.nextState = newState;
    observation.reward = rewardDelta;

    return observation;
}

QLearningAgent.prototype.getLegalActions = function(state) {
    // Hard coded for now
    var legalActions = [];

    if (!IsTerminalState(state, this.synth, this.logger)) {
        var availableActions = [];
        availableActions[0] = AllActions.basicTouch;
        availableActions[1] = AllActions.basicSynth;

        for (var i = 0; i < availableActions.length; i++) {
            // Check that we have enough CP for this action
            if (state.cpState - availableActions[i].cpCost >= 0) {
                legalActions.push(availableActions[i])
            }
        }

    }

    return legalActions;
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

QLearningAgent.prototype.getAction = function(state) {
    // Compute the action to take in the current state.  With
    // probability self.epsilon, we should take a random action and
    // take the best policy action otherwise.  Note that if there are
    // no legal actions, which is the case at the terminal state, you
    // should choose None as the action.

    var action = null;
    var legalActions = this.getLegalActions(state);

    if (this.debug) {
        //this.logger.log('Number of legalActions available: %2d', legalActions.length);
        //for (var i = 0; i < legalActions.length; i++) {
        //    this.logger.log('[%d] %20s', i, legalActions[i].name);
        //}
        //this.logger.log('End of legalActions');
    }

    if (legalActions.length > 0) {
        if (Math.random() < this.epsilon) {
            var randomIndex = getRandomInt(0, legalActions.length - 1);
            action = legalActions[randomIndex];
        }
        else {
            action = this.computeActionFromQValues(state);
        }
    }

    if (this.debug && action != null) {
        //this.logger.log('GetAction: %20s', action.name || 'undefined')
    }

    return action;
}

QLearningAgent.prototype.update = function(state, action, nextState, reward) {
    //var stateString = getStateString(state);
    var oldQ = this.getQValue(state, action);
    this.Q[state][action.name] = (1 - this.alpha) * oldQ + this.alpha * (reward + this.discount * this.getValue(nextState))
}

function ApproximateAgent(synth, verbose, debug, logOutput) {
    QLearningAgent.call(this, synth, verbose, debug, logOutput);

    this.weights = {};
}

ApproximateAgent.prototype = new QLearningAgent();

ApproximateAgent.prototype.getQValue = function(state, action) {
    var features = this.getFeatures(state, action);
    var weights = this.getWeights();

    var dotProd = 0;
    for (var feature in features) {
        if (!(feature in weights)) {
            weights[feature] = 1.0;
        }
        if (this.debug) {
            //this.logger.log('GetQValue: [%s] Weight: %5.2f FVal: %5.2f', feature, weights[feature], features[feature])
        }
        dotProd += weights[feature] * features[feature];
    }

    return dotProd;
}

ApproximateAgent.prototype.getWeights = function() {
    return this.weights;
}

ApproximateAgent.prototype.getFeatures = function(state, action) {
    var features = new FeatureSet(state, this.synth);

    return features;
}

ApproximateAgent.prototype.update = function(state, action, nextState, reward) {

    var feats = this.getFeatures(state, action);
    var oldQ = this.getQValue(state, action);
    var nextValue = this.getValue(nextState);
    var diff = (reward + this.discount * nextValue) - oldQ;

    var weights = this.getWeights();
    if (this.debug) {
        //this.logger.log('nextValue: %5.2f, oldQ: %5.2f, diff: %5.2f, reward: %5.2f, discount: %5.2f', nextValue, oldQ, diff, reward, this.discount);
    }

    for (feat in weights) {
        weights[feat] += this.alpha * diff * feats[feat]
    }

}

function ReinforcementLearningAlgorithm(synth, verbose, debug, logOutput) {
    verbose = verbose !== undefined ? verbose : true;
    debug = debug !== undefined ? debug : false;
    logOutput = logOutput !== undefined ? logOutput : null;

    var logger = new Logger(logOutput);

    // Iterate for a given number of episodes (series of actions until termination)
        // Initialize starting state
        // repeat until no actions are available
        // getAction(state) (random from legalActions)
        // update(state, action, newstate, reward(state, action, newstate))
        // state = newstate

    var episodes = 0;
    var n = 50;

    //var myAgent = new ApproximateAgent(synth, false, false, logOutput);
    var myAgent = new QLearningAgent(synth, false, false, logOutput);

    while (episodes < n) {

        var newState = myAgent.initialState(synth);
        var state = newState;

        var action = myAgent.getAction(state);

        do {
            var observation = myAgent.getObservation(state, action);
            newState = observation.nextState;
            var reward = observation.reward;

            myAgent.update(state, action, newState, reward);
            state = newState;

            action = myAgent.getAction(state)
        } while (action != null);

        if (debug) {
            logger.log('Episode %d complete.', episodes)
        }

        episodes += 1;
    }

    logger.log('Episodes run: %d', episodes)

    if (myAgent.weights) {
        var weights = myAgent.getWeights()
        logger.log('\nFinal Weights', episodes)
        logger.log('=============', episodes)
        for (var myProp in weights) {
            logger.log('%20s: %5.3f', myProp, weights[myProp]);
        }
    }
    else {
        var Q = myAgent.Q;
        for (var aState in Q) {
            for (var myAction in Q[aState]) {
                //logger.log('Q[DUR: %5.2f  CP: %5.2f  QUA: %5.2f  PRG: %5.2f] [%s]: %5.2f', state.durabilityState, state.cpState, state.qualityState, state.progressState, myAction.name, Q[aState][myAction]);
                logger.log('Q[%s][%s]: %5.2f', aState, myAction, Q[aState][myAction]);
            }
        }
    }

    logger.log('\nPolicy', episodes)
    logger.log('========', episodes)

    // Follow the optimal policy
    //==========================
    myAgent.verbose = true;

    var newState = myAgent.initialState(synth);
    var state = newState;
    var action = myAgent.getPolicy(state);

    do {
        var observation = myAgent.getObservation(state, action);
        newState = observation.nextState;
        state = newState;
        action = myAgent.getAction(state)
    } while (action != null);
}

function simSynth(individual, synth, verbose, debug, logOutput) {
    verbose = verbose !== undefined ? verbose : true;
    debug = debug !== undefined ? debug : false;
    logOutput = logOutput !== undefined ? logOutput : null;

    var logger = new Logger(logOutput);

    // State tracking
    var durabilityState = synth.recipe.durability;
    var cpState = synth.crafter.craftPoints;
    var progressState = 0;
    var qualityState = synth.recipe.startQuality;
    var stepCount = 0;
    var wastedActions = 0;
    var effects = new EffectTracker();
    var trickUses = 0;
    var reliability = 1;
    var crossClassActionList = {};
    var crossClassActionCounter = 0;
    var useConditions = synth.useConditions;

    // Conditions
    var pGood = 0.23;
    var pExcellent = 0.01;

    // Step 1 is always normal
    var ppGood = 0;
    var ppExcellent = 0;
    var ppPoor = 0;
    var ppNormal = 1 - (ppGood + ppExcellent + ppPoor);

    // End state checks
    var progressOk = false;
    var cpOk = false;
    var durabilityOk = false;
    var trickOk = false;
    var reliabilityOk = false;

    // Check for null or empty individuals
    if (individual === null || individual.length === 0) {
        return new State(stepCount, '', durabilityState, cpState, qualityState, progressState,
                           wastedActions, progressOk, cpOk, durabilityOk, trickUses, reliability, crossClassActionList);
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

        // Add effect modifiers
        var craftsmanship = synth.crafter.craftsmanship;
        var control = synth.crafter.control;
        if (AllActions.innerQuiet.name in effects.countUps) {
            control += (0.2 * effects.countUps[AllActions.innerQuiet.name]) * synth.crafter.control;
        }

        if (AllActions.innovation.name in effects.countDowns) {
            control += 0.5 * synth.crafter.control;
        }

        var levelDifference = synth.crafter.level - synth.recipe.level;
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

        var qualityIncreaseMultiplier = action.qualityIncreaseMultiplier;
        if (AllActions.greatStrides.name in effects.countDowns) {
            qualityIncreaseMultiplier *= 2;
        }

        // Condition Calculation
        if (useConditions) {
            qualityIncreaseMultiplier *= (1*ppNormal + 1.5*ppGood * Math.pow(1 - (ppGood+pGood)/2, synth.maxTrickUses) + 4*ppExcellent + 0.5*ppPoor);
        }

        // Calculate final gains / losses
        var bProgressGain = action.progressIncreaseMultiplier * synth.calculateBaseProgressIncrease(levelDifference, craftsmanship);
        if (isActionEq(action, AllActions.flawlessSynthesis)) {
            bProgressGain = 40;
        }
        else if (isActionEq(action, AllActions.pieceByPiece)) {
            bProgressGain = (synth.recipe.difficulty - progressState)/3;
        }
        var progressGain = bProgressGain;

        var bQualityGain = qualityIncreaseMultiplier * synth.calculateBaseQualityIncrease(levelDifference, control, synth.recipe.level);
        var qualityGain = bQualityGain;
        if (isActionEq(action, AllActions.byregotsBlessing) && AllActions.innerQuiet.name in effects.countUps) {
            qualityGain *= (1 + 0.2 * effects.countUps[AllActions.innerQuiet.name]);
        }

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

            if ((AllActions.comfortZone.name in effects.countDowns) && (cpState > 0)) {
                cpState += 8;
            }

            if ((isActionEq(action, AllActions.rumination)) && (cpState > 0)) {
                if ((AllActions.innerQuiet.name in effects.countUps) && (effects.countUps[AllActions.innerQuiet.name] > 0)) {
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

function MonteCarloStep(synth, startState, action, verbose, debug, logOutput) {
    verbose = verbose !== undefined ? verbose : true;
    debug = debug !== undefined ? debug : false;
    logOutput = logOutput !== undefined ? logOutput : null;

    var logger = new Logger(logOutput);

    // State Tracking
    var durabilityState = startState.durabilityState
    var cpState = startState.cpState;
    var progressState = startState.progressState;
    var qualityState = startState.qualityState;
    var stepCount = startState.step;
    var wastedActions = startState.wastedActions;
    var effects = startState.effects;
    var trickUses = startState.trickUses;
    var reliability = startState.reliability;
    var crossClassActionList = startState.crossClassActionList;
    var crossClassActionCounter = 0;

    var condition = startState.condition;

    // Conditions
    var pGood = 0.23;
    var pExcellent = 0.01;

    // End state checks
    var progressOk = startState.progressOk;
    var cpOk = startState.cpOk;
    var durabilityOk = startState.durabilityOk;
    var trickOk = false;

    stepCount += 1;

    // Add effect modifiers
    var craftsmanship = synth.crafter.craftsmanship;
    var control = synth.crafter.control;
    if (AllActions.innerQuiet.name in effects.countUps) {
        control += (0.2 * effects.countUps[AllActions.innerQuiet.name]) * synth.crafter.control;
    }

    if (AllActions.innovation.name in effects.countDowns) {
        control += 0.5 * synth.crafter.control;
    }

    // Control is floored before display based on IQ incremental observations
    control = Math.floor(control);

    var levelDifference = synth.crafter.level - synth.recipe.level;
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

    if (AllActions.steadyHand2.name in effects.countDowns) {
        successProbability = action.successProbability + 0.3;        // Assume 2 always overrides 1
    }
    else if (AllActions.steadyHand.name in effects.countDowns) {
        successProbability = action.successProbability + 0.2;
    }
    else {
        successProbability = action.successProbability;
    }
    var successProbability = Math.min(successProbability, 1);

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

    var bProgressGain = action.progressIncreaseMultiplier * synth.calculateBaseProgressIncrease(levelDifference, craftsmanship);
    if (isActionEq(action, AllActions.flawlessSynthesis)) {
        bProgressGain = 40;
    }
    else if (isActionEq(action, AllActions.pieceByPiece)) {
        bProgressGain = (synth.recipe.difficulty - progressState)/3;
    }
    var progressGain = success * bProgressGain;

    var bQualityGain = qualityIncreaseMultiplier * synth.calculateBaseQualityIncrease(levelDifference, control, synth.recipe.level);
    var qualityGain = success * bQualityGain;
    if (isActionEq(action, AllActions.byregotsBlessing) && AllActions.innerQuiet.name in effects.countUps) {
        qualityGain *= (1 + 0.2 * effects.countUps[AllActions.innerQuiet.name]);
    }

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

        if (AllActions.comfortZone.name in effects.countDowns && cpState > 0) {
            cpState += 8;
        }

        if (isActionEq(action, AllActions.rumination) && cpState > 0) {
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

        if (isActionEq(action, AllActions.tricksOfTheTrade) && cpState > 0 && condition == 'Good') {
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

    // Penalise failure outcomes *** REVIEW ***
    if (progressState >= synth.recipe.difficulty) {
        progressOk = true;
    }

    if (cpState >= 0) {
        cpOk = true;
    }

    if (durabilityState >= 0 && progressState >= synth.recipe.difficulty) {
        durabilityOk = true;
    }

    // Ending condition
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

    var finalState = new State(stepCount, action.name, durabilityState, cpState, qualityState, progressState,
                       wastedActions, progressOk, cpOk, durabilityOk, trickUses, reliability, crossClassActionList, effects, condition);

    return finalState;

}

function MonteCarloSequence(individual, synth, overrideTotT, verbose, debug, logOutput) {
    overrideTotT = overrideTotT !== undefined ? overrideTotT : true;
    verbose = verbose !== undefined ? verbose : true;
    debug = debug !== undefined ? debug : false;
    logOutput = logOutput !== undefined ? logOutput : null;

    var logger = new Logger(logOutput);

    // Initialize state values
    var durabilityState = synth.recipe.durability;
    var cpState = synth.crafter.craftPoints;
    var progressState = 0;
    var qualityState = synth.recipe.startQuality;
    var stepCount = 0;
    var wastedActions = 0;
    var effects = new EffectTracker();
    var maxTricksUses = 0;
    var trickUses = 0;
    var reliability = 1;
    var crossClassActionList = {};
    var crossClassActionCounter = 0;
    var useConditions = synth.useConditions;

    var condition = 'Normal';

    // Intialize final state checks
    var progressOk = false;
    var cpOk = false;
    var durabilityOk = false;
    var trickOk = false;
    var reliabilityOk = false;


    // Initialize state variables
    var startState = new State(stepCount, '', durabilityState, cpState, qualityState, progressState,
                       wastedActions, progressOk, cpOk, durabilityOk, trickUses, reliability, crossClassActionList, effects, condition);

    var finalState = new State(stepCount, '', durabilityState, cpState, qualityState, progressState,
                       wastedActions, progressOk, cpOk, durabilityOk, trickUses, reliability, crossClassActionList, effects, condition);

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
        logger.log('%-2s %20s %-5s %-5s %-8s %-5s %-5s %-5s %-5s %-5s %-5s %-5s', '#', 'Action', 'DUR', 'CP', 'EQUA', 'EPRG', 'WAC', 'IQ', 'CTL', 'QINC', 'BPRG', 'BQUA');
        logger.log('%2d %20s %5.0f %5.0f %8.1f %5.1f %5.0f %5.1f %5.0f %5.0f', stepCount, '', durabilityState, cpState, qualityState, progressState, wastedActions, 0, synth.crafter.control, 0);
    }
    else if (verbose) {
        logger.log('%-2s %20s %-5s %-5s %-8s %-5s %-5s', '#', 'Action', 'DUR', 'CP', 'EQUA', 'EPRG', 'WAC');
        logger.log('%2d %20s %5.0f %5.0f %8.1f %5.1f %5.0f', stepCount, '', durabilityState, cpState, qualityState, progressState, wastedActions);

    }

    for (i=0; i < individual.length; i++) {
        var action = individual[i];
        startState = finalState;

        if (overrideTotT) {
            // Manually re-add tricks of the trade when condition is good
            if (finalState.condition == 'Good' && finalState.trickUses < maxTricksUses) {
                finalState = MonteCarloStep(synth, startState, AllActions.tricksOfTheTrade, verbose, debug, logOutput);
                startState = finalState;
            }
        }
        finalState = MonteCarloStep(synth, startState, action, verbose, debug, logOutput);
    }

    // Penalise failure outcomes
    if (finalState.trickUses <= synth.maxTrickUses) {
        trickOk = true;
    }

    for (var crossClassAction in finalState.crossClassActionList) {
        crossClassActionCounter += 1;
    }

    if (finalState.progressState >= synth.recipe.difficulty) {
        progressOk = true;
    }

    if (finalState.cpState >= 0) {
        cpOk = true;
    }

    if (finalState.durabilityState >= -5 && finalState.progressState >= synth.recipe.difficulty) {
        durabilityOk = true;
    }

    if (finalState.reliability >= synth.reliabilityIndex) {
        reliabilityOk = true;
    }

    if (debug) {
        logger.log('Progress Check: %s, Durability Check: %s, CP Check: %s, Tricks Check: %s, Reliability Check: %s, Cross Class Skills: %d, Wasted Actions: %d', progressOk, durabilityOk, cpOk, trickOk, reliabilityOk, crossClassActionCounter, finalState.wastedActions);
    }
    else if (verbose) {
        logger.log('Progress Check: %s, Durability Check: %s, CP Check: %s, Tricks Check: %s, Reliability Check: %s, Cross Class Skills: %d, Wasted Actions: %d', progressOk, durabilityOk, cpOk, trickOk, reliabilityOk, crossClassActionCounter, finalState.wastedActions);
    }

    return finalState;

}

function MonteCarloSynth(individual, synth, verbose, debug, logOutput) {
    verbose = verbose !== undefined ? verbose : true;
    debug = debug !== undefined ? debug : false;
    logOutput = logOutput !== undefined ? logOutput : null;

    var logger = new Logger(logOutput);

    // State Tracking
    var durabilityState = synth.recipe.durability;
    var cpState = synth.crafter.craftPoints;
    var progressState = 0;
    var qualityState = synth.recipe.startQuality;
    var stepCount = 0;
    var wastedActions = 0;
    var effects = new EffectTracker();
    var maxTricksUses = 0;
    var trickUses = 0;
    var reliability = 1;
    var crossClassActionList = {};
    var crossClassActionCounter = 0;
    var useConditions = synth.useConditions;

    var condition = 'Normal';

    // Conditions
    var pGood = 0.23;
    var pExcellent = 0.01;

    // End state checks
    var progressOk = false;
    var cpOk = false;
    var durabilityOk = false;
    var trickOk = false;
    var reliabilityOk = false;

    // Check for null or empty individuals
    if (individual === null || individual.length === 0) {
        return new State(stepCount, '', durabilityState, cpState, qualityState, progressState,
                           wastedActions, progressOk, cpOk, durabilityOk, trickUses, reliability, crossClassActionList);
    }

    // Strip Tricks of the Trade from individual
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

    if (debug) {
        logger.log('%-2s %20s %-5s %-5s %-8s %-5s %-5s %-5s %-5s %-5s %-5s %-5s', '#', 'Action', 'DUR', 'CP', 'EQUA', 'EPRG', 'WAC', 'IQ', 'CTL', 'QINC', 'BPRG', 'BQUA');
        logger.log('%2d %20s %5.0f %5.0f %8.1f %5.1f %5.0f %5.1f %5.0f %5.0f', stepCount, '', durabilityState, cpState, qualityState, progressState, wastedActions, 0, synth.crafter.control, 0);
    }
    else if (verbose) {
        logger.log('%-2s %20s %-5s %-5s %-8s %-5s %-5s', '#', 'Action', 'DUR', 'CP', 'EQUA', 'EPRG', 'WAC');
        logger.log('%2d %20s %5.0f %5.0f %8.1f %5.1f %5.0f', stepCount, '', durabilityState, cpState, qualityState, progressState, wastedActions);

    }

    for (i=0; i < individual.length; i++) {
        var action = individual[i];
        stepCount += 1;

        // Add effect modifiers
        var craftsmanship = synth.crafter.craftsmanship;
        var control = synth.crafter.control;
        if (AllActions.innerQuiet.name in effects.countUps) {
            control += (0.2 * effects.countUps[AllActions.innerQuiet.name]) * synth.crafter.control;
        }

        if (AllActions.innovation.name in effects.countDowns) {
            control += 0.5 * synth.crafter.control;

        }

        // Control is floored before display based on IQ incremental observations
        control = Math.floor(control);

        var levelDifference = synth.crafter.level - synth.recipe.level;
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

        if (AllActions.steadyHand2.name in effects.countDowns) {
            successProbability = action.successProbability + 0.3;        // Assume 2 always overrides 1
        }
        else if (AllActions.steadyHand.name in effects.countDowns) {
            successProbability = action.successProbability + 0.2;
        }
        else {
            successProbability = action.successProbability;
        }
        var successProbability = Math.min(successProbability, 1);

        var qualityIncreaseMultiplier = action.qualityIncreaseMultiplier;
        if (AllActions.greatStrides.name in effects.countDowns) {
            qualityIncreaseMultiplier *= 2;
        }

        // Condition Calculation
        if (condition === 'Excellent') {
            condition = 'Poor';
            if (useConditions) {
                qualityIncreaseMultiplier *= 0.5;
            }
        }
        else if (condition === 'Good' || condition === 'Poor') {
            condition = 'Normal';
        }
        else if (condition === 'Normal' && i > 0) {
            var condRand = Math.random();
            if (0 <= condRand && condRand < pExcellent) {
                condition = 'Excellent';
                if (useConditions) {
                    qualityIncreaseMultiplier *= 4;
                }
            }
            else if (pExcellent <= condRand && condRand < (pExcellent + pGood)) {
                condition = 'Good';

                if (trickUses < maxTricksUses && cpState >= 0) {
                    // Assumes first N good actions will always be used for ToT
                    trickUses += 1;
                    cpState += 20;
                    cpState = Math.min(cpState, synth.crafter.craftPoints);
                    condition = 'Normal';
                    if (useConditions) {
                        qualityIncreaseMultiplier *= 1;
                    }

                    if (debug) {
                        logger.log('%-2s %20s %5.0f %5.0f %8.1f %5.1f %5.0f %5.1f %5.0f %5.0f %5.0f %5.0f', '-', 'Tricks of the Trade', durabilityState, cpState, qualityState, progressState, wastedActions, iqCnt, control, qualityGain, bProgressGain, bQualityGain);
                    }
                    else if (verbose) {
                        logger.log('%-2s %20s %5.0f %5.0f %8.1f %5.1f %5.0f', '-', 'Tricks of the Trade', durabilityState, cpState, qualityState, progressState, wastedActions);
                    }

                }
                else{
                    if (useConditions) {
                        qualityIncreaseMultiplier *= 1.5;
                    }
                }
            }
            else {
                condition = 'Normal';
                if (useConditions) {
                    qualityIncreaseMultiplier *= 1;
                }
            }
        }

        // Calculate final gains / losses
        var success = 0;
        var successRand = Math.random();
        if (0 <= successRand && successRand <= successProbability) {
            success = 1;
        }

        var bProgressGain = action.progressIncreaseMultiplier * synth.calculateBaseProgressIncrease(levelDifference, craftsmanship);
        if (isActionEq(action, AllActions.flawlessSynthesis)) {
            bProgressGain = 40;
        }
        else if (isActionEq(action, AllActions.pieceByPiece)) {
            bProgressGain = (synth.recipe.difficulty - progressState)/3;
        }
        var progressGain = success * bProgressGain;

        var bQualityGain = qualityIncreaseMultiplier * synth.calculateBaseQualityIncrease(levelDifference, control, synth.recipe.level);
        var qualityGain = success * bQualityGain;
        if (isActionEq(action, AllActions.byregotsBlessing) && AllActions.innerQuiet.name in effects.countUps) {
            qualityGain *= (1 + 0.2 * effects.countUps[AllActions.innerQuiet.name]);
        }

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

            if (AllActions.comfortZone.name in effects.countDowns && cpState > 0) {
                cpState += 8;
            }

            if (isActionEq(action, AllActions.rumination) && cpState > 0) {
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

            if (isActionEq(action, AllActions.tricksOfTheTrade) && cpState > 0) {
                trickUses += 1;
                cpState += 20;
            }

            // Decrement countdowns
            for (var countDown in effects.countDowns) {
                effects.countDowns[countDown] -= 1;
                if (effects.countDowns[countDown] === 0) {
                    delete effects.countDowns[countDown];
                }
            }

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

    if (durabilityState >= 0 && progressState >= synth.recipe.difficulty) {
        durabilityOk = true;
    }

    if (trickUses <= synth.maxTrickUses) {
        trickOk = true;
    }

    if (reliability >= synth.reliabilityIndex) {
        reliabilityOk = true;
    }

    var finalState = new State(stepCount, individual[individual.length-1].name, durabilityState, cpState, qualityState, progressState,
                       wastedActions, progressOk, cpOk, durabilityOk, trickUses, reliability, crossClassActionList);

    if (debug) {
        logger.log('Progress Check: %s, Durability Check: %s, CP Check: %s, Tricks Check: %s, Reliability Check: %s, Cross Class Skills: %d, Wasted Actions: %d', progressOk, durabilityOk, cpOk, trickOk, reliabilityOk, crossClassActionCounter, wastedActions);
    }
    else if (verbose) {
        logger.log('Progress Check: %s, Durability Check: %s, CP Check: %s, Tricks Check: %s, Reliability Check: %s, Cross Class Skills: %d, Wasted Actions: %d', progressOk, durabilityOk, cpOk, trickOk, reliabilityOk, crossClassActionCounter, wastedActions);
    }

    return finalState;
}

function MonteCarloSim(individual, synth, nRuns, verbose, debug, logOutput) {
    verbose = verbose !== undefined ? verbose : false;
    debug = debug !== undefined ? debug : false;
    logOutput = logOutput !== undefined ? logOutput : null;

    var logger = new Logger(logOutput);

    var finalStateTracker = [];
    for (var i=0; i < nRuns; i++) {
        var runSynth = MonteCarloSynth(individual, synth, false, false, logOutput);
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

    //logger.log('\nMonteCarloSequence');

    //MonteCarloSequence(individual, synth, true, false, true, logOutput);

    logger.log('\nReinforcement Learning');
    logger.log(  '======================');
    ReinforcementLearningAlgorithm(synth, verbose, debug, logOutput);
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

    var result = simSynth(individual, mySynth, false, false);
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

// Actions
//parameters: shortName,  name, durabilityCost, cpCost, successProbability, qualityIncreaseMultiplier, progressIncreaseMultiplier, aType, activeTurns, cls, level
var AllActions = {
  dummyAction: new Action(       'dummyAction',          '______________',       0,  0,      1, 0.0, 0.0, 'immediate',   1,  'All',          1),
  observe: new Action(           'observe',              'Observe',              0, 14,      1, 0.0, 0.0, 'immediate',   1,  'All',          1),

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
  ingenuity2: new Action(        'ingenuity2',           'Ingenuity II',         0,   32,  1.0, 0.0, 0.0, 'countdown',   5,  'Blacksmith',   50)
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
