(function() {

  'use strict';

  angular.module('application')
		
		.service('fb',function(Facebook,$rootScope,$q){
			
			var saveAuthResponse = function(authResponse){
			
				localStorage.setItem('access-token',authResponse.accessToken);
				localStorage.setItem('expiresIn',authResponse.expiresIn);
				localStorage.setItem('userId',authResponse.userId);
				localStorage.setItem('signedRequest',authResponse.signedRequest);
			};
			
			var removeAuthResponse = function(){
			
				localStorage.removeItem('access-token');
				localStorage.removeItem('expiresIn');
				localStorage.removeItem('userId');
				localStorage.removeItem('signedRequest');
			};
			
			var self = this;
			
			$rootScope.$watch(function() {
		
				return Facebook.isReady();
				
			},function(newVal) {
				
				this.ready = newVal;
			});
			
			this.checkStatus = function(){
				
				return new Promise(function(resolve,reject){

					Facebook.getLoginStatus(function(response) {
						
						if(response.status === 'connected') {
							saveAuthResponse(response.authResponse);	
							resolve();
						} else {
							removeAuthResponse();	
							reject();
						}
					},true);
				});
			};
			
			this.login = function(){
				
				return new Promise(function(resolve,reject){
				
					Facebook.login(function(response){
					
						var authResponse = response.authResponse;
						
						saveAuthResponse(authResponse);
						resolve(authResponse.userId);
					},{
						scope:'email,user_groups'
					});
				});
			};
		
			this.logout = function() {
			
				return new Promise(function(resolve,reject){
					
					Facebook.logout(function(){
					
						removeAuthResponse();
						resolve();
					});
				});
			};
			
			this.user = function() {
			
				return new Promise(function(resolve,reject){
					
					Facebook.api('/me', function(response) {
						resolve(response);
					},{
						access_token: localStorage.getItem('access-token')
					});
				});
			};
			
			this.groups = function(user) {
			
				return new Promise(function(resolve,reject){
					
					Facebook.api('/' + user.id + '/groups', function(groups) {
						resolve(groups.data);
					},{
						access_token: localStorage.getItem('access-token')
					});
					
				});
			};
		});
})();