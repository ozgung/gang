(function() {
  'use strict';

  angular.module('application')
  
		.controller('HomeCtrl',function($scope,$state,chat,user,token){
			
			$scope.teams = user.teams;
			
			$scope.logout = function() {
				token.unset();
				$state.go('welcome.index');
			};
			
			$scope.changeTeam = function(team){
			
				chat.setActiveChannel(team);
				$state.go('chat',{
					channel:team.id
				});
			};
		});
		
})();
