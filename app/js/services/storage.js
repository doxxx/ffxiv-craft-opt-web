'use strict';

var storageModule = angular.module('ffxivCraftOptWeb.services.storage', []);



var LocalStorageService = function() {
  return this;
};

LocalStorageService.prototype.get = function (key) {
  var value = localStorage.getItem(key);
  if (value !== null) value = JSON.parse(value);
  return value;
};

LocalStorageService.prototype.put = function (key, value) {
  if (value === undefined || value === null) {
    throw new TypeError('value may not be undefined or null');
  }
  localStorage.setItem(key, JSON.stringify(value));
};

LocalStorageService.prototype.remove = function (key) {
  localStorage.removeItem(key);
};

LocalStorageService.prototype.hasKey = function (key) {
  return localStorage.getItem(key) !== null;
};

storageModule.service('_localStorage', LocalStorageService);



var CloudStorageService = function ($resource) {
  this.db = $resource('/db/:key', {
    create: {
      method: 'PUT'
    }
  });
  this.data = null;
  return this;
};

CloudStorageService.$inject = ['$resource'];

CloudStorageService.prototype.create = function (key, successFn, failureFn) {
  if (key === undefined || key === null) {
    throw new TypeError('key may not be undefined or null');
  }
  this.key = key;
  this.db.create({key: key}, this.data, function () {
    successFn();
  }, function () {
    failureFn();
  });
};

CloudStorageService.prototype.load = function (key, successFn, failureFn) {
  if (key === undefined || key === null) {
    throw new TypeError('key may not be undefined or null');
  }
  this.key = key;
  this.data = this.db.get({key: key}, function () {
    successFn();
  }, function () {
    failureFn();
  });
};

CloudStorageService.prototype.get = function (key) {
  if (this.data === null) {
    throw new Error('No data loaded from cloud storage');
  }

  return this.data[key];
};

CloudStorageService.prototype.put = function (key, value) {
  if (value === undefined || value === null) {
    throw new TypeError('value may not be undefined or null');
  }
  if (this.data === null) {
    throw new Error('No data loaded from cloud storage');
  }

  this.data[key] = value;
  this._save();
};

CloudStorageService.prototype.remove = function (key) {
  if (this.data === null) {
    throw new Error('No data loaded from cloud storage');
  }

  delete this.data[key];
  this._save();
};

CloudStorageService.prototype.hasKey = function (key) {
  if (this.data === null) {
    throw new Error('No data loaded from cloud storage');
  }

  return this.data.hasOwnProperty(key);
};

CloudStorageService.prototype._save = function () {
  this.db.save({key: key}, value);
};

storageModule.service('_cloudStorage', CloudStorageService);