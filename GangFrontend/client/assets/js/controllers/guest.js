(function () {

    'use strict';

    angular.module('application')

        .controller('GuestCtrl', function ($scope, $rootScope, $state, fb, backend) {

            $scope.fbReady = fb.ready;

            $scope.login = function () {
                //todo refactor these: move them to service layer
                fb.login().then(function (response) {
                    //send fb token to the backend
                    console.log("facebook user id (00112): ", response);

                    //todo donot get these from localstorage
                    var fbAuthData = {
                        token: localStorage.getItem('access-token'),
                        expiresIn: localStorage.getItem('expiresIn'),
                        userId: localStorage.getItem('userId'),
                        signedRequest: localStorage.getItem('signedRequest')
                    };

                    return authWithFB(fbAuthData);

                }).then(function (response) {
                    //now we are fully authenticated
                    //should be "0" response.status;
                    localStorage.setItem('token', response.token);
                    $state.go('account');
                });
            };


            function authWithFB(fbAuthData) {
                fbAuthData.test = "0001"; //todo please delete this line now!
                backend.request("loginFB", fbAuthData)
            }

        });

})();