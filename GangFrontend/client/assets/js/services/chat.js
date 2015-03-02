(function () {

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
                return onlineUsers[uid]
            };

            ws.onMessage(function (e) {

                function handleTextMessage(d) {
                    if (d.type == "message") {

                        if (!messages[d.channel]) {
                            messages[d.channel] = []
                        }
                        messages[d.channel].push(d);

                        //increase unread message count for this channel
                        //workaround reset current channel we received our message in the current channel
                        if (_countNewMessagesNumber[d.msg] && activeChannelId != d.channel) {
                            _newMessageCounter_inc(d.channel);
                        } else if (d.uid == magic_ids._replyingChannelHistory_FINISHED) {
                            _countNewMessagesNumber[d.msg] = true
                        }
                        //start work around online users
                        if (d.uid == magic_ids._userStatusChanged_ONLINE) {
                            onlineUsers[d.msg] = true
                        } else if (d.uid == magic_ids._userStatusChanged_OFFLINE) {
                            delete onlineUsers[d.msg]
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
                        //console.info("PING received ts", new Date(d.ts));
                        return true
                    }
                }

                function handleOtherMessage(d) {
                    console.error("unexpected message type received! data:", d);
                    return true
                }


                var data = JSON.parse(e.data);
                //console.log("message received", "data", data);

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

                backend.getTeam(activeChannelId).then(function (t) {
                    activeChannelDeferred.resolve(t);
                });

                //reset unread message number
                _newMessageCounter_reset(activeChannelId);

                //reset typing users active channel changed!
                //todo this is a partial solution only fixme ~ilgaz
                $rootScope.usersTypingNow = {}
            };


            /**
             * Unread messages, move this
             * @type {{}}
             * @private
             */
            var _newMessageCounter = {};

            function _newMessageCounter_inc(channelid) {
                var x = _newMessageCounter[channelid] || 0;
                //console.debug("__UNREAD ","_newMessageCounter"," cid",channelid,_newMessageCounter );
                _newMessageCounter[channelid] = x + 1
            }

            function _newMessageCounter_reset(channelid) {
                //console.debug("__UNREAD ","_newMessageCounter_reset"," cid",channelid,_newMessageCounter );

                _newMessageCounter[channelid] = 0
            }

            this.numberOfunreadMessages = function (channelid) {
                //console.debug("__UNREAD ","numberOfunreadMessages"," cid",channelid,_newMessageCounter );

                var x = _newMessageCounter[channelid] || 0;

                if (!x) {
                    _newMessageCounter[channelid] = 0
                }
                return x
            }

            function socketError(event) {
                console.warn("SOCKETERROR001", "trying to reconnect", event);
                ws = ws.reconnect()

            }

        });
})();