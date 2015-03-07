(function () {
    'use strict';

    angular.module('application')

        .controller('ChatCtrl', function ($scope, chat, $stateParams, backend, $rootScope) {
            /**
             * this should be false for mobile
             * @type {boolean}
             */
            var FOCUS_ON_INIT = true;


            var channelId = $stateParams.channel;

            chat.setActiveChannel(channelId);

            var MESSAGE_INPUT_ID = "message_input";

            function send() {

                if (messageOnEdit) {
                    messageOnEdit.msg = $scope.message
                } else {
                    chat.sendMessage($scope.message);
                }

                clearFocus();
            }

            function clearFocus() {

                document.getElementById(MESSAGE_INPUT_ID).focus();
                $scope.message = "";
            }

            function initTypingStatus() {

                $scope.$watch('message', function (newValue, oldValue) {

                    var userIsTyping = !!$scope.message;
                    chat.sendUserTypingStatus(userIsTyping);

                    if (!userIsTyping) {
                        messageOnEdit = null
                    }
                });
            }

            function init() {

                $scope.messages = chat.messages;

                $scope.thisChannelMessages = chat.getThisChannelMessages();

                chat.getActiveChannel().then(function (c) {

                    $rootScope.activeChannel = c;

                    var teamUsers = [];

                    c.users.forEach(function (_u) {
                        teamUsers.push(_u.user)
                    });

                    $scope.members = function () {
                        return teamUsers.sort(function (a, b) {
                            var ao = +chat.isUserOnline(a.id);
                            var bo = +chat.isUserOnline(b.id);
                            return bo - ao
                        });
                    };
                    $scope.numberOfUsers = function () {
                        return $scope.members.length
                    };

                    $scope.isUserOnline = chat.isUserOnline;
                    $scope.numberOfTeamUsers = teamUsers.length

                });
                if (FOCUS_ON_INIT) {
                    clearFocus()
                }
                initTypingStatus();
            }

            $scope.getProfile = function (userId) {
                return backend.getUserProfile(+userId, channelId);
            };

            $scope.deleteMessageInline = function (message) {

                var idx = $scope.thisChannelMessages.indexOf(message);
                $scope.thisChannelMessages.splice(idx, 1);
            };

            var messageOnEdit = null;

            $scope.messageOnEdit = function () {
                return messageOnEdit || false
            };

            $scope.editInlineCancel = function () {
                messageOnEdit = false;
            };

            $scope.editInline = function (message) {
                messageOnEdit = message;

                //clearFocus();
                //$scope.message = message.msg;

            };


            $scope.keyPressed = function (event) {

                var enter = (event.keyCode === 13);
                var shift = event.shiftKey;

                if (enter && !shift) {
                    send();
                    event.preventDefault();
                }
            };

            init();

            //Exports
            $scope.send = send;

        });

})();
