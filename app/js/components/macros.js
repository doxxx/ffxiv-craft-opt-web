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
      controller: function ($scope, $translate, _actionsByName) {
        var update = function() {
          if (typeof $scope.sequence == 'undefined') {
            return '';
          }

          var maxLines = 14;

          var waitString = '<wait.' + $scope.options.waitTime + '>';
          var lines = [];

          for (var i = 0; i < $scope.sequence.length; i++) {
            var action = $scope.sequence[i];
            var info = _actionsByName[action];
            if (info) {
              var actionName = $translate.instant(info.name);
              lines.push('/ac "' + actionName + '" <me> ' + waitString + '\n');
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
            if (step % maxLines == 0) {
              macroString += '/echo Macro step ' + step / maxLines + ' complete <se.1>\n';
              macroList.push(macroString);
              macroString = '';
            }
          }

          if (macroString !== '') {
            macroString += '/echo Macro step ' + Math.ceil(lines.length / maxLines) + ' complete <se.1>\n';
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
