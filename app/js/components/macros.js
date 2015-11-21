'use strict';

angular.module('ffxivCraftOptWeb.components')
  .directive('macros', function () {
    return {
      restrict: 'E',
      templateUrl: '../../components/macros.html',
      scope: {
        sequence: '=',
        options: '='
      },
      controller: function ($scope, $translate, _actionsByName, _allActions) {
        var update = function() {
          if (typeof $scope.sequence == 'undefined') {
            return '';
          }

          var buffs = {};
          for (var i = 0; i < _allActions.length; i++) {
            var action = _allActions[i];
            if (action.buff) {
              buffs[action.shortName] = true;
            }
          }

          var maxLines = 14;

          var waitString = '<wait.' + $scope.options.waitTime + '>';
          var buffWaitString = '<wait.' + $scope.options.buffWaitTime + '>';
          var stepSoundEffect = '<se.' + $scope.options.stepSoundEffect + '>';
          var finishSoundEffect = '<se.' + $scope.options.finishSoundEffect + '>';

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

          var macroList = [];

          var macroString = '';
          for (var j = 0; j < lines.length; j++) {
            macroString += lines[j];
            var step = j + 1;
            if (step % maxLines === 0) {
              macroString += '/echo Macro #' + step / maxLines + ' complete ' + stepSoundEffect + '\n';
              macroList.push(macroString);
              macroString = '';
            }
          }

          if (macroString !== '') {
            macroString += '/echo Macro #' + Math.ceil(lines.length / maxLines) + ' complete ' + finishSoundEffect + '\n';
            macroList.push(macroString)
          }

          $scope.macroList = macroList;
        };

        $scope.$on('$translateChangeSuccess', update);
        $scope.$watchCollection('sequence', update);
        $scope.$watchCollection('options', update);

        update();
      }
    }
  });
