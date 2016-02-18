var app = angular.module('bookworm-ui', ['ngRoute', 'ngStorage', 'ui.bootstrap', 'ngTagsInput']);
app.config(['$routeProvider', '$httpProvider',
        function ($routeProvider, $httpProvider) {
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
                .when('/bookworm/auth/users', {
                    templateUrl: 'templates/users.html',
                    controller: 'UsersController'
                })
                .when('/bookworm/auth/users/:username', {
                    templateUrl: 'templates/view-user.html',
                    controller: 'UserDetailsController'
                })
                .when('/bookworm/auth/update-profile/:userId', {
                    templateUrl: 'templates/update-profile.html',
                    controller: 'UserRegistrationController'
                })
                .when('/bookworm/auth/borrow', {
                    templateUrl: 'templates/borrow.html',
                    controller: 'BorrowBooksController'
                })
                .when('/bookworm/auth/borrow/:bookId', {
                    templateUrl: 'templates/view-lent.html',
                    controller: 'ViewBookController'
                })
                .when('/bookworm/auth/lend', {
                    templateUrl: 'templates/lend.html',
                    controller: 'LendBookController'
                })
                .when('/bookworm/auth/edit-book/:bookId', {
                    templateUrl: 'templates/lend.html',
                    controller: 'LendBookController'
                })
                .when('/bookworm/forums', {
                    templateUrl: 'templates/forums.html',
                    controller: 'ForumController'
                })
                .when('/bookworm/forums/:forumId', {
                    templateUrl: 'templates/forum-chats.html',
                    controller: 'ForumChatController'
                })
                .when('/bookworm/auth/new-forum', {
                    templateUrl: 'templates/new-forum.html',
                    controller: 'NewForumController'
                })
                .when('/bookworm/auth/edit-forum/:forumId', {
                    templateUrl: 'templates/new-forum.html',
                    controller: 'NewForumController'
                })
                .when('/bookworm/contact', {
                    templateUrl: 'templates/contact.html',
                    controller: 'HomeController'
                })
                .when('/bookworm/about', {
                    templateUrl: 'templates/about.html',
                    controller: 'HomeController'
                })
                .when('/bookworm/feedback', {
                    templateUrl: 'templates/feedback.html',
                    controller: 'FeedbackController'
                })
                .otherwise({
                    redirectTo: '/bookworm/home'
                });

            $httpProvider.interceptors.push('BookWormHTTPInterceptor');
        }])
    .run(['$rootScope', '$location', 'BookwormAuthProvider', function ($rootScope, $location, BookwormAuthProvider) {
        $rootScope.$on('$locationChangeStart', function (event, next, current) {
            // check only for authenticated pages
            if (next && next.indexOf('/bookworm/auth') !== -1) {
                if (!BookwormAuthProvider.isLoggedIn()) {
                    // console.log('DENY : Redirecting to Login');
                    event.preventDefault();
                    $location.path('/bookworm/login');
                }
                else {
                    // console.log('ALLOW');
                }
            }
        });
    }]);