app.controller('UserRegistrationController', ['$scope', '$routeParams', '$uibModal', 'Constants', 'UsersService', 'BookwormAuthProvider',
    function ($scope, $routeParams, $uibModal, Constants, UsersService, BookwormAuthProvider) {
        $scope.user = {};
        var userId = $routeParams.userId;
        $scope.user.gender = "male";
        $scope.$on('date-set', function (event, args) {
            console.log(args);
            console.log('recieving date-set');
            $scope.user.dob = args.selectedDate;
        });
        $scope.status = {
            success: false,
            warn: false,
            error: false
        };
        $scope.open = function () {
            var options = {
                animation: $scope.animationsEnabled,
                templateUrl: '../../../templates/login-modal.html',
                controller: 'ModalInstanceCtrl',
                size: 'l',
                resolve: {
                    options: function () {
                        return {
                            contentTemplate: '../../../templates/login.html',
                            title: 'BookWorm',
                            showControls: false
                        };
                    }
                }
            };
            console.log(options);
            var modalInstance = $uibModal.open(options);
        };
        $scope.isEditMode = function() {
            return userId && userId.trim() !== '';
        };
        if($scope.isEditMode()){
            var options = Constants.getDefaultPagingSortingData();
            options.id = userId;
            UsersService.getUsers(options)
                .then(function(response){
                    if(response.data && response.data.items) {
                        $scope.user = response.data.items[0];
                    }
                });
        }
        $scope.isUserContributor = function() {
          return BookwormAuthProvider.isCurrentUser($scope.user);
        };
        $scope.update = function () {
            console.log($scope.user);
            UsersService.updateProfile($scope.user)
                .then(function (response) {
                    $scope.status.success = true;
                    $scope.status.error = false;
                }, function (error) {
                    $scope.status.error = true;
                    $scope.status.success = false;
                });

        };
        $scope.signup = function () {
            console.log($scope.user);
            UsersService.registerUser($scope.user)
                .then(function (response) {
                    $scope.status.success = true;
                    $scope.status.error = false;
                }, function (error) {
                    $scope.status.error = true;
                    $scope.status.success = false;
                });

        };

        $scope.checkUsername = function () {
            UsersService.usernameUnique($scope.user)
                .then(function (response) {
                    console.log(response);
                    if (response.data) {
                        $scope.user.isUsernameAvailable = response.data.isUsernameAvailable;
                        if (response.data.isUsernameAvailable) {
                            $scope.user.customMessage = 'User name available';
                        } else {
                            $scope.user.customMessage = 'User name is not available';
                        }
                    }
                });
        };
        $scope.pingServer = function () {
            // TIP: io() with no args does auto-discovery
            socket.emit('ferret', {cricket: 'tobi', alt: 'Jiminy', context: 'Bazinga'}, function (data) {
                console.log(data); // data will be 'woot'
            });

        };
        $scope.dismissAlert = function () {
            $scope.status.success = false;
            $scope.status.error = false;
            $scope.status.warn = false;
        };
    }])
    .controller('UserLoginController', ['$scope', '$location', '$uibModal', 'UsersService',
        function ($scope, $location, $uibModal, UsersService) {
        $scope.user = {};
        $scope.errorMessage = DEFAULT_ERROR_MESSAGE;
        $scope.status = {error: false};
        var DEFAULT_ERROR_MESSAGE = 'Problem submitting the details. Try after sometime!';
        $scope.dismissMessage = function () {
            $scope.status.error = false;
        };
        $scope.login = function () {
            UsersService.loginUser($scope.user).then(function (response) {
                if (response.data) {
                    if (response.data.authSuccess) {
                        $scope.status.error = false;
                        $location.path('/bookworm/home');
                    } else {
                        $scope.errorMessage = 'Invalid credentials!!';
                        $scope.status.error = true;
                    }
                } else {
                    $scope.errorMessage = DEFAULT_ERROR_MESSAGE;
                }
            });
        };
        $scope.showLogin = function () {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: '../../../templates/login-modal.html',
                controller: 'ModalInstanceCtrl',
                size: 'l',
                resolve: {
                    contentTemplate: '../../../templates/login.html',
                    onConfirm: login
                }
            });
        };
    }])
    .controller('UsersController', ['$scope','Constants',  'UsersService',
        function ($scope, Constants, UsersService) {
            var options = Constants.getDefaultPagingSortingData();
            $scope.users = [];
            UsersService.getUsers(options)
                .then(function(response){
                    if(response.data && response.data.items){
                        $scope.users = response.data.items;
                    }
                });
    }])
    .controller('UserDetailsController', ['$scope','$routeParams','Constants',  'UsersService', 'BookwormAuthProvider',
        function ($scope, $routeParams, Constants, UsersService, BookwormAuthProvider) {
            var options = Constants.getDefaultPagingSortingData();
            $scope.user = {};
            $scope.isUserContributor = function(){
                return BookwormAuthProvider.isCurrentUser($scope.user);
            };
            $scope.isLoggedIn = function() {
              return BookwormAuthProvider.isLoggedIn();
            };
            options.username = $routeParams.username;
            UsersService.getUsers(options)
                .then(function(response){
                    if(response.data && response.data.items){
                        $scope.user = response.data.items[0];
                    }
                });
    }]);