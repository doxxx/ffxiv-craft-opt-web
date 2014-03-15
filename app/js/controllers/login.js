'use strict';

var controllers = angular.module('ffxivCraftOptWeb.controllers');

controllers.controller('LoginCtrl', function($scope, $modalInstance, _firebaseProfile) {

  $scope.info = {
    email: '',
    password: '',
    rememberMe: true
  };
  $scope.error = null;
  $scope.loginInProgress = false;
  $scope.createInProgress = false;

  $scope.cancel = function() {
    $modalInstance.dismiss('cancel');
  };

  $scope.createAccount = function() {
    $scope.createInProgress = true;
    console.log('creating account');
    _firebaseProfile.create($scope.info).then(
      function() {
        $scope.createInProgress = false;
        console.log('account created');
        $scope.login();
      },
      function(error) {
        $scope.createInProgress = false;
        console.log('account creation failed: ' + error);
        switch (error.code) {
          case 'EMAIL_TAKEN':
            $scope.error = 'The specified email address is already in use.';
            break;
          default:
            $scope.error = 'An unknown error occurred (' + $error.code + '). Please contact support@lokyst.net.';
        }
      }
    )
  };

  $scope.login = function() {
    $scope.loginInProgress = true;
    _firebaseProfile.login($scope.info).then(
      function() {
        $scope.loginInProgress = false;
        console.log('logged in');
        $modalInstance.close();
      },
      function(error) {
        $scope.loginInProgress = false;
        console.log('login failed: ' + error);
        switch (error.code) {
          case 'INVALID_EMAIL':
          case 'INVALID_PASSWORD':
            $scope.error = 'The specified email address or password is incorrect.';
            break;
          default:
            $scope.error = 'An unknown error occurred (' + $error.code + '). Please contact support@lokyst.net.';
        }
      }
    )
  };
});
