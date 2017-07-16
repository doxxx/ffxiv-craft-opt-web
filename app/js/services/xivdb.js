(function () {
  'use strict';

  var BASE_URL = "https://api.xivdb.com";
  var SEARCH_PATH = "/search";
  var CHAR_PATH = "/character";

  var XIV_SERVERS = [
    "Adamantoise",
    "Aegis",
    "Alexander",
    "Anima",
    "Asura",
    "Atomos",
    "Bahamut",
    "Balmung",
    "Behemoth",
    "Belias",
    "Brynhildr",
    "Cactuar",
    "Carbuncle",
    "Cerberus",
    "Chocobo",
    "Coeurl",
    "Diabolos",
    "Durandal",
    "Excalibur",
    "Exodus",
    "Faerie",
    "Famfrit",
    "Fenrir",
    "Garuda",
    "Gilgamesh",
    "Goblin",
    "Gungnir",
    "Hades",
    "Hyperion",
    "Ifrit",
    "Ixion",
    "Jenova",
    "Kujata",
    "Lamia",
    "Leviathan",
    "Lich",
    "Louisoix",
    "Malboro",
    "Mandragora",
    "Masamune",
    "Mateus",
    "Midgardsormr",
    "Moogle",
    "Odin",
    "Omega",
    "Pandaemonium",
    "Phoenix",
    "Ragnarok",
    "Ramuh",
    "Ridill",
    "Sargatanas",
    "Shinryu",
    "Shiva",
    "Siren",
    "Tiamat",
    "Titan",
    "Tonberry",
    "Typhon",
    "Ultima",
    "Ultros",
    "Unicorn",
    "Valefor",
    "Yojimbo",
    "Zalera",
    "Zeromus",
    "Zodiark"
  ];

  var CLASS_JOB_IDS = {
    8: "Carpenter",
    9: "Blacksmith",
    10: "Armorer",
    11: "Goldsmith",
    12: "Leatherworker",
    13: "Weaver",
    14: "Alchemist",
    15: "Culinarian"
  };

  angular
    .module('ffxivCraftOptWeb.services.xivdb', [])
    .service('_xivdb', XIVDBService);


  function XIVDBService($http, $q) {
    this.$http = $http;
    this.$q = $q;
  }

  XIVDBService.$inject = ['$http', '$q'];

  XIVDBService.prototype.getServers = function () {
    return XIV_SERVERS;
  };

  XIVDBService.prototype.search = function (name, server) {
    var url = BASE_URL + SEARCH_PATH;
    var config = {
      params: {
        one:'characters',
        'server|et': server,
        string: name,
        language: 'en'
      }
    };
    var self = this;
    return this.$http.get(url, config).then(function (response) {
      if (response.data.characters) {
        return response.data.characters.results;
      }
      else {
        return self.$q.reject(response.data.msg);
      }
    });
  };

  XIVDBService.prototype.getCharacter = function (id) {
    var canceller = this.$q.defer();
    var url = BASE_URL + CHAR_PATH + '/' + id;
    var profileConfig = {
      timeout: canceller
    };
    var gearsetsConfig = {
      params: {
        data: 'gearsets'
      },
      timeout: canceller
    };
    var self = this;

    var promise = this.$q.all({
      profile: this.$http.get(url, profileConfig),
      gearsets: this.$http.get(url, gearsetsConfig)
    }).then(function (responses) {
      if (responses.profile.status == 200) {
        var profile = responses.profile.data.data;
        var gearsets = responses.gearsets.data;

        var profileLastUpdated = new Date(responses.profile.data.last_updated + " UTC");

        // Workaround for xivdb gearsets query sometimes returning object instead of array
        if (!(gearsets instanceof Array)) {
          gearsets = Object.values(gearsets)
        }

        // Sort gearsets by level descending
        gearsets.sort(function (a,b) {
          return b.level - a.level
        });

        var r = {
          id: profile.id,
          name: profile.name,
          server: profile.server,
          classes: {}
        };

        for (var classJobId in profile.classjobs) {
          var className = CLASS_JOB_IDS[classJobId];
          if (className) {
            var classJobInfo = profile.classjobs[classJobId];
            if (classJobInfo.level > 0) {
              r.classes[className] = {
                name: className,
                level: classJobInfo.level,
                levelLastUpdated: profileLastUpdated
              }
            }
          }
        }

        for (var i = 0; i < gearsets.length; i++) {
          var gearset = gearsets[i];
          var className = CLASS_JOB_IDS[gearset.classjob_id];
          // Check if this is a crafting class and we haven't seen it already
          if (className && r.classes[className] && !r.classes[className].lastUpdated) {
            var info = r.classes[className];
            info.lastUpdated = new Date(gearset.last_updated + " UTC");
            info.cp = 0;
            info.craftsmanship = 0;
            info.control = 0;
            if (gearset.stats) {
              if (gearset.stats.core) {
                info.cp = gearset.stats.core["CP"] || gearset.stats.core["cp"] || 0;
              }
              if (gearset.stats.mental) {
                info.craftsmanship = gearset.stats.mental["Craftsmanship"] || 0;
                info.control = gearset.stats.mental["Control"] || 0;
              }
              else if (gearset.stats.properties) {
                info.craftsmanship = gearset.stats.properties["Craftsmanship"] || 0;
                info.control = gearset.stats.properties["Control"] || 0;
              }
            }
            r.classes[className] = info;
          }
        }

        return r;
      }
      else {
        return self.$q.reject("failed: " + responses.profile.status);
      }
    });

    promise.cancel = function (reason) {
      canceller.resolve(reason);
    };
    return promise;
  };
})();
