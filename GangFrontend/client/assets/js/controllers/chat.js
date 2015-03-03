(function () {
    'use strict';

    angular.module('application')

        .controller('ChatCtrl', function ($scope, chat, $stateParams, backend, $rootScope) {
            var channelId = $stateParams.channel;
            chat.setActiveChannel(channelId);

            console.log("channelId", channelId);
            /**
             * Message input field id
             * @const {string}
             */
            var MESSAGE_INPUT_ID = "message_input";

            function send() {
                if (messageOnEdit) {
                    messageOnEdit.msg = $scope.message
                } else {
                    //do send
                    chat.sendMessage($scope.message);
                }

                clearFocus();
            }

            function clearFocus() {
                //set focus to input field
                document.getElementById(MESSAGE_INPUT_ID).focus();

                //clear message input
                $scope.message = "";
            }

            function initTypingStatus() {

                $scope.$watch('message', function (newValue, oldValue) {
                    var userIsTyping = !!$scope.message;
                    chat.sendUserTypingStatus(userIsTyping);

                    //move this
                    //reset messageOnEdit after delete
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
										$scope.members = teamUsers;
										$scope.isUserOnline = chat.isUserOnline
                });

                clearFocus();
                initTypingStatus();
            }

            $scope.getProfile = function (userId) {
                return backend.getUserProfile(+userId, channelId);
            };

            $scope.deleteMessage = function (message) {
                console.log("DELETE MESSAGE MOCK", message);

                var idx = $scope.thisChannelMessages.indexOf(message);
                $scope.thisChannelMessages.splice(idx, 1);
            };

            var messageOnEdit = null;

            $scope.textInputStyle = function () {
                if (messageOnEdit) {
                    return "background-color:lightgoldenrodyellow;"
                } else {
                    return ""
                }
            };

            $scope.edit = function (message) {
                console.log("EDIT MESSAGE MOCK", message);
                messageOnEdit = message;
                clearFocus();
                $scope.message = message.msg;

            };
            
						init();

            //Exports
            $scope.send = send;

        });

})();
