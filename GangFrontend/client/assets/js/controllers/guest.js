(function () {

    'use strict';

    angular.module('application')

        .controller('GuestCtrl', function ($scope, $rootScope, $state, fb, backend, $location) {

            $scope.fbReady = fb.ready;

            $scope.login = function () {

                fb.login().then(function (fbResponse) {

                    return backend.authFB(fbResponse);

                }).then(function (response) {
                    var pathToRedirect = localStorage.getItem('afterLoginRedirectTo');
                    if (pathToRedirect) {
                        localStorage.removeItem('afterLoginRedirectTo');
                        $location.path(pathToRedirect);
                    } else {
                        $state.go('account.index');
                    }
                });
            };
        });

})();