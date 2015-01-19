(function() {

  'use strict';

  angular.module('application')
  
		.controller('WelcomeCtrl',function($scope,$state,Gang){
				
			$scope.login = function() {
			
				Gang.facebook.login().then(function(response){
					
					Gang.auth = response;
					$state.go('home');
				});
			};
		
		});
		
})();