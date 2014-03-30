"use strict";

window.onload = function() {
  var footer = document.getElementById('version-footer');
  var xhr = new XMLHttpRequest();
  xhr.onload = function() {
    footer.outerHTML = this.responseText;
  };
  xhr.open('GET', 'partials/version-footer.html', true);
  xhr.send()
};
