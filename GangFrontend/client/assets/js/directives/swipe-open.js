(function() {

  'use strict';

  angular.module('application')
		
		.directive('swipeOpen',function(FoundationApi) {
			
			var directive = {
				link: link
			};
			
			return directive;
	
			function link($scope, element, attrs) {
				
				var alreadyOpened = false;
				var hammerElem;
				
				if(Hammer){
				
					hammerElem = new Hammer(element[0]);
					
					hammerElem.get('swipe').set({
						direction: Hammer.DIRECTION_ALL,
						threshold: 5,
						velocity: 0.5
					});
				}
				
				hammerElem.on('swipeleft', function() {
				
					if(alreadyOpened){
					
						FoundationApi.publish('gang-left-panel', 'close');
						
					}else{
					
						FoundationApi.publish('gang-right-panel', 'open');
					}
					
					alreadyOpened = !alreadyOpened;
				});
				
				hammerElem.on('swiperight', function() {
				
					if(alreadyOpened){
						FoundationApi.publish('gang-right-panel', 'close');
					}else{
						FoundationApi.publish('gang-left-panel', 'open');
					}
					alreadyOpened = !alreadyOpened;
				});
			}
		});
		
})();