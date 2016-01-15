app.service('GoogleAPIService', ['$http', function ($http) {
    this.getAddresses = function (options) {
        return $http.get('https://maps.googleapis.com/maps/api/geocode/json', {params: options});
    };
    this.searchBooks = function (options) {
        return $http.get('https://www.googleapis.com/books/v1/volumes', {params: options});
    };
}]);