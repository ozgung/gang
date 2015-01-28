(function() {
  'use strict';

  angular.module('application')
  
		.controller('ChatCtrl',function($scope,chat){
			
			$scope.messages = chat.messages;
			
		});
		
})();
