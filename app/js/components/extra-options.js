(function () {
    'use strict';

    angular
        .module('ffxivCraftOptWeb.components')
        .directive('extraOptions', factory);

    function factory() {
        return {
            restrict: 'E',
            templateUrl: 'components/extra-options.html',
            scope: {
                sequenceSettings: '=',
                onClick: '=',
                selectable: '=',
                draggable: '=',
                tooltipPlacement: '@'
            },
            controller: controller
        }
    }


    function controller($scope) {
    }
})();
