(function () {
    'use strict';

    angular.module('application')

        .controller('AccountCtrl', function ($scope, $state, chat, user, fb, backend) {

            backend.me().then(function (me) {
                console.log("DEBUG TEAM 000 me: ", me);
                var teams = [];
                me.teams.forEach(function (_team) {
                    console.log("DEBUG TEAM 001", _team);

                    teams.push(_team.team)
                });

                $scope.teams = teams;
                console.log("DEBUG TEAMS 002", teams);
            });

            chat.setChannels(user.groups);

            $scope.logout = function () {
                fb.logout().then(function () {
                    $state.go('guest');
                });

            };

            chat.getActiveChannel().then(function (c) {
                $scope.activeChannel = c;
            });

            $scope.numberOfunreadMessages = chat.numberOfunreadMessages

        });

})();
