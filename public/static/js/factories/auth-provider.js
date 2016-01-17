app.factory('BookwormAuthProvider', ['$http', '$localStorage',
    function ($http, $localStorage) {
        function urlBase64Decode(str) {
            var output = str.replace('-', '+').replace('_', '/');
            switch (output.length % 4) {
                case 0:
                    break;
                case 2:
                    output += '==';
                    break;
                case 3:
                    output += '=';
                    break;
                default:
                    throw 'Illegal base64url string!';
            }
            return window.atob(output);
        }

        function getUserFromToken() {
            //var token = $localStorage.token;
            //var user;
            //if (typeof token !== 'undefined') {
            //    user = JSON.parse(urlBase64Decode(token));
            //}
            var token = $localStorage.user;
            var user;
            if (typeof token !== 'undefined') {
                user = JSON.parse(token);
            }
            return user;
        }

        var authenticatedUser;
        return {
            setUser: function (aUser) {
                if (aUser.authSuccess) {
                    $localStorage.token = aUser.token;
                    $localStorage.user = JSON.stringify(aUser);
                    authenticatedUser = aUser;
                } else {
                    // reset all auth related token
                    authenticatedUser = null;
                    $localStorage.user = null;
                    $localStorage.token = null;
                }
            },
            isLoggedIn: function () {
                return (authenticatedUser) ? authenticatedUser.authSuccess : false;
            },
            getUser: function () {
                if(!authenticatedUser) {
                    authenticatedUser = getUserFromToken();
                }
                return authenticatedUser;
            }
        };
    }]);