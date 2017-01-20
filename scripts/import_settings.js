(function () {
  'use strict';

  var json = window.prompt('Paste the copied text here')
  if (json) {
    var data;
    try {
      data = JSON.parse(json);
    }
    catch (err) {
      window.alert('The text you pasted is incorrect, please try again.\n\n' + err.message);
      return;
    }
    console.log('Importing settings into local storage:', data);
    for (var key in data) {
      if (data.hasOwnProperty(key)) {
        localStorage[key] = data[key];
      }
    }
    window.alert('Settings have been imported, application will now be reloaded');
    window.location.reload();
  }
})();
