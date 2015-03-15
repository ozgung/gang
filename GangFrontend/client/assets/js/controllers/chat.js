(function () {
    'use strict';

    angular.module('application')

        .controller('ChatCtrl', function ($scope, chat, $stateParams, backend, notification, $rootScope, $location, $state,$window) {
            /**
             * this should be false for mobile
             * @type {boolean}
             */
            var FOCUS_ON_INIT = true;


            var channelId = $stateParams.channel;

            chat.setActiveChannel(channelId).then(
                function () {
                    console.log("team/channel found...")
                },
                function (reason) {
                    console.warn("channel not found or not subscribed!", reason)

                    backend.subscribeTeam(channelId).then(
                        function (teamId) {
                            console.warn("reloading");
                            //$state.go($state.current, {channel: teamId}, {reload: true});
                            $window.location.reload();
                            //$location.path(teamId);
                        },
                        function (reason) {
                            console.warn("subscribeTeam rejected msg: ", reason)
                            $state.go("account.index", {reload: true});
                        })
                }
            );

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

            /**
             * color palette
             * source: http://flatuicolors.co/
             */
            var palette = [
                "#1ABC9C",//0
                "#16A085",//1
                "#F1C40F",//2
                "#F39C12",//3
                "#2ECC71",//4
                "#27AE60",//5
                "#E67E22",//6
                "#D35400",//7
                "#3498DB",//8
                "#2980B9",//9
                "#E74C3C",//10
                "#C0392B",//11
                "#9B59B6",//12
                "#8E44AD",//13
                "#34495E",//14
                "#2C3E50"];//15

            /**
             *todo
             * @param Long
             * @returns {string}
             */
            $scope.getRandomColor = function (id) {
                id = id || 0;
                id = id * 43;

                return palette[id % 16];
            };


            $scope.$on("CHANNEL_READY", function (event, cid) {
                //console.log("____", cid);
            });

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

            }

            $scope.getProfile = function (userId) {
                return backend.getUserProfile(+userId, channelId);
            };

            $scope.deleteMessageInline = function (message) {
                chat.deleteMessage(message.ts);
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

            $scope.editInlineKeyPressed = function (event, msg) {

                var enter = (event.keyCode === 13);
                var shift = event.shiftKey;
                var escape = (event.keyCode === 27);
                var message_txt = msg;


                if (escape) {
                    $scope.editInlineCancel();
                } else if (enter && !shift) {
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
                var escape = (event.keyCode === 27);


                if (escape) {
                    clearFocus();
                } else if (enter && !shift) {
                    send();
                    event.preventDefault();
                }
            };

            init();

            //Exports
            $scope.send = send;

        });

})();
