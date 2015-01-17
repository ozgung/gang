(function() {
  'use strict';

  var Gang = angular.module('application', [
    'ui.router',
    'ngAnimate',
		'facebook',
		
    //foundation
    'foundation',
    'foundation.dynamicRouting',
    'foundation.dynamicRouting.animations'
  ])
  .config(config)
  .run(run);

  config.$inject = ['$urlRouterProvider', '$locationProvider','FacebookProvider'];

  function config($urlProvider, $locationProvider,FacebookProvider) {
    $urlProvider.otherwise('/');

    $locationProvider.html5Mode({
      enabled:false,
      requireBase: false
    });

    $locationProvider.hashPrefix('!');
		
		FacebookProvider.init('343745845810440');
  }

  function run() {
    FastClick.attach(document.body);
  }

	Gang
		.controller('HomeCtrl',function($scope){
		
			$scope.hello = 'Hello';
		})
		.controller('WelcomeCtrl',function($scope,Facebook){
		
			$scope.facebookReady = false;
		
			$scope.login = function() {
				
				
				Facebook.login(function(response) {
					// Do something with response.
				});
			};
	
			$scope.getLoginStatus = function() {
			
				Facebook.getLoginStatus(function(response) {
					if(response.status === 'connected') {
						$scope.loggedIn = true;
					} else {
						$scope.loggedIn = false;
					}
				});
			};
	
			$scope.me = function() {
				Facebook.api('/me', function(response) {
					$scope.user = response;
				});
			};
			
			$scope.$watch(function() {
				return Facebook.isReady();
			}, function(newVal) {
				// You might want to use this to disable/show/hide buttons and else
				$scope.facebookReady = true;
			});
			
		})
	
	
	
})();
