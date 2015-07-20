'use strict';

angular.module('ffxivCraftOptWeb.components')
  .directive('mySectionHeader', function () {
    return {
      restrict: 'E',
      scope: {
        isOpen: '=',
        title: '@'
      },
      templateUrl: 'components/section-header.html'
    }
  });
