(function () {
    'use strict';

    angular.module('application')

        .controller('AccountCtrl', function ($scope, $state, chat, user, fb) {

            $scope.teams = chat.subscribedChannels;

            chat.setChannels(user.groups);

            $scope.logout = function () {
                fb.logout().then(function () {
                    $state.go('guest');
                });

            };
        });

})();
