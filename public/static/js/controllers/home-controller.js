// HomeController
app.controller('HomeController', ['$scope', 'UsersService', 'ConfigService', 'BookwormAuthProvider',
    function ($scope, UsersService, ConfigService, BookwormAuthProvider) {
        $scope.loginPopup = function () {
            console.log('Login');
        };
        $scope.userName = '';
        $scope.isLoggedIn = function () {
            return BookwormAuthProvider.isLoggedIn();
        };
        $scope.getUserName = function() {
          var user = BookwormAuthProvider.getUser();
            if (user && user.authorName) {
                return user.authorName;
            }
        };
        $scope.logout = function () {
            UsersService.logout();
        };
        ConfigService
        .getConfig()
        .then(function(response) {
            console.log(response);
        });
}]);