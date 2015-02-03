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
	
    $urlRouterProvider.otherwise('/');
		
		$stateProvider
			
			.state('app', {
				url: '/',
				abstract:true,
				templateUrl: '<ui-view/>',
				resolve:{
				
					connected:function(fb){
						
						return fb.checkStatus().then(function(){
							return true;
						},function(){
							return false;
						});
					}
				}
			})
			
			.state('guest', {
				url: '',
				parent:'app',
				templateUrl: 'templates/guest.html',
				controller:'GuestCtrl',
				onEnter:function(connected,$state){
						
					if(connected){
						$state.go('account');
					}
				}
			})
			
			.state('account', {
				url: '',
				parent:'app',
				templateUrl: 'templates/account.html',
				controller:'AccountCtrl',
				onEnter:function(connected,$state){
						
					if(!connected){
						$state.go('guest');
					}
				},
				resolve:{
					
					user:function(fb,$q){
						return fb.user().then(function(user){
							return fb.groups(user).then(function(groups){
							
								user.groups = groups;
								return user;
								
								/*var promises = [];
							
								groups.forEach(function(group){
									
									var promise = fb.group(group.id);
									
									promises.push(promise);
								});
								
								return $q.all(promises).then(function(groups){
									
									user.groups = groups;
									return user;
								});*/
							});
						});
					}
				}
			})
			
			.state('chat',{
				url: '/:channel',
				templateUrl: 'templates/chat.html',
				controller:'ChatCtrl',
				parent:'account'
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
