(function () {

    'use strict';

    angular.module('application')

        .service('chat', function ($websocket, token) {

            var self = this;
            var activeChannel;

            var ws = $websocket('ws://ws.ganghq.com/ws?token=' + token.get());
            var messages = [];

            ws.onMessage(function (e) {
                messages.push(JSON.parse(e.data));
            });

            this.messages = messages;

            this.sendMessage = function (message) {

                var channelName = '#channel';

                if (activeChannel) {
                    channelName = '#' + activeChannel;
                }


                ws.send(JSON.stringify({
                    msg: message,
                    channel: channelName
                }));
            };

            this.setActiveChannel = function (channel) {
                console.log("setting actime channelId", channel);
                activeChannel = channel;
            };

        });
})();