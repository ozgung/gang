(function () {

    'use strict';

    angular.module('application')

        .service('backend', function (token, $http) {

            this.request = function (action, query) {
                console.log("trace", "backend.request 001");

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
                    console.log("trace", "backend.request 002","got response :)");
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

                fbAuthData.test = "0001"; //todo please delete this line now!
                return (request("loginFB", fbAuthData)).then(function (response) {
                    //now we are fully authenticated
                    //should be "0" response.status;
                    localStorage.setItem('token', response.token);
                    return response;
                })
            }
        })
})();