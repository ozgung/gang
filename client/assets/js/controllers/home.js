(function() {
  'use strict';

  angular.module('application')
  
		.controller('HomeCtrl',function($scope,$state,chat,fb,user){
			
			$scope.teams = user.teams;
			
			$scope.logout = function() {
				fb.logout().then(function(){
					$state.go('welcome');
				});
			};
			
			$scope.changeTeam = function(team){
			
				chat.setActiveChannel(team);
				$state.go('chat',{
					channel:team.id
				});
			};
		});
		
})();
