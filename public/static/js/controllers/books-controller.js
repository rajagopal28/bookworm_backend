app.controller('BorrowBooksController', ['$scope', '$http','BooksService', function($scope, $http, BooksService){
    $scope.search = {};
    $scope.search.sortAscending = true;
    $scope.changeSorting = function(value) {
        $scope.search.sortAscending = !value;
    };
    $scope.loadListsView = function() {        BooksService.all($scope.search).then(function(response){
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