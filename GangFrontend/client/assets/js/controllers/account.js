(function () {
    'use strict';

    angular.module('application')

        .controller('AccountCtrl', function ($scope, $state, chat, fb, backend) {

            backend.me().then(function(me){
						
                var teams = [];
								
                me.teams.forEach(function(team){
								
                  teams.push(team.team)
                });

                $scope.teams = teams;
								
								chat.setChannels(teams);
            });

            $scope.logout = function () {
						
              fb.logout().then(function(){
							
								$state.go('guest');
              });
            };

            $scope.numberOfunreadMessages = chat.numberOfunreadMessages

        });

})();
