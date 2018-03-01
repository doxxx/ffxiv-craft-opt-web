(function () {
  'use strict';

  angular
    .module('ffxivCraftOptWeb.controllers')
    .controller('MacroImportController', controller);

  function controller($scope, $modalInstance, $translate, _actionsByName) {
    //noinspection AssignmentResultUsedJS
    var vm = $scope.vm = {};

    vm.macroText = "";

    vm.importMacro = importMacro;
    vm.cancel = cancel;
    vm.canImport = canImport;

    //////////////////////////////////////////////////////////////////////////

    function importMacro() {
      var sequence = convertMacro(vm.macroText);
      if (sequence !== undefined) {
        $modalInstance.close({
          sequence: sequence,
        });
      }
    }

    function cancel() {
      $modalInstance.dismiss('cancel');
    }

    function canImport() {
      return vm.macroText.trim().length > 0;
    }

    function convertMacro(macroString) {
      if (macroString === null || macroString === "") {
        return undefined;
      }

      var regex = /\/ac(tion)?\s+"(.*?)"\s*<wait\.\d+>/g;
      var newSequence = [];
      var result;
      while (result = regex.exec(macroString)) {
        var action = result[2];
        for (var key in _actionsByName) {
          var value = _actionsByName[key];
          if (action === value.name || action === $translate.instant(value.name)) {
            newSequence.push(key);
          }
        }
      }

      if (newSequence.length === 0) {
        window.alert("Error: Invalid macro synth sequence.");
        return undefined;
      }

      return newSequence;
    }
  }

})();
