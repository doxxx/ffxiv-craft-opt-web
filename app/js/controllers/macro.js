var controllers = angular.module('ffxivCraftOptWeb.controllers');

controllers.controller('MacroCtrl', function($scope, $modalInstance, allActions, sequence) {
  $scope.waitTime = 3;
  $scope.macros = createMacros(allActions, sequence, $scope.waitTime);

  $scope.$watch('waitTime', function() {
    $scope.macros = createMacros(allActions, sequence, $scope.waitTime);
  });

  $scope.close = function() {
    $modalInstance.dismiss('close');
  }
});

function createMacros(allActions, actions, waitTime, insertTricks) {
  if (typeof actions == 'undefined') {
    return '';
  }

  waitTime = typeof waitTime !== 'undefined' ? waitTime : 3;
  insertTricks = typeof insertTricks !== 'undefined' ? insertTricks : false;

  var maxLines = 14

  var waitString = '/wait ' + waitTime + '\n'
  var lines = [];

  for (var i = 0; i < actions.length; i++) {
    var action = actions[i];
    if (action !== 'tricksOfTheTrade') {
      lines.push('/ac "' + allActions[action].name + '" <me>\n');
      lines.push(waitString);
      if (insertTricks) {
        lines.append('/ac "Tricks of the Trade" <me>=\n')
        lines.push(waitString);
      }
    }
  }

  var macros = []

  var macroString = ''
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];
    macroString += line;
    var step = i + 1;
    if (step % maxLines == 0) {
      macroString += '/echo Macro step ' + step/maxLines + ' complete <se.1>\n';
      macros.push(macroString);
      macroString = '';
    }
  }

  if (macroString !== '') {
    macroString += '/echo Macro step ' + Math.ceil(lines.length/maxLines) + ' complete <se.1>\n';
    macros.push(macroString)
  }

  return macros;
}
