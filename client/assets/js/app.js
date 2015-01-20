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
				onEnter:function(fb,$state){
					
					return fb.checkStatus().catch(function(){
					
						$state.go('welcome');
					});
				},
				resolve:{
					blabla:function(fb){
						
						return fb.user().then(function(user){
							return fb.groups(user).then(function(groups){
								return {
									user:user,
									groups:groups
								};
							});
						});
					}
				}
			})
		
    $locationProvider.html5Mode({
      enabled:false,
      requireBase: false
    });

    $locationProvider.hashPrefix('!');
		
		FacebookProvider.init('343800439138314');
  }

  function run() {
    
		FastClick.attach(document.body);
  }

})();
