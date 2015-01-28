(function() {

  'use strict';

  angular.module('application')
  
		.controller('SigninCtrl',function($scope,$state,backend,token){
		
			$scope.signin = function(){
				backend.request('login',$scope.form).then(function(data){
					token.set(data.token);
					$state.go('chat');
				});
			}
		});
		
})();