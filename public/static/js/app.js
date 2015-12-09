var app = angular.module('bookworm-ui', ['ngRoute','ui.bootstrap','ngTagsInput']);
   app.config(['$routeProvider',
      function($routeProvider) {
        $routeProvider
        .when('/bookworm/home', {
            templateUrl: 'templates/welcome.html',
            controller: 'HomeController'
        })
        .when('/bookworm/login', {
            templateUrl: 'templates/login.html',
            controller: 'HomeController'
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
            controller: 'DiscussionController'
        })
        .when('/bookworm/forums/:forumId', {
            templateUrl: 'templates/forums.html',
            controller: 'DiscussionController'
        })
        .when('/bookworm/contact', {
            templateUrl: 'templates/contact.html',
            controller: 'MainController'
        })
        .otherwise({
            redirectTo: '/bookworm/home'
        });
    }]);