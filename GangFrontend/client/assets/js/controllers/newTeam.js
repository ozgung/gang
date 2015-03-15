(function () {
    'use strict';

    angular.module('application')

        .controller('NewTeamCtrl', function ($scope, $state, chat, fb, user, teams, $location, $q,backend,$window) {
            $scope.teamName = "";
            $scope.submit = function () {

                var cTeamResult = backend.createTeam($scope.teamName);

                function handleSuccess(id) {
                    //alert("id of the new team : " + id);
                    //$location.path(id);
                    $state.go("chat", {channel:id}, {reload: true}).then(function(x){
                    $window.location.reload();
                    });

                }

                function handleError(error) {
                    alert("Sorry " + error);
                    $scope.teamName = "";
                }

                cTeamResult.then(handleSuccess, handleError);

                console.log($scope.teamName, "created");


            };




        });
})();
