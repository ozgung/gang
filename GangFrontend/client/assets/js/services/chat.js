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
                return m.split(":D").join(":smiley:")
                    .split(":)").join(":grinning:")
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

            ws.onOpen(socketConnected);

            window.ws = ws; //just for debug purposes
            var messages = {};


            //workaround reset current channel we received our message in the current channel
            var _countNewMessagesNumber = {};
            var onlineUsers = {};

            this.numberOfOnlineUsers = function () {
                var size = 0, key;
                for (key in onlineUsers) {
                    if (onlineUsers.hasOwnProperty(key)) size++;
                }
                return size;
            };
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
                            var historyChanged = false;

                            messages[d.channel].forEach(function (m) {
                                if (m.ts == d.ts) {
                                    //old message update history
                                    angular.extend(m, d);
                                    historyChanged = true
                                }
                            });

                            if (!historyChanged) {
                                //this is new message add to history
                                messages[d.channel].push(d);
                            }

                            d.msg = replaceSmiley(d.msg);

                            //clean deleted messages
                            if (d.msg.trim().length == 0) {
                                //this is delete command  i.e. message with empty txt
                                //todo not implemented yet!

                                var arr = messages[d.channel],
                                    len = arr.length, i;

                                for (i = 0; i < len; i++)

                                    if (arr[i] && arr[i].msg && arr[i].msg.trim().length > 0) {
                                        arr.push(arr[i]);
                                    }  // copy non-empty values to the end of the array

                                arr.splice(0, len);  // cut the array and leave only the non-empty values

                            }


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
                    } else if (d.type == "pong") {
                        console.debug(d);
                        return true;
                    }
                }
                function handleErrorMessages(d) {
                    if (d.type == "error") {
                        console.error(d);
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
                handleErrorMessages(data) ||
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

            this.sendMessage = function (message, edited) {
                var data = {
                    msg: message,
                    type: 'message',
                    channel: +activeChannelId
                };
                if (edited) {
                    data.edited = true;
                    data.ts = edited.ts;
                }
                ws.send(JSON.stringify(data));
            };

            this.deleteMessage = function (ts) {
                var data = {
                    ts: ts,
                    msg: "",
                    edited: true,
                    deleted: true,
                    type: 'message',
                    channel: +activeChannelId
                };
                ws.send(JSON.stringify(data));
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


            function ping() {
                var data = {
                    ts: new Date().valueOf(),
                    type: 'ping'
                };
                ws.send(JSON.stringify(data));
            }

            var pinging = false;

            function socketConnected(event) {
                if (!pinging) {
                    setInterval(ping, 30000);
                    pinging = true;
                    ping();
                }


            }

        });
})();