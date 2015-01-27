(function() {
  'use strict';

  var Gang = angular.module('application', [
    'ui.router',
    'ngAnimate',
		//'facebook',
		'luegg.directives',
		'ngWebSocket',
		
    //foundation
    'foundation'
  ])
  .config(config)
  .run(run);

  function config($urlRouterProvider,$locationProvider,$stateProvider/*,FacebookProvider*/){
	
    $urlRouterProvider.otherwise('/');
		
		$stateProvider
			
			.state('welcome', {
				url: '/',
				templateUrl: 'templates/welcome.html',
				controller:'WelcomeCtrl',
				abstract:true,
				
				onEnter:function(token,$state){
						
					if(token.isValid()){
						$state.go('home');
					}
				}
			})
			
			.state('welcome.index', {
				url: '',
				templateUrl: 'templates/welcome.index.html',
				controller:'WelcomeIndexCtrl',
				parent:'welcome'
				/*onEnter:function(fb,$state){
					
					return fb.checkStatus().then(function(){
					
						$state.go('home');
					});
				}*/
			})
			
			.state('signin', {
				url: 'signin',
				templateUrl: 'templates/signin.html',
				controller:'SigninCtrl',
				parent:'welcome'
			})
			
			.state('signup', {
				url: 'signup',
				templateUrl: 'templates/signup.html',
				controller:'SignupCtrl',
				parent:'welcome'
			})
			
			.state('home', {
				url: '/home',
				templateUrl: 'templates/home.html',
				controller:'HomeCtrl',
				resolve:{
					
					user:function(backend){
					
						return backend.request('me').then(function(res){
							return res.appUser;
						});
					}
				}
			})
			
			.state('newteam',{
				url: '/newteam',
				templateUrl: 'templates/newteam.html',
				controller:'NewTeamCtrl',
				parent:'home'
			})
			
			.state('chat',{
				url: '/:channel',
				templateUrl: 'templates/chat.html',
				controller:'ChatCtrl',
				parent:'home'
			});
		
    $locationProvider.html5Mode({
      enabled:false,
      requireBase: false
    });

    $locationProvider.hashPrefix('!');
		
		/*FacebookProvider.init({
			appId:'343800439138314',
			status:true
		});*/
  }

  function run() {
    
		FastClick.attach(document.body);
  }

})();
