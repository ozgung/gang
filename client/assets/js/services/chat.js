(function() {

  'use strict';

  angular.module('application')
		
		.service('chat',function($websocket){
			
			var self = this;
			var activeChannel;
			
			var ws = $websocket('ws://zeus.fikrimuhal.com:9000/ws');
			var messages = [];
			
			ws.onMessage(function(e) {
				messages.push(JSON.parse(e.data));
			});
			
			this.messages = messages;
			
			this.sendMessage = function(message){
				
				var channelName = '#channel';
				
				if(activeChannel){
					channelName = '#' + activeChannel.id;
				}
				
				
        ws.send(JSON.stringify({
					msg: message, 
					channel: channelName
				}));
			};
			
			this.setActiveChannel = function(channel){
        activeChannel = channel;
			};
			
		});
})();