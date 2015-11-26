var app = angular.module('bookworm-ui', ['ngRoute','ui.bootstrap', 'toggle-switch']);
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
        .when('/bookworm/forum', {
            templateUrl: 'templates/contact.html',
            controller: 'userCtrl'
        })
        .when('/bookworm/contact', {
            templateUrl: 'templates/contact.html',
            controller: 'userCtrl'
        })
        .otherwise({
            redirectTo: '/bookworm/home'
        });
    }]);