app.controller('BorrowBooksController', ['$scope', '$http','BooksService', function($scope, $http, BooksService){
    BooksService.all().then(function(response){
        console.log(response.data);
        $scope.availableBooks = response.data; 
    });
    console.log($scope.availableBooks);
    
}])