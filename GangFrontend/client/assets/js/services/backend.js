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
                function getProfileFromBackend(groupId) {
                    console.log("getProfileFromBackend 001");

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

                            getProfileFromBackend(optionalGroupId).then(function (response) {
                                console.log("getProfileFromBackend 002");
                                var fetchedUserProfile = {displayName: "MockUsername", id: userId};
                                oldProfile._fetched = true;
                                oldProfile._loading = false;
                                angular.extend(oldProfile, fetchedUserProfile);
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