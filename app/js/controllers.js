'use strict';

/* Controllers */

angular.module('ffxivCraftOptWeb.controllers', [])
  .controller('MainCtrl',
  function ($scope, $http, $location, $modal, $document, $timeout, $filter, $state, _getSolverServiceURL, _allClasses,
    _actionGroups, _allActions, _getActionImagePath, _recipeLibrary, _localProfile, _simulator, _solver, _xivdbtooltips)
  {
    // provide access to constants
    $scope.allClasses = _allClasses;
    $scope.actionGroups = _actionGroups;
    $scope.getActionImagePath = _getActionImagePath;

    // split class list into two groups
    $scope.splitClasses = [_allClasses.slice(0, _allClasses.length/2),
                           _allClasses.slice(_allClasses.length/2, _allClasses.length)];

    $scope.allActions = {};
    $scope.actionTooltips = {};

    function makeTooltipsFetchCallback(cls, actionShortName) {
      return function (data) {
        $scope.actionTooltips[cls + actionShortName] = data;
      };
    }

    for (var i = 0; i < _allActions.length; i++) {
      var action = _allActions[i];
      $scope.allActions[action.shortName] = action;
      if (action.skillID) {
        if (action.cls == 'All') {
          for (var j = 0; j < _allClasses.length; j++) {
            var cls = _allClasses[j];
            _xivdbtooltips.fetch(action.skillID[cls]).then(makeTooltipsFetchCallback(cls, action.shortName));
          }
        }
        else {
          _xivdbtooltips.fetch(action.skillID[action.cls])
            .then(makeTooltipsFetchCallback(action.cls, action.shortName));
        }
      }
    }

    // non-persistent page states
    $scope.navBarCollapsed = true;
    $scope.editingSequence = false;

    $scope.recipeSearch = {
      list: [],
      selected: 0,
      text: ''
    };

    $scope.simulatorStatus = {
      logText: '',
      running: false
    };

    $scope.solverStatus = {
      running: false,
      generationsCompleted: 0,
      maxGenerations: 0,
      state: null,
      logText: '',
      sequence: [],
      error: null
    };

    $scope.simulatorTabs = {
      simulation: { active: true },
      solver: { actie: false }
    };

    $scope.solverResult = {
      logText: '',
      sequence: [],
      state: null
    };

    $scope.onProfileLoaded = function () {
      $scope.userInfo = $scope.profile.userInfo();

      $scope.profile.bindCrafterStats($scope, 'crafter.stats');
      $scope.savedSynthNames = $scope.profile.synthNames();

      // watches for automatic updates and saving settings
      $scope.$watchCollection('sections', function () {
        saveLocalPageState($scope);
      });

      function updateRecipeSearchList() {
        var recipesForClass = $scope.recipesForClass($scope.recipe.cls) || [];
        $scope.recipeSearch.list = $filter('filter')(recipesForClass, {name: $scope.recipeSearch.text});
        $scope.recipeSearch.selected = Math.min($scope.recipeSearch.selected, $scope.recipeSearch.list.length - 1);
      }

      $scope.$watch('recipeSearch.text', function () {
        updateRecipeSearchList();
      });

      function saveAndRerunSim() {
        saveLocalPageState($scope);
        if ($scope.sequence.length > 0 && $scope.isValidSequence($scope.sequence, $scope.recipe.cls)) {
          $scope.runSimulation();
        }
        else {
          $scope.simulatorStatus.state = null;
          $scope.simulatorStatus.error = null;
        }
      }

      $scope.$watch('settings.name', function () {
        saveLocalPageState($scope);
      });

      $scope.$watch('crafter.cls', function () {
        saveLocalPageState($scope);
      });

      $scope.$watchCollection('bonusStats', saveAndRerunSim);

      for (var cls in $scope.crafter.stats) {
        $scope.$watchCollection('crafter.stats.' + cls, saveAndRerunSim);
        $scope.$watchCollection('crafter.stats.' + cls + '.actions', saveAndRerunSim);
      }

      $scope.$watchCollection('recipe', saveAndRerunSim);
      $scope.$watch('recipe.cls', function () {
        $scope.recipeSearch.text = '';
        updateRecipeSearchList();
      });

      $scope.$watchCollection('sequence', saveAndRerunSim);

      $scope.$watchCollection('sequenceSettings', saveAndRerunSim);

      $scope.$watchCollection('simulation', saveAndRerunSim);

      $scope.$watchCollection('solver', function () {
        saveLocalPageState($scope);
      });
    };

    $scope.$on('sequence.editor.save', function (event, newSequence) {
      $scope.editingSequence = false;
      $scope.sequence = angular.copy(newSequence);
      $scope.runSimulation();
    });

    $scope.$on('sequence.editor.cancel', function () {
      $scope.editingSequence = false;
      $scope.runSimulation();
    });

    $scope.$on('sequence.editor.simulation.start', function (event, sequence) {
      $scope.simulatorStatus.sequence = sequence;
      $scope.simulatorStatus.running = true;
    });

    $scope.$on('sequence.editor.simulation.success', function (event, state) {
      $scope.simulatorStatus.state = state;
      $scope.simulatorStatus.error = undefined;
      $scope.simulatorStatus.running = false;
    });

    $scope.$on('sequence.editor.simulation.error', function (event, error) {
      $scope.simulatorStatus.state = undefined;
      $scope.simulatorStatus.error = error;
      $scope.simulatorStatus.running = false;
    });

    // data model interaction functions
    $scope.recipesForClass = function (cls) {
      /*var recipes = angular.copy(_recipeLibrary.recipesForClass(cls));
       recipes.sort(function(a,b) { return a.name.localeCompare(b.name); });
       return recipes;*/
      return _recipeLibrary.recipesForClass(cls);
    };

    $scope.importRecipe = function (name) {
      var cls = $scope.recipe.cls;
      $scope.recipe = angular.copy(_recipeLibrary.recipeForClassByName(cls, name));
      $scope.recipe.cls = cls;
      $scope.recipe.startQuality = 0;
    };

    $scope.onSearchKeyPress = function (event) {
      if (event.which == 13) {
        event.preventDefault();
        $scope.importRecipe($scope.recipeSearch.list[$scope.recipeSearch.selected].name);
        event.target.parentNode.parentNode.closeMenu();
      }
    };

    $scope.onSearchKeyDown = function (event) {
      if (event.which === 40) {
        // down
        $scope.recipeSearch.selected = Math.min($scope.recipeSearch.selected + 1, $scope.recipeSearch.list.length - 1);
        document.getElementById('recipeSearchElement' + $scope.recipeSearch.selected).scrollIntoViewIfNeeded(false);
      }
      else if (event.which === 38) {
        // up
        $scope.recipeSearch.selected = Math.max($scope.recipeSearch.selected - 1, 0);
        document.getElementById('recipeSearchElement' + $scope.recipeSearch.selected).scrollIntoViewIfNeeded(false);
      }
    };

    $scope.newSynth = function () {
      $scope.settings.name = '';
      var newRecipe = newRecipeStats($scope);
      newRecipe.cls = $scope.recipe.cls;
      $scope.recipe = newRecipe;
      $scope.bonusStats = newBonusStats();
    };

    $scope.loadSynth = function (name) {
      var settings = $scope.profile.loadSynth(name);

      $scope.bonusStats = settings.bonusStats;
      $scope.recipe = settings.recipe;
      $scope.sequence = settings.sequence;
      $scope.sequenceSettings = settings.sequenceSettings;
      $scope.solver = settings.solver;
      $scope.solverResult = {
        logText: '',
        sequence: [],
        state: null
      };

      // Backwards compatibility with version 3
      if (!$scope.sequenceSettings.reliabilityPercent) {
        $scope.sequenceSettings.reliabilityPercent = 100;
      }

      $scope.settings.name = name;
    };

    $scope.saveSynth = function () {
      var settings = {};

      settings.name = $scope.settings.name;
      settings.bonusStats = $scope.bonusStats;
      settings.recipe = $scope.recipe;
      settings.sequence = $scope.sequence;
      settings.sequenceSettings = $scope.sequenceSettings;
      settings.solver = $scope.solver;

      $scope.profile.saveSynth($scope.settings.name, settings);
      
      $scope.savedSynthNames = $scope.profile.synthNames();
    };

    $scope.saveSynthAs = function () {
      var name = prompt('Enter synth name:');
      if (name === null || name.length === 0) return;
      $scope.settings.name = name;
      $scope.saveSynth();
    };

    $scope.deleteSynth = function (name) {
      if (confirm('Are you sure you want to delete the "' + name + '" synth?')) {
        $scope.profile.deleteSynth(name);
        if (name == $scope.settings.name) {
          $scope.settings.name = '';
        }
        $scope.savedSynthNames = $scope.profile.synthNames();
      }
    };

    $scope.renameSynth = function (name) {
      var newName = prompt('Enter new synth name:');
      if (newName === null || newName.length === 0) return;
      $scope.profile.renameSynth(name, newName);
      if (name == $scope.settings.name) {
        $scope.settings.name = newName;
      }
      $scope.savedSynthNames = $scope.profile.synthNames();
    };

    $scope.isSynthDirty = function () {
      if (!$scope.settings || $scope.settings.name === '') {
        return false;
      }

      var settings = $scope.profile.loadSynth($scope.settings.name);
      if (!settings) return false;

      var clean = true;

      clean = clean && angular.equals(settings.bonusStats, $scope.bonusStats);
      clean = clean && angular.equals(settings.recipe, $scope.recipe);
      clean = clean && angular.equals(settings.sequence, $scope.sequence);
      clean = clean && angular.equals(settings.sequenceSettings, $scope.sequenceSettings);
      clean = clean && angular.equals(settings.solver, $scope.solver);

      return !clean;
    };

    $scope.synthNameForDisplay = function () {
      if (!$scope.settings) return '';

      if ($scope.settings.name === '') {
        return '<unnamed>';
      }
      else {
        return $scope.settings.name;
      }
    };

    $scope.actionClasses = function (action, cls) {
      return {
        'selected-action': $scope.isActionSelected(action, cls),
        'action-cross-class': $scope.isActionCrossClass(action, cls),
        'invalid-action': !$scope.isActionSelected(action, cls)
      }
    };

    $scope.isActionSelected = function (action, cls) {
      return $scope.crafter &&
             $scope.crafter.stats &&
             $scope.crafter.stats[cls] &&
             $scope.crafter.stats[cls].actions &&
             $scope.crafter.stats[cls].actions.indexOf(action) >= 0;
    };

    $scope.isActionCrossClass = function (action, cls) {
      return $scope.allActions[action].cls != 'All' &&
             $scope.allActions[action].cls != cls;
    };

    $scope.isValidSequence = function (sequence, cls) {
      return sequence !== undefined && sequence.every(function (action) {
        return $scope.isActionSelected(action, cls);
      });
    };

    $scope.actionTooltip = function (action, cls) {
      var info = $scope.allActions[action];
      var tooltipClass = info.cls;
      if (tooltipClass == 'All') {
        tooltipClass = cls;
      }
      var tooltip = $scope.actionTooltips[tooltipClass + action];
      return tooltip ? tooltip : '';
    };

    $scope.sequenceActionTooltip = function (action, cls) {
      return $scope.actionTooltip(action, cls);
    };

    $scope.uniqueCrossClassActions = function (sequence, cls) {
      if (typeof sequence == 'undefined') return [];
      var crossClassActions = sequence.filter(function (action) {
        var actionClass = $scope.allActions[action].cls;
        return actionClass != 'All' && actionClass != cls;
      });
      return crossClassActions.unique();
    };

    $scope.toggleAction = function (action) {
      var i = $scope.crafter.stats[$scope.crafter.cls].actions.indexOf(action);
      if (i >= 0) {
        $scope.crafter.stats[$scope.crafter.cls].actions.splice(i, 1);
      }
      else {
        $scope.crafter.stats[$scope.crafter.cls].actions.push(action);
      }
    };

    $scope.showStatBonusesModal = function () {
      var modalInstance = $modal.open({
        templateUrl: 'partials/stat-bonus-editor.html',
        controller: 'StatBonusEditorCtrl',
        windowClass: 'stat-bonus-editor',
        resolve: {
          crafter: function () { return $scope.crafter; },
          bonusStats: function () { return $scope.bonusStats; }
        }
      });
      modalInstance.result.then(function (result) {
        $scope.bonusStats = angular.copy(result);
      });
    };

    $scope.editSequenceInline = function () {
      $scope.editingSequence = true;
      $scope.$broadcast('sequence.editor.init', $scope.sequence,  $scope.recipe, $scope.crafter.stats[$scope.recipe.cls], $scope.bonusStats, $scope.sequenceSettings)
    };

    $scope.showMacroModal = function () {
      $modal.open({
        templateUrl: 'partials/macro.html',
        controller: 'MacroCtrl',
        windowClass: 'macro-modal',
        resolve: {
          allActions: function () {
            return $scope.allActions;
          },
          sequence: function () {
            return $scope.sequence;
          }
        }
      });
    };

    $scope.useSolverResult = function () {
      var seq = $scope.solverResult.sequence;
      if (seq instanceof Array && seq.length > 0) {
        $scope.sequence = $scope.solverResult.sequence;
      }
    };

    // Web Service API

    $scope.simulationSuccess = function (data) {
      $scope.simulatorStatus.sequence = $scope.sequence;
      $scope.simulatorStatus.logText = data.log;
      $scope.simulatorStatus.state = data.state;
      $scope.simulatorStatus.error = undefined;
      $scope.simulatorTabs.simulation.active = true;
      $scope.simulatorStatus.running = false;
    };

    $scope.simulationError = function (data) {
      $scope.simulatorStatus.sequence = $scope.sequence;
      $scope.simulatorStatus.logText = data.log;
      $scope.simulatorStatus.logText += '\n\nError: ' + data.error;
      $scope.simulatorStatus.state = undefined;
      $scope.simulatorStatus.error = data.error;
      $scope.simulatorTabs.simulation.active = true;
      $scope.simulatorStatus.running = false;
    };

    $scope.runSimulation = function () {
      if ($scope.simulatorStatus.running) {
        return;
      }
      var settings = {
        crafter: addBonusStats($scope.crafter.stats[$scope.recipe.cls], $scope.bonusStats),
        recipe: $scope.recipe,
        sequence: $scope.sequence,
        maxTricksUses: $scope.sequenceSettings.maxTricksUses,
        maxMontecarloRuns: $scope.sequenceSettings.maxMontecarloRuns,
        reliabilityPercent: $scope.sequenceSettings.reliabilityPercent,
        useConditions: $scope.sequenceSettings.useConditions,
        debug: $scope.sequenceSettings.debug
      };
      if ($scope.sequenceSettings.specifySeed) {
        settings.seed = $scope.sequenceSettings.seed;
      }

      $scope.simulatorStatus.running = true;
      _simulator.start(settings, $scope.simulationSuccess, $scope.simulationError);
    };

    $scope.solverProgress = function (data) {
      $scope.solverStatus.generationsCompleted = data.generationsCompleted;
      $scope.solverStatus.maxGenerations = data.maxGenerations;
      $scope.solverStatus.state = data.state;
      $scope.solverStatus.bestSequence = data.bestSequence;
    };

    $scope.solverSuccess = function (data) {
      $scope.solverResult.logText = data.log;
      $scope.solverResult.sequence = data.bestSequence;
      $scope.simulatorTabs.solver.active = true;
      $scope.solverStatus.state = data.state;
      $scope.solverStatus.running = false;
    };

    $scope.solverError = function (data) {
      $scope.solverStatus.error = data.error;
      $scope.solverResult.logText = data.log;
      $scope.solverResult.logText += '\n\nError: ' + data.error;
      $scope.solverResult.sequence = [];
      $scope.simulatorTabs.solver.active = true;
      $scope.solverStatus.running = false;
      $scope.solverStatus.generationsCompleted = 0;
    };

    $scope.startSolver = function () {
      var settings = {
        crafter: addBonusStats($scope.crafter.stats[$scope.recipe.cls], $scope.bonusStats),
        recipe: $scope.recipe,
        sequence: $scope.sequence,
        algorithm: $scope.solver.algorithm,
        maxTricksUses: $scope.sequenceSettings.maxTricksUses,
        maxMontecarloRuns: $scope.sequenceSettings.maxMontecarloRuns,
        reliabilityPercent: $scope.sequenceSettings.reliabilityPercent,
        useConditions: $scope.sequenceSettings.useConditions,
        solver: $scope.solver,
        debug: $scope.sequenceSettings.debug
      };
      if ($scope.sequenceSettings.specifySeed) {
        settings.seed = $scope.sequenceSettings.seed;
      }
      $scope.solverStatus.running = true;
      _solver.start($scope.sequence, settings, $scope.solverProgress, $scope.solverSuccess, $scope.solverError);
    };

    $scope.resetSolver = function() {
      $scope.solverStatus.error = null;
      $scope.solverStatus.generationsCompleted = 0;
      $scope.solverStatus.maxGenerations = $scope.solver.generations;
      $scope.solverStatus.state = null;
      $scope.solverResult.logText = "";
      $scope.solverResult.sequence = [];
    };

    $scope.resumeSolver = function() {
      $scope.solverStatus.running = true;
      _solver.resume();
    };

    $scope.stopSolver = function () {
      _solver.stop();
    };

    loadLocalPageState($scope);

    $scope.profile = _localProfile;
    $scope.onProfileLoaded();
  });

function loadLocalPageState($scope) {
  initPageStateDefaults($scope);
  if (loadLocalPageState_v2($scope)) return;
  loadLocalPageState_v1($scope);
}

function initPageStateDefaults($scope) {
  $scope.sections = {
    crafter: true,
    synth: true,
    simulator: true,
    simulatorOptions: false
  };

  $scope.settings = {
    name: ''
  };

  $scope.crafter = {
    cls: $scope.allClasses[0],
    stats: {}
  };

  $scope.bonusStats = newBonusStats();

  $scope.recipe = newRecipeStats($scope);

  $scope.sequence = [];

  $scope.sequenceSettings = {
    maxTricksUses: 0,
    maxMontecarloRuns: 500,
    reliabilityPercent: 100,
    specifySeed: false,
    seed: 1337,
    useConditions: true,
    debug: false
  };

  $scope.solver = {
    algorithm: 'eaSimple',
    penaltyWeight: 10000,
    population: 300,
    generations: 100
  };
}

function loadLocalPageState_v2($scope) {
  if (localStorage['pageStage_v2'] === undefined) return false;

  var state = JSON.parse(localStorage['pageStage_v2']);

  extend($scope.sections, state.sections);
  extend($scope.bonusStats, state.bonusStats);
  extend($scope.recipe, state.recipe);
  extend($scope.sequenceSettings, state.sequenceSettings);
  extend($scope.solver, state.solver);

  $scope.sequence = state.sequence;

  $scope.settings.name = state.settingsName;
  $scope.crafter.cls = state.crafterClass;

  return true;
}

function loadLocalPageState_v1($scope) {
  var sections = localStorage['sections'];
  if (sections) {
    extend($scope.sections, JSON.parse(sections));
  }

  if (localStorage['settingsName']) {
    $scope.settings.name = localStorage['settingsName'];
  }

  if (localStorage['crafterClass']) {
    $scope.crafter.cls = localStorage['crafterClass'];
  }

  var bonusStats = localStorage['settings.bonusStats'];
  if (bonusStats) {
    extend($scope.bonusStats, JSON.parse(bonusStats));
  }

  var recipe = localStorage['settings.recipe'];
  if (recipe) {
    extend($scope.recipe, JSON.parse(recipe));
  }

  var sequence = localStorage['settings.sequence'];
  if (sequence) {
    $scope.sequence = JSON.parse(sequence);
  }

  var sequenceSettings = localStorage['settings.sequenceSettings'];
  if (sequenceSettings) {
    extend($scope.sequenceSettings, JSON.parse(sequenceSettings));
  }

  var solver = localStorage['settings.solver'];
  if (solver) {
    extend($scope.solver, JSON.parse(solver));
  }

  return true;
}

function saveLocalPageState($scope) {
  saveLocalPageState_v2($scope);
}

function saveLocalPageState_v2($scope) {
  var state = {
    sections: $scope.sections,
    bonusStats: $scope.bonusStats,
    recipe: $scope.recipe,
    sequence: $scope.sequence,
    sequenceSettings: $scope.sequenceSettings,
    solver: $scope.solver,
    settingsName: $scope.settings.name,
    crafterClass: $scope.crafter.cls
  };

  localStorage['pageStage_v2'] = JSON.stringify(state)
}

function saveLocalPageState_v1($scope) {
  saveToLocalStorage('sections', $scope.sections);
  saveToLocalStorage('settings.bonusStats', $scope.bonusStats);
  saveToLocalStorage('settings.recipe', $scope.recipe);
  saveToLocalStorage('settings.sequence', $scope.sequence);
  saveToLocalStorage('settings.sequenceSettings', $scope.sequenceSettings);
  saveToLocalStorage('settings.solver', $scope.solver);

  localStorage['settingsName'] = $scope.settings.name;
  localStorage['crafterClass'] = $scope.crafter.cls;

  return true;
}

function saveToLocalStorage(name, value) {
  if (value === undefined || value === null) {
    console.error('Ignoring attempt to save an undefined or null value to local storage for setting: ' + name)
  }
  else {
    localStorage[name] = JSON.stringify(value);
  }
}

function extend(dest, src) {
  if (dest === null || dest === undefined) {
    throw 'cannot extend null or undefined object';
  }
  if (src === null || src === undefined) {
    throw 'cannot extend object with null or undefined object';
  }
  for (var p in src) {
    if (src.hasOwnProperty(p)) {
      var v = src[p];
      if (v !== undefined && v !== null) {
        var o = dest[p];
        if (o === null || o === undefined) {
          dest[p] = v;
        }
        else if (typeof o == 'object' && typeof v == 'object') {
          extend(dest[p], v);
        }
        else {
          dest[p] = v;
        }
      }
    }
  }
}

// attach the .equals method to Array's prototype to call it on any array
Array.prototype.equals = function (array) {
  // if the other array is a falsy value, return
  if (!array)
    return false;

  // compare lengths - can save a lot of time
  if (this.length != array.length)
    return false;

  for (var i = 0, l = this.length; i < l; i++) {
    // Check if we have nested arrays
    if (this[i] instanceof Array && array[i] instanceof Array) {
      // recurse into the nested arrays
      if (!this[i].compare(array[i]))
        return false;
    }
    else if (this[i] != array[i]) {
      // Warning - two different object instances will never be equal: {x:20} != {x:20}
      return false;
    }
  }
  return true;
};

Array.prototype.unique = function () {
  return this.filter(function (value, index, self) {
    return self.indexOf(value) === index;
  })
};

function newRecipeStats($scope) {
  return {
    cls: $scope.crafter.cls,
    level: 1,
    difficulty: 9,
    durability: 40,
    startQuality: 0,
    maxQuality: 312
  }
}

function newBonusStats() {
  return {
    craftsmanship: 0,
    control: 0,
    cp: 0
  }
}

function addBonusStats(crafter, bonusStats) {
  var newStats = angular.copy(crafter);
  newStats.craftsmanship += bonusStats.craftsmanship;
  newStats.control += bonusStats.control;
  newStats.cp += bonusStats.cp;
  return newStats;
}

// scrollIntoViewIfNeeded polyfill for Firefox and IE
// Based on https://gist.github.com/hsablonniere/2581101
if (!Element.prototype.scrollIntoViewIfNeeded) {
  Element.prototype.scrollIntoViewIfNeeded = function (centerIfNeeded) {
    centerIfNeeded = arguments.length === 0 ? true : !!centerIfNeeded;

    var parent = this.parentNode,
      parentComputedStyle = window.getComputedStyle(parent, null),
      parentBorderTopWidth = parseInt(parentComputedStyle.getPropertyValue('border-top-width')),
      parentBorderLeftWidth = parseInt(parentComputedStyle.getPropertyValue('border-left-width')),
      overTop = this.offsetTop - parent.offsetTop < parent.scrollTop,
      overBottom = (this.offsetTop - parent.offsetTop + this.clientHeight - parentBorderTopWidth) > (parent.scrollTop + parent.clientHeight),
      overLeft = this.offsetLeft - parent.offsetLeft < parent.scrollLeft,
      overRight = (this.offsetLeft - parent.offsetLeft + this.clientWidth - parentBorderLeftWidth) > (parent.scrollLeft + parent.clientWidth);

    if (centerIfNeeded) {
      if (overTop || overBottom) {
        parent.scrollTop = this.offsetTop - parent.offsetTop - parent.clientHeight / 2 - parentBorderTopWidth + this.clientHeight / 2;
      }

      if (overLeft || overRight) {
        parent.scrollLeft = this.offsetLeft - parent.offsetLeft - parent.clientWidth / 2 - parentBorderLeftWidth + this.clientWidth / 2;
      }
    }
    else {
      if (overTop) {
        parent.scrollTop = this.offsetTop - parent.offsetTop - parentBorderTopWidth;
      }

      if (overBottom) {
        parent.scrollTop = this.offsetTop - parent.offsetTop - parentBorderTopWidth - parent.clientHeight + this.clientHeight;
      }

      if (overLeft) {
        parent.scrollLeft = this.offsetLeft - parent.offsetLeft - parentBorderLeftWidth;
      }

      if (overRight) {
        parent.scrollLeft = this.offsetLeft - parent.offsetLeft - parentBorderLeftWidth - parent.clientWidth + this.clientWidth;
      }
    }
  };
}
