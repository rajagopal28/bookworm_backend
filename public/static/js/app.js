var app = angular.module('bookworm-ui', ['ngRoute','ngStorage','ui.bootstrap','ngTagsInput']);
app.config(['$routeProvider', '$httpProvider',
  function($routeProvider, $httpProvider) {
    $routeProvider
    .when('/bookworm/home', {
        templateUrl: 'templates/welcome.html',
        controller: 'HomeController'
    })
    .when('/bookworm/login', {
        templateUrl: 'templates/login.html',
        controller: 'UserLoginController'
    })
    .when('/bookworm/register', {
        templateUrl: 'templates/register.html',
        controller: 'UserRegistrationController'
    })
    .when('/bookworm/borrow', {
        templateUrl: 'templates/borrow.html',
        controller: 'BorrowBooksController'
    })
    .when('/bookworm/lend', {
        templateUrl: 'templates/lend.html',
        controller: 'LendBooksController'
    })
    .when('/bookworm/forums', {
        templateUrl: 'templates/forums.html',
        controller: 'ForumController'
    })
    .when('/bookworm/forums/:forumId', {
        templateUrl: 'templates/forum-chats.html',
        controller: 'ForumChatController'
    })
    .when('/bookworm/new-forum', {
        templateUrl: 'templates/new-forum.html',
        controller: 'NewForumController'
    })
    .when('/bookworm/contact', {
        templateUrl: 'templates/contact.html',
        controller: 'MainController'
    })
    .otherwise({
        redirectTo: '/bookworm/home'
    });

    $httpProvider.interceptors.push(['$q', '$location', '$localStorage', function($q, $location, $localStorage) {
        return {
            'request': function (config) {
                if(config && config.url && config.url.indexOf('/bookworm') !== -1) {
                    config.headers = config.headers || {};
                    if ($localStorage.token) {
                        config.headers.Authorization = 'Bearer ' + $localStorage.token;
                    }
                }
                return config;
            },
            'responseError': function(response) {
                if(response.status === 401 || response.status === 403) {
                    $location.path('/bookworm/login');
                }
                return $q.reject(response);
            }
        };
    }]);
}])
.run(['$rootScope', '$location', 'BookwormAuthProvider', function ($rootScope, $location, BookwormAuthProvider) {
        $rootScope.$on('$locationChangeStart', function (event, next, current) {
        // check only for authenticated pages
        if(next && next.indexOf('/bookworm/auth') !== -1) {
            if (!BookwormAuthProvider.isLoggedIn()) {
                  console.log('DENY : Redirecting to Login');
                  event.preventDefault();
                  $location.path('/bookworm/login');
                }
                else {
                  console.log('ALLOW');
                }
        }
  });
}])