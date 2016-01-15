app.controller('UserRegistrationController', ['$scope', '$uibModal', 'UsersService', function ($scope, $uibModal, UsersService) {
        $scope.user = {};
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
    .controller('UserLoginController', ['$scope', '$location', '$uibModal', 'UsersService', function ($scope, $location, $uibModal, UsersService) {
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
                animation: $scope.animationsEnabled,
                templateUrl: '../../../templates/login-modal.html',
                controller: 'ModalInstanceCtrl',
                size: 'l',
                resolve: {
                    contentTemplate: '../../../templates/login.html',
                    onConfirm: login
                }
            });
        };
    }]);