app.filter('formatDate', [function() {
  return function(input) {
      var monthNames = [
          'January', 'February', 'March',
          'April', 'May', 'June', 'July',
          'August', 'September', 'October',
          'November', 'December'
        ];
      var DATE_SEPARATOR = '-';
      var INVALID_DATE_ERROR = 'Invalid Date';
      if(new Date(input) !== INVALID_DATE_ERROR){
        input = new Date(input);
        var day = input.getDate();
        var monthIndex = input.getMonth();
        var year = input.getFullYear();

        // console.log(day, monthNames[monthIndex], year);
        var formattedDateString = day
            + DATE_SEPARATOR
            + monthNames[monthIndex]
            + DATE_SEPARATOR
            + year;
        return formattedDateString;
      }
      return input;
  };
}]);