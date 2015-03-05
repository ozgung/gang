(function () {
    'use strict';

    angular.module('application')

      .controller('AccountCtrl',function($scope,$state,chat,fb,user,teams) {
				
				chat.setChannels(teams);
				
				$scope.user = user;
				$scope.teams = teams;
				
				$scope.numberOfunreadMessages = chat.numberOfunreadMessages;
				
				$scope.logout = function(){
				
					localStorage.removeItem('token');
					$state.go('guest');
				};
      });
})();
