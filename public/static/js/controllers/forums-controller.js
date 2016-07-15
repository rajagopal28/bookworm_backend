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
    .controller('PrivateForumController', ['$scope', 'ForumsService', 'Constants', 'BookwormAuthProvider',
    function ($scope, ForumsService, Constants, BookwormAuthProvider) {
        $scope.status = {};
        $scope.forums = [];
        $scope.isPrivate = true;
        $scope.pageSort = Constants.getDefaultPagingSortingData();
        $scope.pageChanged = function() {
            if(BookwormAuthProvider.isLoggedIn()) {
                var authUser = BookwormAuthProvider.getUser();
                var options = $scope.pageSort;
                options.id = authUser.id;
                ForumsService.getPrivateForums(options)
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
            }
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
                    options.author = authorInfo;
                    // send author info so as to get it while receiving on socket broadcast
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
                if (response.data
                    && response.data.success) {
                    $scope.forum = response.data.item;
                    $scope.forumChats = response.data.item.chats;
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
    .controller('PrivateForumChatController', ['$scope', '$routeParams','Constants', 'ForumsService', 'BookwormAuthProvider',
        function ($scope, $routeParams,Constants, ForumsService, BookwormAuthProvider) {
            var forumId = $routeParams.forumId;
            // console.log(forumId);
            $scope.newChat = {};
            $scope.isPrivate = true;
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
                        options.author = authorInfo;
                        options.id = authorInfo.id;
                        console.log(options);
                        // send author info so as to get it while receiving on socket broadcast
                        ForumsService.addPrivateChat(options)
                            .then(function (response) {
                                // console.log(response);
                                //$scope.forumChats.push(options);
                                $scope.newChat.chatComment = '';
                            });
                    }
                }
            };
            $scope.forum = {};
            $scope.forumChats = [];
            // make service call to get list of forum chats
            if(BookwormAuthProvider.isLoggedIn()) {
                var authUser = BookwormAuthProvider.getUser();
                var options = {forumId: forumId, id: authUser.id };
                ForumsService.allPrivateChats(options)
                    .then(function (response) {
                    if (response.data
                        && response.data.success) {
                        $scope.forum = response.data.item;
                        $scope.forumChats = response.data.item.chats;
                    }
                });
            }
            socket.on(Constants.EVENT_NAME_NEW_CHAT, function (chatInfo) {
                // console.log('choot');
                // console.log(chatInfo);
                if (chatInfo.forumId === forumId) {
                    $scope.forumChats.push(chatInfo.chat);
                }
            });
        }])
    .controller('NewForumController', ['$scope', '$routeParams', 'Constants', 'ForumsService', 'BooksService', 'UsersService', 'GoogleAPIService', 'BookwormAuthProvider', 'formatUserNameFilter',
        function ($scope, $routeParams, Constants, ForumsService, BooksService, UsersService, GoogleAPIService, BookwormAuthProvider, formatUserName) {
            $scope.book = {};
            $scope.selectedUser = {};
            $scope.forum = {};
            $scope.visibleToUsers = [];
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
                            if($scope.forum) {
                                if($scope.forum.referredBook) {
                                    $scope.book = $scope.forum.referredBook;
                                }
                                if($scope.forum.visibleTo) {
                                    $scope.visibleToUsers = $scope.forum.visibleTo;
                                }
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
                var authorInfo = BookwormAuthProvider.getUser();
                if (authorInfo && authorInfo.id) {
                    $scope.forum.author = authorInfo.id;
                    $scope.forum.visibleTo = $scope.visibleToUsers.map(function(item) {
                        return item.id;
                    });
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
                }
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
            $scope.loadUsersList = function(searchText) {
                var userInfo = BookwormAuthProvider.getUser();
                var options = Constants.getDefaultPagingSortingData();
                options.id = userInfo.id;
                options.query = searchText;
                return UsersService.getUsersInNetwork(options)
                    .then(function (response) {
                        //  console.log(response);
                        return response.data.items;
                    });
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
            $scope.onUserSelect = function ($item, $model, $label) {
                var temp = $scope.visibleToUsers.filter(function(pivot){
                    return pivot.id == $item.id;
                });
                if(temp.length === 0) {
                    $scope.visibleToUsers.push($item);
                }
                // console.log($item);
                // console.log($model);
                // console.log($label);
            };
            $scope.removeUser = function (indexToRemove) {
                $scope.visibleToUsers.splice(indexToRemove, 1);
            };
    }]);