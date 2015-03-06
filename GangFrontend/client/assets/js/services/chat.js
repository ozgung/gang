(function () {

    // Object {type: "error", code: "rate_limit", msg: "RATE LIMIT EXCEEDED! BACK OFF! 1.0/s", ts: 1425499697252}`


    'use strict';

    angular.module('application')

        .service('chat', function ($websocket, token, $rootScope, backend, $q) {

            //todo these will be refactored
            var magic_ids = {
                _PERSISTED: -15
                , _userStatusChanged_OFFLINE: -14
                , _numberOfOnlineUsers: -13
                , _userStatusChanged_ONLINE: -12
                , _replyingChannelHistory_FINISHED: -11
                , _replyingChannelHistory_STARTED: -10

            };

            function replaceSmiley(m) {
                //todo replace these with parser may be regex
                return m.split(":)").join(":smiley:")
                    .split(":D").join(":grinning:")
                    .split(":p").join(":stuck_out_tongue:")
                    .split(":P").join(":stuck_out_tongue:");
            }

            var self = this;
            var activeChannelId;
            var activeChannelDeferred = $q.defer();

            var ws = $websocket('ws://ws.ganghq.com/ws?token=' + token.get());

            //reconnect
            ws.onClose(socketError);
            ws.onError(socketError);

            window.ws = ws; //just for debug purposes
            var messages = {};


            //workaround reset current channel we received our message in the current channel
            var _countNewMessagesNumber = {};
            var onlineUsers = {};
            this.isUserOnline = function (uid) {
                return onlineUsers[Number(uid)]
            };

            ws.onMessage(function (e) {

                function handleTextMessage(d) {
                    if (d.type == "message") {
                        var fromNormalUser = true;
                        if (!messages[d.channel]) {
                            messages[d.channel] = []
                        }


                        //increase unread message count for this channel
                        //workaround reset current channel we received our message in the current channel
                        if (_countNewMessagesNumber[d.msg] && activeChannelId != d.channel) {
                            _newMessageCounter_inc(d.channel);
                        } else if (d.uid == magic_ids._replyingChannelHistory_FINISHED) {
                            _countNewMessagesNumber[d.msg] = true;
                            fromNormalUser = false;
                        }

                        //condition is need until workarounds removed (i.e. messages with special user ids)
                        if (fromNormalUser) {
                            messages[d.channel].push(d);
                            d.msg = replaceSmiley(d.msg);
                        }


                        //start work around online users
                        if (d.uid == magic_ids._userStatusChanged_ONLINE) {
                            onlineUsers[Number(d.msg)] = true;
                            fromNormalUser = false;
                        } else if (d.uid == magic_ids._userStatusChanged_OFFLINE) {
                            delete onlineUsers[Number(d.msg)];
                            fromNormalUser = false;
                        }



                        //end work around onliner users
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

                function handlePingMessage(d) {
                    if (d.type == "ping") {
                        return true;
                    }
                }

                function handleOtherMessage(d) {
                    return true;
                }


                var data = JSON.parse(e.data);

                handleTextMessage(data) ||
                handleTypingStatusMessage(data) ||
                handlePingMessage(data) ||
                handleOtherMessage(data);
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
                return activeChannelDeferred.promise;
            };

            this.setChannels = function (channels) {
                channels.forEach(function (it) {
                    var channelId = +it.id;
                    messages[channelId] = [];
                });
            };

            var userIsTypingOnChannel = null;
            this.sendUserTypingStatus = function sendUserTypingStatus(isTyping) {
                function updateStatus() {
                    ws.send(JSON.stringify({
                        type: 'cmd_usr_typing',
                        isTyping: isTyping,
                        channel: +activeChannelId
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

                    }
                }

            };

            this.sendMessage = function (message) {
                ws.send(JSON.stringify({
                    msg: message,
                    type: 'message',
                    channel: +activeChannelId
                }));
            };

            this.setActiveChannel = function (channel) {

                activeChannelId = +channel;

                activeChannelDeferred = $q.defer();

                backend.getTeam(activeChannelId).then(function (t) {
                    activeChannelDeferred.resolve(t);
                });

                //reset unread message number
                _newMessageCounter_reset(activeChannelId);

                //reset typing users active channel changed!
                //todo this is a partial solution only fixme ~ilgaz
                $rootScope.usersTypingNow = {}
            };

            var _newMessageCounter = {};

            function _newMessageCounter_inc(channelid) {

                var x = _newMessageCounter[channelid] || 0;

                _newMessageCounter[channelid] = x + 1
            }

            function _newMessageCounter_reset(channelid) {
                _newMessageCounter[channelid] = 0
            }

            this.numberOfunreadMessages = function (channelid) {

                var x = _newMessageCounter[channelid] || 0;

                if (!x) {
                    _newMessageCounter[channelid] = 0;
                }
                return x;
            };

            function socketError(event) {
                ws = ws.reconnect();
            }

        });
})();