(function () {
    'use strict';

    angular.module('application')

        .controller('AccountCtrl', function ($scope, $state, chat, fb, user, teams, $window) {

            chat.setChannels(teams);

            $scope.user = user;
            $scope.teams = teams;


            function shortName (str, maxlen)
            {
				var words = str.split(" ");
				var result = "";
            	for (var word in words){
            		if (result.length >= maxlen) return result; 
            		var s = words[word].replace( /[^a-zA-Z]/, "");//remove non alpha
            		if (s !=  '') result += s.charAt(0).toUpperCase();
            	}
            	return result;
            }

            /**
			* color palette
			* source: http://flatuicolors.co/
            */
            $scope.palette = ["#1ABC9C",//0
            				  "#16A085",//1
            				  "#F1C40F",//2
            				  "#F39C12",//3
            				  "#2ECC71",//4
            				  "#27AE60",//5
            				  "#E67E22",//6
            				  "#D35400",//7
            				  "#3498DB",//8
            				  "#2980B9",//9
            				  "#E74C3C",//10
            				  "#C0392B",//11
            				  "#9B59B6",//12
            				  "#8E44AD",//13
            				  "#34495E",//14
            				  "#2C3E50"];//15

            /**
             *todo
             * @param team
             * @returns {string}
             */
            $scope.getTeamColor = function (team) {
                var id = team.id, result = "#34495E";
                result = $scope.palette[id%16];
                return result;
            };

            /**
             * todo
             * @param team
             * @returns {string}
             */
            $scope.getTeamShortName = function (team) {
                return shortName(team.name, 2);
            };

            $scope.numberOfunreadMessages = chat.numberOfunreadMessages;

            $scope.logout = function () {

                $window.localStorage.removeItem('token');
                $window.localStorage.removeItem('lastChannel')
                $state.go('guest');
            };
        });
})();
