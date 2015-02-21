(function() {

  'use strict';

  angular.module('application')
  
		.controller('SigninCtrl',function($scope,$state,backend,token){
		
			$scope.signin = function(){

				var access_token = localStorage.setItem('access-token')
				console.log(access_token)
				backend.request('login',{access-token: access_token}).then(function(data){
					token.set(data.token);
					$state.go('chat');
				});
			}
		});
		
})();