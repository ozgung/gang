/**********************************************/
/*     DISABLING LOGS    											*/

//var CONSOLE_LOG = console.log;
//console.log = function(){};

/**********************************************/

(function () {

    'use strict';
    
		var Gang = angular.module('application', [
        'ui.router',
        'ngAnimate',
        'facebook',
        'luegg.directives',
        'ngWebSocket',
        'angulartics',
        'angulartics.google.analytics',
        //foundation
        'foundation',
        'dbaq.emoji',
        'ngSanitize',
				'jQueryScrollbar'
    ])

    .config(config)
		
    .run(run);

    function config($urlRouterProvider,$locationProvider,$stateProvider,FacebookProvider,$httpProvider) {

      FacebookProvider.init({
          appId: '343800439138314',
          status: true
      });

      $urlRouterProvider.otherwise('/');

      $stateProvider

          .state('app', {
              url: '/',
              abstract: true,
              template: '<ui-view/>',
              resolve: {

                connected:function(fb){

                  return fb.checkStatus().then(function () {

                    return true;
                  },function(){
									
										localStorage.removeItem('token');
										return false;
									});
                }
              }
          })
					
          .state('account', {
              url: '',
              parent: 'app',
							abstract:true,
              templateUrl: 'templates/account.html',
              controller: 'AccountCtrl',
							resolve:{
								
								user:function(backend,$state){
									return backend.me().then(function(user){
										return user;
									},function(){
										localStorage.removeItem('token');
										localStorage.removeItem('lastChannel');
										$state.go('guest');
									});
								},
								
								teams:function(user){
								
									var teams = [];
								
									user.teams.forEach(function(team){
										teams.push(team.team)
									});
									
									return teams;
								}
							}
          })

					.state('account.index', {
            url: '',
						templateUrl:'templates/account.index.html',
						onEnter:function($state){
							
							var last = localStorage.getItem('lastChannel');
							
							if(last){
								
								$state.go('chat',{
									channel:last
								});
								
							}
						}
          })
					
          .state('chat', {
            url: ':channel',
            parent: 'account',
						templateUrl:'templates/chat.html',
						controller: 'ChatCtrl',
						onEnter:function($stateParams){
						
							localStorage.setItem('lastChannel',$stateParams.channel);
						}
          })
					
					.state('guest', {
              url: '',
              parent: 'app',
              templateUrl: 'templates/guest.html',
              controller: 'GuestCtrl'
          });

      $locationProvider.html5Mode({
          enabled: false,
          requireBase: false
      });

      $locationProvider.hashPrefix('!');
			
			$httpProvider.interceptors.push('httpInterceptor');
    }

    function run() {
			
			FastClick.attach(document.body);
    }

})();
