app.service('UsersService', ['$http', '$q', '$localStorage', 'Constants', 'BookwormAuthProvider',
    function ($http, $q, $localStorage, Constants, BookwormAuthProvider) {
        this.registerUser = function (user) {
            return $http.post('/bookworm/api/users/register', user, {timeout: Constants.DEFAULT_HTTP_TIMEOUT});
        };
        this.updateProfile = function (user) {
            return $http.post('/bookworm/api/users/update', user, {timeout: Constants.DEFAULT_HTTP_TIMEOUT});
        };
        this.loginUser = function (user) {
            var promise = $http.post('/bookworm/api/users/login-auth', user, {timeout: Constants.DEFAULT_HTTP_TIMEOUT});
            promise.then(function (response) {
                BookwormAuthProvider.setUser(response.data);
            });
            return promise;
        };
        this.usernameUnique = function (user) {
            return $http.post('/bookworm/api/users/check-unique', user, {timeout: Constants.DEFAULT_HTTP_TIMEOUT});
        };
        this.logout = function (successCB) {
            BookwormAuthProvider.setUser({});
            if(successCB) {
                successCB();
            }

        };
        this.getUsers = function(options){
          return $http.get('/bookworm/api/users/all', {params : options}, {timeout: Constants.DEFAULT_HTTP_TIMEOUT});
        };
        this.getUsersInNetwork = function(options){
          return $http.get('/bookworm/api/users/network/all', {params : options}, {timeout: Constants.DEFAULT_HTTP_TIMEOUT});
        };
        this.postImage = function(file){
            var user = BookwormAuthProvider.getUser();

            if(user && user.username && file) {
                var username = user.username;
                var fd = new FormData();
                fd.append(Constants.PARAM_USER_NAME, username);
                fd.append(Constants.PARAM_USER_IMAGE_FILE_NAME, file);

                return $http.post('/bookworm/api/user/profile-upload', fd, {
                  transformRequest: angular.identity,
                  headers: {
                    'Content-Type': undefined
                  }
                });
            }
            return $q.reject({error : Constants.ERROR_MISSING_REQUIRED_FIELDS})

        };
        this.postFeedback = function(feedback){
            return $http.post('/bookworm/api/feedback/add', feedback, {timeout: Constants.DEFAULT_HTTP_TIMEOUT})
        };
        this.updatePassword = function(credentials){
            return $http.post('/bookworm/api/users/change-password', credentials, {timeout: Constants.DEFAULT_HTTP_TIMEOUT})
        };
        this.requestResetPassword = function(credentials){
            return $http.post('/bookworm/api/users/request-password-reset', credentials, {timeout: Constants.DEFAULT_HTTP_TIMEOUT})
        };
        this.resetPassword = function(credentials){
            return $http.post('/bookworm/api/users/reset-password', credentials, {timeout: Constants.DEFAULT_HTTP_TIMEOUT})
        };
        this.verifyAccount = function(credentials){
            return $http.post('/bookworm/api/users/verify-account', credentials, {timeout: Constants.DEFAULT_HTTP_TIMEOUT})
        };
        this.sendFriendRequest = function(options){
            return $http.post('/bookworm/api/users/network/send-friend-request', options, {timeout: Constants.DEFAULT_HTTP_TIMEOUT})
        };
        this.acceptFriendRequest = function(options){
            return $http.post('/bookworm/api/users/network/accept-request', options, {timeout: Constants.DEFAULT_HTTP_TIMEOUT})
        };
        this.removeUserFromNetwork = function(options){
            return $http.post('/bookworm/api/users/network/remove-friend', options, {timeout: Constants.DEFAULT_HTTP_TIMEOUT})
        };
}]);