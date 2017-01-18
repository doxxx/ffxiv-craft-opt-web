(function () {
  'use strict';

  angular
    .module('ffxivCraftOptWeb.controllers', [])
    .controller('MainController', controller);

  function controller($scope, $rootScope, $q, $modal, $translate, _allClasses, _actionGroups, _actionsByName,
    _profile, _localStorage, _xivdbtooltips, _getActionImagePath, _bonusStats, _languages)
  {
    $scope.allClasses = _allClasses;
    $scope.actionGroups = _actionGroups;
    $scope.allActions = _actionsByName;
    $scope.getActionImagePath = _getActionImagePath;

    $scope.changeLang = changeLang;
    $scope.currentLang = currentLang;
    $scope.loadSynth = loadSynth;
    $scope.revertSynth = revertSynth;
    $scope.saveSynth = saveSynth;
    $scope.isSynthDirty = isSynthDirty;
    $scope.saveSynthAs = saveSynthAs;
    $scope.deleteSynth = deleteSynth;
    $scope.renameSynth = renameSynth;
    $scope.synthNameForDisplay = synthNameForDisplay;
    $scope.actionForName = actionForName;
    $scope.isActionSelected = isActionSelected;
    $scope.isActionCrossClass = isActionCrossClass;
    $scope.isValidSequence = isValidSequence;
    $scope.showOptionsModal = showOptionsModal;

    $scope.languages = _languages;

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


    $scope.cgBusyConfig = {
      promise: undefined,
      message: "Loading...",
      delay: 0,
      minDuration: 1000
    };

    $rootScope.$on('$translateChangeSuccess', onTranslateChangeSuccess);
    $scope.$on('recipe.selected', onRecipeSelected);
    $scope.$on('update.sequence', onUpdateSequence);

    // Final initialization
    loadLocalPageState($scope);
    _profile.useStorage(_localStorage);

    $scope.cgBusyConfig.promise = $q.all([
      _xivdbtooltips.loadTooltips($translate.use()),
      _profile.load().then(onProfileLoaded)
    ]);

    //////////////////////////////////////////////////////////////////////////

    function onTranslateChangeSuccess(event, data) {
      $scope.cgBusyConfig.promise = _xivdbtooltips.loadTooltips(data.language);
      $scope.$broadcast('$translateChangeSuccess', data);
    }

    function onRecipeSelected(event, recipe) {
      $scope.recipe = recipe;
    }

    function onUpdateSequence(event, newSequence) {
      $scope.sequence = angular.copy(newSequence);
    }

    function changeLang(lang) {
      $translate.use(lang);
    }

    function currentLang() {
      return $translate.use();
    }

    function onProfileLoaded(profile) {
      $scope.profile = profile;

      $scope.userInfo = $scope.profile.userInfo();

      $scope.profile.bindCrafterStats($scope, 'crafter.stats');
      $scope.savedSynthNames = $scope.profile.synthNames();

      // watches for automatic updates and saving settings
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

      $scope.$broadcast('profile.loaded');
    }

    //
    // Saved Synth Management
    //

    function loadSynth(name, noDirtyCheck) {
      if (!$scope.profile) return;

      if (!noDirtyCheck && isSynthDirty()) {
        if (!window.confirm('You have not saved the changes to your current sequence. Are you sure?')) {
          return;
        }
      }

      var settings = $scope.profile.loadSynth(name);

      $scope.bonusStats = angular.extend(_bonusStats.newBonusStats(), settings.bonusStats);
      $scope.recipe = settings.recipe;
      $scope.sequence = settings.sequence;

      $scope.settings.name = name;

      $scope.$broadcast('synth.changed');
    }

    function revertSynth() {
      loadSynth($scope.settings.name, true);
    }

    function saveSynth(noDirtyCheck) {
      if (!$scope.profile) return;

      // Hack for bug in angular-ui-bootstrap
      // ng-disabled elements don't close their tooltip
      if (!noDirtyCheck && !isSynthDirty()) {
        return;
      }

      var settings = {};

      settings.name = $scope.settings.name;
      settings.bonusStats = angular.extend(_bonusStats.newBonusStats(), $scope.bonusStats);
      settings.recipe = $scope.recipe;
      settings.sequence = $scope.sequence;

      $scope.profile.saveSynth($scope.settings.name, settings);

      $scope.savedSynthNames = $scope.profile.synthNames();
    }

    function saveSynthAs() {
      var name = $scope.settings.name;
      if (name === undefined || name === '') {
        name = $scope.recipe.name;
      }
      var newName = window.prompt('Enter new synth name:', name);
      if (newName === null || newName.length === 0) return;
      $scope.settings.name = newName;
      saveSynth(true);
    }

    function deleteSynth() {
      if (!$scope.profile) return;

      var name = $scope.settings.name;
      if (window.confirm('Are you sure you want to delete the "' + name + '" synth?')) {
        $scope.profile.deleteSynth(name);
        $scope.settings.name = '';
        $scope.savedSynthNames = $scope.profile.synthNames();
        $scope.$broadcast('synth.changed');
      }
    }

    function renameSynth() {
      if (!$scope.profile) return;

      var name = $scope.settings.name;
      var newName = window.prompt('Enter new synth name:', name);
      if (newName === null || newName.length === 0) return;
      $scope.settings.name = newName;
      $scope.profile.renameSynth(name, newName);
      $scope.savedSynthNames = $scope.profile.synthNames();
    }

    function isSynthDirty() {
      if (!$scope.profile) return false;

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
    }

    function synthNameForDisplay() {
      if (!$scope.settings) return '';

      if ($scope.settings.name === '') {
        return '<unnamed>';
      }
      else {
        return $scope.settings.name;
      }
    }

    function actionForName(name) {
      return _actionsByName[name];
    }

    function isActionSelected(action, cls) {
      return $scope.crafter &&
             $scope.crafter.stats &&
             $scope.crafter.stats[cls] &&
             $scope.crafter.stats[cls].actions &&
             $scope.crafter.stats[cls].actions.indexOf(action) >= 0;
    }

    function isActionCrossClass(action, cls) {
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
    }

    function isValidSequence(sequence, cls) {
      return !sequence || sequence.every(function (action) {
          return isActionSelected(action, cls);
        });
    }

    function showOptionsModal() {
      var modalInstance = $modal.open({
        templateUrl: 'modals/options.html',
        controller: 'OptionsController',
        windowClass: 'options-modal',
        resolve: {
          pageState: function () {
            return $scope.pageState;
          },
          sequenceSettings: function () {
            return $scope.sequenceSettings;
          },
          solver: function () {
            return $scope.solver;
          },
          macroOptions: function () {
            return $scope.macroOptions;
          }
        }
      });
      modalInstance.result.then(function (result) {
        $scope.sequenceSettings = result.sequenceSettings;
        $scope.solver = result.solver;
        $scope.macroOptions = result.macroOptions;
      });
    }

    function loadLocalPageState($scope) {
      initPageStateDefaults($scope);
      if (loadLocalPageState_v2($scope)) return;
      loadLocalPageState_v1($scope);
    }

    function initPageStateDefaults($scope) {
      $scope.settings = {
        name: ''
      };

      $scope.crafter = {
        cls: $scope.allClasses[0],
        stats: {}
      };

      $scope.bonusStats = _bonusStats.newBonusStats();

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
        waitTime: 3,
        buffWaitTime: 2,
        stepSoundEffect: 1,
        finishSoundEffect: 14
      };
    }

    function loadLocalPageState_v2($scope) {
      if (localStorage['pageStage_v2'] === undefined) return false;

      var state = JSON.parse(localStorage['pageStage_v2']);

      angular.extend($scope.bonusStats, state.bonusStats);
      angular.extend($scope.recipe, state.recipe);
      angular.extend($scope.sequenceSettings, state.sequenceSettings);
      angular.extend($scope.solver, state.solver);
      angular.extend($scope.macroOptions, state.macroOptions || {});

      $scope.sequence = state.sequence;

      $scope.settings.name = state.settingsName;
      $scope.crafter.cls = state.crafterClass;

      return true;
    }

    function loadLocalPageState_v1($scope) {
      if (localStorage['settingsName']) {
        $scope.settings.name = localStorage['settingsName'];
      }

      if (localStorage['crafterClass']) {
        $scope.crafter.cls = localStorage['crafterClass'];
      }

      var bonusStats = localStorage['settings.bonusStats'];
      if (bonusStats) {
        angular.extend($scope.bonusStats, JSON.parse(bonusStats));
      }

      var recipe = localStorage['settings.recipe'];
      if (recipe) {
        angular.extend($scope.recipe, JSON.parse(recipe));
      }

      var sequence = localStorage['settings.sequence'];
      if (sequence) {
        $scope.sequence = JSON.parse(sequence);
      }

      var sequenceSettings = localStorage['settings.sequenceSettings'];
      if (sequenceSettings) {
        angular.extend($scope.sequenceSettings, JSON.parse(sequenceSettings));
      }

      var solver = localStorage['settings.solver'];
      if (solver) {
        angular.extend($scope.solver, JSON.parse(solver));
      }

      return true;
    }

    function saveLocalPageState($scope) {
      saveLocalPageState_v2($scope);
    }

    function saveLocalPageState_v2($scope) {
      var state = {
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


  }
})();

