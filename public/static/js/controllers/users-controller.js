app.controller('UserRegistrationController', ['$scope', '$routeParams', '$uibModal', 'Constants', 'ConfigService', 'UsersService', 'BookwormAuthProvider',
        function ($scope, $routeParams, $uibModal, Constants, ConfigService, UsersService, BookwormAuthProvider) {
            $scope.user = {};
            var userId = $routeParams.userId;
            $scope.messages = [];
            $scope.messages.push(Constants.getMessage(Constants.INFO_MESSAGE_REGISTRATION_EMAIL, Constants.MSG_TYPE.INFO));
            $scope.user.gender = Constants.PARAM_VALUE_GENDER_MALE;
            $scope.user.dob = new Date();
            $scope.$on(Constants.EVENT_NAME_DATE_SET, function (event, args) {
                // console.log(args);
                // console.log('recieving date-set');
                $scope.user.dob = args.selectedDate;
            });
            var noMaleImageURL, noFemaleImageURL, imagePath;
            ConfigService.getConfig()
                .then(function (response) {
                    if (response.data && response.data) {
                        noMaleImageURL = response.data.noMaleImageURL;
                        noFemaleImageURL = response.data.noFemaleImageURL;
                        imagePath = response.data.imagesDirectory
                            ? response.data.imagesDirectory
                            : Constants.DEFAULT_LOCAL_IMAGES_PATH;
                        $scope.user.thumbnailURL = noMaleImageURL;
                    }
                });

            $scope.genderChange = function () {
                if (!$scope.user.thumbnailURL) {
                    $scope.user.thumbnailURL = $scope.user.gender === Constants.PARAM_VALUE_GENDER_MALE ? noMaleImageURL : noFemaleImageURL;
                }
                if ($scope.user.gender === Constants.PARAM_VALUE_GENDER_FEMALE
                    && $scope.user.thumbnailURL === noMaleImageURL) {
                    $scope.user.thumbnailURL = noFemaleImageURL;
                } else if ($scope.user.gender === Constants.PARAM_VALUE_GENDER_MALE
                    && $scope.user.thumbnailURL === noFemaleImageURL) {
                    $scope.user.thumbnailURL = noMaleImageURL;
                }
            };
            $scope.isEditMode = function () {
                return userId && userId.trim() !== '';
            };
            if ($scope.isEditMode()) {
                var options = Constants.getDefaultPagingSortingData();
                options.id = userId;
                UsersService.getUsers(options)
                    .then(function (response) {
                        if (response.data && response.data.items) {
                            $scope.user = response.data.items[0];
                        }
                    });
            }
            $scope.isUserContributor = function () {
                return BookwormAuthProvider.isCurrentUser($scope.user);
            };
            $scope.isLoggedIn = function () {
                return BookwormAuthProvider.isLoggedIn();
            };
            $scope.update = function () {
                // console.log($scope.user);
                showConfirmationModal($uibModal, Constants.DEFAULT_CONFIRMATION_MESSAGE, function () {
                    UsersService.updateProfile($scope.user)
                        .then(function (response) {
                            $scope.messages.push(Constants.getPostSuccessMessage());
                            BookwormAuthProvider.updateUser($scope.user);
                        }, function (error) {
                            $scope.messages.push(Constants.getGetErrorMessage(error));
                        });
                });

            };
            $scope.signup = function () {
                showConfirmationModal($uibModal, Constants.DEFAULT_CONFIRMATION_MESSAGE, function () {
                    // console.log($scope.user);
                    UsersService.registerUser($scope.user)
                        .then(function (response) {
                            $scope.messages.push(Constants.getPostSuccessMessage());
                            $scope.user = {};
                        }, function (error) {
                            $scope.messages.push(Constants.getGetErrorMessage(error));
                        });
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
                        user: $scope.user
                    }
                });
                modalInstance.result.then(function (result) {
                    // console.log(result);
                    if (result.data
                        && result.data.success
                        && result.data.fileAbsolutePath) {
                        $scope.user.thumbnailURL = result.data.fileAbsolutePath;
                    }
                });
            };
            $scope.dismissAlert = function (index) {
                $scope.messages.splice(index, 1);
            };
        }])
    .controller('UserLoginController', ['$scope', '$routeParams', '$location', '$uibModal', '$localStorage', 'Constants', 'UsersService',
        function ($scope, $routeParams, $location, $uibModal, $localStorage, Constants, UsersService) {
            $scope.user = {};
            $scope.messages = [];
            var requestToken = $routeParams.requestToken;
            if (requestToken) {
                $scope.user.token = requestToken;
                UsersService.verifyAccount($scope.user).then(
                    function (response) {
                        if (response.data.success) {
                            $scope.messages.push(Constants.getPostSuccessMessage());
                        } else {
                            $scope.messages.push(Constants.getPostErrorMessage());
                        }
                    }, function (error) {
                        $scope.messages.push(Constants.getPostErrorMessage(error));
                    });
            }
            $scope.login = function () {
                UsersService.loginUser($scope.user).then(function (response) {
                    if (response.data) {
                        if (response.data.authSuccess) {
                            if ($localStorage.redirectURL
                                && $localStorage.redirectURL.indexOf('/bookworm') !== -1) {
                                $location.path($localStorage.redirectURL);
                                delete $localStorage.redirectURL;
                            } else {
                                $location.path('/bookworm/home');
                            }
                        } else {
                            $scope.messages.push(Constants.getPostErrorMessage({msg: Constants.ERROR_LOGIN_FAILED}));
                        }
                    } else {
                        $scope.messages.push(Constants.getPostErrorMessage());
                    }
                }, function (error) {
                    $scope.messages.push(Constants.getPostErrorMessage(error));
                });
            };

            $scope.sendResetPasswordRequest = function () {
                showConfirmationModal($uibModal, Constants.DEFAULT_CONFIRMATION_MESSAGE, function () {
                    UsersService.requestResetPassword($scope.user).then(function (response) {
                        if (response.data.success) {
                            $scope.messages.push(Constants.getPostSuccessMessage(Constants.SUCCESS_MESSAGE_PASSWORD_RESET_REQUESTED));
                            $scope.user = {};
                        } else {
                            $scope.messages.push(Constants.getPostErrorMessage(response.data.error));
                        }
                    });
                });
            };

            $scope.dismissAlert = function (index) {
                $scope.messages.splice(index, 1);
            };
        }])
    .controller('UsersController', ['$scope', 'Constants', 'UsersService',
        function ($scope, Constants, UsersService) {
            $scope.pageSort = Constants.getDefaultPagingSortingData();
            $scope.users = [];
            $scope.search = {query: ''};
            $scope.searchUsers = function () {
                var options = $scope.pageSort;
                if ($scope.search.query) {
                    options.query = $scope.search.query;
                }
                UsersService.getUsers(options)
                    .then(function (response) {
                        if (response.data && response.data.items) {
                            $scope.users = response.data.items;
                            $scope.pageSort.totalItems = response.data.totalItems;
                        }
                    });
            };
            $scope.searchUsers();
        }])
    .controller('NetworkController', ['$scope', 'Constants', 'UsersService', 'BookwormAuthProvider',
        function ($scope, Constants, UsersService, BookwormAuthProvider) {
            $scope.pageSort = Constants.getDefaultPagingSortingData();
            $scope.users = [];
            $scope.search = {query: ''};
            $scope.searchUsers = function () {
                var options = $scope.pageSort;
                if ($scope.search.query.trim() != '') {
                    options.query = $scope.search.query;
                }
                if (BookwormAuthProvider.isLoggedIn()) {
                    var currentUser = BookwormAuthProvider.getUser();
                    options.id = currentUser.id;
                    UsersService.getUsersInNetwork(options)
                        .then(function (response) {
                            if (response.data && response.data.items) {
                                $scope.users = response.data.items;
                                $scope.pageSort.totalItems = response.data.totalItems;
                            }
                        });
                }
            };
            $scope.searchUsers();
        }])
    .controller('UserPasswordController', ['$scope', '$routeParams', 'Constants', 'UsersService', 'BookwormAuthProvider',
        function ($scope, $routeParams, Constants, UsersService, BookwormAuthProvider) {
            $scope.messages = [];
            $scope.user = BookwormAuthProvider.getUser();
            var requestToken = $routeParams.requestToken;
            $scope.changePassword = function () {
                if (BookwormAuthProvider.isLoggedIn()) {
                    UsersService.updatePassword($scope.user).then(function (response) {
                        if (response.data.success) {
                            $scope.messages.push(Constants.getPostSuccessMessage(Constants.SUCCESS_MESSAGE_PASSWORD_REST_DONE));
                            $scope.user = {};
                        } else {
                            $scope.messages.push(Constants.getPostErrorMessage(response.data.error));
                        }
                    });
                }
            };
            $scope.resetPassword = function () {
                if (requestToken) {
                    $scope.user.token = requestToken;
                    UsersService.resetPassword($scope.user).then(function (response) {
                        if (response.data.success) {
                            $scope.messages.push(Constants.getPostSuccessMessage());
                            $scope.user = {};
                        } else {
                            $scope.messages.push(Constants.getPostErrorMessage(response.data.error));
                        }
                    });
                }

            };
            $scope.dismissAlert = function (index) {
                $scope.messages.splice(index, 1);
            };
        }])
    .controller('UserDetailsController', ['$scope', '$routeParams', '$uibModal', 'Constants', 'UsersService', 'BookwormAuthProvider',
        function ($scope, $routeParams, $uibModal, Constants, UsersService, BookwormAuthProvider) {

            $scope.messages = [];
            var options = Constants.getDefaultPagingSortingData();
            $scope.user = {};
            options.identifier = $routeParams.identifier;
            $scope.isUserContributor = function () {
                return BookwormAuthProvider.isCurrentUser($scope.user);
            };
            $scope.sendFriendRequest = function () {
                if (BookwormAuthProvider.isLoggedIn()
                    && $scope.user
                    && $scope.user.id) {
                    showConfirmationModal($uibModal, Constants.CONFIRM_ADD_FRIEND, function () {
                        var user = BookwormAuthProvider.getUser();
                        user.friendId = $scope.user.id;
                        UsersService.sendFriendRequest(user).then(function (response) {
                            if (response.data.success) {
                                $scope.messages.push(Constants.getPostSuccessMessage(Constants.SUCCESS_MESSAGE_FRIEND_REQUEST_SENT));
                            } else {
                                $scope.messages.push(Constants.getPostErrorMessage(response.data.error));
                            }
                        });
                    });
                }
            };
            $scope.isUserAlreadyInNetwork = function () {
                if (BookwormAuthProvider.isLoggedIn()) {
                    var currentUser = BookwormAuthProvider.getUser();
                    return $scope.user
                        && $scope.user.network
                        && $scope.user.network.indexOf(currentUser.id) !== -1
                }
                return false;
            };
            $scope.removeUserFromNetwork = function () {
                if ($scope.isUserAlreadyInNetwork()) {
                    showConfirmationModal($uibModal, Constants.CONFIRM_REMOVE_FRIEND, function () {
                        var currentUser = BookwormAuthProvider.getUser();
                        var request = {id: currentUser.id, friendId: $scope.user.id};
                        UsersService.removeUserFromNetwork(request)
                            .then(function (response) {
                                $scope.messages.push(Constants.getPostSuccessMessage());
                            });
                    });
                }
            };
            $scope.isLoggedIn = function () {
                return BookwormAuthProvider.isLoggedIn();
            };
            UsersService.getUsers(options)
                .then(function (response) {
                    if (response.data && response.data.items) {
                        $scope.userDataAvailable = response.data.items.length > 0;
                        $scope.user = response.data.items[0];
                    }
                });
            $scope.dismissAlert = function (index) {
                $scope.messages.splice(index, 1);
            };
        }])
    .controller('ImageUploadController', ['$scope', '$uibModalInstance', '$timeout', 'Constants', 'UsersService', 'BookwormAuthProvider', 'user',
        function ($scope, $uibModalInstance, $timeout, Constants, UsersService, BookwormAuthProvider, user) {
            $scope.user = user;
            $scope.profileThumbnail = null;
            $scope.messages = [];
            $scope.uploadImage = function () {
                var file = $scope.profileThumbnail;
                if (file && file.size < Constants.MAX_FILE_UPLOAD_LIMIT) {
                    UsersService
                        .postImage(file)
                        .then(function (response) {
                            if (response.data.success) {
                                $scope.messages.push(Constants.getPostSuccessMessage(Constants.SUCCESS_MESSAGE_IMAGE_UPLOADED));
                                $scope.user.thumbnailURL = $scope.user.thumbnailURL !== response.data.fileAbsolutePath
                                    ? response.data.fileAbsolutePath
                                    : response.data.fileAbsolutePath + '?lastmod=' + (new Date()).getTime();
                                $timeout(function () {
                                    $uibModalInstance.close(response.data);
                                }, 10000);
                                $scope.profileThumbnail = null;
                            } else {
                                $scope.messages.push(Constants.getPostErrorMessage({msg: response.data.error}));
                            }
                        }, function (error) {
                            if (error) {
                                $scope.messages.push(Constants.getPostErrorMessage(error));
                            }
                        });
                }
            };
            $scope.dismissAlert = function (index) {
                $scope.messages.splice(index, 1);
            };
            $scope.cancel = function () {
                $uibModalInstance.dismiss(Constants.MODAL_DISMISS_RESPONSE);
            };
        }])
    .controller('FeedbackController', ['$scope', '$uibModal', 'Constants', 'UsersService', 'BookwormAuthProvider', 'formatUserNameFilter',
        function ($scope, $uibModal, Constants, UsersService, BookwormAuthProvider, formatUserName) {
            $scope.feedback = {feedbackType: 'query'};
            $scope.messages = [];
            if (BookwormAuthProvider.isLoggedIn()) {
                var currentUser = BookwormAuthProvider.getUser();
                if (currentUser && currentUser.username) {
                    var options = Constants.getDefaultPagingSortingData();
                    options.username = currentUser.username;
                    UsersService.getUsers(options)
                        .then(function (response) {
                            if (response.data && response.data.items) {
                                $scope.feedback = $.extend($scope.feedback, response.data.items[0]);
                                $scope.feedback.authorName = formatUserName($scope.feedback);
                            }
                        });
                }
            }
            $scope.sendFeedback = function () {
                showConfirmationModal($uibModal, Constants.DEFAULT_CONFIRMATION_MESSAGE, function () {
                    if ($scope.feedback.feedbackComment) {
                        UsersService
                            .postFeedback($scope.feedback)
                            .then(function (response) {
                                if (response.data && response.data.success) {
                                    $scope.messages.push(Constants.getPostSuccessMessage(Constants.SUCCESS_MESSAGE_FEEDBACK_SENT));
                                } else {
                                    $scope.messages.push(Constants.getPostErrorMessage({msg: response.data.error}));
                                }
                                $scope.feedback.feedbackComment = '';
                            }, function (error) {
                                $scope.messages.push(Constants.getPostErrorMessage(error));
                                $scope.feedback.feedbackComment = '';
                            });
                    }
                });
            };
            $scope.dismissAlert = function (index) {
                $scope.messages.splice(index, 1);
            };
        }]);