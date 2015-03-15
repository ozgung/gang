(function () {

    'use strict';

    angular.module('application')

        .service('backend', function (token, $http, $q) {

            this.request = doRequest

            function doRequest(action, query) {

                var t = token.get();

                if (!query) {
                    query = {};
                }

                if (t) {
                    query.token = t;
                }

                return $http({
                    method: 'get',
                    url: 'http://app.ganghq.com/api/' + action,
                    params: query
                }).then(function (response) {
                    return response.data;
                });
            };

            /**
             *
             * todo refactor these: move them to service layer
             * todo do not get these from localstorage
             * @param fbAuthData
             * @returns {*}
             */

            /*
             normalde bunlar backendde saklanacak. biz backendden aldığımız token ı localstorage da tutucaz. catay
             */

            this.authFB = function authWithFB(fbAuthData) {

                return doRequest('loginFB', {
                    token: fbAuthData.accessToken
                }).then(function (response) {

                    localStorage.setItem('token', response.token);
                });
                /*
                 $http({

                 method: 'get',
                 url: 'http://app.ganghq.com/api/loginFB',
                 params: fbAuthData

                 }).then(function(response){

                 console.log(response);

                 return response.data;

                 }).then(function(response){

                 localStorage.setItem('token', response.token);

                 return response;
                 });*/
            };

            var meCache = null;

            this.me = function () {

                return doRequest("me").then(function (response) {

                    return response.appUser;
                });
            };

            /*this.me = function me() {

             function getMeFromBackend() {

             return doRequest("me").then(function(x){

             return x.appUser;
             });
             }

             if(!meCache){
             meCache = getMeFromBackend();
             }

             return meCache;
             };*/

            this.getTeam = function (groupId) {

                if (!teamCache[groupId]) {

                    teamCache[groupId] = getTeamFromBackend(groupId);
                }
                return teamCache[groupId];
            };

            var teamCache = {};

            function getTeamFromBackend(groupId) {

                return doRequest("team", {id: +groupId}).then(function (t) {

                    return t.team;
                });
            }

            window._debug = this;
            var _userProfileCache = {};

            window._debug_upc = _userProfileCache; //todo delete me

            this.getUserProfile = function getUserProfile(userId, optionalGroupId) {

                var cachedProfile = _userProfileCache[userId];

                if (!cachedProfile) {
                    _userProfileCache[userId] = {_fetched: false, _loading: false};

                    if (optionalGroupId) {

                        if (!_userProfileCache[userId]._loading) {
                            //console.log("333333", userId, optionalGroupId,_userProfileCache[userId]);

                            var oldProfile = _userProfileCache[userId] || {};
                            oldProfile._loading = true;

                            getTeamFromBackend(optionalGroupId).then(function (response) {
                                //console.log("444444", userId);
                                //console.log("getProfileFromBackend 002");
                                response.users.forEach(function (userWrapped) {
                                    //console.log("55555555555", userId, "warppedUser", userWrapped);


                                    var fetchedUserProfile = userWrapped.user;
                                    var _oldProfile = _userProfileCache[fetchedUserProfile.id] || {}; //todo should be id not username

                                    fetchedUserProfile._fetched = true;
                                    fetchedUserProfile._loading = false;

                                    fetchedUserProfile.displayName = fetchedUserProfile.firstName + " " + fetchedUserProfile.lastName;

                                    angular.extend(_oldProfile, fetchedUserProfile);
                                });
                            })
                        } else {
                            // do nothing, already loading from previous req.

                        }
                    } else {
                        // groupId olmadığı için api'den profili çekemiyoruz
                    }

                }

                return _userProfileCache[userId]
            };


            this.createTeam = function createTeam(name) {
                var deferred = $q.defer();

                doRequest("createTeam", {name: name, uniqueId: name}).then(function (t) {
                    if (t.status = "0") {
                        deferred.resolve(t.team.id);
                    } else {
                        deferred.reject(t.message);

                    }
                });

                return deferred.promise;
            };

            this.subscribeTeam = function subscribeTeam(teamId) {
                var deferred = $q.defer();

                console.warn("todo: call subscribe team");


                doRequest("subscribeTeam", {teamId: teamId}).then(function (t) {
                    if (t.status = "0") {
                        deferred.resolve(teamId);
                    } else {
                        deferred.reject(t.message);

                    }
                });

                return deferred.promise;
            }

        });
})
();