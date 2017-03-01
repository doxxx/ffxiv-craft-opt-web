(function () {
  'use strict';

  angular
    .module('ffxivCraftOptWeb.controllers')
    .controller('SettingsImportController', controller);

  function controller($scope, $window) {
    //noinspection AssignmentResultUsedJS
    var vm = $scope.vm = {};

    vm.generateFile = generateFile;
    vm.handleDrop = handleDrop;

    //////////////////////////////////////////////////////////////////////////

    function generateFile() {
      var zip = new JSZip();
      zip.file("settings.json", generateExportText());
      zip.generateAsync({type:"blob"})
        .then(function(content) {
          // see FileSaver.js
          saveAs(content, "settings.zip");
        });
    }

    function handleDrop(file) {
      JSZip.loadAsync(file.content)
        .then(function (zip) {
          var settingsJsonFile = zip.file('settings.json');
          if (!settingsJsonFile) {
            throw new Error('settings.json not found');
          }
          settingsJsonFile.async('text')
            .then(function (text) {
              $scope.$apply(function () {
                try {
                  importSettings(text);
                }
                catch (err) {
                  $window.alert('Invalid zip file provided.\n\n' + err.message);
                }
              });
            })
            .catch(function (err) {
              $window.alert('Invalid zip file provided.\n\n' + err.message);
            });
        })
        .catch(function (err) {
          $window.alert('Invalid zip file provided.\n\n' + err.message);
        });
    }

    function importSettings(text) {
      var data;
      data = JSON.parse(text);
      if (!$window.confirm('Are you sure you want to import this settings file? All your existing settings will be overwritten.')) {
        return;
      }
      console.log('Importing settings into local storage:', data);
      for (var key in data) {
        if (data.hasOwnProperty(key)) {
          localStorage[key] = data[key];
        }
      }
      $window.alert('Settings have been imported. Application will now be reloaded.');
      $window.location.reload();
    }

    function generateExportText() {
      var settings = {};

      var keys = [
        'NG_TRANSLATE_LANG_KEY',
        'crafterStats',
        'pageStage_v2',
        'synths',
        'character'
      ];
      for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        settings[key] = localStorage[key];
      }

      return JSON.stringify(settings);
    }
  }

})();
