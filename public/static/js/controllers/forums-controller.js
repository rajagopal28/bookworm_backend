// ForumController
app.controller('ForumController', ['$scope','ForumsService', function($scope, ForumsService){
    $scope.status = {};
    $scope.forums = [];
    // make service call to get list of forums
    var options = {};
    ForumsService.allForums(options).then(
    function(response){
        $scope.forums = response.data;
    });
}])
.controller('ForumChatController', ['$scope','$routeParams','ForumsService', function($scope, $routeParams, ForumsService){
    var forumId = $routeParams.forumId;
    console.log(forumId);
    $scope.isCommentorAuthor = function(chatItem) {
        return chatItem.creator.id === $scope.forum.creator.id;
    };
    $scope.forum = {};
    $scope.forumChats = [];
    // make service call to get list of forum chats 
    var options = {forumId : forumId};
    ForumsService.allChats(options).then(
    function(response){
        $scope.forum = response.data.forum;
        $scope.forumChats = response.data.chats;
    });    
}])
.controller('NewForumController', ['$scope','$routeParams','ForumsService','BooksService','GoogleAPIService', function($scope, $routeParams, ForumsService, BooksService, GoogleAPIService){
    $scope.book = {};
    $scope.forum = {};
    $scope.addDicsussion = function() {
        $scope.forum.referredBook = $scope.book;
        console.log($scope.forum);
       ForumsService.addForum($scope.forum); 
    };
    $scope.loadBookDetails = function(searchText) {
        console.log("searchText="+searchText);
        if(searchText && searchText.length > 4) {
            var newSearch = searchText.split(" ").join("+");
           var options = {
                    q: 'intitle:'+newSearch,
                    maxResults: 10
                }; 
            return GoogleAPIService.searchBooks(options)
                   .then(function(response){
                // console.log(response);
                   if(response.data.items && response.data.items.length>0) {
                      return response.data.items.map(function(item){
        console.log(item);
        return BooksService.parseGBookToBook(item);
      });
                   }                   
               });
        }
    };
    $scope.onBookSelect = function($item, $model, $label)     {
        $scope.book = $item;
        console.log($item);
        console.log($model);
        console.log($label);
    };        
}])
/*

*/