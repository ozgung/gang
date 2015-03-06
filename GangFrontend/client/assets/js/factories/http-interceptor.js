(function () {

    'use strict';

    angular.module('application')

			.factory('httpInterceptor',function($q,$rootScope){
	
				return {
						request:function(config){
							
							$rootScope.$broadcast("show_loader");
							
							return (config || $q.when(config));
						},
						
						response: function (response) {
							
							$rootScope.$broadcast("hide_loader");
							
							return (response || $q.when(response));
						},
						
						responseError: function (response) {
							
							$rootScope.$broadcast("hide_loader");

							return $q.reject(response);
						}
				};
			});
})();