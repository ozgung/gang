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
        'dbaq.emoji',
        'ngSanitize',
        'jQueryScrollbar',
        'ng.deviceDetector',
        'foundation',
        "monospaced.elastic"
    ])

        .config(config)

        .run(run);

    function config($urlRouterProvider, $locationProvider, $stateProvider, FacebookProvider, $httpProvider) {

        FacebookProvider.init({
            appId: '343745845810440',
            status: true
        });

        $urlRouterProvider.otherwise('/');

        $stateProvider

            .state('app', {
                url: '/',
                abstract: true,
                template: '<ui-view/>',
                resolve: {

                    connected: function (fb, $window) {

                        return fb.checkStatus().then(function () {
                            return true;
                        }, function () {
                            $window.localStorage.removeItem('token');
                            return false;
                        });
                    }
                }
            })

            .state('account', {
                url: '',
                parent: 'app',
                abstract: true,
                templateUrl: 'templates/account.html',
                controller: 'AccountCtrl',
                resolve: {

                    user: function (backend, $state, $location) {
                        return backend.me().then(function (user) {
                            return user;
                        }, function () {

                            var path = $location.path();

                            if (path && path != "/") {
                                localStorage.setItem('afterLoginRedirectTo', path);
                            }
                            localStorage.removeItem('token');
                            $state.go('guest');
                        });
                    },

                    teams: function (user) {

                        var teams = [];

                        user.teams.forEach(function (team) {
                            teams.push(team.team)
                        });

                        return teams;
                    }
                }
            })

            .state('account.index', {
                url: '',
                templateUrl: 'templates/account.index.html'
            })

            .state('chat', {
                url: ':channel',
                parent: 'account',
                templateUrl: 'templates/chat.html',
                controller: 'ChatCtrl'
            })

            .state('about', {
                url: 'about',
                parent: 'account',
                controller: function ($scope) {
                    $scope.order = _.shuffle([1, 2, 3, 4, 5]);
                },
                templateUrl: 'templates/about.html'
            })

            .state('users', {
                url: 'users',
                parent: 'account',
                templateUrl: 'templates/users.html'
            })

            .state('groups', {
                url: 'groups',
                parent: 'account',
                templateUrl: 'templates/groups.html'
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
