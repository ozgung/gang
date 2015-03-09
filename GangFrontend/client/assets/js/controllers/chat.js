(function () {
    'use strict';

    angular.module('application')

        .controller('ChatCtrl', function ($scope, chat, $stateParams, backend, notification, $rootScope) {
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
                        return _.sortBy(teamUsers, function (u) {
                            return +chat.isUserOnline(u.id);
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

                notification.init();
            }

            $scope.getProfile = function (userId) {
                return backend.getUserProfile(+userId, channelId);
            };

            $scope.deleteMessageInline = function (message) {
                chat.deleteMessage(message.ts);
                console.debug("delte message", message);
                //var idx = $scope.thisChannelMessages.indexOf(message);
                //$scope.thisChannelMessages.splice(idx, 1);
                $scope.thisChannelMessages = chat.getThisChannelMessages();
            };

            var messageOnEdit = null;

            $scope.inlineEdit_msg = "";

            $scope.messageOnEdit = function () {
                return messageOnEdit || false
            };

            $scope.editInlineCancel = function () {
                messageOnEdit = false;
                $scope.inlineEdit_msg = "";
            };

            $scope.editInline = function (message) {
                messageOnEdit = message;
                $scope.inlineEdit_msg = message.msg;
                //todo set focus to textArea

            };

            $scope.editInlineKeyPressed = function (event,msg) {

                var enter = (event.keyCode === 13);
                var shift = event.shiftKey;
                var message_txt = msg;


                if (enter && !shift) {
                    //todo send to server
                    messageOnEdit.msg = message_txt;

                    chat.sendMessage(message_txt, messageOnEdit);

                    messageOnEdit = null;
                    event.preventDefault();
                }


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
