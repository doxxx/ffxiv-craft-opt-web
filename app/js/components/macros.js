(function () {
  'use strict';

  var MAX_LINES = 15;

  angular
    .module('ffxivCraftOptWeb.components')
    .directive('macros', factory);

  function factory() {
    return {
      restrict: 'E',
      templateUrl: 'components/macros.html',
      scope: {
        sequence: '=',
        cls: '=',
        options: '='
      },
      controller: controller
    }
  }

  function controller($scope, $translate, _actionsByName, _allActions, _iActionClassSpecific, _isActionCrossClass) {
    $scope.macroList = [];

    $scope.$on('$translateChangeSuccess', update);
    $scope.$watchCollection('sequence', update);
    $scope.$watch('cls', update);
    $scope.$watchCollection('options', update);

    update();

    //////////////////////////////////////////////////////////////////////////

    function update() {
      if (!angular.isDefined($scope.sequence)) {
        return;
      }

      if ($scope.options.setupCrossClassActions) {
        var crossClassActionSetupLines = buildCrossClassActionSetupLines($scope.options, $scope.sequence, $scope.cls);
        $scope.crossClassSetupMacroText = crossClassActionSetupLines.join('');
      }

      var sequenceLines = buildSequenceLines($scope.options, $scope.sequence, extractBuffs());
      $scope.macroList = buildMacroList($scope.options, sequenceLines);
    }

    function extractBuffs() {
      var buffs = {};
      for (var i = 0; i < _allActions.length; i++) {
        var action = _allActions[i];
        if (action.buff) {
          buffs[action.shortName] = true;
        }
      }
      return buffs;
    }

    function soundEffect(num) {
      return '<se.' + num + '>';
    }

    function extractCrossClassActions(options, sequence, cls) {
      var crossClass = {};
      var testFunc = options.includeCurrentClassActions ? _iActionClassSpecific : _isActionCrossClass;
      for (var i = 0; i < sequence.length; i++) {
        var action = sequence[i];
        if (!crossClass[action] && testFunc(action, cls)) {
          crossClass[action] = true;
        }
      }
      return Object.keys(crossClass).sort();
    }

    function buildCrossClassActionSetupLines(options, sequence, cls) {
      var crossClass = extractCrossClassActions(options, sequence, cls);

      var lines = [];
      if (crossClass.length > 0) {
        lines.push('/aaction clear\n');
      }

      for (var i = 0; i < crossClass.length; i++) {
        var action = crossClass[i];
        var info = _actionsByName[action];
        if (info) {
          var actionName = $translate.instant(info.name);
          var line = '/aaction "' + actionName + '" on\n';
          lines.push(line);
        }
        else {
          lines.push('/echo Error: Unknown action ' + action);
        }
      }

      if (lines.length > 0) {
        lines.push('/echo Cross-class action setup complete ' + soundEffect(options.stepSoundEffect) + '\n');
      }

      return lines;
    }

    function buildSequenceLines(options, sequence, buffs) {
      var waitString = '<wait.' + options.waitTime + '>';
      var buffWaitString = '<wait.' + options.buffWaitTime + '>';

      var lines = [];

      for (var i = 0; i < sequence.length; i++) {
        var action = sequence[i];
        var info = _actionsByName[action];
        if (info) {
          var actionName = $translate.instant(info.name);
          var line = '/ac "' + actionName + '" ';
          var time;
          if (buffs[action]) {
            line += buffWaitString;
            time = options.buffWaitTime;
          }
          else {
            line += waitString;
            time = options.waitTime
          }
          line += '\n';
          lines.push({text: line, time: time});
        }
        else {
          lines.push({text: '/echo Error: Unknown action ' + action, time: 0});
        }
      }

      return lines;
    }

    function buildMacroList(options, lines) {
      var macroList = [];

      var macroString = '';
      var macroLineCount = 0;
      var macroTime = 0;
      var macroIndex = 1;

      for (var j = 0; j < lines.length; j++) {
        var line = lines[j];
        macroString += line.text;
        macroTime += line.time;
        macroLineCount += 1;

        if (macroLineCount === MAX_LINES - 1) {
          if (lines.length - (j + 1) > 1) {
            macroString += '/echo Macro #' + macroIndex + ' complete ' + soundEffect(options.stepSoundEffect) + '\n';
            macroList.push({text: macroString, time: macroTime});
            macroString = '';
            macroLineCount = 0;
            macroTime = 0;
            macroIndex += 1;
          }
        }
      }

      if (macroLineCount > 0) {
        if (macroLineCount < MAX_LINES) {
          macroString += '/echo Macro #' + macroIndex + ' complete ' + soundEffect(options.finishSoundEffect) + '\n';
        }
        macroList.push({text: macroString, time: macroTime});
      }

      return macroList;
    }
  }
})();
