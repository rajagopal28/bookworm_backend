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