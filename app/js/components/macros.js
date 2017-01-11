(function () {
  'use strict';

  var MAX_LINES = 15;

  angular
    .module('ffxivCraftOptWeb.components')
    .directive('macros', factory);

  function factory() {
    return {
      restrict: 'E',
      templateUrl: '../../components/macros.html',
      scope: {
        sequence: '=',
        options: '='
      },
      controller: controller
    }
  }

  function controller($scope, $translate, _actionsByName, _allActions) {
    $scope.macroList = [];

    $scope.$on('$translateChangeSuccess', update);
    $scope.$watchCollection('sequence', update);
    $scope.$watchCollection('options', update);

    update();

    //////////////////////////////////////////////////////////////////////////

    function update() {
      if (!angular.isDefined($scope.sequence)) {
        return;
      }

      $scope.macroList = buildMacroList(buildMacroLines(extractBuffs()));
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

    function buildMacroLines(buffs) {
      var waitString = '<wait.' + $scope.options.waitTime + '>';
      var buffWaitString = '<wait.' + $scope.options.buffWaitTime + '>';

      var lines = [];

      for (var i = 0; i < $scope.sequence.length; i++) {
        var action = $scope.sequence[i];
        var info = _actionsByName[action];
        if (info) {
          var actionName = $translate.instant(info.name);
          var line = '/ac "' + actionName + '" <me> ';
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

    function buildMacroList(lines) {
      var stepSoundEffect = '<se.' + $scope.options.stepSoundEffect + '>';
      var finishSoundEffect = '<se.' + $scope.options.finishSoundEffect + '>';

      var macroList = [];

      var macroString = '';
      var macroLineCount = 0;
      var macroIndex = 1;

      for (var j = 0; j < lines.length; j++) {
        macroString += lines[j];
        macroLineCount += 1;

        if (macroLineCount == MAX_LINES-1) {
          if (lines.length - (j + 1) > 1) {
            macroString += '/echo Macro #' + macroIndex + ' complete ' + stepSoundEffect + '\n';
            macroList.push(macroString);
            macroString = '';
            macroLineCount = 0;
            macroIndex += 1;
          }
        }
      }

      if (macroLineCount > 0) {
        if (macroLineCount < MAX_LINES) {
          macroString += '/echo Macro #' + macroIndex + ' complete ' + finishSoundEffect + '\n';
        }
        macroList.push(macroString)
      }

      return macroList;
    }
  }
})();
