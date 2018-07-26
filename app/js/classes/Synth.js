var ProgressPenaltyTable = {
  180: -0.02,
  210: -0.035,
  220: -0.035,
  250: -0.04,
  320: -0.02,
  350: -0.035,
}

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

  if (crafterLevel > 250) {
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

Synth.prototype.getPropabilityOfGoodCondition = function () {
  var recipeLevel = this.recipe.level;
  var qualityAssurance = this.crafter.level >= 63;
  var result;
  switch (true) {
    case recipeLevel >= 300: // 70*+
      result = qualityAssurance ? 0.11 : 0.10;
      break;
    case recipeLevel >= 276: // 65+
      result = qualityAssurance ? 0.17 : 0.15;
      break;
    case recipeLevel >= 255: // 61+
      result = qualityAssurance ? 0.22 : 0.20;
      break;
    case recipeLevel >= 150: // 60+
      result = qualityAssurance ? 0.11 : 0.10;
      break;
    case recipeLevel >= 136: // 55+
      result = qualityAssurance ? 0.17 : 0.15;
      break;
    default:
      result = qualityAssurance ? 0.27 : 0.25;
  }
  return result;
}

Synth.prototype.getPropabilityOfExcelentCondition = function () {
  var recipeLevel = this.recipe.level;
  var result;
  switch (true) {
    case recipeLevel >= 300: // 70*+
      result = 0.01;
      break;
    case recipeLevel >= 255: // 61+
      result = 0.02
      break;
    case recipeLevel >= 150: // 60+
      result = 0.01;
      break;
    default:
      result = 0.02;
  }
  return result;
}
