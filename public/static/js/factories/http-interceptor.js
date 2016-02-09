app.factory('BookWormHTTPInterceptor', ['$q', '$location', '$localStorage', 'Constants', 'LoaderService',
    function ($q, $location, $localStorage, Constants, LoaderService) {
            return {
                'request': function (config) {
                    if (config && config.url
                        && config.url.indexOf('/bookworm') !== -1) {
                        config.headers = config.headers || {};
                        if ($localStorage.token) {
                            config.headers.Authorization = Constants.BOOKWORM_HTTP_AUTH_TOKEN_BEARER + $localStorage.token;
                        }
                    }
                    LoaderService.activateSpinner();
                    return config;
                },
                'responseError': function (response) {
                    if (response.status === 401 || response.status === 403) {
                        $location.path('/bookworm/login');
                    }
                    LoaderService.deactivateSpinner();
                    return $q.reject(response);
                },
                'response': function (response) {
                    LoaderService.deactivateSpinner();
                    return response;
                }
            };
        }]);