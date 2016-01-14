function User(mongoose, bcrypt) {
    'use strict';
    var self = this;
    var SALT_WORK_FACTOR = 10;
    var userSchemaDefinition = {
        username : String,
        first_name : String,
        dob : { type : Date},
        last_name : String,
        password : String,
        gender : String,
        email : String,
        token : String,
        created_lent_ts : { type : Date , default : Date.now},
        last_modified_ts : { type : Date , default : Date.now}
    };
    var userSchema = mongoose.Schema(userSchemaDefinition);
    userSchema.pre('save', function(next) {
    var user = this;
        // only hash the password if it has been modified (or is new)
        if (!user.isModified('password')) return next();

        // generate a salt
        bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
            if (err) return next(err);
            // hash the password along with our new salt
            bcrypt.hash(user.username, salt, function(err, hash) {
                if (err) return next(err);
                // override the cleartext password with the hashed one
                user.token = hash;
                next();
            });
            bcrypt.hash(user.password, salt, function(err, hash) {
                if (err) return next(err);

                // override the cleartext password with the hashed one
                user.password = hash;
                next();
            });
        });
    });
    userSchema.methods.comparePassword = function(candidatePassword, token, cb) {
        bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
            if (err) return cb(err);
            token = isMatch? token : null;
            cb(null, isMatch, token);
        });
    };
    this.Model = mongoose.model('User', userSchema);
    this.buildSearchQuery = function(searchQuery, mUtils) {
        var $or =[];
        if(searchQuery.username) {
            searchQuery.username = mUtils.addRegexOption(searchQuery.username);
            $or.push({username: searchQuery.username});
            delete searchQuery.username;// remove the key value pair
        }
        if($or.length > 0) {
            searchQuery.$or = $or;
        }
        return searchQuery;
    };
    this.authenticateUser = function(user , cb){
      self.Model.findOne({$or : [
          {username : user.username},
          {email : user.username}
      ]}, function(error, worm) {
          if(error) {
              cb(error);
          } else{
            if(worm){
                worm.comparePassword(user.password, worm.token, cb);
            } else {
                cb(null,false,null);
            }
          }
      });
    };
};
module.exports.User = User;