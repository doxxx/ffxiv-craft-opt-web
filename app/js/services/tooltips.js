(function () {
  'use strict';

  angular
    .module('ffxivCraftOptWeb.services.tooltips', [])
    .service('_tooltips', TooltipsService);

  function TooltipsService($rootScope, $q, $translate, _allActions, _allClasses, _actionsByName) {
    this.$rootScope = $rootScope;
    this.$q = $q;
    this.$translate = $translate;
    this._allActions = _allActions;
    this._allClasses = _allClasses;
    this._actionsByName = _actionsByName;

    this.actionTooltips = {};
  }

  TooltipsService.$inject = ['$rootScope', '$q', '$translate', '_allActions', '_allClasses', '_actionsByName'];

  TooltipsService.prototype.loadTooltips = function (lang) {
    this.actionTooltips = {};

    for (var i = 0; i < this._allActions.length; i++) {
      var action = this._allActions[i];
      if (action.skillID) {
        if (action.cls === 'All') {
          for (var j = 0; j < this._allClasses.length; j++) {
            var cls = this._allClasses[j];
            this.actionTooltips[cls + action.shortName] = this.renderTooltip(action);
          }
        }
        else {
          this.actionTooltips[action.cls + action.shortName] = this.renderTooltip(action);
        }
      }
    }

    this.$rootScope.$broadcast("tooltipCacheUpdated");

    var deferred = this.$q.defer();
    var promise = deferred.promise;
    deferred.resolve(true);
    return promise;
  };

  TooltipsService.prototype.renderTooltip = function (action) {
    var T = this.$translate.instant;
    var efficiency = (action.qualityIncreaseMultiplier > 0 ? action.qualityIncreaseMultiplier : action.progressIncreaseMultiplier) * 100;
    var successRate = action.successProbability * 100;
    return "<!--actiontooltip-->"
           + "<div class='action-tooltip-title'>" + T(action.name) + " (" + T("LEVEL") + " " + action.level + ")</div>\n"
           + "<div class='action-tooltip-fields'>"
           + "<span class='action-tooltip-field-name'>" + T("CP_COST") + ":</span>&emsp;<span class='action-tooltip-field-value'>" + action.cpCost + "</span><br/>\n"
           + "<span class='action-tooltip-field-name'>" + T("DURABILITY_COST") + ":</span>&emsp;<span class='action-tooltip-field-value'>" + action.durabilityCost + "</span><br/>\n"
           + "<span class='action-tooltip-field-name'>" + T("EFFICIENCY") + ":</span>&emsp;<span class='action-tooltip-field-value'>" + efficiency + "%</span><br/>\n"
           + "<span class='action-tooltip-field-name'>" + T("SUCCESS_RATE") + ":</span>&emsp;<span class='action-tooltip-field-value'>" + successRate + "%</span><br/>\n"
           + "</div>"
  };

})();
