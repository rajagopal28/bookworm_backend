app.filter('formatUserName', [function() {
  return function(user) {
      if(!user) {
          return '';
      }
      var fullName = (user.firstName ? user.firstName : '')
                    + ' '
                    + (user.lastName ? user.lastName : '') ;
      return fullName.trim();
  };
}]);