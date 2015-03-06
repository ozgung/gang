(function () {
    'use strict';

    angular.module('application')

      .controller('AccountCtrl',function($scope,$state,chat,fb,user,teams,$window) {
				
				chat.setChannels(teams);
				
				$scope.user = user;
				$scope.teams = teams;
				
				$scope.numberOfunreadMessages = chat.numberOfunreadMessages;
				
				$scope.logout = function(){
				
					$window.localStorage.removeItem('token');
					$window.localStorage.removeItem('lastChannel')
					$state.go('guest');
				};
      });
})();
