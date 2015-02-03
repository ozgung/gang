(function() {
  'use strict';

  angular.module('application')
  
		.controller('AccountCtrl',function($scope,$state,chat,user,token){
			
			$scope.teams = user.groups;
			
			$scope.logout = function() {
				token.unset();
				$state.go('guest');
			};
		});
		
})();
