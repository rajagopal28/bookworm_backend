app.service('ForumsService', ['$http', 'Constants', function ($http, Constants) {
    this.addForum = function (options) {
        return $http.post('/bookworm/api/forums/add', options, {timeout : Constants.DEFAULT_HTTP_TIMEOUT});
    };
    this.updateForum = function (options) {
        return $http.post('/bookworm/api/forums/update', options, {timeout : Constants.DEFAULT_HTTP_TIMEOUT});
    };
    this.allForums = function (options) {
        return $http.get('/bookworm/api/forums/all', {params: options});
    };
    this.allChats = function (options) {
        return $http.get('/bookworm/api/forums/chats/all', {params: options});
    };
    this.addChat = function (options) {
        return $http.post('/bookworm/api/forums/chats/add', options, {timeout : Constants.DEFAULT_HTTP_TIMEOUT});
    };
    this.getPrivateForums = function (options) {
        return $http.get('/bookworm/api/private-forums/all', {params: options});
    };
    this.allPrivateChats = function (options) {
        return $http.get('/bookworm/api/private-forums/chats/all', {params: options});
    };
    this.addPrivateChat = function (options) {
        return $http.post('/bookworm/api/private-forums/chats/add', options, {timeout : Constants.DEFAULT_HTTP_TIMEOUT});
    };
}]);