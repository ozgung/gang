(function() {

  'use strict';

  angular.module('application')
		
		.service('Gang',function(Facebook,$websocket){
			
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
			
			this.facebook = {
				
				login:function(){
				
					return new Promise(function(resolve,reject){
					
						Facebook.login(function(response){
							localStorage.setItem('authenticated',true);
							self.authenticated = true;
							resolve(response);
						});
					});
				},
				
				logout:function() {
				
					return new Promise(function(resolve,reject){
						
						Facebook.logout(function(response){
							localStorage.removeItem('authenticated');
							self.authenticated = false;
							resolve(response);
						});
					});
				},
				
				me: function() {
				
					return new Promise(function(resolve,reject){
						
						Facebook.api('/me', function(response) {
							resolve(response);
						});
						
					});
				},
				
				groups: function(userId) {
				
					return new Promise(function(resolve,reject){
						
						Facebook.api('/' + userId + '/groups', function(groups) {
							resolve(groups);
						});
						
					});
				}
			};
		});
})();