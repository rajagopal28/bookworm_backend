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
    $scope.genres = ['Drama','Mystery'];
    $scope.search.genres = $scope.genres;
    $scope.changeSorting = function(value) {
        $scope.search.sortAscending = !value;
    };
    $scope.loadItems = function(query){
        
    };
    $scope.loadListsView = function() {  
    $scope.search.genres = [];
    for(var index in $scope.search.genres){
       var text = $scope.genres[index].text? $scope.genres[index].text : $scope.genres[index];
                $scope.search.genres.push($scope.genres[index].text);
        
    }
    
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
.controller('LendBooksController', ['$scope', '$http','BooksService','GoogleAPIService', function($scope, $http, BooksService,GoogleAPIService){
    $scope.book = {};
    $scope.status = {
        success : false,
        error : false
    };
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
               GoogleAPIService.searchBooks(options)
                   .then(function(response){
                   console.log(response);
                   if(response.data.items && response.data.items.length>0) {
                       $scope.book = BooksService.parseGBookToBook(response.data.items[0]);
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