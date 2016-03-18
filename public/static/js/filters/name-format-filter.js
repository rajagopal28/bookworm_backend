app.filter('formatUserName', [function() {
  return function(user) {
      var fullName = (user.firstName ? user.firstName : '')
                    + ' '
                    + (user.lastName ? user.lastName : '') ;
      return fullName.trim();
  };
}]);