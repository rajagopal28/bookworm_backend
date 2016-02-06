// ForumController
app.controller('ForumController', ['$scope', 'ForumsService', 'Constants', 'BookwormAuthProvider',
    function ($scope, ForumsService, Constants, BookwormAuthProvider) {
        $scope.status = {};
        $scope.forums = [];
        $scope.pageSort = Constants.getDefaultPagingSortingData();
        $scope.pageChanged = function() {
            var options = $scope.pageSort;
            ForumsService.allForums(options)
                .then(function (response) {
                    $scope.status = {};
                    $scope.forums = response.data.items;
                    if($scope.forums && $scope.forums.length) {
                        $scope.status[$scope.forums[0].id] = {open :true};
                        // always open first one
                    }
                    $scope.pageSort.totalItems = response.data.totalItems;
                    console.log($scope.pageSort);
                });
        };
        $scope.isLoggedIn = function () {
          return BookwormAuthProvider.isLoggedIn();
        };
        // make service call to get list of forums
        $scope.isCreatorAuthor = function (forum) {
            return BookwormAuthProvider.isCurrentUser(forum.author);
        };
        $scope.pageChanged();
    }])
    .controller('ForumChatController', ['$scope', '$routeParams','Constants', 'ForumsService', 'BookwormAuthProvider',
    function ($scope, $routeParams,Constants, ForumsService, BookwormAuthProvider) {
        var forumId = $routeParams.forumId;
        console.log(forumId);
        $scope.newChat = {};
        $scope.currentUser = BookwormAuthProvider.getUser();
        $scope.isCommentatorAuthor = function (chatItem) {
            return BookwormAuthProvider.isCurrentUser(chatItem.author);
        };
        $scope.isLoggedIn = function () {
          return BookwormAuthProvider.isLoggedIn();
        };
        var pageSort = Constants.getDefaultPagingSortingData();
        $scope.addChat = function () {
            var options = $.extend({}, pageSort);
            options.forumId = forumId;
            options.chatComment = $scope.newChat.chatComment;
            var authorInfo = ForumsService.getCurrentAuthorInfo();
            if (authorInfo) {
                options.author = authorInfo;
            }
            ForumsService.addChat(options)
                .then(function (response) {
                    console.log(response);
                    //$scope.forumChats.push(options);
                });
        };
        $scope.forum = {};
        $scope.forumChats = [];
        // make service call to get list of forum chats
        var options = {id: forumId};
        ForumsService.allChats(options).then(
            function (response) {
                if (response.data) {
                    $scope.forum = response.data;
                    $scope.forumChats = response.data.chats;
                }
            });
        socket.on('new-chat', function (chatInfo) {
            console.log('choot');
            console.log(chatInfo);
            if (chatInfo.forumId === forumId) {
                $scope.forumChats.push(chatInfo.chat);
            }
        });
    }])
    .controller('NewForumController', ['$scope', '$routeParams', 'ForumsService', 'BooksService', 'GoogleAPIService', 'BookwormAuthProvider',
        function ($scope, $routeParams, ForumsService, BooksService, GoogleAPIService, BookwormAuthProvider) {
            $scope.book = {};
            $scope.forum = {};
            $scope.isLoggedIn = function () {
              return BookwormAuthProvider.isLoggedIn();
            };
            $scope.addForum = function () {
                $scope.forum.referredBook = $scope.book;
                var authorInfo = ForumsService.getCurrentAuthorInfo();
                if (authorInfo) {
                    $scope.forum.author = authorInfo;
                }
                console.log($scope.forum);
                ForumsService.addForum($scope.forum);
            };
            $scope.loadBookDetails = function (searchText) {
                console.log("searchText=" + searchText);
                if (searchText && searchText.length > 4) {
                    var newSearch = searchText.split(" ").join("+");
                    var options = {
                        q: 'intitle:' + newSearch,
                        maxResults: 10
                    };
                    return GoogleAPIService.searchBooks(options)
                        .then(function (response) {
                            // console.log(response);
                            if (response.data.items && response.data.items.length > 0) {
                                return response.data.items.map(function (item) {
                                    console.log(item);
                                    return BooksService.parseGBookToBook(item);
                                });
                            }
                        });
                }
            };
            $scope.onBookSelect = function ($item, $model, $label) {
                $scope.book = $item;
                console.log($item);
                console.log($model);
                console.log($label);
            };
    }]);