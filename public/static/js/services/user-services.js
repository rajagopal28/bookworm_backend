app.service('UsersService', [ '$http', '$localStorage','BookwormAuthProvider', function($http, $localStorage, BookwormAuthProvider){
    this.registerUser = function(user) {
        return $http.post('/bookworm/api/users/register', user,{timeout: 1000});
    };
    this.loginUser = function(user) {
        var promise = $http.post('/bookworm/api/users/login-auth', user,{timeout: 1000});
        promise.then(function(response){
            BookwormAuthProvider.setUser(response.data);
        });
        return promise;
    };
    this.usernameUnique = function(user) {
        return $http.post('/bookworm/api/users/check-unique', user,{timeout: 1000});
    };
    this.logout = function(successCB) {
        BookwormAuthProvider.changeUser({});
        successCB();
    };
}])