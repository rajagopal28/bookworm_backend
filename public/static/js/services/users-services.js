app.service('UsersService', [ '$http', function($http){
    this.registerUser = function(user) {
        return $http.post('/bookworm/api/users/register', user,{timeout: 1000})
    };
}])