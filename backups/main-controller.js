// HomeController
app.controller('MainController', ['$scope', function ($scope) {
        $scope.loginPopup = function () {
            // console.log('Login');
        };
        /*
         $scope.fName = '';
         $scope.lName = '';
         $scope.passw1 = '';
         $scope.passw2 = '';
         $scope.users = [
         {id:1, fName:'Hege',lName:"Pege" },
         {id:2, fName:'Kim',lName:"Pim" },
         {id:3, fName:'Sal',lName:"Smith" },
         {id:4, fName:'Jack',lName:"Jones" },
         {id:5, fName:'John',lName:"Doe" },
         {id:6, fName:'Peter',lName:"Pan" }
         ];
         $scope.edit = true;
         $scope.error = false;
         $scope.incomplete = false;
         $scope.editUser = function(id) {
         if (id == 'new') {
         $scope.edit = true;
         $scope.incomplete = true;
         $scope.fName = '';
         $scope.lName = '';
         } else {
         $scope.edit = false;
         $scope.fName = $scope.users[id-1].fName;
         $scope.lName = $scope.users[id-1].lName;
         }
         };

         $scope.$watch('passw1',function() {$scope.test();});
         $scope.$watch('passw2',function() {$scope.test();});
         $scope.$watch('fName',function() {$scope.test();});
         $scope.$watch('lName',function() {$scope.test();});

         $scope.test = function() {
         if ($scope.passw1 !== $scope.passw2) {
         $scope.error = true;
         } else {
         $scope.error = false;
         }
         $scope.incomplete = false;
         if ($scope.edit && (!$scope.fName.length ||
         !$scope.lName.length ||
         !$scope.passw1.length || !$scope.passw2.length)) {
         $scope.incomplete = true;
         }
         };
         */
        $scope.pingServer = function () {
            // TIP: io() with no args does auto-discovery
            socket.emit('ferret', {cricket: 'tobi', alt: 'Jiminy', context: 'Bazinga'}, function (data) {
                // console.log(data); // data will be 'woot'
            });

        };
        $scope.open = function () {
            var options = {
                animation: true,
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
            // console.log(options);
            var modalInstance = $uibModal.open(options);
        };
    }])
    .controller('ModalInstanceCtrl', ['$scope', '$uibModalInstance', 'options', function ($scope, $uibModalInstance, options) {

        $scope.ok = function () {
            $uibModalInstance.close();
        };
        $scope.options = options;
        // console.log(options);
        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }])
    .controller('DatepickerCtrl', ['$scope', function ($scope) {
        $scope.today = function () {
            $scope.dt = new Date();
        };
        $scope.today();

        $scope.clear = function () {
            $scope.dt = null;
        };

        /*
         // Disable weekend selection
         $scope.disabled = function(date, mode) {
         return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
         };
         */

        $scope.toggleMin = function () {
            $scope.minDate = $scope.minDate ? null : new Date(1900, 5, 22);
        };
        $scope.toggleMin();
        $scope.maxDate = new Date();

        $scope.showDatepicker = function ($event) {
            $scope.status.opened = true;
        };

        $scope.onDatePicked = function () {
            $scope.$emit('date-set', {selectedDate: $scope.dt});
            // console.log('Emitting date-set');
        };
        $scope.setDate = function (year, month, day) {
            $scope.dt = new Date(year, month, day);
        };

        $scope.dateOptions = {
            formatYear: 'yy',
            startingDay: 1
        };
        /*
         $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
         */
        $scope.format = 'dd-MMMM-yyyy';
        //$scope.formats[0];
        /*
         $scope.status = {
         opened: false
         };

         var tomorrow = new Date();
         tomorrow.setDate(tomorrow.getDate() + 1);
         var afterTomorrow = new Date();
         afterTomorrow.setDate(tomorrow.getDate() + 2);
         $scope.events =
         [
         {
         date: tomorrow,
         status: 'full'
         },
         {
         date: afterTomorrow,
         status: 'partially'
         }
         ];

         $scope.getDayClass = function(date, mode) {
         if (mode === 'day') {
         var dayToCheck = new Date(date).setHours(0,0,0,0);

         for (var i=0;i<$scope.events.length;i++){
         var currentDay = new Date($scope.events[i].date).setHours(0,0,0,0);

         if (dayToCheck === currentDay) {
         return $scope.events[i].status;
         }
         }
         }

         return '';
         };
         */
    }]);