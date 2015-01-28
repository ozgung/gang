(function() {
  'use strict';

  angular.module('application')
  
		.controller('HomeCtrl',function($scope,$state,chat,fb,data){
			
			$scope.message = '';
			$scope.messages = chat.messages;
			
			$scope.user = data.user;
			
			$scope.groups = data.groups;
			
			$scope.send = function(){
				chat.sendMessage($scope.message);
				$scope.message = '';
			};
			
			$scope.logout = function() {
				fb.logout().then(function(){
					$state.go('welcome');
				});
			};
			
			$scope.changeChannel = function(channel){
				chat.setActiveChannel(channel);
				$state.go('chat',{
					channel:channel.id
				});
			};
		});
		
})();
