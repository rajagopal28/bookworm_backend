app.controller('BorrowBooksController', ['$scope', '$http', 'Constants', 'BooksService', 'GoogleAPIService',
    function ($scope, $http, Constants, BooksService, GoogleAPIService) {
        $scope.search = {};
        $scope.pageSort = Constants.getDefaultPagingSortingData();
        $scope.getLocations = function (queryText) {
            console.log(queryText);
            return GoogleAPIService.getAddresses({'address': queryText})
                .then(function (response) {
                    console.log(response);
                    return response.data.results.map(function (item) {
                        return item.formatted_address;
                    });
                });
        };
        $scope.genres = BooksService.availableGenres();
        $scope.search.sortAscending = true;
        $scope.search.isAvailable = true;
        $scope.genres = ['Drama', 'Mystery'];
        $scope.search.genres = $scope.genres;

       $scope.pageChanged = function() {
        var options = $scope.pageSort;
        $scope.search.genres = [];
        for (var index in $scope.genres) {
            var text = $scope.genres[index].text ? $scope.genres[index].text : $scope.genres[index];
            $scope.search.genres.push(text);
        }
        var sortOrder = $scope.search.sortAscending ? Constants.SORT_ORDER_ASC : Constants.SORT_ORDER_DESC;
        $scope.pageSort.primarySort = {'lendDate' : sortOrder};
        $scope.search = $.extend($scope.search, $scope.pageSort);
        console.log($scope.search);
        BooksService.rentalBooks($scope.search)
           .then(function (response) {
              console.log(response.data);
               $scope.availableBooks = response.data.items;
               $scope.pageSort.totalItems = response.data.totalItems;
           });
        };
        console.log($scope.availableBooks);
        $scope.searchBooks = function () {
            $scope.pageChanged();
        };
        $scope.pageChanged();
    }])
    .controller('ViewBookController', ['$scope', '$http','$routeParams', 'Constants', 'BooksService','BookwormAuthProvider',
    function ($scope, $http, $routeParams, Constants, BooksService, BookwormAuthProvider) {
        $scope.book = {};
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
        $scope.isLoggedIn = function() {
          return BookwormAuthProvider.isLoggedIn();
        };
    }])
    .controller('LendBookController', ['$scope', '$routeParams', '$http', 'ConfigService', 'BooksService', 'BookwormAuthProvider', 'GoogleAPIService',
        function ($scope, $routeParams, $http, ConfigService, BooksService, BookwormAuthProvider, GoogleAPIService) {
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
                            console.log($scope.book);
                        }
                    });
            }
            $scope.isEditMode = function() {
              return bookId && bookId.trim() !== '';
            };
            $scope.editBook = function() {
              BooksService.editBook($scope.book)
                    .then(function (response) {
                        console.log(response);
                        if (response.status === 200) {
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
                console.log("isbn=" + isbn);
                console.log("searchText=" + searchText);
                if (!isNaN(isbn)) {
                    if (isbn.length == 10 || isbn.length == 10) {
                        var options = {
                            q: 'isbn:' + isbn,
                            maxResults: 10
                        };
                        GoogleAPIService.searchBooks(options)
                            .then(function (response) {
                                console.log(response);
                                if (response.data.items && response.data.items.length > 0) {
                                    $scope.book = BooksService.parseGBookToBook(response.data.items[0]);
                                }
                            });
                    }
                }
                if (searchText && searchText.length > 4) {
                    var newSearch = searchText.split(" ").join("+");
                    //console.log('In else block');
                    //console.log(newSearch);
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
            $scope.genres = BooksService.availableGenres();
            $scope.book.genresList = [{text: 'Drama'}, {text: 'Mystery'}];
            $scope.changeSorting = function (value) {
                $scope.search.sortAscending = !value;
            };
            $scope.lendBook = function () {
                console.log($scope.book);
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
                        console.log(response);
                        if (response.status === 200) {
                            $scope.status.success = true;
                            $scope.status.error = false;
                        } else {
                            $scope.status.error = true;
                            $scope.status.success = false;
                        }
                    });
            };
        }]);