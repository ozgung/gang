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
		
		.service('Gang',function(Facebook){
			
			this.me = function() {
				Facebook.api('/me', function(response) {
					Gang.user = response;
				});
			};
			
			this.login = function(){
				Facebook.login(function(response){
					
					//redirect to home
				}
			});
			
			this.logout = function() {
				
				Facebook.logout();
				
				//redirect to welcome
			};
			
		})
		
		.controller('HomeCtrl',function($scope,Gang){
			
			$scope.logout = function() {
				Gang.logout();
			};
			
		})
		
		.controller('WelcomeCtrl',function($scope,Gang){
		
			$scope.login = function() {
				Gang.login();
			};

		})
	
	
	
})();
