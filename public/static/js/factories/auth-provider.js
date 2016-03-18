app.factory('BookwormAuthProvider', ['$http', '$localStorage', 'formatUserNameFilter',
    function ($http, $localStorage, formatUserName) {
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
        function resetUsetToken() {
            authenticatedUser = null;
            $localStorage.user = null;
            $localStorage.token = null;
        }
        function updateUserObject(aUser){
            if(authenticatedUser
                && authenticatedUser.authSuccess
                && aUser
                && aUser.username === authenticatedUser.username ){
                var newUser = {
                    authSuccess : authenticatedUser.authSuccess,
                    authorName : formatUserName(aUser),
                    firstName : aUser.firstName,
                    lastName: aUser.lastName,
                    username : aUser.username,
                    thumbnailURL : aUser.thumbnailURL,
                    id : aUser.id,
                    token : authenticatedUser.token
                };
                $localStorage.user = JSON.stringify(newUser);
                authenticatedUser = newUser;
            }

        }
        function setUserFromToken(aUser) {
            $localStorage.token = aUser.token;
            if(!aUser.authorName
                && (aUser.firstName
                    || aUser.lastName)) {
                aUser.authorName = formatUserName(aUser);
            }
            $localStorage.user = JSON.stringify(aUser);
            authenticatedUser = aUser;
        }
        var authenticatedUser;
        return {
            setUser: function (aUser) {
                if (aUser.authSuccess) {
                   setUserFromToken(aUser);
                } else {
                    // reset all auth related token
                    resetUsetToken();
                }
            },
            updateUser : function(aUser){
                updateUserObject(aUser);
            },
            isLoggedIn: function () {
                if(!authenticatedUser) {
                    authenticatedUser = getUserFromToken();
                }
                return (authenticatedUser) ? authenticatedUser.authSuccess : false;
            },
            getUser: function () {
                if(!authenticatedUser) {
                    authenticatedUser = getUserFromToken();
                }
                return authenticatedUser;
            },
            isCurrentUser : function(contributor) {
                return authenticatedUser && contributor
                    && contributor.username === authenticatedUser.username;
            }
        };
    }]);