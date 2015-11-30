app.controller('BorrowBooksController', ['$scope', '$http','BooksService','GoogleAPIService', function($scope, $http, BooksService, GoogleAPIService){
    $scope.search = {};
    
   $scope.getLocations = function(queryText) {
       console.log(queryText);
     return GoogleAPIService.getAddresses({'address': queryText})
            .then(function(response){
            console.log(response);
              return response.data.results.map(function(item){
                return item.formatted_address;
              });
            });
   };
    $scope.genres = ['History','Romance','Drama','Mystery', 'Science', 'Fiction'];
    $scope.search.sortAscending = true;
    $scope.search.availableOnly = true;
    $scope.search.genres = ['Drama','Mystery'];
    $scope.changeSorting = function(value) {
        $scope.search.sortAscending = !value;
    };
    $scope.loadItems = function(query){
        
    };
    $scope.loadListsView = function() {   
    console.log($scope.search);    BooksService.rentalBooks($scope.search).then(function(response){
            console.log(response.data);
            $scope.availableBooks = response.data; 
        });
    };
    console.log($scope.availableBooks);
    $scope.searchBooks = function() {
        $scope.loadListsView();
    };
    $scope.loadListsView();
}])
.controller('LendBooksController', ['$scope', '$http','BooksService', function($scope, $http, BooksService){
    $scope.book = {};
    $scope.status = {
        success : false,
        error : false
    };
    var defaultThumbnail = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9InllcyI/PjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB3aWR0aD0iMTcxIiBoZWlnaHQ9IjE4MCIgdmlld0JveD0iMCAwIDE3MSAxODAiIHByZXNlcnZlQXNwZWN0UmF0aW89Im5vbmUiPjwhLS0KU291cmNlIFVSTDogaG9sZGVyLmpzLzEwMCV4MTgwCkNyZWF0ZWQgd2l0aCBIb2xkZXIuanMgMi42LjAuCkxlYXJuIG1vcmUgYXQgaHR0cDovL2hvbGRlcmpzLmNvbQooYykgMjAxMi0yMDE1IEl2YW4gTWFsb3BpbnNreSAtIGh0dHA6Ly9pbXNreS5jbwotLT48ZGVmcz48c3R5bGUgdHlwZT0idGV4dC9jc3MiPjwhW0NEQVRBWyNob2xkZXJfMTUxNGU1MzczMDAgdGV4dCB7IGZpbGw6I0FBQUFBQTtmb250LXdlaWdodDpib2xkO2ZvbnQtZmFtaWx5OkFyaWFsLCBIZWx2ZXRpY2EsIE9wZW4gU2Fucywgc2Fucy1zZXJpZiwgbW9ub3NwYWNlO2ZvbnQtc2l6ZToxMHB0IH0gXV0+PC9zdHlsZT48L2RlZnM+PGcgaWQ9ImhvbGRlcl8xNTE0ZTUzNzMwMCI+PHJlY3Qgd2lkdGg9IjE3MSIgaGVpZ2h0PSIxODAiIGZpbGw9IiNFRUVFRUUiLz48Zz48dGV4dCB4PSI1OS41NTQ2ODc1IiB5PSI5NC41Ij4xNzF4MTgwPC90ZXh0PjwvZz48L2c+PC9zdmc+';
    $scope.book.thumbnail = defaultThumbnail;
    $scope.loadBookDetails = function(searchText) {
        var isbn = $scope.book.isbn; 
        console.log("isbn="+isbn);
        console.log("searchText="+searchText);
        if(!isNaN(isbn)) {
            if(isbn.length == 10 || isbn.length == 10) {
                var options = {
                    q: 'isbn:'+isbn,
                    maxResults: 10
                };
               BooksService.searchBooks(options)
                   .then(function(response){
                   console.log(response);
                   if(response.data.items && response.data.items.length>0) {
                       $scope.book = $scope.parseGBookToBook(response.data.items[0]);
                   }                   
               });
            }
        }
        if(searchText && searchText.length > 4) {
            var newSearch = searchText.split(" ").join("+");
            //console.log('In else block');
            //console.log(newSearch);
           var options = {
                    q: 'intitle:'+newSearch,
                    maxResults: 10
                }; 
            return BooksService.searchBooks(options)
                   .then(function(response){
                // console.log(response);
                   if(response.data.items && response.data.items.length>0) {
                      return response.data.items.map(function(item){
        console.log(item);
        return $scope.parseGBookToBook(item);
      });
                   }                   
               });
        }
    };
    $scope.onBookSelect = function($item, $model, $label) {
        $scope.book = $item;
        console.log($item);
        console.log($model);
        console.log($label);
    };
    $scope.genres = ['History','Romance','Drama','Mystery', 'Science', 'Fiction'];
    $scope.book.genres = ['Drama','Mystery'];
    $scope.changeSorting = function(value) {
        $scope.search.sortAscending = !value;
    };
    $scope.parseGBookToBook = function(gBook) {
        var item = {};
        item.description = gBook.volumeInfo.description;
        item.bookName = gBook.volumeInfo.title;
        if(gBook.volumeInfo.authors && gBook.volumeInfo.authors.length > 0){
            item.author = gBook.volumeInfo.authors.join(",");
        }
        item.thumbnail = gBook.volumeInfo.imageLinks.thumbnail;
        if(!item.thumbnail) {
            item.thumbnail = defaultThumbnail;
        }
        item.googleId = gBook.id;
        var indId = gBook.volumeInfo.industryIdentifiers;
        for(var indInd in indId) {
            if(indId[indInd].type === 'ISBN_10') {
                item.isbn = indId[indInd].identifier;
            }
        }
        return item;
    };
    $scope.lendBook = function(){
        console.log($scope.book);
        BooksService.lendBook($scope.book)
            .then(function(response){
            console.log(response);
            if(response.status === 200){
                $scope.status.success = true;
                $scope.status.error = false;
            } else {
                $scope.status.error = true;
                $scope.status.success = false;
            }
        });
    };
}])