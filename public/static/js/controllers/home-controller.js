// HomeController
app.controller('HomeController', ['$scope', '$routeParams', '$location', 'UsersService', 'BookwormAuthProvider', 'formatUserNameFilter','formatUserNameFilter',
    function ($scope, $routeParams, $location, UsersService, BookwormAuthProvider, formatUserName)  {
        $scope.status = {success : false, error : false};
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

        var friendId = $routeParams.friendId;
        if(friendId
            && friendId.trim() !== ''
            && BookwormAuthProvider.isLoggedIn()) {
            var currentUser = BookwormAuthProvider.getUser();
            currentUser.friendId = friendId;
            UsersService.acceptFriendRequest(currentUser)
                .then(function (response) {
                    $scope.status.success = response.data
                        && response.data.success;
                    $scope.status.error = false;
                    $scope.user = {};
                }, function (error) {
                    $scope.status.error = true;
                    $scope.status.success = false;
                });
        }

        $scope.dismissAlert = function () {
            $scope.status.success = false;
            $scope.status.error = false;
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