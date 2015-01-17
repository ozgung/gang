(function() {
  'use strict';

  var Gang = angular.module('application', [
    'ui.router',
    'ngAnimate',
		'facebook',
		'luegg.directives',
		'ngWebSocket',
		
    //foundation
    'foundation',
    'foundation.dynamicRouting',
    'foundation.dynamicRouting.animations'
  ])
  .config(config)
  .run(run);

  config.$inject = ['$urlRouterProvider', '$locationProvider','FacebookProvider'];

  function config($urlProvider, $locationProvider,FacebookProvider) {
    $urlProvider.otherwise('/welcome');

    $locationProvider.html5Mode({
      enabled:false,
      requireBase: false
    });

    $locationProvider.hashPrefix('!');
		
		FacebookProvider.init('343800439138314');
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
		
		.service('Gang',function(Facebook,$websocket){
			
			var self = this;
			
			var ws = $websocket('ws://zeus.fikrimuhal.com:9000/ws');
			var messages = [];
			
			ws.onMessage(function(e) {
				messages.push(JSON.parse(e.data));
			});
			
			this.messages = messages;
			
			this.sendMessage = function(message,channel){
        ws.send(JSON.stringify({
					msg: message, 
					channel: channel
				}));
			};
			
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
							localStorage.removeItem('authenticated');
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
			
			$scope.message = '';
			$scope.messages = Gang.messages;
			
			$scope.send = function(){
				Gang.sendMessage($scope.message,'#channel');
				$scope.message = '';
			};
			
			$scope.logout = function() {
				Gang.facebook.logout().then(function(){
					$state.go('welcome');
				});
			};
			
		})
})();
