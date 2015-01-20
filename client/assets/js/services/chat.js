(function() {

  'use strict';

  angular.module('application')
		
		.service('chat',function($websocket){
			
			var self = this;
			
			var ws = $websocket('ws://zeus.fikrimuhal.com:9000/ws');
			var messages = [];
			
			ws.onMessage(function(e) {
				messages.push(JSON.parse(e.data));
			});
			
			this.messages = messages;
			
			this.sendMessage = function(message,channel){
        ws.send(JSON.stringify({
					msg: message, 
					channel: channel
				}));
			};
			
		});
})();