// HomeController
app.controller('HomeController', ['$scope', 'UsersService', 'BookwormAuthProvider', function ($scope, UsersService, BookwormAuthProvider) {
    $scope.loginPopup = function () {
        console.log('Login');
    };
    $scope.userName = '';
    $scope.isLoggedIn = function () {
        return BookwormAuthProvider.isLoggedIn();
    };
    var user = BookwormAuthProvider.getUser();
    if (user && user.authorName) {
        $scope.userName = user.authorName;
    }
    $scope.logout = function () {
        UsersService.logout();
        $scope.userName = '';
    };
}]);