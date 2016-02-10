app.controller('UserRegistrationController', ['$scope', '$routeParams', '$uibModal', 'Constants', 'ConfigService', 'UsersService', 'BookwormAuthProvider',
    function ($scope, $routeParams, $uibModal, Constants, ConfigService, UsersService, BookwormAuthProvider) {
        $scope.user = {};
        var userId = $routeParams.userId;
        $scope.user.gender = Constants.PARAM_VALUE_GENDER_MALE;
        $scope.user.dob = new Date();
        $scope.$on(Constants.EVENT_NAME_DATE_SET, function (event, args) {
            // console.log(args);
            // console.log('recieving date-set');
            $scope.user.dob = args.selectedDate;
        });
        var noMaleImageURL, noFemaleImageURL, imagePath;
        ConfigService.getConfig()
            .then(function(response){
                if(response.data && response.data) {
                    noMaleImageURL = response.data.noMaleImageURL;
                    noFemaleImageURL = response.data.noFemaleImageURL;
                    imagePath = response.data.imagesDirectory
                                    ? response.data.imagesDirectory
                                    : Constants.DEFAULT_LOCAL_IMAGES_PATH;
                    $scope.user.thumbnailURL = noMaleImageURL;
                }
            });

        $scope.status = {
            success: false,
            warn: false,
            error: false
        };
        $scope.genderChange = function() {
            if(!$scope.user.thumbnailURL){
                $scope.user.thumbnailURL = $scope.user.gender === Constants.PARAM_VALUE_GENDER_MALE? noMaleImageURL : noFemaleImageURL;
            }
            if($scope.user.gender === Constants.PARAM_VALUE_GENDER_FEMALE
                && $scope.user.thumbnailURL === noMaleImageURL) {
                $scope.user.thumbnailURL = noFemaleImageURL;
            } else if ($scope.user.gender === Constants.PARAM_VALUE_GENDER_MALE
                 && $scope.user.thumbnailURL === noFemaleImageURL){
                $scope.user.thumbnailURL = noMaleImageURL;
            }
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
        $scope.isLoggedIn = function() {
          return BookwormAuthProvider.isLoggedIn();
        };
        $scope.update = function () {
            // console.log($scope.user);
            UsersService.updateProfile($scope.user)
                .then(function (response) {
                    $scope.status.success = true;
                    $scope.status.error = false;
                    BookwormAuthProvider.updateUser($scope.user);
                }, function (error) {
                    $scope.status.error = true;
                    $scope.status.success = false;
                });

        };
        $scope.signup = function () {
            // console.log($scope.user);
            UsersService.registerUser($scope.user)
                .then(function (response) {
                    $scope.status.success = true;
                    $scope.status.error = false;
                    $scope.user = {};
                }, function (error) {
                    $scope.status.error = true;
                    $scope.status.success = false;
                });

        };

        $scope.checkUsername = function () {
            UsersService.usernameUnique($scope.user)
                .then(function (response) {
                    // console.log(response);
                    if (response.data) {
                        $scope.user.isUsernameAvailable = response.data.isUsernameAvailable;
                        if (response.data.isUsernameAvailable) {
                            $scope.user.customMessage = Constants.MESSAGE_USERNAME_AVAILABLE;
                        } else {
                            $scope.user.customMessage = Constants.MESSAGE_USERNAME_UNAVAILABLE;
                        }
                    }
                });
        };
         $scope.showImageUploadModal = function () {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: '../../../templates/image-upload.html',
                controller: 'ImageUploadController',
                size: Constants.MODAL_SIZE_LARGE,
                resolve: {
                    user : $scope.user
                }
            });
            modalInstance.result.then(function(result) {
                // console.log(result);
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
        $scope.status = {error: false};
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
                        $scope.errorMessage = Constants.ERROR_LOGIN_FAILED;
                        $scope.status.error = true;
                    }
                } else {
                    $scope.status.error = true;
                    $scope.errorMessage = Constants.DEFAULT_POST_ERROR_MESSAGE;
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
                        $scope.userDataAvailable = response.data.items.length > 0;
                        $scope.user = response.data.items[0];
                    }
                });
    }])
    .controller('ImageUploadController', ['$scope','$uibModalInstance','Constants',  'UsersService', 'BookwormAuthProvider','user',
        function ($scope, $uibModalInstance, Constants, UsersService, BookwormAuthProvider, user) {
            $scope.user = user;
            $scope.profileThumbnail = null;
            $scope.status = {error: false};
            $scope.uploadImage = function() {
                var file = $scope.profileThumbnail;
                if(file && file.size < Constants.MAX_FILE_UPLOAD_LIMIT) {
                    UsersService
                    .postImage(file)
                    .then(function(response){
                        if(response && response.data){
                            if(response.data.error) {
                                $scope.status.error = true;
                                $scope.errorMessage = response.data.error;
                            } else {
                                $uibModalInstance.close(response.data);
                            }
                        } else {
                            $scope.status.error = true;
                            $scope.errorMessage = Constants.DEFAULT_POST_ERROR_MESSAGE;
                        }
                    }, function(error) {
                        if(error) {
                            $scope.status.error = true;
                            $scope.errorMessage = Constants.DEFAULT_POST_ERROR_MESSAGE;
                        }
                    });
                }
            };
            $scope.cancel = function() {
                $uibModalInstance.dismiss(Constants.MODAL_DISMISS_RESPONSE);
            };
    }]);