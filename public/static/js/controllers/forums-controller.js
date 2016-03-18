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
                    // console.log($scope.pageSort);
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
        // console.log(forumId);
        $scope.newChat = {};
        $scope.loggedTime = new Date();
        $scope.currentUser = BookwormAuthProvider.getUser();
        $scope.isUserForumOwner = function() {
            return $scope.forum && BookwormAuthProvider.isCurrentUser($scope.forum.author);
        };
        $scope.isCommentatorAuthor = function (chatItem) {
            return BookwormAuthProvider.isCurrentUser(chatItem.author);
        };
        $scope.isLoggedIn = function () {
          return BookwormAuthProvider.isLoggedIn();
        };
        var pageSort = Constants.getDefaultPagingSortingData();
        $scope.addChat = function () {
            if($scope.newChat.chatComment
                && $scope.newChat.chatComment.trim() !== '') {
                var options = $.extend({}, pageSort);
                options.forumId = forumId;
                options.chatComment = $scope.newChat.chatComment;
                var authorInfo = BookwormAuthProvider.getUser();
                if (authorInfo) {
                    options.author = authorInfo.id;
                }
                ForumsService.addChat(options)
                    .then(function (response) {
                        // console.log(response);
                        //$scope.forumChats.push(options);
                        $scope.newChat.chatComment = '';
                    });
            }
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
        socket.on(Constants.EVENT_NAME_NEW_CHAT, function (chatInfo) {
            // console.log('choot');
            // console.log(chatInfo);
            if (chatInfo.forumId === forumId) {
                $scope.forumChats.push(chatInfo.chat);
            }
        });
    }])
    .controller('NewForumController', ['$scope', '$routeParams', 'Constants', 'ForumsService', 'BooksService', 'GoogleAPIService', 'BookwormAuthProvider',
        function ($scope, $routeParams, Constants, ForumsService, BooksService, GoogleAPIService, BookwormAuthProvider) {
            $scope.book = {};
            $scope.forum = {};
            var forumId = $routeParams.forumId;
            $scope.status = {success : false, error: false};
            $scope.isLoggedIn = function () {
              return BookwormAuthProvider.isLoggedIn();
            };
            if(forumId) {
                var options = Constants.getDefaultPagingSortingData();
                options.id = forumId;
                ForumsService
                    .allForums(options)
                    .then(function(response){
                        if(response.data && response.data.items){
                            $scope.forum = response.data.items[0];
                            if($scope.forum && $scope.forum.referredBook) {
                                $scope.book = $scope.forum.referredBook;
                            }
                        }
                    });
            }
            $scope.isEditMode = function() {
                return forumId && forumId.trim() !== '';
            };
            $scope.updateForum = function() {
                $scope.forum.referredBook = $scope.book;
                var authorInfo = BookwormAuthProvider.getUser();
                if (authorInfo) {
                    $scope.forum.author = authorInfo.id;
                }
                ForumsService
                    .updateForum($scope.forum)
                    .then(function(response) {
                        if (response && response.data) {
                            if (response.data.success) {
                                $scope.status.success = true;
                                $scope.status.error = false;
                            } else {
                                $scope.status.error = true;
                                $scope.status.success = false;
                            }
                        }
                    });
            };
            $scope.addForum = function () {
                $scope.forum.referredBook = $scope.book;
                var authorInfo = ForumsService.getCurrentAuthorInfo();
                if (authorInfo) {
                    $scope.forum.author = authorInfo;
                }
                // console.log($scope.forum);
                ForumsService
                    .addForum($scope.forum)
                    .then(function(response) {
                        if (response && response.data) {
                            if (response.data.success) {
                                $scope.status.success = true;
                                $scope.status.error = false;
                                $scope.book = {};
                                $scope.forum = {};
                            } else {
                                $scope.status.error = true;
                                $scope.status.success = false;
                            }
                        }
                    });
            };
            $scope.loadBookDetails = function (searchText) {
                // console.log("searchText=" + searchText);
                if (searchText && searchText.length > Constants.GOOGLE_BOOK_MIN_TITLE_QUERY_LIMIT) {
                    var newSearch = searchText.split(" ").join("+");
                    var options = {
                        q: Constants.GOOGLE_BOOKS_SEARCH_PARAM_IN_TITLE + newSearch,
                        maxResults: Constants.GOOGLE_BOOKS_SEARCH_MAX_RESULTS
                    };
                    return GoogleAPIService.searchBooks(options)
                        .then(function (response) {
                            //  console.log(response);
                            if (response.data.items && response.data.items.length > 0) {
                                return response.data.items.map(function (item) {
                                    // console.log(item);
                                    return BooksService.parseGBookToBook(item);
                                });
                            }
                        });
                }
            };
            $scope.dismissAlert = function() {
                $scope.status.success = false;
                $scope.status.error = false;
            };
            $scope.onBookSelect = function ($item, $model, $label) {
                $scope.book = $item;
                // console.log($item);
                // console.log($model);
                // console.log($label);
            };
    }]);