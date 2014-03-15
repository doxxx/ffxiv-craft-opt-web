'use strict';

var controllers = angular.module('ffxivCraftOptWeb.controllers');

controllers.controller('LoginCtrl', function($scope, $modalInstance, $q, _firebaseProfile) {
  $scope.tabs = {
    login: {
      active: true,
      error: null,
      inProgress: false,
      info: {
        email: '',
        password: '',
        rememberMe: true
      }
    },
    register: {
      active: false,
      error: null,
      inProgress: false,
      info: {
        email: '',
        password: '',
        rememberMe: true,
        importLocal: true
      }
    }
  };

  $scope.cancel = function() {
    $modalInstance.dismiss('cancel');
  };

  $scope.register = function(info) {
    $scope.tabs.register.inProgress = true;
    $scope.tabs.register.error = null;
    _firebaseProfile.create(info).then(
      function() {
        $scope.tabs.register.inProgress = false;
        $scope.tabs.login.active = true;
        $scope.login(info);
      },
      function(error) {
        $scope.tabs.register.inProgress = false;
        switch (error.code) {
          case 'EMAIL_TAKEN':
            $scope.tabs.register.error = 'The specified email address is already in use.';
            break;
          case 'INVALID_EMAIL':
            $scope.tabs.register.error = 'The specified email address is invalid.';
            break;
          default:
            $scope.tabs.register.error = 'An unknown error occurred (' + error.code + '). Please contact support@lokyst.net.';
        }
      }
    )
  };

  $scope.login = function(info) {
    $scope.tabs.login.inProgress = true;
    $scope.tabs.login.error = null;
    _firebaseProfile.login(info).then(
      function() {
        $scope.tabs.login.inProgress = false;
        $modalInstance.close(info);
      },
      function(error) {
        $scope.tabs.login.inProgress = false;
        switch (error.code) {
          case 'INVALID_EMAIL':
          case 'INVALID_PASSWORD':
            $scope.tabs.login.error = 'The specified email address or password is incorrect.';
            break;
          default:
            $scope.tabs.login.error = 'An unknown error occurred (' + error.code + '). Please contact support@lokyst.net.';
        }
      }
    )
  };
});
