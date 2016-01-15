// ForumController
app.controller('ForumController', ['$scope', 'ForumsService', function ($scope, ForumsService) {
        $scope.status = {};
        $scope.forums = [];
        // make service call to get list of forums
        var options = {};
        ForumsService.allForums(options).then(
            function (response) {
                $scope.forums = response.data;
            });
    }])
    .controller('ForumChatController', ['$scope', '$routeParams', 'ForumsService','BookwormAuthProvider',
        function ($scope, $routeParams, ForumsService, BookwormAuthProvider) {
        var forumId = $routeParams.forumId;
        console.log(forumId);
        $scope.newChat = {};
        $scope.isCommentorAuthor = function (chatItem) {
            return chatItem && chatItem.creator && chatItem.creator.id === $scope.forum.creator.id;
        };
        $scope.addChat = function () {
            var options = {};
            options.forumId = forumId;
            options.chatComment = $scope.newChat.chatComment;
            var currentUser = BookwormAuthProvider.getUser();
            options.author = {
                authorName : currentUser.authorName,
                username : currentUser.username,
                thumbnailURL : currentUser.thumbnailURL
            };
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
    .controller('NewForumController', ['$scope', '$routeParams', 'ForumsService', 'BooksService', 'GoogleAPIService','BookwormAuthProvider',
        function ($scope, $routeParams, ForumsService, BooksService, GoogleAPIService, BookwormAuthProvider) {
        $scope.book = {};
        $scope.forum = {};
        $scope.addDicsussion = function () {
            $scope.forum.referredBook = $scope.book;
            var currentUser = BookwormAuthProvider.getUser();
            $scope.forum.author = {
                authorName : currentUser.authorName,
                username : currentUser.username,
                thumbnailURL : currentUser.thumbnailURL
            };
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