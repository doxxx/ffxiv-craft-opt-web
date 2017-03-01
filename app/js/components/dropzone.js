(function () {
  'use strict';

  angular
    .module('ffxivCraftOptWeb.directives')
    .directive('myDropzone', dropzone);

  function dropzone() {
    return {
      restrict: 'A',
      link: function (scope, elem, attrs) {
        elem.bind('dragover', function (e) {
          e.preventDefault();
        });
        elem.bind('dragenter', function (e) {
          e.preventDefault();
        });
        elem.bind('drop', function (e) {
          e.stopPropagation();
          e.preventDefault();

          var files = e.dataTransfer.files;
          for (var i = 0, f; f = files[i]; i++) {
            var reader = new FileReader();
            reader.readAsArrayBuffer(f);

            reader.onload = (function (f, reader) {
              return function () {
                var data = {
                  name: f.name,
                  type: f.type,
                  size: f.size,
                  lastModifiedDate: f.lastModifiedDate,
                  content: reader.result
                };

                var handler = scope.$eval(attrs['dropHandler']);
                scope.$apply(function () { handler(data); });
              };
            })(f, reader);
          }
        });
      }
    }
  }
})();
