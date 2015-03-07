(function () {
    'use strict';

    angular.module('application')

        .controller('AccountCtrl', function ($scope, $state, chat, fb, user, teams, $window) {

            chat.setChannels(teams);

            $scope.user = user;
            $scope.teams = teams;


            /**
             *todo
             * @param team
             * @returns {string}
             */
            $scope.getTeamColor = function (team) {
                team.id
                return "#c0392b"
            };

            /**
             * todo
             * @param team
             * @returns {string}
             */
            $scope.getTeamShortName = function (team) {
                team.name
                return "IS"
            };

            $scope.numberOfunreadMessages = chat.numberOfunreadMessages;

            $scope.logout = function () {

                $window.localStorage.removeItem('token');
                $window.localStorage.removeItem('lastChannel')
                $state.go('guest');
            };
        });
})();
