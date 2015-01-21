(function() {
  'use strict';

  var Gang = angular.module('application', [
    'ui.router',
    'ngAnimate',
		'facebook',
		'luegg.directives',
		'ngWebSocket',
		
    //foundation
    'foundation'
  ])
  .config(config)
  .run(run);

  function config($urlRouterProvider,$locationProvider,$stateProvider,FacebookProvider){
	
    $urlRouterProvider.otherwise('/welcome');
		
		$stateProvider
		
			.state('welcome', {
				url: '/welcome',
				templateUrl: 'templates/welcome.html',
				controller:'WelcomeCtrl',
				onEnter:function(fb,$state){
					
					return fb.checkStatus().then(function(){
					
						$state.go('home');
					});
				}
			})
			
			.state('home', {
				url: '/',
				templateUrl: 'templates/home.html',
				controller:'HomeCtrl',
				resolve:{
				
					data:function(fb){
						
						return fb.checkStatus().then(function(){
						
							return fb.user().then(function(user){
							
								return fb.groups(user).then(function(groups){
									
									return {
										user:user,
										groups:groups
									};
								});
							})
						}).catch(function(){
						
							$state.go('welcome');
						});
					}
				}
			})
			
			.state('chat',{
				url: ':channel',
				templateUrl: 'templates/chat.html',
				controller:'ChatCtrl',
				parent:'home'
			});
		
    $locationProvider.html5Mode({
      enabled:false,
      requireBase: false
    });

    $locationProvider.hashPrefix('!');
		
		FacebookProvider.init({
			appId:'343800439138314',
			status:true
		});
  }

  function run() {
    
		FastClick.attach(document.body);
  }

})();
