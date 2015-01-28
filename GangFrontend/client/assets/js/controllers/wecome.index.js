(function() {

  'use strict';

  angular.module('application')
  
		.controller('WelcomeIndexCtrl',function($scope,$rootScope,$state,fb){
			
			$scope.fbReady = fb.ready;
			
			$scope.login = function() {
			
				fb.login().then(function(response){
					
					$state.go('home');
				});
			};
		
		});
		
})();