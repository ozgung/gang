(function() {
  'use strict';

  angular.module('application')
  
		.controller('ChatCtrl',function($scope,chat){
			
			$scope.message = '';
			$scope.messages = chat.messages;
			
			$scope.send = function(){
				chat.sendMessage($scope.message);
				$scope.message = '';
			};
			
		});
		
})();
