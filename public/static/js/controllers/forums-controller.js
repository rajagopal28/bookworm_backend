// ForumController
app.controller('ForumController', ['$scope', 'ForumsService', 'Constants',
    function ($scope, ForumsService, Constants) {
        $scope.status = {};
        $scope.forums = [];
        $scope.pageSort = Constants.getDefaultPagingSortingData();
        $scope.pageChange = function() {
            var options = $scope.pageSort;
            ForumsService.allForums(options)
                .then(function (response) {
                    $scope.forums = response.data.items;
                    $scope.pageSort.totalItems = response.data.totalItems;
                });
        };
        // make service call to get list of forums
        $scope.isCreatorAuthor = function (forum) {
            return ForumsService.isUserItemAuthor(forum);
        };
        $scope.pageChange();
    }])
    .controller('ForumChatController', ['$scope', '$routeParams', 'ForumsService', 'BookwormAuthProvider',
    function ($scope, $routeParams, ForumsService, BookwormAuthProvider) {
        var forumId = $routeParams.forumId;
        console.log(forumId);
        $scope.newChat = {};
        $scope.currentUser = BookwormAuthProvider.getUser();
        $scope.isCommentatorAuthor = function (chatItem) {
            return ForumsService.isUserItemAuthor(chatItem);
        };
        $scope.addChat = function () {
            var options = {};
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
        $scope.addForum = function () {
            $scope.forum.referredBook = $scope.book;
            var currentUser = BookwormAuthProvider.getUser();
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