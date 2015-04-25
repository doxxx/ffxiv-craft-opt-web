angular.module('ffxivCraftOptWeb.controllers')
  .controller('MacroCtrl', function ($scope, $modalInstance, $translate, allActions, sequence) {
    $scope.waitTime = 3;
    $scope.insertTricks = false;

    function createMacros() {
      if (typeof sequence == 'undefined') {
        return '';
      }

      var waitTime = typeof $scope.waitTime !== 'undefined' ? $scope.waitTime : 3;
      var insertTricks = typeof $scope.insertTricks !== 'undefined' ? $scope.insertTricks : false;

      var totName = $translate.instant('Tricks of the Trade');

      var maxLines = 14;

      var waitString = '<wait.' + waitTime + '>';
      var lines = [];

      for (var i = 0; i < sequence.length; i++) {
        var action = sequence[i];
        if (action !== 'tricksOfTheTrade') {
          var actionName = $translate.instant(allActions[action].name);
          lines.push('/ac "' + actionName + '" <me> ' + waitString + '\n');
          if (insertTricks) {
            lines.append('/ac "' + totName + '" <me> ' + waitString + '\n');
            lines.push(waitString);
          }
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

    $scope.macros = createMacros();

    $scope.$watch('waitTime', function () {
      $scope.macros = createMacros();
    });

    $scope.$watch('insertTricks', function () {
      $scope.macros = createMacros();
    });

    $scope.close = function () {
      $modalInstance.dismiss('close');
    }
  });
