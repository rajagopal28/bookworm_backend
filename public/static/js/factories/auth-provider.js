app
.factory('BookwormAuthProvider', ['$http', '$localStorage', function($http,$localStorage) {
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
        var token = $localStorage.token;
        var user;
        if (typeof token !== 'undefined') {
            user = JSON.parse(urlBase64Decode(token));
        }
        return user;
    }

    var authenticatedUser;
    return {
        setUser : function(aUser){
          if(aUser.authSuccess) {
              $localStorage.token = aUser.token;  
              authenticatedUser = aUser;
          }
        },
        isLoggedIn : function(){
          return(authenticatedUser)? authenticatedUser : false;
        },
        getUser : function() {             
            authenticatedUser.token = $localStorage.token;
            return authenticatedUser;
        }
    };
  }]);