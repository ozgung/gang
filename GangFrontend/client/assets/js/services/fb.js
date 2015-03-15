(function() {

  'use strict';

  angular.module('application')
		
		.service('fb',function(Facebook,$rootScope,$q){
			
			var self = this;
			
			$rootScope.$watch(function() {
		
				return Facebook.isReady();
				
			},function(newVal) {
				
				this.ready = newVal;
			});
			
			this.checkStatus = function(){
				
				return $q(function(resolve,reject){
					
					Facebook.getLoginStatus(function(response) {
						
						if(response.status === 'connected') {
							resolve();
						} else {
							reject();
						}
					},true);
				});
			};
			
			this.login = function(){
				
				return $q(function(resolve,reject){
				
					Facebook.login(function(response){
					
						var authResponse = response.authResponse;
						
						//saveAuthResponse(authResponse);
						
						resolve(authResponse);
						
					},{
						scope:'email'
					});
				});
			};
			
		});
})();