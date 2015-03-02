(function () {

    'use strict';

    angular.module('application')

        .service('backend', function (token, $http, $q) {

            this.request = doRequest

            function doRequest(action, query) {
                console.log("trace", "backend.request 001", "action", action, "query", query);

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
                    console.log("trace", "backend.request 002", "got response :)", response);
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
            this.authFB = function authWithFB() {
                console.log("trace", "backend.authFB 001");

                var fbAuthData = {
                    token: localStorage.getItem('access-token'),
                    expiresIn: localStorage.getItem('expiresIn'),
                    userId: localStorage.getItem('userId'),
                    signedRequest: localStorage.getItem('signedRequest')
                };

                var backendResponse = $http({
                    method: 'get',
                    url: 'http://app.ganghq.com/api/loginFB',
                    params: fbAuthData
                }).then(function (response) {
                    return response.data;
                }).then(function (response) {
                    //now we are fully authenticated
                    //should be "0" response.status;
                    localStorage.setItem('token', response.token);
                    return response;
                });

                return backendResponse;
            };


            var meCache = null;
            this.me = function me() {
                function getMeFromBackend() {
                    console.log("getMeFromBackend 001");
                    return doRequest("me").then(function (x) {
                        return x.appUser
                    })
                }

                if (!meCache) {
                    meCache = getMeFromBackend()
                }

                return meCache
            };


            this.getTeam = function (groupId) {
                if (!teamCache[groupId]) {
                    teamCache[groupId] = getTeamFromBackend(groupId)
                }
                return teamCache[groupId];
            };
            var teamCache = {};

            function getTeamFromBackend(groupId) {
                console.log("getTeamFromBackend 001");

                return doRequest("team", {id: +groupId}).then(function (t) {
                    return t.team
                })
            };


            window._debug = this; //todo delete me
            /**
             * todo Move this to a new Service i.e userService / accountService
             * @returns {*}
             */
            var _userProfileCache = {};
            window._debug_upc = _userProfileCache; //todo delete me

            this.getUserProfile = function getUserProfile(userId, optionalGroupId) {

                var cachedProfile = _userProfileCache[userId];

                //console.log("______", userId, optionalGroupId,cachedProfile);

                if (!cachedProfile) {
                    console.log("1111111", userId, cachedProfile);
                    //return empty profile until api responds.
                    _userProfileCache[userId] = {_fetched: false, _loading: false};
                    console.log("1111111_2", userId, _userProfileCache);


                    //update cache..
                    if (optionalGroupId) {
                        console.log("222222", userId, optionalGroupId);

                        if (!_userProfileCache[userId]._loading) {
                            console.log("333333", userId, optionalGroupId,_userProfileCache[userId]);

                            var oldProfile = _userProfileCache[userId] || {};
                            oldProfile._loading = true;

                            getTeamFromBackend(optionalGroupId).then(function (response) {
                                console.log("444444", userId);
                                console.log("getProfileFromBackend 002");
                                response.users.forEach(function (userWrapped) {

                                    var fetchedUserProfile = userWrapped.id;
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


        })
})
();