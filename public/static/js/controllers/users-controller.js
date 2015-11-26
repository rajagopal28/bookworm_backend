app.controller('UserRegistrationController', ['$scope', '$http','$uibModal', function($scope, $http,$uibModal){
    $scope.user = {};
    $scope.user.gender="male";
    $scope.$on('date-set', function(event, args){
        console.log(args);
        console.log('recieving date-set');
        $scope.user.dob = args.selectedDate;
    });
    $scope.status = {
        success : false,
        warn : false,
        error : false
    };
    $scope.open = function(){
        var options ={
          animation: $scope.animationsEnabled,
          templateUrl: '../../../templates/login-modal.html',
          controller: 'ModalInstanceCtrl',
          size: 'l',
          resolve: {
              options : function() { 
                    return {
                     contentTemplate: '../../../templates/login.html',
                      title : 'BookWorm',
                      showControls : false
                  };
                }
          }
        };
        console.log(options);
      var modalInstance = $uibModal.open(options);  
    };
    $scope.signup = function(){  
    console.log($scope.user);
        $http.post('/bookworm/api/registerUser', $scope.user,{timeout: 1000})
        .then(function(response){
            $scope.status.success = true;
            $scope.status.error = false;
        }, function(error){
            $scope.status.error = true;
            $scope.status.success = false;
        });
        
    };
    $scope.pingServer = function() {
        // TIP: io() with no args does auto-discovery
        socket.emit('ferret', {cricket: 'tobi', alt : 'Jiminy', context : 'Bazinga'}, function (data) {
          console.log(data); // data will be 'woot'
        });

    };
    $scope.dismissAlert = function(){
        $scope.status.success = false;
        $scope.status.error = false;
        $scope.status.warn = false;
    };
}])
.controller('UserLoginController', ['$scope', '$http','$uibModal', function($scope, $http, $uibModal){  
    $scope.login = function(data) {
        
    };
    $scope.showLogin = function(){
      var modalInstance = $uibModal.open({
          animation: $scope.animationsEnabled,
          templateUrl: '../../../templates/login-modal.html',
          controller: 'ModalInstanceCtrl',
          size: 'l',
          resolve: {
              contentTemplate : '../../../templates/login.html',
              onConfirm: login
          }
        });  
    };
}])