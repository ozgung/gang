(function () {

    'use strict';

    angular.module('application')

        .service('chat', function ($websocket, token, $rootScope, backend,$q) {

            var self = this;
            var activeChannelId;
            var activeChannelDeferred= $q.reject();

            var ws = $websocket('ws://ws.ganghq.com/ws?token=' + token.get());
            var messages = {};

            ws.onMessage(function (e) {

                function handleTextMessage(d) {
                    if (d.type == "message") {

                        if (!messages[d.channel]) {
                            messages[d.channel] = []
                        }
                        messages[d.channel].push(d);
                        return true
                    }
                }

                function handleTypingStatusMessage(d) {
                    if (d.type == "cmd_usr_typing") {
                        //someone changed his typing status for this channel
                        if (d.channel == activeChannelId) {
                            if (d.isTyping) {
                                //user started typing so mark it, note that for duplicated status updates from the server (for some reason (it shouldn't be(but shit happens!))) this will work.
                                //refactor: it may be better to return user obj(with username, etc) instead of just uid ~ilgaz
                                $rootScope.usersTypingNow[d.uid] = d.uid;
                            } else {
                                //user stopped typing, delete the marker
                                delete $rootScope.usersTypingNow[d.uid]
                            }
                        }
                        return true
                    }
                }

                function handleOtherMessage(d) {
                    console.error("unexpected message type received! data:", d);
                    return true
                }


                var data = JSON.parse(e.data);
                console.log("message received", "data", data);

                handleTextMessage(data) || handleTypingStatusMessage(data) || handleOtherMessage(data);
            });

            this.messages = messages;

            this.getThisChannelMessages = function () {
                if (!messages[activeChannelId]) {
                    messages[activeChannelId] = []
                }
                return messages[activeChannelId]
            };

            var _activeTeam = [];
            this.getActiveChannel = function () {
                return activeChannel
            };

            this.setChannels = function (channels) {
                channels.forEach(function (it) {
                    console.log("channel id: ", it.id);
                    messages[it.id] = [];
                });
            };

            var userIsTypingOnChannel = null;
            this.sendUserTypingStatus = function sendUserTypingStatus(isTyping) {
                function updateStatus() {
                    ws.send(JSON.stringify({
                        type: 'cmd_usr_typing',
                        isTyping: isTyping,
                        channel: activeChannelId
                    }));
                }

                // refactor: Simplify these branches ~ilgaz
                if (isTyping) {

                    if (!userIsTypingOnChannel) {
                        userIsTypingOnChannel = activeChannelId;
                        updateStatus()
                    } else if (userIsTypingOnChannel != activeChannelId) {
                        updateStatus()
                    } else {
                        //do not thing, shebang knows the user is typing already.
                    }
                } else {
                    if (userIsTypingOnChannel) {
                        userIsTypingOnChannel = false;
                        updateStatus()
                    } else {
                        //do nothing, shebang knows it
                    }
                }

            };

            this.sendMessage = function (message) {
                ws.send(JSON.stringify({
                    msg: message,
                    type: 'message',
                    channel: activeChannelId
                }));
            };

            this.setActiveChannel = function (channel) {
                console.log("setting active channelId", channel);
                activeChannelId = channel;

                activeChannelDeferred = $q.defer();

                backend.me().then(function (me) {

                    me.teams.forEach(function (_team) {

                        if (_team.team.id == activeChannelId) {
                            activeChannelDeferred.resolve(_team.team);
                        }

                    });

                });


                //reset typing users active channel changed!
                //todo this is a partial solution only fixme ~ilgaz
                $rootScope.usersTypingNow = {}
            };

        });
})();