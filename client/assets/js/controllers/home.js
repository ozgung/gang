(function() {
  'use strict';

  angular.module('application')
  
		.controller('HomeCtrl',function($scope,$state,chat,fb,blabla){
			
			$scope.message = '';
			$scope.messages = chat.messages;
			
			$scope.user = blabla.user;
			
			$scope.groups = blabla.groups;
			
			$scope.send = function(){
				chat.sendMessage($scope.message,'#channel');
				$scope.message = '';
			};
			
			$scope.logout = function() {
				fb.logout().then(function(){
					$state.go('welcome');
				});
			};
		});
		
})();
