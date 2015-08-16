'use strict';

/* Controllers */

angular.module('ffxivCraftOptWeb.controllers', [])
  .controller('MainCtrl',
  function ($scope, $rootScope, $modal, $translate, _allClasses, _actionGroups, _allActions, _actionsByName,
    _localProfile, _xivdbtooltips, _getActionImagePath)
  {
    // provide access to constants
    $scope.allClasses = _allClasses;
    $scope.actionGroups = _actionGroups;

    // split class list into two groups
    $scope.splitClasses = [_allClasses.slice(0, _allClasses.length/2),
                           _allClasses.slice(_allClasses.length/2, _allClasses.length)];

    $scope.getActionImagePath = _getActionImagePath;

    $scope.allActions = _actionsByName;

    $scope.languages = {
      ja: '日本語',
      en: 'English',
      de: 'Deutsch',
      fr: 'Français'
    };

    $scope.changeLang = function (lang) {
      $translate.use(lang);
    };

    $scope.currentLang = function () {
      return $translate.use();
    };

    $rootScope.$on('$translateChangeSuccess', function (event, data) {
      _xivdbtooltips.onLanguageChange(data.language);
      $scope.$broadcast('$translateChangeSuccess', data);
    });
    _xivdbtooltips.onLanguageChange($translate.use());

    // non-persistent page state
    $scope.pageState = {
      navBarCollapsed: true,
      options: {
        tabs: {
          simulator: {
            active: false
          },
          solver: {
            active: false
          },
          macro: {
            active: false
          },
          debugging: {
            active: true
          }
        }
      }
    };

    $scope.onProfileLoaded = function () {
      $scope.userInfo = $scope.profile.userInfo();

      $scope.profile.bindCrafterStats($scope, 'crafter.stats');
      $scope.savedSynthNames = $scope.profile.synthNames();

      // watches for automatic updates and saving settings
      $scope.$watchCollection('sections', function () {
        saveLocalPageState($scope);
      });

      $scope.$watch('settings.name', function () {
        saveLocalPageState($scope);
      });

      $scope.$watch('crafter.cls', function () {
        saveLocalPageState($scope);
      });

      $scope.$watchCollection('bonusStats', function () {
        saveLocalPageState($scope);
        $scope.$broadcast('bonusStats.changed', $scope.bonusStats);
        $scope.$broadcast('simulation.needs.update');
      });

      var crafterStatsChangedHandler = function () {
        saveLocalPageState($scope);
        $scope.$broadcast('crafter.stats.changed');
        $scope.$broadcast('simulation.needs.update');
      };
      var crafterActionsChangedHandler = function () {
        saveLocalPageState($scope);
        $scope.$broadcast('crafter.actions.changed');
        $scope.$broadcast('simulation.needs.update');
      };
      for (var cls in $scope.crafter.stats) {
        $scope.$watchCollection('crafter.stats.' + cls, crafterStatsChangedHandler);
        $scope.$watchCollection('crafter.stats.' + cls + '.actions', crafterActionsChangedHandler);
      }

      $scope.$watchCollection('recipe', function () {
        saveLocalPageState($scope);
        $scope.$broadcast('recipe.changed', $scope.recipe);
        $scope.$broadcast('simulation.needs.update');
      });

      $scope.$watch('recipe.cls', function () {
        $scope.$broadcast('recipe.cls.changed', $scope.recipe.cls);
      });

      $scope.$watchCollection('sequence', function () {
        saveLocalPageState($scope);
        $scope.$broadcast('simulation.needs.update');
      });

      $scope.$watchCollection('sequenceSettings', function () {
        saveLocalPageState($scope);
        $scope.$broadcast('sequenceSettings.changed', $scope.sequenceSettings);
        $scope.$broadcast('simulation.needs.update');
      });

      $scope.$watchCollection('solver', function () {
        saveLocalPageState($scope);
        $scope.$broadcast('solver.changed', $scope.solver);
      });

      $scope.$watchCollection('macroOptions', function () {
        saveLocalPageState($scope);
        $scope.$broadcast('macro.options.changed', $scope.macroOptions);
      });

      // Trigger initial simulation using newly loaded profile
      $scope.$broadcast('simulation.needs.update');
    };

    // data model interaction functions

    $scope.$on('recipe.selected', function (event, recipe) {
      $scope.recipe = recipe;
    });

    $scope.$on('update.sequence', function (event, newSequence) {
      $scope.sequence = angular.copy(newSequence);
    });

    //
    // Saved Synth Management
    //

    $scope.loadSynth = function (name) {
      if ($scope.isSynthDirty()) {
        if (!window.confirm('You have not saved the changes to your current sequence. Are you sure?')) {
          return;
        }
      }

      var settings = $scope.profile.loadSynth(name);

      $scope.bonusStats = extend(newBonusStats(), settings.bonusStats);
      $scope.recipe = settings.recipe;
      $scope.sequence = settings.sequence;

      $scope.settings.name = name;

      $scope.$broadcast('synth.changed');
    };

    $scope.saveSynth = function (noDirtyCheck) {
      // Hack for bug in angular-ui-bootstrap
      // ng-disabled elements don't close their tooltip
      if (!noDirtyCheck && !$scope.isSynthDirty()) {
        return;
      }

      var settings = {};

      settings.name = $scope.settings.name;
      settings.bonusStats = extend(newBonusStats(), $scope.bonusStats);
      settings.recipe = $scope.recipe;
      settings.sequence = $scope.sequence;

      $scope.profile.saveSynth($scope.settings.name, settings);

      $scope.savedSynthNames = $scope.profile.synthNames();
    };

    $scope.saveSynthAs = function () {
      var name = $scope.settings.name;
      if (name === undefined || name === '') {
        name = $scope.recipe.name;
      }
      var newName = window.prompt('Enter new synth name:', name);
      if (newName === null || newName.length === 0) return;
      $scope.settings.name = newName;
      $scope.saveSynth(true);
    };

    $scope.deleteSynth = function () {
      var name = $scope.settings.name;
      if (window.confirm('Are you sure you want to delete the "' + name + '" synth?')) {
        $scope.profile.deleteSynth(name);
        $scope.settings.name = '';
        $scope.savedSynthNames = $scope.profile.synthNames();
        $scope.$broadcast('synth.changed');
      }
    };

    $scope.renameSynth = function () {
      var name = $scope.settings.name;
      var newName = window.prompt('Enter new synth name:', name);
      if (newName === null || newName.length === 0) return;
      $scope.settings.name = newName;
      $scope.profile.renameSynth(name, newName);
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

    $scope.isActionSelected = function (action, cls) {
      return $scope.crafter &&
             $scope.crafter.stats &&
             $scope.crafter.stats[cls] &&
             $scope.crafter.stats[cls].actions &&
             $scope.crafter.stats[cls].actions.indexOf(action) >= 0;
    };

    $scope.isActionCrossClass = function (action, cls) {
      if (!angular.isDefined(action)) {
        console.error('undefined actionName');
        return undefined;
      }
      var info = _actionsByName[action];
      if (!angular.isDefined(info)) {
        console.error('unknown action: %s', action);
        return undefined;
      }
      return info.cls != 'All' &&
             info.cls != cls;
    };

    $scope.isValidSequence = function (sequence, cls) {
      return !sequence || sequence.every(function (action) {
        return $scope.isActionSelected(action, cls);
      });
    };

    $scope.showOptionsModal = function () {
      var modalInstance = $modal.open({
        templateUrl: 'modals/options.html',
        controller: 'OptionsController',
        windowClass: 'options-modal',
        resolve: {
          pageState: function () { return $scope.pageState; },
          sequenceSettings: function () { return $scope.sequenceSettings; },
          solver: function () { return $scope.solver; },
          macroOptions: function () { return $scope.macroOptions; }
        }
      });
      modalInstance.result.then(function (result) {
        extend($scope, result);
      });
    };

    // Final initialization
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

  $scope.recipe = newRecipeStats($scope.crafter.cls);

  $scope.sequence = [];

  $scope.sequenceSettings = {
    maxTricksUses: 0,
    maxMontecarloRuns: 500,
    reliabilityPercent: 100,
    specifySeed: false,
    seed: 1337,
    useConditions: true,
    overrideOnCondition: false,
    debug: false
  };

  $scope.solver = {
    algorithm: 'eaSimple',
    penaltyWeight: 10000,
    population: 300,
    generations: 100
  };

  $scope.macroOptions = {
    waitTime: 3
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
  extend($scope.macroOptions, state.macroOptions || {});

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
    crafterClass: $scope.crafter.cls,
    macroOptions: $scope.macroOptions
  };

  localStorage['pageStage_v2'] = JSON.stringify(state)
}

function extend(dest, src) {
  if (dest === null || dest === undefined) {
    dest = {};
  }
  if (src === null || src === undefined) {
    src = {};
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
  return dest;
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

function newRecipeStats(cls) {
  return {
    cls: cls,
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
    cp: 0,
    startQuality: 0
  }
}

function addCrafterBonusStats(crafter, bonusStats) {
  var newStats = angular.copy(crafter);
  newStats.craftsmanship += bonusStats.craftsmanship;
  newStats.control += bonusStats.control;
  newStats.cp += bonusStats.cp;
  return newStats;
}

function addRecipeBonusStats(recipe, bonusStats) {
  var newStats = angular.copy(recipe);
  newStats.startQuality += bonusStats.startQuality;
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
