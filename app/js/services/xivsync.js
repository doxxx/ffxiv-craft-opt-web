'use strict';

var XIVSyncBase = "http://xivsync.com";
var XIVSyncSearch = "/search/character";
var XIVSyncCharGet = "/character/get";

var XIVServers = [
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
  "Malboro",
  "Mandragora",
  "Masamune",
  "Mateus",
  "Midgardsormr",
  "Moogle",
  "Odin",
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

var classJobIDs = {
  8: "Carpenter",
  9: "Blacksmith",
  10: "Armorer",
  11: "Goldsmith",
  12: "Leatherworker",
  13: "Weaver",
  14: "Alchemist",
  15: "Culinarian"
};


var XIVSync = function($http, $q) {
  this.$http = $http;
  this.$q = $q;
};

XIVSync.$inject = ['$http', '$q'];

XIVSync.prototype.getServers = function () {
  return XIVServers;
};

XIVSync.prototype.search = function (name, server) {
  var url = XIVSyncBase + XIVSyncSearch;
  var config = {
    params: {
      name: name,
      server: server
    }
  };
  var self = this;
  return this.$http.get(url, config).then(function (response) {
    if (response.data.ok) {
      return response.data.data;
    }
    else {
      return self.$q.reject(response.data.msg);
    }
  });
};

XIVSync.prototype.getCharacter = function (id) {
  var canceller = this.$q.defer();
  var url = XIVSyncBase + XIVSyncCharGet;
  var config = {
    params: {
      lodestone: id
    },
    timeout: canceller
  };
  var self = this;
  var promise = this.$http.get(url, config).then(function (response) {
    if (response.data.ok) {
      var d = response.data.data;
      var r = {
        id: d.id,
        name: d.name,
        server: d.world,
        classes: {}
      };

      for (var i = 0; i < d.classjobs.length; i++) {
        var job = d.classjobs[i];
        var className = classJobIDs[job.real_id];
        if (className) {
          var classInfo = {
            name: className,
            level: Number(job.level) || 0
          };
          var gear = d.gear[job.name.toLowerCase()];
          if (gear && gear.attributes) {
            classInfo.craftsmanship = Number(gear.attributes.craftsmanship) || 0;
            classInfo.control = Number(gear.attributes.control) || 0;
            classInfo.cp = Number(gear.attributes.cp) || 0;
          }
          else {
            classInfo.craftsmanship = 0;
            classInfo.control = 0;
            classInfo.cp = 0;
          }
          r.classes[classInfo.name] = classInfo;
        }
      }
      return r;
    }
    else {
      return self.$q.reject(response.data.msg);
    }
  });
  promise.cancel = function (reason) {
    canceller.resolve(reason);
  };
  return promise;
};


angular.module('ffxivCraftOptWeb.services.xivsync', []).
  service('_xivsync', XIVSync);
