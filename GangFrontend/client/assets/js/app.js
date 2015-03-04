/**********************************************/
/*     DISABLING LOGS    											*/

//var CONSOLE_LOG = console.log;
console.log = function(){};

/**********************************************/

(function () {
    'use strict';
    
		console.log("Gang version 073");
		
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
        'ngSanitize'
    ])

        .config(config)
        .run(run);

    function config($urlRouterProvider, $locationProvider, $stateProvider, FacebookProvider) {

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

                    connected: function (fb, backend) {

                        return fb.checkStatus().then(function () {

                            //todo donot send auth request to the backend each time, check with local storage
                            //todo handle backend timeout
                            //~ilgaz
														
														/* 
															bu each time request göndermiyo ama.. her page reloadda gönderiyo. 
															access token vs değişmesi ihtimali var falan. o yüzden
															çatay
														*/
														
                            console.log("trace", "app.js/0001");
														
                            return backend.authFB().then(function () {
														
                                console.log("trace", "app.js/0002");
                                return true;
                            })
                        }, function () {

                            return false;
                        });
                    }
                }
            })

            .state('guest', {
                url: '',
                parent: 'app',
                templateUrl: 'templates/guest.html',
                controller: 'GuestCtrl',
                onEnter: function (connected, $state) {

                    if (connected) {
                        $state.go('account');
                    }
                }
            })

            .state('account', {
                url: '',
                parent: 'app',
                templateUrl: 'templates/account.html',
                controller: 'AccountCtrl',
                onEnter: function (connected, $state) {

                    if (!connected) {
                        $state.go('guest');
                    }
                },
                resolve: {

                    user: function (fb, $q) {
                        return fb.user().then(function (user) {
                            return fb.groups(user).then(function (groups) {

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

            .state('chat', {
                url: ':channel',
                parent: 'account',
								templateUrl:'templates/chat.html',
								controller: 'ChatCtrl'
            });

        $locationProvider.html5Mode({
            enabled: false,
            requireBase: false
        });

        $locationProvider.hashPrefix('!');
    }

    function run() {

        FastClick.attach(document.body);
    }

})();
