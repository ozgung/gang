(function () {

    'use strict';

    angular.module('application')

        .service('backend', function (token, $http) {

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

            /**
             * todo Move this to a new Service i.e userService / accountService
             * @returns {*}
             */
            var userProfileCache = {};
            this.getUserProfile = function userProfileCache(userId, optionalGroupId) {
                function getTeamFromBackend(groupId) {
                    console.log("getTeamFromBackend 001");

                    return doRequest("team", {id: groupId})
                }


                var cachedProfile = userProfileCache[userId];
                if (!cachedProfile) {

                    //return empty profile until api responds.
                    userProfileCache[userId] = {_fetched: false, _loading: false};


                    //update cache..
                    if (optionalGroupId) {

                        if (!userProfileCache[userId]._loading) {

                            var oldProfile = userProfileCache[userId] || {};
                            oldProfile._loading = true;

                            getTeamFromBackend(optionalGroupId).then(function (response) {
                                console.log("getProfileFromBackend 002");
                                response.team.users.forEach(function (userWrapped) {

                                    var fetchedUserProfile = userWrapped.user;
                                    var _oldProfile = userProfileCache[fetchedUserProfile.username] || {
                                            _fetched: true,
                                            _loading: false
                                        }; //todo should be id not username

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

                return userProfileCache[userId]
            }


        })
})
();