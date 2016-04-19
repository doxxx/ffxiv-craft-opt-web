"use strict";

angular.module('ffxivCraftOptWeb.controllers').controller('RecipeStartWithController', function ($scope, $modalInstance, _getActionImagePath, crafter, recipe, recipeStartWith, bonusStats) {

  $scope.getActionImagePath = _getActionImagePath;
  $scope.crafter = angular.copy(crafter);
  $scope.bonusStats = angular.copy(bonusStats);
  $scope.recipe = angular.copy(recipe);
  $scope.recipeStartWith = angular.extend({}, recipeStartWith);
  $scope.recipeStartWith.effects = angular.extend(new EffectTracker(), recipeStartWith.effects);
  $scope._recipeStartWith = angular.extend({}, recipeStartWith);

  $scope.tabs = {
    state : false,
    effects : true
  }

  // ----------------------------------------------------------------------------------------------
  // Actions exclusions : whenever action is selected, remove all excluded actions from effects list
  // Associate action to action list or name action pattern to exclude
  var Exclusions = {
    get : function(action){ return this[action.shortName] },
    add : function(actions, excluded){
      if (!angular || !excluded) return;

      var self = this;
      if (!angular.isArray(actions))
        actions = [ actions ]
      if (!angular.isArray(excluded))
        excluded = [ excluded ]

      actions.forEach(function(action){
        self[action.shortName] = excluded;
      });
    }
  };
  Exclusions.add(AllActions.steadyHand, AllActions.steadyHand2);
  Exclusions.add(AllActions.steadyHand2, AllActions.steadyHand);
  Exclusions.add(AllActions.wasteNot, AllActions.wasteNot2);
  Exclusions.add(AllActions.wasteNot2, AllActions.wasteNot);
  Exclusions.add(AllActions.ingenuity, AllActions.ingenuity2);
  Exclusions.add(AllActions.ingenuity2, AllActions.ingenuity);
  Exclusions.add(AllActions.ingenuity2, AllActions.ingenuity);
  Exclusions.add([
    AllActions.nameOfEarth,
    AllActions.nameOfFire,
    AllActions.nameOfIce,
    AllActions.nameOfLightning,
    AllActions.nameOfWater,
    AllActions.nameOfWind
  ], "nameOf");

  // ----------------------------------------------------------------------------------------------

  /**
   * Set effect list
   * @type {Array}
   */
  $scope.crafterEffectActions = []
  for (var i = 0; i < $scope.crafter.actions.length; i++) {
    var action = AllActions[$scope.crafter.actions[i]];
    if (action.type != "immediate")
      $scope.crafterEffectActions.push(action);
  }

  /**
   * Add effects action
   * @param action
   * @param order
   */
  $scope.makeEffect = function (action, order){
    var effects = $scope.recipeStartWith.effects.countDowns;
    var baseIndex = 1;

    if (action.type == "countup") {
      effects = $scope.recipeStartWith.effects.countUps;
      baseIndex = 0;
    }

    // Get active turns value. Handle specifics (Marker's mark/InnerQuiet/etc..)
    // --------------------------------------------
    var activeTurns = action.activeTurns;
    // Marker's mark, depend on recipe difficulty
    if (isActionEq(action, AllActions.makersMark)) {
      activeTurns = Math.ceil(recipe.difficulty / 100);
      if (activeTurns == 0)
        activeTurns = 1;
    }
    // Innerquiet, max is 11
    if (isActionEq(action, AllActions.innerQuiet)) {
      activeTurns = 11;
    }

    // First click : initialize effect
    // --------------------------------------------
    if (effects[action.shortName] == undefined){
      // Remove exclusions first
      applyExclusions(action);

      effects[action.shortName] = (action.type == "countup" ? baseIndex : activeTurns);
    }else{

    // Change effect value (+/-)
    // --------------------------------------------
      var value = effects[action.shortName] + (order < 0 ? -1 : 1);
      if (value > activeTurns + baseIndex - 1)
        value = baseIndex;
      if (value < baseIndex)
        value = activeTurns + baseIndex - 1;

      // Finally, set value
      // --------------------------------------------
      effects[action.shortName] = value;
    }
  }

  /**
   * Apply exclusions
   * @param action
   */
  var applyExclusions = function(action){
    var excludeList = Exclusions.get(action);
    if (!angular.isArray(excludeList))
      return;

    excludeList.forEach(function(exclude){
      if (angular.isObject(exclude))
        $scope.removeEffect(exclude);

      if (angular.isString(exclude)){
        $scope.crafterEffectActions.forEach(function(action){
          if (new RegExp(exclude).test(action.shortName))
            $scope.removeEffect(action);
        })
      }
    })
  }

  /**
   * Remove effect from list
   * @param e effect
   */
  $scope.removeEffect = function(e){
    if (!e) return;
    var actionName = e.shortName || e.name;
    if (!actionName) return;

    delete $scope.recipeStartWith.effects.countDowns[actionName];
    delete $scope.recipeStartWith.effects.countUps[actionName];
  }

  /**
   * Return true if nothing is set
   * @returns {boolean}
   */
  $scope.isEmptyState = function(){
    var startWith = $scope.recipeStartWith;

    return startWith.durability === undefined
        && startWith.difficulty === undefined
        && startWith.quality === undefined
        && startWith.cp === undefined
        && startWith.condition === undefined
        && Object.keys(startWith.effects.countUps).length == 0
        && Object.keys(startWith.effects.countDowns).length == 0;
  }

  /**
   * Indicate whether there is a user modification that can be reverted
   * @returns {boolean}
   */
  $scope.canRevert = function(){
    return angular.toJson($scope.recipeStartWith) != angular.toJson($scope._recipeStartWith);
  }

  $scope.save = function () {
    $modalInstance.close({
      recipeStartWith : $scope.recipeStartWith
    });
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  }

  $scope.revert = function () {
    $scope.recipeStartWith = angular.extend({}, $scope._recipeStartWith);
  }

  $scope.clear = function () {
    $scope.recipeStartWith = {
      effects : new EffectTracker()
    }
  }
});
