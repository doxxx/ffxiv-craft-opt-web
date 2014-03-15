'use strict';

// Declare app level module which depends on filters, and services
var app = angular.module('ffxivCraftOptWeb', [
  'ngTouch',
  'ui.bootstrap',
  'lvl.directives.dragdrop',
  'ffxivCraftOptWeb.services',
  'ffxivCraftOptWeb.services.actions',
  'ffxivCraftOptWeb.services.localprofile',
  'ffxivCraftOptWeb.services.firebaseprofile',
  'ffxivCraftOptWeb.services.recipelibrary',
  'ffxivCraftOptWeb.services.simulator',
  'ffxivCraftOptWeb.services.solver',
  'ffxivCraftOptWeb.directives',
  'ffxivCraftOptWeb.filters',
  'ffxivCraftOptWeb.controllers'
]);
