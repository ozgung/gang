(function () {
    'use strict';

    angular.module('application')

        .controller('ChatCtrl', function ($scope, chat, $stateParams, backend) {
            var channelId = $stateParams.channel;
            chat.setActiveChannel(channelId);
            $scope.activeChannel = '#' + channelId;

            console.log("channelId", channelId);
            /**
             * Message input field id
             * @const {string}
             */
            var MESSAGE_INPUT_ID = "message_input";

            function send() {

                //do send
                chat.sendMessage($scope.message);

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
                });
            }

            function init() {
                $scope.messages = chat.messages;
                $scope.thisChannelMessages = chat.getThisChannelMessages();
                clearFocus();
                initTypingStatus();
            }

            $scope.getProfile = function (userId) {
                return backend.getUserProfile(userId, channelId);
            };

            init();

            //Exports
            $scope.send = send;


        });

})();
