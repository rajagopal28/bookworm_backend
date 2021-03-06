app.controller('BorrowBooksController', ['$scope', '$http', 'Constants', 'BooksService', 'GoogleAPIService',
        function ($scope, $http, Constants, BooksService, GoogleAPIService) {
            $scope.search = {};
            $scope.pageSort = Constants.getDefaultPagingSortingData();
            // TODO query locations not used
            $scope.getLocations = function (queryText) {
                // console.log(queryText);
                return GoogleAPIService.getAddresses({'address': queryText})
                    .then(function (response) {
                        if (response.data) {
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

            $scope.pageChanged = function () {
                var options = $.extend({}, $scope.pageSort);
                $scope.search.genres = [];
                for (var index in $scope.genres) {
                    var text = $scope.genres[index].text ? $scope.genres[index].text : $scope.genres[index];
                    $scope.search.genres.push(text);
                }
                var sortOrder = $scope.search.sortAscending
                    ? Constants.SORT_ORDER_ASC
                    : Constants.SORT_ORDER_DESC;
                $scope.pageSort.primarySort = {'lendDate': sortOrder};
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
    .controller('ViewBookController', ['$scope', '$http', '$routeParams', '$uibModal', 'Constants', 'BooksService', 'BookwormAuthProvider',
        function ($scope, $http, $routeParams, $uibModal, Constants, BooksService, BookwormAuthProvider) {
            $scope.book = {};
            $scope.messages = [];
            var bookId = $routeParams.bookId;
            BooksService.rentalBooks({id: bookId})
                .then(function (response) {
                    if (response.data && response.data.items) {
                        $scope.bookDataAvailable = response.data.items.length > 0;
                        $scope.book = response.data.items[0];
                        $scope.book.authorName = $scope.book.authorName.join(', ');
                    }
                });
            $scope.isUserContributor = function () {
                return $scope.book
                    && BookwormAuthProvider.isCurrentUser($scope.book.contributor);
            };
            $scope.borrowBook = function () {
                showConfirmationModal($uibModal, Constants.CONFIRM_BORROW_BOOK, function() {
                    var options = $scope.book;
                    // console.log('Requesting to borrow book');
                    var currentUser = BookwormAuthProvider.getUser();
                    if (options && currentUser && currentUser.username) {
                        options.borrowerName = currentUser.username;
                        // console.log(options);
                        BooksService
                            .requestBook(options)
                            .then(function (response) {
                                // console.log(response);
                                if (response.data.success) {
                                    $scope.messages.push(Constants.getPostSuccessMessage(Constants.SUCCESS_MESSAGE_BORROW_REQUEST_SENT));
                                } else {
                                    $scope.messages.push(Constants.getPostErrorMessage());
                                }
                            });
                    }
                });
            };
            $scope.dismissAlert = function (index) {
                $scope.messages.splice(index, 1);
            };
            $scope.isLoggedIn = function () {
                return BookwormAuthProvider.isLoggedIn();
            };
        }])
    .controller('LendBookController', ['$scope', '$routeParams', '$http', '$uibModal', 'Constants', 'ConfigService', 'BooksService', 'BookwormAuthProvider', 'GoogleAPIService',
        function ($scope, $routeParams, $http, $uibModal, Constants, ConfigService, BooksService, BookwormAuthProvider, GoogleAPIService) {
            $scope.book = {};
            $scope.messages = [];
            $scope.messages.push(Constants.getMessage(Constants.INFO_MESSAGE_AUTO_COMPLETE_FORM_BOOK, Constants.MSG_TYPE.INFO));
            var noImageURL;
            ConfigService.getConfig()
                .then(function (response) {
                    if (response.data && response.data) {
                        noImageURL = response.data.noImageURL;
                        $scope.book.thumbnailURL = noImageURL;
                    }
                });

            var currentUser = BookwormAuthProvider.getUser();
            var contributor;
            if (currentUser) {
                contributor = currentUser.id;
            }
            var bookId = $routeParams.bookId;
            if (bookId) {
                BooksService.rentalBooks({id: bookId})
                    .then(function (response) {
                        if (response.data && response.data.items) {
                            $scope.book = response.data.items[0];
                            $scope.book.genresList = $scope.book.genres;
                            $scope.book.authorName = $scope.book.authorName.join(', ');
                            $scope.book.contributor = contributor;
                            // console.log($scope.book);
                        }
                    });
            }
            $scope.isEditMode = function () {
                return bookId && bookId.trim() !== '';
            };
            $scope.editBook = function () {
                showConfirmationModal($uibModal, Constants.CONFIRM_EDIT_BOOK, function() {
                    BooksService.editBook($scope.book)
                        .then(function (response) {
                            // console.log(response);
                            if (response.data.success) {
                                $scope.messages.push(Constants.getPostSuccessMessage());
                            } else {
                                $scope.messages.push(Constants.getPostErrorMessage());
                            }
                        });
                });
            };
            $scope.loadBookDetails = function (searchText) {
                var isbn = $scope.book.isbn;
                // console.log("isbn=" + isbn);
                // console.log("searchText=" + searchText);
                var options = {};
                if (!isNaN(isbn) && !(searchText && searchText.length)) {
                    if (Constants.GOOGLE_BOOK_VALID_ISBN_LENGTHS.indexOf(isbn.length) != -1) {
                        options = {
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
                    options = {
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
                if (!$scope.book.thumbnailURL) {
                    $scope.book.thumbnailURL = noImageURL;
                }
                $scope.book.genres = [];
                for (var index = 0; index < $scope.book.genresList.length; index++) {
                    var item = $scope.book.genresList[index];
                    $scope.book.genres.push(item.text);
                }
                $scope.book.contributor = contributor;
                showConfirmationModal($uibModal, Constants.CONFIRM_ADD_BOOK, function() {
                    BooksService.lendBook($scope.book)
                        .then(function (response) {
                            // console.log(response);
                            if (response.data.success) {
                                $scope.messages.push(Constants.getPostSuccessMessage());
                                $scope.book = {};
                            } else {
                                $scope.messages.push(Constants.getPostErrorMessage());
                            }
                        });
                });
            };
            $scope.dismissAlert = function (index) {
                $scope.messages.splice(index, 1);
            };
        }]);