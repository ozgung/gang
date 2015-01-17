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

  function run($rootScope,$location,$state,Gang) {
    
		FastClick.attach(document.body);
		
		$rootScope.$on('$stateChangeStart',function(e,toState,toParams,fromState,fromParams) {
				
      var isLogin = toState.name === "welcome";
			
      if(isLogin){
        return;
      }
			
			var auth = localStorage.getItem('authenticated');
			
      if(!auth) {
				
        e.preventDefault();
        $state.go('welcome');
      }
    });
  }

	Gang
		
		.service('Gang',function(Facebook){
			
			var self = this;
			
			this.facebook = {
				
				login:function(){
				
					return new Promise(function(resolve,reject){
					
						Facebook.login(function(response){
							localStorage.setItem('authenticated',true);
							self.authenticated = true;
							resolve(response);
						});
					});
				},
				
				logout:function() {
				
					return new Promise(function(resolve,reject){
						
						Facebook.logout(function(response){
							localStorage.setItem('authenticated',false);
							self.authenticated = false;
							resolve(response);
						});
					});
				},
				
				me: function() {
				
					return new Promise(function(resolve,reject){
						
						Facebook.api('/me', function(response) {
							Gang.user = response;
							resolve(response);
						});
						
					});
				}
			};
		})
		
		.controller('WelcomeCtrl',function($scope,$state,Gang){
		
			$scope.login = function() {
				Gang.facebook.login().then(function(){
					$state.go('home');
				});
			};

		})
		
		.controller('HomeCtrl',function($scope,$state,Gang){
			
			$scope.logout = function() {
				Gang.facebook.logout().then(function(){
					$state.go('welcome');
				});
			};
			
		})
})();
