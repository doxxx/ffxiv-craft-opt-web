'use strict';

var controllers = angular.module('ffxivCraftOptWeb.controllers');

controllers.controller('LoginCtrl', function($scope, $modalInstance, _firebaseProfile) {
  $scope.tabs = {
    login: { active: true, error: null },
    register: { active: false, error: null }
  };
  $scope.info = {
    email: '',
    password: '',
    rememberMe: true
  };
  $scope.loginInProgress = false;
  $scope.registerInProgress = false;

  $scope.cancel = function() {
    $modalInstance.dismiss('cancel');
  };

  $scope.register = function() {
    $scope.registerInProgress = true;
    $scope.tabs.register.error = null;
    _firebaseProfile.create($scope.info).then(
      function() {
        $scope.registerInProgress = false;
        $scope.login();
      },
      function(error) {
        $scope.registerInProgress = false;
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

  $scope.login = function() {
    $scope.loginInProgress = true;
    $scope.tabs.login.error = null;
    _firebaseProfile.login($scope.info).then(
      function() {
        $scope.loginInProgress = false;
        $modalInstance.close();
      },
      function(error) {
        $scope.loginInProgress = false;
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
