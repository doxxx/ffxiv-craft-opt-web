angular.module('ffxivCraftOptWeb.controllers')
  .controller('MacroCtrl', function ($scope, $translate, _actionsByName) {
    function createMacros() {
      if (typeof $scope.sequence == 'undefined') {
        return '';
      }

/*
      var totName = $translate.instant('Tricks of the Trade');
*/

      var maxLines = 14;

      var waitString = '<wait.' + $scope.macroOptions.waitTime + '>';
      var lines = [];

      for (var i = 0; i < $scope.sequence.length; i++) {
        var action = $scope.sequence[i];
        if (action !== 'tricksOfTheTrade') {
          var actionName = $translate.instant(_actionsByName[action].name);
          lines.push('/ac "' + actionName + '" <me> ' + waitString + '\n');
/*
          if (insertTricks) {
            lines.append('/ac "' + totName + '" <me> ' + waitString + '\n');
            lines.push(waitString);
          }
*/
        }
      }

      var macros = [];

      var macroString = '';
      for (var j = 0; j < lines.length; j++) {
        macroString += lines[j];
        var step = j + 1;
        if (step % maxLines == 0) {
          macroString += '/echo Macro step ' + step / maxLines + ' complete <se.1>\n';
          macros.push(macroString);
          macroString = '';
        }
      }

      if (macroString !== '') {
        macroString += '/echo Macro step ' + Math.ceil(lines.length / maxLines) + ' complete <se.1>\n';
        macros.push(macroString)
      }

      return macros;
    }

    $scope.$watch('sequence', function () {
      $scope.macros = createMacros();
    });

    $scope.$on('macro.options.changed', function () {
      $scope.macros = createMacros();
    });

  });
