'use strict';

/* Directives */
angular.module('ffxivCraftOptWeb.directives', [])
  .directive('appVersion', [
    'version', function (version) {
      return function (scope, elm, attrs) {
        elm.text(version);
      };
    }
  ])

  .directive('mySectionHeader', function () {
    return {
      restrict: 'E',
      scope: {
        isOpen: '=',
        title: '@'
      },
      templateUrl: 'partials/section-header.html'
    }
  })

  .directive('selectOnClick', function () {
    // Linker function
    return function (scope, element, attrs) {
      element.bind('click', function () {
        this.select();
      });
    };
  })

  .directive('selectOnFocus', function () {
    // Linker function
    return function (scope, element, attrs) {
      element.bind('focus', function () {
        this.select();
      });
    };
  })

  .directive('isolateScrolling', function () {
    return {
      restrict: 'A',
      link: function (scope, element, attr) {
        element.bind('mousewheel', function (e) {
          if ((e.deltaY > 0 && this.clientHeight + this.scrollTop == this.scrollHeight) ||
              (e.deltaY < 0 && this.scrollTop == 0)) {
            e.stopPropagation();
            e.preventDefault();
            return false;
          }

          return true;
        });
      }
    };
  })

  .directive('stopClickPropogation', function () {
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
  })

  .directive('myDropdownToggle', [
    '$document', '$location', function ($document, $location) {
      var openElement = null,
        closeMenu = angular.noop,
        focusElement = null,
        searchFocusElement = function (root) {
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
        link: function (scope, element, attrs) {
          scope.$watch('$location.path', function () {
            closeMenu();
          });
          element.parent().bind('click', function () {
            closeMenu();
          });
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
                delete parent[0].closeMenu;
                openElement = null;
              };
              $document.bind('click', closeMenu);
              $document.bind('keyup', function (event) {
                if (event.which === 27) {
                  closeMenu(event);
                }
              });
              parent[0].closeMenu = closeMenu;
              focusElement = searchFocusElement(parent);
              if (focusElement !== undefined) {
                focusElement[0].focus();
              }
            }
          });
        }
      };
    }
  ])

  .directive('autoFocus', function ($timeout) {
    return {
      restrict: 'AC',
      link: function (_scope, _element) {
        $timeout(function () {
          _element[0].focus();
        }, 0);
      }
    };
  })

  .directive('onEnter', function () {
    // Linker function
    return function (scope, element, attrs) {
      element.bind('keypress', function (event) {
        if (event.keyCode == 13) {
          scope.$apply(function () {
            scope.$eval(attrs['onEnter']);
          });
        }
      });
    };
  })

  .directive('simulatorStatus', function () {
    return {
      restrict: 'E',
      templateUrl: 'partials/simulator-status.html',
      scope: {
        recipe: '=',
        status: '=',
        valid: '&'
      }
    }
  });
