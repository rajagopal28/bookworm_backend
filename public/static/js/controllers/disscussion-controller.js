// DiscussionController
app.controller('DiscussionController', ['$scope','DiscussionsService', function($scope, DiscussionsService){
    $scope.status = {};
    $scope.discussions = [];
    // make service call to get list of discussions
    var options = {};
    DiscussionsService.allDiscussions(options).then(
    function(response){
        $scope.discussions = response.data;
    });
}])
.controller('DiscussionChatController', ['$scope','$routeParams','DiscussionsService', function($scope, $routeParams, DiscussionsService){
    var discussionId = $routeParams.discussionId;
    console.log(discussionId);
    $scope.isCommentorAuthor = function(chatItem) {
        return chatItem.creator.id === $scope.discussion.creator.id;
    };
    $scope.discussion = {};
    $scope.discussionChats = [];
    // make service call to get list of discussion chats 
    var options = {discussionId : discussionId};
    DiscussionsService.allChats(options).then(
    function(response){
        $scope.discussion = response.data.discussion;
        $scope.discussionChats = response.data.chats;
    });    
}])
.controller('NewDiscussionController', ['$scope','$routeParams','DiscussionsService','BooksService','GoogleAPIService', function($scope, $routeParams, DiscussionsService, BooksService, GoogleAPIService){
    $scope.book = {};
    $scope.addDicsussion = function() {
        $scope.forum.referredBook = $scope.book;
        console.log($scope.forum);
       DiscussionsService.addDiscussion($scope.forum); 
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