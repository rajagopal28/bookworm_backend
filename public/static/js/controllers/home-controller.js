// HomeController
app.controller('HomeController', ['$scope', '$location', 'UsersService', 'BookwormAuthProvider', 'formatUserNameFilter',
    function ($scope, $location, UsersService, BookwormAuthProvider, formatUserName)  {
        $scope.tabs = [{
            title : 'BookWorm',
            template :'./templates/about-site.html',
            active : true},
            {
            title : 'Author',
            template :'./templates/about-author.html',
            active : false}];
        $scope.loginPopup = function () {
            // console.log('Login');
        };
        $scope.isLoggedIn = function () {
            return BookwormAuthProvider.isLoggedIn();
        };
        $scope.getDisplayName = function() {
          var user = BookwormAuthProvider.getUser();
            if (user) {
                return formatUserName(user);
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
            $location.path('/bookworm/home');
        };
}]);