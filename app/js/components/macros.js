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

  function controller($scope, $translate, _actionsByName, _allActions, _isActionCrossClass) {
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

      var macroList = [];

      if ($scope.options.setupCrossClassActions) {
        var crossClassActionSetupLines = buildCrossClassActionSetupLines($scope.options, $scope.sequence, $scope.cls);
        macroList.push(crossClassActionSetupLines.join(''))
      }

      var sequenceLines = buildSequenceLines($scope.options, $scope.sequence, extractBuffs());
      var sequenceMacroList = buildMacroList($scope.options, sequenceLines);
      macroList = macroList.concat(sequenceMacroList);

      $scope.macroList = macroList;
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

    function buildCrossClassActionSetupLines(options, sequence, cls) {
      var crossClass = {};
      for (var i = 0; i < sequence.length; i++) {
        var action = sequence[i];
        if (_isActionCrossClass(action, cls) && !crossClass[action]) {
          crossClass[action] = true;
        }
      }
      crossClass = Object.keys(crossClass);

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

      lines.push('/echo Cross-class action setup complete ' + soundEffect(options.stepSoundEffect) + '\n');

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
          if (buffs[action]) {
            line += buffWaitString;
          }
          else {
            line += waitString;
          }
          line += '\n';
          lines.push(line);
        }
        else {
          lines.push('/echo Error: Unknown action ' + action);
        }
      }

      return lines;
    }

    function buildMacroList(options, lines) {
      var macroList = [];

      var macroString = '';
      var macroLineCount = 0;
      var macroIndex = 1;

      for (var j = 0; j < lines.length; j++) {
        macroString += lines[j];
        macroLineCount += 1;

        if (macroLineCount == MAX_LINES-1) {
          if (lines.length - (j + 1) > 1) {
            macroString += '/echo Macro #' + macroIndex + ' complete ' + soundEffect(options.stepSoundEffect) + '\n';
            macroList.push(macroString);
            macroString = '';
            macroLineCount = 0;
            macroIndex += 1;
          }
        }
      }

      if (macroLineCount > 0) {
        if (macroLineCount < MAX_LINES) {
          macroString += '/echo Macro #' + macroIndex + ' complete ' + soundEffect(options.finishSoundEffect) + '\n';
        }
        macroList.push(macroString)
      }

      return macroList;
    }
  }
})();
