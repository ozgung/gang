(function () {

    'use strict';

    angular.module('application')

        .controller('GuestCtrl', function ($scope, $rootScope, $state, fb, backend) {

            $scope.fbReady = fb.ready;

            $scope.login = function () {

                fb.login().then(function (response) {
                    //send fb token to the backend
                    console.log("GuestCtrl.login","facebook user id (00112): ", response);
                    return backend.authFB();

                }).then(function (response) {
                    $state.go('account');
                });
            };



        });

})();