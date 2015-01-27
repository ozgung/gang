(function() {

  'use strict';

  angular.module('application')
	
		.service('backend',function(token,$http){
			
			this.request = function(action,query){
				
				var t = token.get();
				
				if(!query){
					query = {};
				}
				
				if(t){
					query.token = t;
				}
				
				return $http({
					method:'get',
					url:'http://app.ganghq.com/api/' + action,
					params:query
				}).then(function(response){
					return response.data;
				});
			}
		})
})();