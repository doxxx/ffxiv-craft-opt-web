'use strict';

// Declare app level module which depends on filters, and services
var app = angular.module('ffxivCraftOptWeb', [
  'ngTouch',
  'ui.bootstrap',
  'lvl.directives.dragdrop',
  'ffxivCraftOptWeb.services',
  'ffxivCraftOptWeb.services.actions',
  'ffxivCraftOptWeb.services.simulator',
  'ffxivCraftOptWeb.directives',
  'ffxivCraftOptWeb.filters',
  'ffxivCraftOptWeb.controllers',
]);
