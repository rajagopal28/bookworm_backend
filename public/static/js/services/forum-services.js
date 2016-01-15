app.service('ForumsService', ['$http', function ($http) {
    this.addForum = function (options) {
        return $http.post('/bookworm/api/forums/add', options);
    };
    this.allForums = function (options) {
        return $http.get('/bookworm/api/forums/all', {params: options});
    };
    this.allChats = function (options) {
        return $http.get('/bookworm/api/forums/chats/all', {params: options});
    };
    this.addChat = function (options) {
        return $http.post('/bookworm/api/forums/chats/add', options);
    };
}]);