(function () {

    'use strict';

    angular.module('application')

        .service('chat', function ($websocket, token) {

            var self = this;
            var activeChannel = {id: ""};

            var ws = $websocket('ws://ws.ganghq.com/ws?token=' + token.get());
            var messages = {};
            var subscribedChannels = {};

            ws.onMessage(function (e) {
                var data = JSON.parse(e.data);

                if (!messages[data.channel]) {
                    messages[data.channel] = []
                }
                messages[data.channel].push(data);
                console.log("message received,  messages", messages, "data", data);

                //increment notification count by 1
                subscribedChannels[data.channel].numberOfUnReadMessages = 1 + (subscribedChannels[data.channel].numberOfUnReadMessages | 0);
            });

            this.messages = messages;

            this.getThisChannelMessages = function () {
                if (!messages[activeChannel.id]) {
                    console.log("trace", "getThisChannelMessages adding array");
                    messages[activeChannel.id] = []
                }

                //set notification to 0
                subscribedChannels[activeChannel.id].numberOfUnReadMessages = 0;

                console.log("trace", "getThisChannelMessages", messages[activeChannel.id]);
                return messages[activeChannel.id]
            };

            this.setChannels = function (channels) {
                channels.forEach(function (entry) {

                    entry.numberOfUnReadMessages = (entry.numberOfUnReadMessages | 0);

                    console.log("channel id: ", entry.id);
                    messages['#' + entry.id] = [];
                    subscribedChannels['#' + entry.id] = entry;
                });
            };

            this.sendMessage = function (message) {

                var channelName = '#channel';

                if (activeChannel.id) {
                    channelName = activeChannel.id;
                }


                ws.send(JSON.stringify({
                    msg: message,
                    channel: channelName
                }));
            };

            this.getActiveChannel = function () {
                return subscribedChannels[activeChannel.id]
            };

            this.subscribedChannels = subscribedChannels;

            this.setActiveChannel = function (channel) {
                console.log("setting actime channelId", channel);
                activeChannel.id = '#' + channel.id;
            };

        });
})();