(function() {

  'use strict';

  angular.module('application')
  
		.controller('SignupCtrl',function($scope,$state,backend){
			
			$scope.form = {};
			
			$scope.signup = function(){
				
				backend.request('signup',$scope.form).then(function(data){
					$state.go('signin');
				});
			};
		});
		
})();