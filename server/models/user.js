function User(mongoose, bcrypt) {
    'use strict';
    var constants = {
        SCHEMA_HOOK_UPDATE : 'update',
        SCHEMA_HOOK_SAVE : 'save',
        FIELD_PASSWORD : 'password',
        FIELD_USERNAME : 'username'
    };
    var MODEL_NAME_USER = 'User';
    var self = this;
    var SALT_WORK_FACTOR = 10;
    var userSchemaDefinition = {
        username: String,
        first_name: String,
        dob: {type: Date},
        last_name: String,
        password: String,
        gender: String,
        email: String,
        thumbnail_url: String,
        contributions: {type: Number, default: 0},
        token: String,
        created_ts: {type: Date, default: Date.now},
        last_modified_ts: {type: Date, default: Date.now}
    };
    var userSchema = mongoose.Schema(userSchemaDefinition);
    userSchema.pre(constants.SCHEMA_HOOK_UPDATE, function(next){
        var user = this;
        console.log('updating user in hook - pre update');
        user.last_modified_ts = new Date();
        console.log(user.last_modified_ts);
        next();
    });
    userSchema.pre(constants.SCHEMA_HOOK_SAVE, function (next) {
        var user = this;
        user.last_modified_ts = new Date();
          // generate a salt
        var isPasswordChanged = user.isModified(constants.FIELD_PASSWORD);
        var isUsernameChanged = user.isModified(constants.FIELD_USERNAME);
        if(!(isPasswordChanged || isUsernameChanged)) {
            // go to next as we do not need any deferred hashing call
            next();
        }
        bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
            if (err) return next(err);
            // hash the password along with our new salt
        // only hash the password if it has been modified (or is new)
            if (isPasswordChanged){
                 bcrypt.hash(user.password, salt, function (err, hash) {
                    if (err) return next(err);

                    // override the cleartext password with the hashed one
                    user.password = hash;
                     if(!isUsernameChanged) {
                         next();
                     }
                     // wait till the next hash async call execution to call next()
                });
            }
            if(isUsernameChanged) {
                bcrypt.hash(user.username, salt, function (err, hash) {
                    if (err) return next(err);
                    // override the cleartext password with the hashed one
                    user.token = hash;
                    next();
                });
            }

        });
    });
    userSchema.methods.getFullName = function () {
        return this.first_name + ' ' + this.last_name;
    };
    userSchema.methods.comparePassword = function (candidatePassword, user, cb) {
        bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
            if (err) return cb(err);
            if (!isMatch) {
                user = {};
            }
            user.auth_success = isMatch;
            cb(null, user);
        });
    };
    this.Model = mongoose.model(MODEL_NAME_USER, userSchema);
    this.buildSearchQuery = function (searchQuery, mUtils) {
        var $or = [];
        if (searchQuery.username) {
            searchQuery.username = mUtils.addRegexOption(searchQuery.username);
            $or.push({username: searchQuery.username});
            delete searchQuery.username;// remove the key value pair
        }
        if ($or.length > 0) {
            searchQuery.$or = $or;
        }
        return searchQuery;
    };
    this.buildSearchQuery = function(searchQuery){
        if(searchQuery.password) {
            delete searchQuery.password;
        }
        return searchQuery;
    };
    this.searchUsersWithUserNameQuery = function(usersList) {
        var searchQuery = {username : {$in : []}};
        if(usersList && usersList.length){
            for(var index=0; index < usersList.length; index++){
                searchQuery.username.$in.push(usersList[index]);
            }
            return searchQuery;
        }
        return null;
    };
    this.authenticateUser = function (user, cb) {
        self.Model.findOne({
            $or: [
                {username: user.username},
                {email: user.username}
            ]
        }, function (error, worm) {
            if (error) {
                cb(error);
            } else {
                if (worm) {
                    var authResponse = {};
                    authResponse.author_name = worm.getFullName();
                    authResponse.username = worm.username;
                    authResponse.thumbnail_url = worm.thumbnail_url;
                    authResponse.token = worm.token;
                    worm.comparePassword(user.password, authResponse, cb);
                } else {
                    cb(null, null);
                }
            }
        });
    };
};
module.exports.User = User;