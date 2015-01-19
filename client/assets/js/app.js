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

  function config($urlRouterProvider, $locationProvider,FacebookProvider,$stateProvider){
	
    $urlRouterProvider.otherwise('/welcome');
		
		$stateProvider
			
			.state('application', {
				abstract:true,
				template: '<ui-view/>',
			})
			
			.state('welcome', {
				url: '/welcome',
				templateUrl: 'templates/welcome.html',
				controller:'WelcomeCtrl',
				parent:'application'
			})
			
			.state('home', {
				url: '/',
				templateUrl: 'templates/home.html',
				controller:'HomeCtrl',
				parent:'application'
			})
		
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

})();
