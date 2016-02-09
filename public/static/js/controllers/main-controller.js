// HomeController
app.controller('DatepickerCtrl', ['$scope','Constants', function ($scope, Constants) {
        $scope.today = function () {
            $scope.dt = new Date();
        };
        $scope.today();

        $scope.clear = function () {
            $scope.dt = null;
        };
        $scope.toggleMin = function () {
            $scope.minDate = $scope.minDate ? null : new Date(Constants.DEFAULT_MIN_YEAR,
                Constants.DEFAULT_MIN_MONTH,
                Constants.DEFAULT_MIN_DATE);
        };
        $scope.toggleMin();
        $scope.maxDate = new Date();

        $scope.showDatepicker = function ($event) {
            $scope.status.opened = true;
        };

        $scope.onDatePicked = function () {
            $scope.$emit(Constants.EVENT_NAME_DATE_SET, {selectedDate: $scope.dt});
            // console.log('Emitting date-set');
        };
        $scope.setDate = function (year, month, day) {
            $scope.dt = new Date(year, month, day);
        };

        $scope.dateOptions = {
            formatYear: Constants.DEFAULT_YEAR_FORMAT,
            startingDay: 1
        };
        $scope.format = Constants.DEFAULT_DATE_FORMAT;
    }]);