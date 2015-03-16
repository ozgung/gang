(function () {

    // Object {type: "error", code: "rate_limit", msg: "RATE LIMIT EXCEEDED! BACK OFF! 1.0/s", ts: 1425499697252}`


    'use strict';

    angular.module('application')

        .service('chat', function ($websocket, token, $rootScope, backend, notification, $q) {

            notification.init();

            var _lastReadMessages_loadedFromLocalStorage = false;
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
                        var fromNormalUser = d.channel > 0;
                        if (!messages[d.channel]) {
                            messages[d.channel] = []
                        }
                        var oldSize = messages[d.channel].length;
                        if (oldSize > 70) {
                            messages[d.channel].splice(0, oldSize - 50)
                        }


                        //increase unread message count for this channel
                        //workaround reset current channel we received our message in the current channel
                        if (d.uid == magic_ids._replyingChannelHistory_FINISHED) {

                            //broadcast channel id after all messages fetched
                            $rootScope.$broadcast("CHANNEL_READY", Number(d.msg));

                            if (_lastReadMessages_loadedFromLocalStorage) {

                                _lastReadMessagesUpdate(d.channel, messages[d.channel])
                            } else {


                            }

                            if (activeChannelId == d.channel) {
                                //todo we are marking all messages in the active channel as read
                                _lastReadMessagesMarkNow(d.channel, d.ts)
                            }
                            _countNewMessagesNumber[Number(d.msg)] = true;
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

                                    //add avatar for repeating messages
                                if(historyChanged && m.uid == d.uid){
                                    d._repeating = false
                                }
                            });

                            if (!historyChanged) {
                                //this is new message add to history
                                messages[d.channel].push(d);

                                //remove avatar for repeating messages
                                var previousMessage = messages[d.channel][messages[d.channel].length-2]
                                if(previousMessage && previousMessage.uid == d.uid){
                                    d._repeating = true
                                }




                                if (_countNewMessagesNumber[d.channel]) {
                                    SendNotification(d);


                                    if (activeChannelId == d.channel) {
                                        //todo we are marking all messages in the active channel as read
                                        _lastReadMessagesMarkNow(d.channel, d.ts)
                                    } else {
                                        _lastReadMessagesUpdate(d.channel, messages[d.channel])
                                    }

                                }
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

                        return true;
                    }
                }

                function handleErrorMessages(d) {
                    if (d.type == "error") {

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
                    if (t) {
                        activeChannelDeferred.resolve(t);
                    }else{

                        activeChannelDeferred.reject("team not subscribed or non exists");
                    }
                });

                //reset unread message number
                _lastReadMessagesMarkNow(activeChannelId);

                //reset typing users active channel changed!
                //todo this is a partial solution only fixme ~ilgaz
                $rootScope.usersTypingNow = {};

                return activeChannelDeferred.promise
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


            //UNREAD MESSAGES

            var _lastReadMessages = _lastReadMessagesLoadData();

            function _lastReadMessagesGet(channelid) {
                channelid = channelid || activeChannelId;
                _lastReadMessages[channelid] = _lastReadMessages[channelid] || {ts: -1, count: 0, lastMessagesTS: -1};
                return _lastReadMessages[channelid]
            }


            function _lastReadMessagesMarkNow(channelid, now) {

                channelid = channelid || activeChannelId;


                var lrm = _lastReadMessagesGet(channelid);


                var ts = _.max([now, lrm.ts, lrm.lastMessagesTS]);

                lrm.ts = ts;
                lrm.count = 0;
                lrm.lastMessagesTS = ts;


                if (lrm.ts != now) {


                    _lastReadMessagesStoreData()
                }

            }

            function _lastReadMessagesUpdate(channelid, messages) {
                var lrm = _lastReadMessagesGet(channelid);

                var ts = lrm.ts;
                lrm.count = _.filter(messages, function (m) {
                    var newMessage = m.ts > ts;

                    lrm.lastMessagesTS = _.max([lrm.lastMessagesTS, m.ts]);

                    if (newMessage) {

                    }

                    return newMessage
                }).length;


                return lrm
            }

            function _lastReadMessagesStoreData() {

                localStorage.setItem("_lastReadMessages", JSON.stringify(_lastReadMessages))
            }

            function _lastReadMessagesLoadData() {
                var value = localStorage.getItem("_lastReadMessages");

                _lastReadMessages_loadedFromLocalStorage = true;
                if (value) {
                    try {
                        _lastReadMessages_loadedFromLocalStorage = true;

                        return JSON.parse(value)
                    } catch (err) {

                        _lastReadMessages_loadedFromLocalStorage = false;

                        localStorage.removeItem("_lastReadMessages");
                        return {}
                    }

                } else {

                    _lastReadMessages_loadedFromLocalStorage = false;
                    return {}
                }


            }

            //this.lastReadMessagesMarkNow = _lastReadMessagesMarkNow;
            this.lastReadMessagesGet = _lastReadMessagesGet;


            // notifications


            function _loadNotificationSettings() {
                var value = localStorage.getItem("settings_notifications");

                if (value) {
                    try {
                        return JSON.parse(value)
                    } catch (err) {
                        localStorage.removeItem("settings_notifications");
                        return {enabled: true}
                    }
                } else {
                    return {enabled: true}
                }

            }

            $rootScope.notifications = _loadNotificationSettings();
            $rootScope.toggleNotifications = function () {
                $rootScope.notifications.enabled = !$rootScope.notifications.enabled;
                localStorage.setItem("settings_notifications", JSON.stringify($rootScope.notifications));
            };
            function SendNotification(d) {

                if (!d.self && $rootScope.notifications.enabled) {

                    //todo fix notifications
                    var team = backend.getTeam(d.channel).then(function (t) {
                        var user = backend.getUserProfile(d.uid);
                        if (!user) {
                            user = ""
                        }

                        notification.post(user.displayName + " @ " + t.name, d.msg);
                    });
                }
            }

        });
})();