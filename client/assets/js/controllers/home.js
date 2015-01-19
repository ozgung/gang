(function() {
  'use strict';

  angular.module('application')
  
		.controller('HomeCtrl',function($scope,$state,Gang){
			
			$scope.message = '';
			$scope.messages = Gang.messages;
			
			$scope.send = function(){
				Gang.sendMessage($scope.message,'#channel');
				$scope.message = '';
			};
			
			$scope.logout = function() {
				Gang.facebook.logout().then(function(){
					$state.go('welcome');
				});
			};
			
			Gang.facebook.me().then(function(user){
				
				$scope.user = user;
				
				console.log(user);
				
				return Gang.facebook.groups(user.id).then(function(groups){
					
					$scope.groups = groups;
					console.log(groups);
					
				});
			});
		});
		
})();
