(function() {

  'use strict';

  angular.module('application')
		.service('token',function(){
			
			this.set = function(token,expires){
				localStorage.setItem('token',token);
				
				if(expires){
					localStorage.setItem('expires',expires);
				}
			};
			
			this.isValid = function(){
				return this.get() && !this.isExpired();
			};
			
			this.unset = function(){
				localStorage.removeItem('token');
				localStorage.removeItem('expires');
			};
			
			this.get = function(){
				
				return localStorage.getItem('token');
			};
			
			this.isExpired = function(){
				
				var expires = localStorage.getItem('expires');
				var now = new Date();
				
				if(expires){
					return now > new Date(expires);
				}
				
				return false;
			};
			
		})
})();