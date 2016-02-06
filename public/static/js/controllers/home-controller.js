// HomeController
app.controller('HomeController', ['$scope', 'UsersService', 'ConfigService', 'BookwormAuthProvider',
    function ($scope, UsersService, ConfigService, BookwormAuthProvider) {
        $scope.loginPopup = function () {
            console.log('Login');
        };
        $scope.isLoggedIn = function () {
            return BookwormAuthProvider.isLoggedIn();
        };
        $scope.getDisplayName = function() {
          var user = BookwormAuthProvider.getUser();
            if (user && user.authorName) {
                return user.authorName;
            }
        };
         $scope.getUserName = function() {
          var user = BookwormAuthProvider.getUser();
            if (user && user.username) {
                return user.username;
            }
        };
        $scope.getThumbnail = function() {
          var user = BookwormAuthProvider.getUser();
            if (user && user.thumbnailURL) {
                return user.thumbnailURL;
            }
        };
        $scope.logout = function () {
            UsersService.logout();
        };
}]);