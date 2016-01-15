app.service('BooksService', ['$http', function ($http) {
    var defaultThumbnail = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9InllcyI/PjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB3aWR0aD0iMTcxIiBoZWlnaHQ9IjE4MCIgdmlld0JveD0iMCAwIDE3MSAxODAiIHByZXNlcnZlQXNwZWN0UmF0aW89Im5vbmUiPjwhLS0KU291cmNlIFVSTDogaG9sZGVyLmpzLzEwMCV4MTgwCkNyZWF0ZWQgd2l0aCBIb2xkZXIuanMgMi42LjAuCkxlYXJuIG1vcmUgYXQgaHR0cDovL2hvbGRlcmpzLmNvbQooYykgMjAxMi0yMDE1IEl2YW4gTWFsb3BpbnNreSAtIGh0dHA6Ly9pbXNreS5jbwotLT48ZGVmcz48c3R5bGUgdHlwZT0idGV4dC9jc3MiPjwhW0NEQVRBWyNob2xkZXJfMTUxNGU1MzczMDAgdGV4dCB7IGZpbGw6I0FBQUFBQTtmb250LXdlaWdodDpib2xkO2ZvbnQtZmFtaWx5OkFyaWFsLCBIZWx2ZXRpY2EsIE9wZW4gU2Fucywgc2Fucy1zZXJpZiwgbW9ub3NwYWNlO2ZvbnQtc2l6ZToxMHB0IH0gXV0+PC9zdHlsZT48L2RlZnM+PGcgaWQ9ImhvbGRlcl8xNTE0ZTUzNzMwMCI+PHJlY3Qgd2lkdGg9IjE3MSIgaGVpZ2h0PSIxODAiIGZpbGw9IiNFRUVFRUUiLz48Zz48dGV4dCB4PSI1OS41NTQ2ODc1IiB5PSI5NC41Ij4xNzF4MTgwPC90ZXh0PjwvZz48L2c+PC9zdmc+';
    this.rentalBooks = function (options) {
        return $http.get('/bookworm/api/books/rental/all', {params: options});
    };
    this.lendBook = function (options) {
        return $http.post('/bookworm/api/books/rental/add', options, {timeout: 1000});
    };
    this.parseGBookToBook = function (gBook) {
        var item = {};
        item.description = gBook.volumeInfo.description;
        item.bookName = gBook.volumeInfo.title;
        if (gBook.volumeInfo.authors && gBook.volumeInfo.authors.length > 0) {
            item.authorName = gBook.volumeInfo.authors;
        }
        item.thumbnailURL = gBook.volumeInfo.imageLinks ? gBook.volumeInfo.imageLinks.thumbnail : defaultThumbnail;

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