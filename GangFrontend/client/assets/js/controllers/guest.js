(function() {

  'use strict';

  angular.module('application')
  
		.controller('GuestCtrl',function($scope,$rootScope,$state,fb){
			
			$scope.fbReady = fb.ready;
			
			$scope.login = function() {
			
				fb.login().then(function(response){
					// ozgun
					var access_token = localStorage.setItem('access-token')
					console.log(access_token)
					/*backend.request('login',{access-token: access_token}).then(function(data){
					token.set(data.token);
					$state.go('chat');
					});*/
					// ozgun
					$state.go('account');
				});
			};
		
		});
		
})();