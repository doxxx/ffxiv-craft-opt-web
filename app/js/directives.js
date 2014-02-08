'use strict';

/* Directives */
var module = angular.module('ffxivCraftOptWeb.directives', []);

module.directive('appVersion', ['version', function(version) {
  return function(scope, elm, attrs) {
    elm.text(version);
  };
}]);

module.directive('mySectionHeader', function() {
  return {
    restrict: 'E',
    scope: {
      isOpen: '=',
      title: '@',
    },
    templateUrl: 'partials/section-header.html'
  }
});

module.directive('selectOnClick', function () {
    // Linker function
    return function (scope, element, attrs) {
        element.bind('click', function () {
            this.select();
        });
    };
});

module.directive('selectOnFocus', function () {
    // Linker function
    return function (scope, element, attrs) {
        element.bind('focus', function () {
            this.select();
        });
    };
});

module.directive('isolateScrolling', function () {
  return {
    restrict: 'A',
    link: function (scope, element, attr) {
      element.bind('mousewheel', function (e) {
        if ((e.deltaY > 0 && this.clientHeight + this.scrollTop == this.scrollHeight) ||
            (e.deltaY < 0 && this.scrollTop == 0))
        {
          e.stopPropagation();
          e.preventDefault();
          return false;
        }

        return true;
      });
    }
  };
});

module.directive('stopClickPropogation', function () {
  return {
    restrict: 'A',
    link: function (scope, element, attr) {
      element.bind('click', function (e) {
        e.stopPropagation();
        e.preventDefault();
        return false;
      });
    }
  };
});

module.directive('myDropdownToggle', ['$document', '$location', function ($document, $location) {
  var openElement = null,
      closeMenu   = angular.noop,
      focusElement = null,
      hasFocusClass = function(e) { return e.hasClass('my-dropdown-focus'); },
      searchFocusElement = function(root) {
        var children = root.children();
        for (var i = 0; i < children.length; i++) {
          var e = angular.element(children[i]);
          if (e.hasClass('my-dropdown-focus')) {
            return e;
          }
        }
        for (var i = 0; i < children.length; i++) {
          var e = searchFocusElement(angular.element(children[i]));
          if (e !== undefined) {
            return e;
          }
        }
        return undefined;
      };
  return {
    restrict: 'CA',
    link: function(scope, element, attrs) {
      scope.$watch('$location.path', function() { closeMenu(); });
      element.parent().bind('click', function() { closeMenu(); });
      element.bind('click', function (event) {
        var elementWasOpen = (element === openElement);

        event.preventDefault();
        event.stopPropagation();

        if (!!openElement) {
          closeMenu();
        }

        if (!elementWasOpen && !element.hasClass('disabled') && !element.prop('disabled')) {
          var parent = element.parent();
          while (parent.length > 0 && !parent.hasClass('my-dropdown')) {
            parent = parent.parent();
          }
          if (parent.length === 0) {
            console.error('could not find parent element with my-dropdown class');
            return;
          }
          parent.addClass('open');
          openElement = element;
          closeMenu = function (event) {
            if (event) {
              event.preventDefault();
              event.stopPropagation();
            }
            $document.unbind('click', closeMenu);
            parent.removeClass('open');
            closeMenu = angular.noop;
            openElement = null;
          };
          $document.bind('click', closeMenu);
          $document.bind('keyup', function(event) {
            if (event.which === 27) {
              closeMenu();
            }
          });
          focusElement = searchFocusElement(parent);
          if (focusElement !== undefined) {
            focusElement[0].focus();
          }
        }
      });
    }
  };
}]);
