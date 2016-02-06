app.service('BooksService', ['$http', function ($http) {
    this.rentalBooks = function (options) {
        return $http.get('/bookworm/api/books/rental/all', {params: options});
    };
    this.lendBook = function (options) {
        return $http.post('/bookworm/api/books/rental/add', options, {timeout: 1000});
    };
    this.editBook = function (options) {
        return $http.post('/bookworm/api/books/rental/update', options, {timeout: 1000});
    };
    this.requestBook = function (options) {
        return $http.post('/bookworm/api/books/rental/request', options, {timeout: 1000});
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
            if (indId[indInd].type === 'ISBN_10') {
                item.isbn = indId[indInd].identifier;
            }
        }
        return item;
    };
    var allGenres = ['History', 'Romance', 'Drama', 'Mystery', 'Science', 'Fiction', 'Thriller', 'Comedy'];
    this.availableGenres = function () {
        return allGenres;
    };
}]);