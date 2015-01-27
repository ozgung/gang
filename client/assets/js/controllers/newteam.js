(function() {

  'use strict';

  angular.module('application')
  
		.controller('NewTeamCtrl',function($scope,backend,user){
			
			$scope.form = {};
			
			$scope.create = function(){
				
				backend.request('createTeam',$scope.form);
			};
			
		});
		
})();