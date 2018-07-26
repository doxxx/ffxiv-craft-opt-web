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
  this.condition = condition;

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

  // Consider removing sanity check in updateState
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

State.createStateFromSynth = function (synth) {
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
