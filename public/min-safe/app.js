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
                .when('/bookworm/auth/users/:identifier', {
                    templateUrl: 'templates/view-user.html',
                    controller: 'UserDetailsController'
                })
                .when('/bookworm/auth/update-profile/:userId', {
                    templateUrl: 'templates/update-profile.html',
                    controller: 'UserRegistrationController'
                })
                .when('/bookworm/auth/change-password', {
                    templateUrl: 'templates/change-password.html',
                    controller: 'UserPasswordController'
                })
                .when('/bookworm/reset-password-link/:requestToken', {
                    templateUrl: 'templates/reset-password.html',
                    controller: 'UserPasswordController'
                })
                .when('/bookworm/verify-account-link/:requestToken', {
                    templateUrl: 'templates/login.html',
                    controller: 'UserLoginController'
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
                .when('/bookworm/auth/accept-friend-link/:friendId', {
                    templateUrl: 'templates/welcome.html',
                    controller: 'HomeController'
                })
                .when('/bookworm/auth/my-network', {
                    templateUrl: 'templates/users.html',
                    controller: 'NetworkController'
                })
                .when('/bookworm/auth/forums', {
                    templateUrl: 'templates/forums.html',
                    controller: 'PrivateForumController'
                })
                .when('/bookworm/auth/forums/:forumId', {
                    templateUrl: 'templates/forum-chats.html',
                    controller: 'PrivateForumChatController'
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
    .run(['$rootScope', '$location', '$localStorage', 'BookwormAuthProvider',
        function ($rootScope, $location,$localStorage, BookwormAuthProvider) {
        $rootScope.$on('$locationChangeStart', function (event, next, current) {
            // check only for authenticated pages
            if (next && next.indexOf('/bookworm/auth') !== -1) {
                if (!BookwormAuthProvider.isLoggedIn()) {
                    // console.log('DENY : Redirecting to Login');
                    event.preventDefault();
                    $localStorage.redirectURL = next.substring(next.indexOf('/bookworm'));
                    $location.path('/bookworm/login');
                }
            }
        });
    }]);