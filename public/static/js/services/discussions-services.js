app.service('DiscussionsService', [ '$http', function($http){
    this.addDiscussion = function(options){
        return $http.get('/bookworm/api/discussions/add', {params : options});
    };
    this.allDiscussions = function(options){
        return $http.get('/bookworm/api/discussions/all', {params : options});
    };
    this.allChats = function(options){
        return $http.get('/bookworm/api/discussions/chats/all', {params : options});
    };
}])