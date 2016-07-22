// HomeController
app.controller('HomeController', ['$scope', '$routeParams', '$location', 'Constants', 'UsersService', 'BookwormAuthProvider', 'formatUserNameFilter','formatUserNameFilter',
    function ($scope, $routeParams, $location, Constants, UsersService, BookwormAuthProvider, formatUserName)  {
        $scope.messages = [];
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
                    if(response.data.success) {
                        $scope.messages.push(Constants.getPostSuccessMessage(Constants.SUCCESS_MESSAGE_FRIEND_ADDED));
                    }
                    $scope.user = {};
                }, function (error) {
                    $scope.messages.push(Constants.getGetErrorMessage(error));
                });
        }

        $scope.dismissAlert = function (index) {
            $scope.messages.splice(index, 1);
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
}])
.controller('ConfirmationModalCtrl', ['$scope','$uibModalInstance', 'Constants', 'message',
    function ($scope, $uibModalInstance, Constants, message) {
        $scope.message = (message && message.message) ? message.message : Constants.DEFAULT_CONFIRMATION_MESSAGE;
        $scope.ok = function() {
            $uibModalInstance.close();
        };
        $scope.cancel = function() {
            $uibModalInstance.dismiss(Constants.MODAL_DISMISS_RESPONSE);
        };
}]);
