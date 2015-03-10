( function () {

	'use strict'

	angular.module('application')
	.service('notification', function(){

		/*source: http://www.binpress.com/tutorial/building-useful-notifications-with-html5-apis/163 */

		var notificationAPI;
		var originalTitle = '', messageCount = 0;
		var hidden, visibilityChangeEvent;

		// Event handler: log change to browser console
		function visibleChangeHandler() {
		    if (document[hidden]) {
		        //console.log('Page is not visible\n');
		    } else {
		        //console.log('Page is visible\n');
		        changeFavicon("/assets/img/g-bg.png");
		    }
		}


		this.init = function(){
			
			document.addEventListener('visibilitychange', visibleChangeHandler, false);
			
			notificationAPI = window.Notification || window.mozNotification || window.webkitNotification;
			notificationAPI.requestPermission(function(permission){});

			if (typeof document.hidden !== 'undefined') {
			    // Opera 12.10, Firefox >=18, Chrome >=31, IE11
			    hidden = 'hidden';
			    visibilityChangeEvent = 'visibilitychange';
			} else if (typeof document.mozHidden !== 'undefined') {
			    // Older firefox
			    hidden = 'mozHidden';
			    visibilityChangeEvent = 'mozvisibilitychange';
			} else if (typeof document.msHidden !== 'undefined') {
			    // IE10
			    hidden = 'msHidden';
			    visibilityChangeEvent = 'msvisibilitychange';
			} else if (typeof document.webkitHidden !== 'undefined') {
			    // Chrome <31 and Android browser (4.4+ !)
			    hidden = 'webkitHidden';
			    visibilityChangeEvent = 'webkitvisibilitychange';
			}

			//Register event handler
			if (typeof document.addEventListener === 'undefined' ||
			             typeof document[hidden] === 'undefined'   ) {
			    //console.log("Page Visibility API isn't supported, sorry!");
			} else {
			    document.addEventListener(visibilityChangeEvent, visibleChangeHandler, false);
			}


		}


		// A function handler
		function Notify(titleText, bodyText)
		{
		    //console.log("notify called")
		    //console.log(titleText, bodyText);
		    if ('undefined' === typeof notificationAPI)
		        //console.log("undefined");
		        return false;       //Not supported....
		    var noty = new notificationAPI(
		        titleText, {
		            body: bodyText,
		            dir: 'auto', // or ltr, rtl
		            lang: 'EN', //lang used within the notification.
		            tag: 'notificationPopup', //An element ID to get/set the content
		            icon: 'http://ganghq.com/assets/img/g-bg.png' //The URL of an image to be used as an icon
		        }
		    );
		    noty.onerror = function () {
		        //console.log('notification.Error');
		    };
		    noty.onshow = function () {
		        console.log('notification.Show');
                var this_notification = noty;
                setTimeout(function(){
                    this_notification.close()
                },2000)
		    };
		    noty.onclose = function () {
		        //console.log('notification.Close');
		    };
		    return true;
		}

		/*!
		 * Dynamically changing favicons with JavaScript
		 * Works in all A-grade browsers except Safari and Internet Explorer
		 * Demo: http://mathiasbynens.be/demo/dynamic-favicons
		 */

		// HTML5™, baby! http://mathiasbynens.be/notes/document-head
		document.head = document.head || document.getElementsByTagName('head')[0];

		function changeFavicon(src) {
		 var link = document.createElement('link'),
		     oldLink = document.getElementById('favicon');
		 link.id = 'dfavicon';
		 link.rel = 'shortcut icon';
		 link.href = src;
		 if (oldLink) {
		  document.head.removeChild(oldLink);
		 }
		 document.head.appendChild(link);
		}

		/* Function post notification */
		this.post = function (title, body){
		    //console.log("post called")
		    if (document['hidden']) {
		        //console.log('page not visible, use notification and vibrate');
		        //Vibrate and try to send notification
		        window.navigator.vibrate(500);
		        if (false == Notify(title, body)) {
		            //Fallback signaling which updates the tab title
		            if ('' == originalTitle)
		                originalTitle = document.title;
		            messageCount++;
		            document.title = '('+messageCount+' messages!) '+originalTitle;
		            changeFavicon("/assets/img/g-bg-redhat.png");
		        } else {
		            //Notification was shown
		        }
		    }
		    else {
		        //console.log('page visible, push to normal notification queue');
		        //doYourOwnSignaling(data);

		        //Reset fallback handling
		        messageCount = 0;
		        if ('' != originalTitle)
		            document.title = originalTitle;
		        originalTitle = '';
		    }
		}
	});

})();