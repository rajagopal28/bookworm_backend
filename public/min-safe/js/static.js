var app = angular.module('bookworm-ui', ['ngRoute', 'ngStorage', 'ui.bootstrap', 'ngTagsInput']);
app.config(['$routeProvider', '$httpProvider',
        function ($routeProvider, $httpProvider) {
            $routeProvider
                .when('/bookworm/home', {
                    templateUrl: 'templates/welcome.html',
                    controller: 'HomeController'
                })
                .when('/bookworm/login', {
                    templateUrl: 'templates/login.html',
                    controller: 'UserLoginController'
                })
                .when('/bookworm/register', {
                    templateUrl: 'templates/register.html',
                    controller: 'UserRegistrationController'
                })
                .when('/bookworm/auth/users', {
                    templateUrl: 'templates/users.html',
                    controller: 'UsersController'
                })
                .when('/bookworm/auth/users/:username', {
                    templateUrl: 'templates/view-user.html',
                    controller: 'UserDetailsController'
                })
                .when('/bookworm/auth/update-profile/:userId', {
                    templateUrl: 'templates/update-profile.html',
                    controller: 'UserRegistrationController'
                })
                .when('/bookworm/auth/change-password', {
                    templateUrl: 'templates/change-password.html',
                    controller: 'UserPasswordController'
                })
                .when('/bookworm/reset-password-link/:requestToken', {
                    templateUrl: 'templates/reset-password.html',
                    controller: 'UserPasswordController'
                })
                .when('/bookworm/verify-account-link/:requestToken', {
                    templateUrl: 'templates/login.html',
                    controller: 'UserLoginController'
                })
                .when('/bookworm/auth/borrow', {
                    templateUrl: 'templates/borrow.html',
                    controller: 'BorrowBooksController'
                })
                .when('/bookworm/auth/borrow/:bookId', {
                    templateUrl: 'templates/view-lent.html',
                    controller: 'ViewBookController'
                })
                .when('/bookworm/auth/lend', {
                    templateUrl: 'templates/lend.html',
                    controller: 'LendBookController'
                })
                .when('/bookworm/auth/edit-book/:bookId', {
                    templateUrl: 'templates/lend.html',
                    controller: 'LendBookController'
                })
                .when('/bookworm/forums', {
                    templateUrl: 'templates/forums.html',
                    controller: 'ForumController'
                })
                .when('/bookworm/forums/:forumId', {
                    templateUrl: 'templates/forum-chats.html',
                    controller: 'ForumChatController'
                })
                .when('/bookworm/auth/new-forum', {
                    templateUrl: 'templates/new-forum.html',
                    controller: 'NewForumController'
                })
                .when('/bookworm/auth/edit-forum/:forumId', {
                    templateUrl: 'templates/new-forum.html',
                    controller: 'NewForumController'
                })
                .when('/bookworm/contact', {
                    templateUrl: 'templates/contact.html',
                    controller: 'HomeController'
                })
                .when('/bookworm/about', {
                    templateUrl: 'templates/about.html',
                    controller: 'HomeController'
                })
                .when('/bookworm/feedback', {
                    templateUrl: 'templates/feedback.html',
                    controller: 'FeedbackController'
                })
                .otherwise({
                    redirectTo: '/bookworm/home'
                });

            $httpProvider.interceptors.push('BookWormHTTPInterceptor');
        }])
    .run(['$rootScope', '$location', 'BookwormAuthProvider', function ($rootScope, $location, BookwormAuthProvider) {
        $rootScope.$on('$locationChangeStart', function (event, next, current) {
            // check only for authenticated pages
            if (next && next.indexOf('/bookworm/auth') !== -1) {
                if (!BookwormAuthProvider.isLoggedIn()) {
                    // console.log('DENY : Redirecting to Login');
                    event.preventDefault();
                    $location.path('/bookworm/login');
                }
                else {
                    // console.log('ALLOW');
                }
            }
        });
    }]);
app.constant('Constants', {
    DEFAULT_ITEMS_PER_PAGE : 10,
    DEFAULT_MAXIMUM_PAGES : 10,
    SORT_ORDER_ASC : 'asc',
    SORT_ORDER_DESC : 'desc',
    DEFAULT_SORT_FIELD : 'createdTS',
    DEFAULT_LOCAL_IMAGES_PATH : '../static/images/',
    DEFAULT_POST_ERROR_MESSAGE : 'Problem submitting the details. Please try after sometime!',
    MESSAGE_USERNAME_AVAILABLE : 'User name available',
    MESSAGE_USERNAME_UNAVAILABLE : 'User name is not available',
    MODAL_SIZE_LARGE : 'l',
    MODAL_DISMISS_RESPONSE : 'cancel',
    DEFAULT_HTTP_TIMEOUT : '1000', // milliseconds
    DEFAULT_MIN_YEAR : 1900,
    DEFAULT_MIN_MONTH : 5,
    DEFAULT_MIN_DATE : 22,
    DEFAULT_DATE_FORMAT : 'dd-MMMM-yyyy',
    DEFAULT_YEAR_FORMAT : 'yy',
    PARAM_VALUE_GENDER_MALE : 'male',
    PARAM_VALUE_GENDER_FEMALE : 'female',
    ERROR_LOGIN_FAILED : 'Invalid credentials!!',
    ERROR_MISSING_REQUIRED_FIELDS : 'Missing one or more required fields',
    DEFAULT_DATA_ERROR_MESSAGE : 'Something went wring. Please try after sometime!',
    PARAM_USER_NAME : 'username',
    PARAM_USER_IMAGE_FILE_NAME : 'file',
    MAX_FILE_UPLOAD_LIMIT : '5242880', // Bytes --> 5MB
    GOOGLE_BOOKS_SEARCH_PARAM_ISBN : 'isbn:',
    GOOGLE_BOOKS_SEARCH_PARAM_IN_TITLE : 'intitle:',
    GOOGLE_BOOKS_SEARCH_MAX_RESULTS : 10,
    GOOGLE_BOOK_VALID_ISBN_LENGTHS : [10,13],
    GOOGLE_BOOK_MIN_TITLE_QUERY_LIMIT : 5,
    GOOGLE_BOOK_ISBN_TYPE_10 : 'ISBN_10',
    ALL_BOOK_GENRES : ['History', 'Romance', 'Drama', 'Mystery', 'Science', 'Fiction', 'Thriller', 'Comedy', 'Philosophy', 'Spiritual'],
    BOOKWORM_HTTP_AUTH_TOKEN_BEARER : 'Bearer ',
    ERROR_MESSAGE_FILE_SIZE_LIMIT_EXCEEDED : 'Sorry we cannot upload the file. File size should be less than 5MB.',

    EVENT_NAME_DATE_SET : 'date-set',
    EVENT_NAME_NEW_CHAT : 'new-chat',
    getDefaultPagingSortingData : function() {
        var pageSortDefaults = {
            itemsPerPage : this.DEFAULT_ITEMS_PER_PAGE,
            totalItems : 0,
            pageNumber : 1,
            primarySort : {},
            maximumPages : this.DEFAULT_MAXIMUM_PAGES
        };
        pageSortDefaults.primarySort[this.DEFAULT_SORT_FIELD] = this.SORT_ORDER_ASC;
        return pageSortDefaults;
    }
});
app.controller('BorrowBooksController', ['$scope', '$http', 'Constants', 'BooksService', 'GoogleAPIService',
    function ($scope, $http, Constants, BooksService, GoogleAPIService) {
        $scope.search = {};
        $scope.pageSort = Constants.getDefaultPagingSortingData();
        // TODO query locations not used
        $scope.getLocations = function (queryText) {
            // console.log(queryText);
            return GoogleAPIService.getAddresses({'address': queryText})
                .then(function (response) {
                   if(response.data){
                        // console.log(response);
                        return response.data.results.map(function (item) {
                            return item.formatted_address;
                        });
                   }
                    return null;
                });
        };
        $scope.genres = Constants.ALL_BOOK_GENRES;
        $scope.search.sortAscending = true;
        $scope.search.isAvailable = true;
        $scope.genres = [];// ['Drama', 'Mystery'];
        $scope.search.genres = $scope.genres;

       $scope.pageChanged = function() {
        var options = $.extend({}, $scope.pageSort);
        $scope.search.genres = [];
        for (var index in $scope.genres) {
            var text = $scope.genres[index].text ? $scope.genres[index].text : $scope.genres[index];
            $scope.search.genres.push(text);
        }
        var sortOrder = $scope.search.sortAscending
            ? Constants.SORT_ORDER_ASC
            : Constants.SORT_ORDER_DESC;
        $scope.pageSort.primarySort = {'lendDate' : sortOrder};
        $scope.search = $.extend($scope.search, $scope.pageSort);
        // console.log($scope.search);
        BooksService.rentalBooks($scope.search)
           .then(function (response) {
              // console.log(response.data);
               $scope.availableBooks = response.data.items;
               $scope.pageSort.totalItems = response.data.totalItems;
           });
        };
        // console.log($scope.availableBooks);
        $scope.searchBooks = function () {
            $scope.pageChanged();
        };
        $scope.pageChanged();
    }])
    .controller('ViewBookController', ['$scope', '$http','$routeParams', 'Constants', 'BooksService','BookwormAuthProvider',
    function ($scope, $http, $routeParams, Constants, BooksService, BookwormAuthProvider) {
        $scope.book = {};
        $scope.status = {
            success: false,
            error: false
        };
        var bookId = $routeParams.bookId;
        BooksService.rentalBooks({id:bookId})
            .then(function(response){
                if(response.data && response.data.items){
                    $scope.bookDataAvailable =  response.data.items.length > 0;
                    $scope.book = response.data.items[0];
                    $scope.book.authorName = $scope.book.authorName.join(', ');
                }
            });
        $scope.isUserContributor = function() {
            return $scope.book
                    && BookwormAuthProvider.isCurrentUser($scope.book.contributor);
        };
        $scope.borrowBook = function() {
            var options = $scope.book;
            // console.log('Requesting to borrow book');
            var currentUser = BookwormAuthProvider.getUser();
            if(options && currentUser && currentUser.username){
               options.borrowerName = currentUser.username;
               // console.log(options);
               BooksService
                .requestBook(options)
                .then(function(response) {
                    // console.log(response);
                    if (response.data.success) {
                        $scope.status.success = true;
                        $scope.status.error = false;
                    } else {
                        $scope.status.error = true;
                        $scope.status.success = false;
                    }
                });
            }
        };
        $scope.dismissAlert = function() {
            $scope.status.success = false;
            $scope.status.error = false;
        };
        $scope.isLoggedIn = function() {
          return BookwormAuthProvider.isLoggedIn();
        };
    }])
    .controller('LendBookController', ['$scope', '$routeParams', '$http', 'Constants', 'ConfigService', 'BooksService', 'BookwormAuthProvider', 'GoogleAPIService',
        function ($scope, $routeParams, $http, Constants, ConfigService, BooksService, BookwormAuthProvider, GoogleAPIService) {
            $scope.book = {};
            $scope.status = {
                success: false,
                error: false
            };
            var noImageURL;
            ConfigService.getConfig()
                .then(function(response){
                    if(response.data && response.data) {
                        noImageURL = response.data.noImageURL;
                        $scope.book.thumbnailURL = noImageURL;
                    }
                });

            var currentUser = BookwormAuthProvider.getUser();
            var contributor = {};
            if(currentUser) {
                contributor = {
                    authorName : currentUser.authorName,
                    username : currentUser.username,
                    thumbnailURL : currentUser.thumbnailURL
                };
            }
            var bookId = $routeParams.bookId;
            if(bookId) {
                BooksService.rentalBooks({id:bookId})
                    .then(function(response){
                        if(response.data && response.data.items){
                            $scope.book = response.data.items[0];
                            $scope.book.genresList = $scope.book.genres;
                            $scope.book.authorName = $scope.book.authorName.join(', ');
                            $scope.book.contributor = contributor;
                            // console.log($scope.book);
                        }
                    });
            }
            $scope.isEditMode = function() {
              return bookId && bookId.trim() !== '';
            };
            $scope.editBook = function() {
              BooksService.editBook($scope.book)
                    .then(function (response) {
                        // console.log(response);
                        if (response.success) {
                            $scope.status.success = true;
                            $scope.status.error = false;
                        } else {
                            $scope.status.error = true;
                            $scope.status.success = false;
                        }
                    });
            };
            $scope.loadBookDetails = function (searchText) {
                var isbn = $scope.book.isbn;
                // console.log("isbn=" + isbn);
                // console.log("searchText=" + searchText);
                if (!isNaN(isbn) && !(searchText && searchText.length)) {
                    if (Constants.GOOGLE_BOOK_VALID_ISBN_LENGTHS.indexOf(isbn.length) != -1) {
                        var options = {
                            q: Constants.GOOGLE_BOOKS_SEARCH_PARAM_ISBN + isbn,
                            maxResults: Constants.GOOGLE_BOOKS_SEARCH_MAX_RESULTS
                        };
                        GoogleAPIService.searchBooks(options)
                            .then(function (response) {
                                // console.log(response);
                                if (response.data.items && response.data.items.length > 0) {
                                    $scope.book = BooksService.parseGBookToBook(response.data.items[0]);
                                }
                            });
                    }
                } else if (searchText && searchText.length > Constants.GOOGLE_BOOK_MIN_TITLE_QUERY_LIMIT) {
                    var newSearch = searchText.split(" ").join("+");
                    //  console.log('In else block');
                    //  console.log(newSearch);
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
            $scope.onBookSelect = function ($item, $model, $label) {
                $scope.book = $item;
                // console.log($item);
                // console.log($model);
                // console.log($label);
            };
            $scope.genres = Constants.ALL_BOOK_GENRES;
            $scope.book.genresList = [];//[{text: 'Drama'}, {text: 'Mystery'}];
            $scope.changeSorting = function (value) {
                $scope.search.sortAscending = !value;
            };
            $scope.lendBook = function () {
                // console.log($scope.book);
                if(!$scope.book.thumbnailURL) {
                    $scope.book.thumbnailURL = noImageURL;
                }
                $scope.book.genres = [];
                for (var index = 0; index < $scope.book.genresList.length; index++) {
                    var item = $scope.book.genresList[index];
                    $scope.book.genres.push(item.text);
                }
                $scope.book.contributor = contributor;
                BooksService.lendBook($scope.book)
                    .then(function (response) {
                        // console.log(response);
                        if (response.data.success) {
                            $scope.status.success = true;
                            $scope.status.error = false;
                            $scope.book = {};
                        } else {
                            $scope.status.error = true;
                            $scope.status.success = false;
                        }
                    });
            };
        }]);
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
                var authorInfo = ForumsService.getCurrentAuthorInfo();
                if (authorInfo) {
                    options.author = authorInfo;
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
                var authorInfo = ForumsService.getCurrentAuthorInfo();
                if (authorInfo) {
                    $scope.forum.author = authorInfo;
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
// HomeController
app.controller('HomeController', ['$scope', '$location', 'UsersService', 'BookwormAuthProvider',
    function ($scope, $location, UsersService, BookwormAuthProvider)  {
        $scope.tabs = [{
            title : 'BookWorm',
            template :'./templates/about-site.html',
            active : true},
            {
            title : 'Author',
            template :'./templates/about-author.html',
            active : false}];
        $scope.loginPopup = function () {
            // console.log('Login');
        };
        $scope.isLoggedIn = function () {
            return BookwormAuthProvider.isLoggedIn();
        };
        $scope.getDisplayName = function() {
          var user = BookwormAuthProvider.getUser();
            if (user && user.authorName) {
                return user.authorName;
            }
        };
         $scope.getUserName = function() {
          var user = BookwormAuthProvider.getUser();
            if (user && user.username) {
                return user.username;
            }
        };
        $scope.getThumbnail = function() {
          var user = BookwormAuthProvider.getUser();
            if (user && user.thumbnailURL) {
                return user.thumbnailURL;
            }
        };
        $scope.logout = function () {
            UsersService.logout();
            $location.path('/bookworm/home');
        };
}]);
app.controller('UserRegistrationController', ['$scope', '$routeParams', '$uibModal', 'Constants', 'ConfigService', 'UsersService', 'BookwormAuthProvider',
    function ($scope, $routeParams, $uibModal, Constants, ConfigService, UsersService, BookwormAuthProvider) {
        $scope.user = {};
        var userId = $routeParams.userId;
        $scope.user.gender = Constants.PARAM_VALUE_GENDER_MALE;
        $scope.user.dob = new Date();
        $scope.$on(Constants.EVENT_NAME_DATE_SET, function (event, args) {
            // console.log(args);
            // console.log('recieving date-set');
            $scope.user.dob = args.selectedDate;
        });
        var noMaleImageURL, noFemaleImageURL, imagePath;
        ConfigService.getConfig()
            .then(function(response){
                if(response.data && response.data) {
                    noMaleImageURL = response.data.noMaleImageURL;
                    noFemaleImageURL = response.data.noFemaleImageURL;
                    imagePath = response.data.imagesDirectory
                                    ? response.data.imagesDirectory
                                    : Constants.DEFAULT_LOCAL_IMAGES_PATH;
                    $scope.user.thumbnailURL = noMaleImageURL;
                }
            });

        $scope.status = {
            success: false,
            warn: false,
            error: false
        };
        $scope.genderChange = function() {
            if(!$scope.user.thumbnailURL){
                $scope.user.thumbnailURL = $scope.user.gender === Constants.PARAM_VALUE_GENDER_MALE? noMaleImageURL : noFemaleImageURL;
            }
            if($scope.user.gender === Constants.PARAM_VALUE_GENDER_FEMALE
                && $scope.user.thumbnailURL === noMaleImageURL) {
                $scope.user.thumbnailURL = noFemaleImageURL;
            } else if ($scope.user.gender === Constants.PARAM_VALUE_GENDER_MALE
                 && $scope.user.thumbnailURL === noFemaleImageURL){
                $scope.user.thumbnailURL = noMaleImageURL;
            }
        };
        $scope.isEditMode = function() {
            return userId && userId.trim() !== '';
        };
        if($scope.isEditMode()){
            var options = Constants.getDefaultPagingSortingData();
            options.id = userId;
            UsersService.getUsers(options)
                .then(function(response){
                    if(response.data && response.data.items) {
                        $scope.user = response.data.items[0];
                    }
                });
        }
        $scope.isUserContributor = function() {
          return BookwormAuthProvider.isCurrentUser($scope.user);
        };
        $scope.isLoggedIn = function() {
          return BookwormAuthProvider.isLoggedIn();
        };
        $scope.update = function () {
            // console.log($scope.user);
            UsersService.updateProfile($scope.user)
                .then(function (response) {
                    $scope.status.success = true;
                    $scope.status.error = false;
                    BookwormAuthProvider.updateUser($scope.user);
                }, function (error) {
                    $scope.status.error = true;
                    $scope.status.success = false;
                });

        };
        $scope.signup = function () {
            // console.log($scope.user);
            UsersService.registerUser($scope.user)
                .then(function (response) {
                    $scope.status.success = true;
                    $scope.status.error = false;
                    $scope.user = {};
                }, function (error) {
                    $scope.status.error = true;
                    $scope.status.success = false;
                });

        };

        $scope.checkUsername = function () {
            UsersService.usernameUnique($scope.user)
                .then(function (response) {
                    // console.log(response);
                    if (response.data) {
                        $scope.user.isUsernameAvailable = response.data.isUsernameAvailable;
                        if (response.data.isUsernameAvailable) {
                            $scope.user.customMessage = Constants.MESSAGE_USERNAME_AVAILABLE;
                        } else {
                            $scope.user.customMessage = Constants.MESSAGE_USERNAME_UNAVAILABLE;
                        }
                    }
                });
        };
         $scope.showImageUploadModal = function () {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: '../../../templates/image-upload.html',
                controller: 'ImageUploadController',
                size: Constants.MODAL_SIZE_LARGE,
                resolve: {
                    user : $scope.user
                }
            });
            modalInstance.result.then(function(result) {
                // console.log(result);
                if(result.data
                    && result.data.success
                    && result.data.fileAbsolutePath) {
                    $scope.user.thumbnailURL = result.data.fileAbsolutePath;
                }
            });
        };
        $scope.dismissAlert = function () {
            $scope.status.success = false;
            $scope.status.error = false;
            $scope.status.warn = false;
        };
    }])
    .controller('UserLoginController', ['$scope', '$routeParams', '$location', '$uibModal', 'Constants', 'UsersService',
        function ($scope, $routeParams, $location, $uibModal, Constants, UsersService) {
        $scope.user = {};
        $scope.status = {error: false, success : false};
        $scope.dismissMessage = function () {
            $scope.status.error = false;
        };
        var requestToken = $routeParams.requestToken;
        if(requestToken){
            $scope.user.token = requestToken;
            UsersService.verifyAccount($scope.user).then(
                function (response) {
                    if (response.data.success) {
                        $scope.status.error = false;
                        $scope.status.success = true;
                    } else {
                        $scope.errorMessage = response.data.msg ? response.data.msg : Constants.DEFAULT_POST_ERROR_MESSAGE;
                        $scope.status.error = true;
                        $scope.status.success = false;
                    }
                }, function(error) {
                    $scope.status.error = true;
                    $scope.errorMessage = Constants.DEFAULT_POST_ERROR_MESSAGE;
                    $scope.status.success = false;
            });
        }
        $scope.login = function () {
            UsersService.loginUser($scope.user).then(function (response) {
                if (response.data) {
                    if (response.data.authSuccess) {
                        $scope.status.error = false;
                        $location.path('/bookworm/home');
                    } else {
                        $scope.errorMessage = response.data.msg ? response.data.msg : Constants.ERROR_LOGIN_FAILED;
                        $scope.status.error = true;
                        $scope.status.success = false;
                    }
                } else {
                    $scope.status.error = true;
                    $scope.errorMessage = Constants.DEFAULT_POST_ERROR_MESSAGE;
                    $scope.status.success = false;
                }
            });
        };

        $scope.sendResetPasswordRequest = function() {
            UsersService.requestResetPassword($scope.user).then(function (response) {
                    if (response.data.success) {
                        $scope.status.error = false;
                        $scope.status.success = true;
                        $scope.user = {};
                    } else {
                        var err = response.data.error;
                        $scope.errorMessage = err? err : Constants.DEFAULT_POST_ERROR_MESSAGE;
                        $scope.status.error = true;
                        $scope.status.success = false;
                    }
                });
        };

        $scope.dismissAlert = function () {
            $scope.status.success = false;
            $scope.status.error = false;
        };
    }])
    .controller('UsersController', ['$scope','Constants',  'UsersService',
        function ($scope, Constants, UsersService) {
            $scope.pageSort = Constants.getDefaultPagingSortingData();
            $scope.users = [];
            $scope.search = {query : ''};
            $scope.searchUsers = function() {
                var options = $scope.pageSort;
                if($scope.search.query){
                    options.query = $scope.search.query;
                }
                UsersService.getUsers(options)
                    .then(function(response){
                        if(response.data && response.data.items){
                            $scope.users = response.data.items;
                            $scope.pageSort.totalItems = response.data.totalItems;
                        }
                    });
            };
            $scope.searchUsers();
    }])
    .controller('UserPasswordController', ['$scope','$routeParams', 'Constants',  'UsersService', 'BookwormAuthProvider',
        function ($scope, $routeParams, Constants, UsersService, BookwormAuthProvider) {
            $scope.status = {error: false, success : false};
            $scope.user = BookwormAuthProvider.getUser();
            var requestToken = $routeParams.requestToken;
            $scope.changePassword = function () {
                if(BookwormAuthProvider.isLoggedIn()) {
                    UsersService.updatePassword($scope.user).then(function (response) {
                        if (response.data.success) {
                            $scope.status.error = false;
                            $scope.status.success = true;
                            $scope.user = {};
                        } else {
                            var err = response.data.error;
                            $scope.errorMessage = err? err : Constants.DEFAULT_POST_ERROR_MESSAGE;
                            $scope.status.error = true;
                            $scope.status.success = false;
                        }
                    });
                }
            };
            $scope.resetPassword = function() {
                if(requestToken){
                    $scope.user.token = requestToken;
                    UsersService.resetPassword($scope.user).then(function (response) {
                        if (response.data.success) {
                            $scope.status.error = false;
                            $scope.status.success = true;
                            $scope.user = {};
                        } else {
                            var err = response.data.error;
                            $scope.errorMessage = err? err : Constants.DEFAULT_POST_ERROR_MESSAGE;
                            $scope.status.error = true;
                            $scope.status.success = false;
                        }
                    });
                }

            };

        $scope.dismissAlert = function () {
            $scope.status.success = false;
            $scope.status.error = false;
        };
    }])
    .controller('UserDetailsController', ['$scope','$routeParams','Constants',  'UsersService', 'BookwormAuthProvider',
        function ($scope, $routeParams, Constants, UsersService, BookwormAuthProvider) {

            var options = Constants.getDefaultPagingSortingData();
            $scope.user = {};
            $scope.isUserContributor = function(){
                return BookwormAuthProvider.isCurrentUser($scope.user);
            };
            $scope.isLoggedIn = function() {
              return BookwormAuthProvider.isLoggedIn();
            };
            options.username = $routeParams.username;
            UsersService.getUsers(options)
                .then(function(response){
                    if(response.data && response.data.items){
                        $scope.userDataAvailable = response.data.items.length > 0;
                        $scope.user = response.data.items[0];
                    }
                });
    }])
    .controller('ImageUploadController', ['$scope','$uibModalInstance', '$timeout', 'Constants',  'UsersService', 'BookwormAuthProvider','user',
        function ($scope, $uibModalInstance, $timeout, Constants, UsersService, BookwormAuthProvider, user) {
            $scope.user = user;
            $scope.profileThumbnail = null;
            $scope.status = {error: false, success: false};
            $scope.uploadImage = function() {
                var file = $scope.profileThumbnail;
                if(file && file.size < Constants.MAX_FILE_UPLOAD_LIMIT) {
                    UsersService
                    .postImage(file)
                    .then(function(response){
                        if(response && response.data){
                            if(response.data.success) {
                               $scope.status.error = false;
                                $scope.status.success = true;
                                $scope.user.thumbnailURL = $scope.user.thumbnailURL !== response.data.fileAbsolutePath
                                    ? response.data.fileAbsolutePath
                                    : response.data.fileAbsolutePath + '?lastmod=' + (new Date()).getTime();
                                $timeout(function(){
                                 $uibModalInstance.close(response.data);
                                }, 10000);
                                $scope.profileThumbnail = null;
                            } else {
                                 $scope.status.error = true;
                                $scope.status.success = false;
                                $scope.errorMessage = response.data.error;
                            }
                        } else {
                            $scope.status.error = true;
                            $scope.status.success = false;
                            $scope.errorMessage = Constants.DEFAULT_POST_ERROR_MESSAGE;
                        }
                    }, function(error) {
                        if(error) {
                            $scope.status.error = true;
                            $scope.status.success = false;
                            $scope.errorMessage = Constants.DEFAULT_POST_ERROR_MESSAGE;
                        }
                    });
                }
            };
            $scope.dismissAlert = function() {
                $scope.status.error = false;
                $scope.status.success = false;
            };
            $scope.cancel = function() {
                $uibModalInstance.dismiss(Constants.MODAL_DISMISS_RESPONSE);
            };
    }])
    .controller('FeedbackController', ['$scope','Constants',  'UsersService', 'BookwormAuthProvider',
        function ($scope, Constants, UsersService, BookwormAuthProvider) {
            $scope.feedback = {feedbackType:'query'};
            $scope.status = {success : false, error: false};
            if(BookwormAuthProvider.isLoggedIn()) {
                var currentUser = BookwormAuthProvider.getUser();
                if(currentUser && currentUser.username) {
                    var options = Constants.getDefaultPagingSortingData();
                    options.username = currentUser.username;
                    UsersService.getUsers(options)
                    .then(function(response){
                        if(response.data && response.data.items){
                            $scope.feedback = $.extend($scope.feedback, response.data.items[0]);
                            $scope.feedback.authorName = $scope.feedback.firstName + ' ' + $scope.feedback.lastName;
                        }
                    });
                }
            }
            $scope.dismissAlert = function () {
                $scope.status.error = false;
                $scope.status.success = false;
            };
            $scope.sendFeedback = function() {
                if($scope.feedback.feedbackComment){
                    UsersService
                        .postFeedback($scope.feedback)
                        .then(function(response){
                            if(response.data && response.data.success){
                                $scope.status.error = false;
                                $scope.status.success = true;
                            } else {
                                $scope.status.error = true;
                                $scope.status.success = false;
                            }
                            $scope.feedback.feedbackComment = '';
                        }, function(error) {
                            $scope.status.error =  true;
                            $scope.status.success = false;
                            $scope.feedback.feedbackComment = '';
                        });
                }
            };

    }]);
app.directive('datePickerInput', function(){
    return {
        restrict: 'E',
        scope : {
            initDate : '='
        },
        templateUrl : '../../templates/datepicker-input-template.html',
        controller : 'DatepickerCtrl'
    };
}).controller('DatepickerCtrl', ['$scope','Constants', function ($scope, Constants) {
        $scope.today = function () {
            $scope.dt = new Date();
        };
        $scope.status = {};
        if($scope.initDate) {
            $scope.dt = $scope.initDate;
        } else {
            $scope.today();
        }
        $scope.clear = function () {
            $scope.dt = null;
        };
        $scope.toggleMin = function () {
            $scope.minDate = $scope.minDate ? null : new Date(Constants.DEFAULT_MIN_YEAR,
                Constants.DEFAULT_MIN_MONTH,
                Constants.DEFAULT_MIN_DATE);
        };
        $scope.toggleMin();
        $scope.maxDate = new Date();

        $scope.showDatepicker = function ($event) {
            $scope.status.opened = true;
        };

        $scope.onDatePicked = function () {
            $scope.$emit(Constants.EVENT_NAME_DATE_SET, {selectedDate: $scope.dt});
            // console.log('Emitting date-set');
        };
        $scope.setDate = function (year, month, day) {
            $scope.dt = new Date(year, month, day);
        };

        $scope.dateOptions = {
            formatYear: Constants.DEFAULT_YEAR_FORMAT,
            startingDay: 1
        };
        $scope.format = Constants.DEFAULT_DATE_FORMAT;
    }]);
app.directive('equals', function () {
    return {
        restrict: 'A', // only activate on element attribute
        require: '?ngModel', // get a hold of NgModelController
        link: function (scope, elem, attrs, ngModel) {
            if (!ngModel) return; // do nothing if no ng-model

            // watch own value and re-validate on change
            scope.$watch(attrs.ngModel, function () {
                validate();
            });

            // observe the other value and re-validate on change
            attrs.$observe('equals', function (val) {
                validate();
            });

            var validate = function () {
                // values
                var val1 = ngModel.$viewValue;
                var val2 = attrs.equals;

                // set validity
                ngModel.$setValidity('equals', !val1 || !val2 || val1 === val2);
            };
        }
    }
});

app.directive('fileModel', ['$parse', function ($parse) {
        return {
           restrict: 'A',
           link: function(scope, element, attrs) {
              var model = $parse(attrs.fileModel);
              var modelSetter = model.assign;

              element.bind('change', function(){
                 scope.$apply(function(){
                    modelSetter(scope, element[0].files[0]);
                 });
              });
           }
        };
     }]);
      
app.factory('BookwormAuthProvider', ['$http', '$localStorage',
    function ($http, $localStorage) {
        function urlBase64Decode(str) {
            var output = str.replace('-', '+').replace('_', '/');
            switch (output.length % 4) {
                case 0:
                    break;
                case 2:
                    output += '==';
                    break;
                case 3:
                    output += '=';
                    break;
                default:
                    throw 'Illegal base64url string!';
            }
            return window.atob(output);
        }

        function getUserFromToken() {
            //var token = $localStorage.token;
            //var user;
            //if (typeof token !== 'undefined') {
            //    user = JSON.parse(urlBase64Decode(token));
            //}
            var token = $localStorage.user;
            var user;
            if (typeof token !== 'undefined') {
                user = JSON.parse(token);
            }
            return user;
        }
        function resetUsetToken() {
            authenticatedUser = null;
            $localStorage.user = null;
            $localStorage.token = null;
        }
        function updateUserObject(aUser){
            if(authenticatedUser
                && authenticatedUser.authSuccess
                && aUser
                && aUser.username === authenticatedUser.username ){
                var newUser = {
                    authSuccess : authenticatedUser.authSuccess,
                    authorName : ('' + (aUser.firstName ? aUser.firstName : '') + ' ' + (aUser.lastName ? aUser.lastName : '')).trim(),
                    username : aUser.username,
                    thumbnailURL : aUser.thumbnailURL,
                    token : authenticatedUser.token
                };
                $localStorage.user = JSON.stringify(newUser);
                authenticatedUser = newUser;
            }

        }
        function setUserFromToken(aUser) {
            $localStorage.token = aUser.token;
            $localStorage.user = JSON.stringify(aUser);
            authenticatedUser = aUser;
        }
        var authenticatedUser;
        return {
            setUser: function (aUser) {
                if (aUser.authSuccess) {
                   setUserFromToken(aUser);
                } else {
                    // reset all auth related token
                    resetUsetToken();
                }
            },
            updateUser : function(aUser){
                updateUserObject(aUser);
            },
            isLoggedIn: function () {
                if(!authenticatedUser) {
                    authenticatedUser = getUserFromToken();
                }
                return (authenticatedUser) ? authenticatedUser.authSuccess : false;
            },
            getUser: function () {
                if(!authenticatedUser) {
                    authenticatedUser = getUserFromToken();
                }
                return authenticatedUser;
            },
            isCurrentUser : function(contributor) {
                return authenticatedUser && contributor
                    && contributor.username === authenticatedUser.username;
            }
        };
    }]);
app.factory('BookWormHTTPInterceptor', ['$q', '$location', '$localStorage', 'Constants', 'LoaderService',
    function ($q, $location, $localStorage, Constants, LoaderService) {
            return {
                'request': function (config) {
                    if (config && config.url
                        && config.url.indexOf('/bookworm') !== -1) {
                        config.headers = config.headers || {};
                        if ($localStorage.token) {
                            config.headers.Authorization = Constants.BOOKWORM_HTTP_AUTH_TOKEN_BEARER + $localStorage.token;
                        }
                    }
                    LoaderService.activateSpinner();
                    return config;
                },
                'responseError': function (response) {
                    if (response.status === 401 || response.status === 403) {
                        $location.path('/bookworm/login');
                    }
                    LoaderService.deactivateSpinner();
                    return $q.reject(response);
                },
                'response': function (response) {
                    LoaderService.deactivateSpinner();
                    return response;
                }
            };
        }]);
app.filter('formatDate', [function() {
  return function(input) {
      var monthNames = [
          'January', 'February', 'March',
          'April', 'May', 'June', 'July',
          'August', 'September', 'October',
          'November', 'December'
        ];
      var DATE_SEPARATOR = '-';
      var INVALID_DATE_ERROR = 'Invalid Date';
      if(new Date(input) !== INVALID_DATE_ERROR){
        input = new Date(input);
        var day = input.getDate();
        var monthIndex = input.getMonth();
        var year = input.getFullYear();

        // console.log(day, monthNames[monthIndex], year);
        var formattedDateString = day
            + DATE_SEPARATOR
            + monthNames[monthIndex]
            + DATE_SEPARATOR
            + year;
        return formattedDateString;
      }
      return input;
  };
}]);
/*

 var socket = io.connect('http://localhost:8080',{transports:['websocket']});
 window.io.connect('ws://localhost:8080', {transports:['websocket']});
 */
var BOOKWORM_APPLICATION_HOST = 'http://127.0.0.1:8080';
var hostname = location.hostname;
var protocol = location.protocol;
var SOCKET_OPTIONS = {
    SECURE : {
        PROTOCOL : 'wss',
        PORT : 8443
    },
    NORMAL : {
        PROTOCOL : 'ws',
        PORT : 8000
    }
};
if (hostname !== '127.0.0.1') {
    // For OpenShift Deployment socket connection
    var option = 'https:' === protocol ? SOCKET_OPTIONS.SECURE : SOCKET_OPTIONS.NORMAL;
    BOOKWORM_APPLICATION_HOST = option.PROTOCOL
                                    + '://'
                                    + hostname
                                    + ':'
                                    + option.PORT;
}
var socket = io.connect(BOOKWORM_APPLICATION_HOST, {transports: ['websocket']});

pingServer = function (data) {
    // TIP: io() with no args does auto-discovery
    socket.on('connect', function () { // TIP: you can avoid listening on `connect` and listen on events directly too!
        socket.emit('ferret', 'tobi', function (data) {
            // console.log(data); // data will be 'woot'
        });
    });

};

/*
 * Jquery Loader插件 中文叫菊花插件
 * 使用例子:
 * $.loader.open(arg); 打开屏幕菊花
 * $.loader.close(arg); 关闭菊花
 * $(dom).loader(arg);  打开指定dom的菊花
 * 参数arg可以为菊花后的文字  或者 菊花配置
 */
(function ($) {
    $.loader_ext = {
        // 默认配置
        defaults: {
            autoCheck: 32, //自动检测大容器，并使用的指定size
            css: {}, //自定义样式
            size: 16,  //指定菊花大小
            bgColor: '#FFF',   //背景颜色
            bgOpacity: 0.5,    //背景透明度
            fontColor: false,  //文字颜色
            position: [0, 0, 0, 0],    //偏移设置 上左高宽
            title: '', //文字
            isOnly: true,
            imgUrl: 'images/loading[size].gif',
            onShow: function () {
            },  //打开回调
            onClose: function () {
            }  //关闭回调
        },

        template: function (tmpl, data) {
            $.each(data, function (k, v) {
                tmpl = tmpl.replace('${' + k + '}', v);
            });
            return $(tmpl);
        },

        // 初始化
        init: function (scope, options) {
            this.options = $.extend({}, this.defaults, options);
            this.scope = scope;

            if (this.scope.is(':hidden')) {
                return;
            }
            this.checkScope();
            this.check_position();
            this.check_unique();
            this.create();
            this.set_css();
            this.set_define();
            this.show();

            return this.loading;
        },

        // 容器检测
        checkScope: function () {
            if (!this.options.autoCheck) {
                return;
            }
            if (this.scope.is('body') || this.scope.is('div') || this.scope.is('form')) {
                this.options.size = this.options.autoCheck;
            }
            if (this.scope.is('input') || this.scope.is('button')) {
                this.options.title = '';
            }
        },

        // 位置容错处理
        check_position: function () {
            var pos = this.options.position;
            for (var i = 0; i < 4; i++) {
                if (pos[i] === undefined) {
                    pos[i] = 0;
                }
            }
            this.options.position = pos;
        },

        // 检测唯一性
        check_unique: function () {
            if (this.options.isOnly && this.loading !== undefined) {
                this.close();
            }
        },

        // 创建菊花
        create: function () {
            var ops = this.options;
            ops.imgUrl = ops.imgUrl.replace('[size]', ops.size + 'x' + ops.size);
            this.loading = this.template($.loader.tmpl, {
                Class: 'x' + ops.size,
                Src: ops.imgUrl,
                Title: ops.title
            }).hide();
            this.loading.appendTo($('body'));
        },

        // 设置样式
        set_css: function () {
            var scope = this.scope,
                ops = this.options,
                loading = this.loading,
                height = scope.outerHeight(),
                width = scope.outerWidth(),
                top = scope.offset().top,
                left = scope.offset().left;

            loading.css('top', top);

            if (scope.is('body')) {
                height = $(window).height();
                width = $(window).width();
                loading.css('position', 'fixed');

                this.for_ie6();
            }

            loading.css({
                'height': height + ops.position[2],
                'width': width + ops.position[3],
                'left': left,
                'border-radius': scope.css('border-radius')
            }).css(ops.css);

            var loader = loading.children();
            loader.css({
                'margin-top': (height - ops.size) / 2 + ops.position[0],
                'margin-left': (width - ops.size) / 2 + ops.position[1] - loader.find('span').outerWidth() / 2
            });
        },

        // 自定义设置
        set_define: function () {
            var ops = this.options,
                loading = this.loading;
            if (!ops.bgColor) {
                loading.css('background', 'none');
            } else {
                loading.css({
                    'background-color': ops.bgColor,
                    'opacity': ops.bgOpacity,
                    'filter': 'alpha(opacity=' + ops.bgOpacity * 100 + ')'
                });
            }

            ops.fontColor && loading.find('span').css('color', ops.fontColor);

            var self = this;
            $(window).resize(function () {
                self.loading && self.set_css();
            })
        },

        // IE6兼容
        for_ie6: function () {
            var loading = this.loading;
            if ($.browser && $.browser.msie && $.browser.version == '6.0') {
                loading.css({
                    'position': 'absolute',
                    'top': $(window).scrollTop()
                });

                $(window).scroll(function () {
                    loading.css("top", $(window).scrollTop());
                })
            }
        },

        // 显示菊花
        show: function () {
            var ops = this.options;
            this.loading.show(1, function () {
                var loader = $(this).children();
                var left = loader.css('margin-left').replace('px', '');
                loader.css('margin-left', left - loader.find('span').outerWidth() / 2);
                ops.onShow(this.loading);
            });
        },

        // 关闭菊花
        close: function (all) {
            if (all) {
                var className = $($.loader.tmpl).attr('class');
                $('.' + className).remove();
            } else {
                if (this.loading != undefined) {
                    this.loading.remove();
                    this.loading = undefined;
                }
            }
            this.options != undefined && this.options.onClose();
        }
    };

    // 简单开启关闭以及设置模板
    $.loader = {
        tmpl: '<div class="loading_wrp"><div class="loading ${Class}"><img src="${Src}" /><span>${Title}</span></div></div>',

        open: function (arg) {
            return $('body').loader(arg);
        },
        close: function (all) {
            $.loader_ext.close(all);
        }
    };

    // 指定范围显示
    $.fn.loader = function (arg) {
        if (!$(this).size()) {
            return;
        }
        if ($.type(arg) === "string") {
            arg = {
                title: arg
            }
        }
        var dom = $(this);
        if (dom.size() > 1) {
            dom = dom.parent();
        }
        return $.loader_ext.init(dom, arg);
    };

})(jQuery);
app.service('BooksService', ['$http', 'Constants', function ($http, Constants) {
    this.rentalBooks = function (options) {
        return $http.get('/bookworm/api/books/rental/all', {params: options});
    };
    this.lendBook = function (options) {
        return $http.post('/bookworm/api/books/rental/add', options, {timeout: Constants.DEFAULT_HTTP_TIMEOUT});
    };
    this.editBook = function (options) {
        return $http.post('/bookworm/api/books/rental/update', options, {timeout: Constants.DEFAULT_HTTP_TIMEOUT});
    };
    this.requestBook = function (options) {
        return $http.post('/bookworm/api/books/rental/request', options, {timeout: Constants.DEFAULT_HTTP_TIMEOUT});
    };
    this.parseGBookToBook = function (gBook) {
        var item = {};
        item.description = gBook.volumeInfo.description;
        item.bookName = gBook.volumeInfo.title;
        if (gBook.volumeInfo.authors && gBook.volumeInfo.authors.length > 0) {
            item.authorName = gBook.volumeInfo.authors;
        }
        item.thumbnailURL = gBook.volumeInfo.imageLinks ? gBook.volumeInfo.imageLinks.thumbnail : null;

        item.googleId = gBook.id;
        var indId = gBook.volumeInfo.industryIdentifiers;
        for (var indInd in indId) {
            if (indId[indInd].type === Constants.GOOGLE_BOOK_ISBN_TYPE_10) {
                item.isbn = indId[indInd].identifier;
            }
        }
        return item;
    };
}]);
app.service('ConfigService', ['$http', '$q', 'BookwormAuthProvider',
    function ($http, $q, BookwormAuthProvider) {
        var config;
        this.getConfig = function() {
            if(config) {
                var someDeferred = $q.defer();
                someDeferred.resolve({data: config});
                return someDeferred.promise;
            }
            var promise = $http.get('/bookworm/api/config');
            promise.then(function(response) {
                config = response.data;
            });
            return promise;
        };
    }]);
app.service('ForumsService', ['$http', 'Constants', 'BookwormAuthProvider', function ($http, Constants, BookwormAuthProvider) {
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
    this.getCurrentAuthorInfo = function(){
        var currentUser = BookwormAuthProvider.getUser();
        if(currentUser) {
            return {
                authorName : currentUser.authorName,
                username : currentUser.username,
                thumbnailURL : currentUser.thumbnailURL
            };
        }
        return null;
    };
}]);
app.service('GoogleAPIService', ['$http', function ($http) {
    this.getAddresses = function (options) {
        return $http.get('https://maps.googleapis.com/maps/api/geocode/json', {params: options});
    };
    this.searchBooks = function (options) {
        return $http.get('https://www.googleapis.com/books/v1/volumes', {params: options});
    };
}]);
app.service('LoaderService', ['$',
    function ($) {
        var spinnerState = {
            options : {
                autoCheck:  false,
                size:  32,
                bgColor: '#fff',   //背景颜色
                bgOpacity: 0.9,    //背景透明度
                fontColor: '#000',  //文字颜色
                title: 'Loading', //文字
                isOnly: false,
                imgUrl : './static/images/loading.gif'
            },
            active : false};
        this.activateSpinner = function(){
            changeSpinnerStatus();
        };

        this.deactivateSpinner = function() {
            changeSpinnerStatus();
        };
        function changeSpinnerStatus() {
            // console.log('changing loader status ');
            // console.log(spinnerState);
            if(spinnerState.active) {
                $.loader.close(true);
            } else {
                $.loader.open(spinnerState.options);
            }
            spinnerState.active = !spinnerState.active;
        }
    }])
    .service('$', function() {
        return $;
    });
app.service('UsersService', ['$http', '$q', '$localStorage', 'Constants', 'BookwormAuthProvider',
    function ($http, $q, $localStorage, Constants, BookwormAuthProvider) {
        this.registerUser = function (user) {
            return $http.post('/bookworm/api/users/register', user, {timeout: Constants.DEFAULT_HTTP_TIMEOUT});
        };
        this.updateProfile = function (user) {
            return $http.post('/bookworm/api/users/update', user, {timeout: Constants.DEFAULT_HTTP_TIMEOUT});
        };
        this.loginUser = function (user) {
            var promise = $http.post('/bookworm/api/users/login-auth', user, {timeout: Constants.DEFAULT_HTTP_TIMEOUT});
            promise.then(function (response) {
                BookwormAuthProvider.setUser(response.data);
            });
            return promise;
        };
        this.usernameUnique = function (user) {
            return $http.post('/bookworm/api/users/check-unique', user, {timeout: Constants.DEFAULT_HTTP_TIMEOUT});
        };
        this.logout = function (successCB) {
            BookwormAuthProvider.setUser({});
            if(successCB) {
                successCB();
            }

        };
        this.getUsers = function(options){
          return $http.get('/bookworm/api/users/all', {params : options}, {timeout: Constants.DEFAULT_HTTP_TIMEOUT});
        };
        this.postImage = function(file){
            var user = BookwormAuthProvider.getUser();

            if(user && user.username && file) {
                var username = user.username;
                var fd = new FormData();
                fd.append(Constants.PARAM_USER_NAME, username);
                fd.append(Constants.PARAM_USER_IMAGE_FILE_NAME, file);

                return $http.post('/bookworm/api/user/profile-upload', fd, {
                  transformRequest: angular.identity,
                  headers: {
                    'Content-Type': undefined
                  }
                });
            }
            return $q.reject({error : Constants.ERROR_MISSING_REQUIRED_FIELDS})

        };
        this.postFeedback = function(feedback){
            return $http.post('/bookworm/api/feedback/add', feedback, {timeout: Constants.DEFAULT_HTTP_TIMEOUT})
        };
        this.updatePassword = function(credentials){
            return $http.post('/bookworm/api/users/change-password', credentials, {timeout: Constants.DEFAULT_HTTP_TIMEOUT})
        };
        this.requestResetPassword = function(credentials){
            return $http.post('/bookworm/api/users/request-password-reset', credentials, {timeout: Constants.DEFAULT_HTTP_TIMEOUT})
        };
        this.resetPassword = function(credentials){
            return $http.post('/bookworm/api/users/reset-password', credentials, {timeout: Constants.DEFAULT_HTTP_TIMEOUT})
        };
        this.verifyAccount = function(credentials){
            return $http.post('/bookworm/api/users/verify-account', credentials, {timeout: Constants.DEFAULT_HTTP_TIMEOUT})
        };
}]);