app.service('UsersService', [ '$http', function($http){
    this.registerUser = function(user) {
        return $http.post('/bookworm/api/registerUser', user,{timeout: 1000})
    };
}])