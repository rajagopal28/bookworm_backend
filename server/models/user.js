function User(mongoose, mCrypto, mUtils) {
    'use strict';
    var self = this;
    var crypto = mCrypto;
    var mUtils = mUtils;
    var constants = mUtils.constants;
    var salt = constants.SALT_STRING_RANDOM_CHIPHER;
    var userSchemaDefinition = {
        username: {
            type: String,
            required: true,
            unique : true
          },
        first_name: {
            type: String,
            required: true
          },
        dob: {type: Date,
            required: true},
        last_name: String,
        password: String,
        gender: String,
        email: {
            type: String,
            required: true
          },
        thumbnail_url: String,
        password_reset_expiry_ts : {type: Date, default: Date.now},
        is_verified : {type: Boolean, default: false},
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
        if (user.isModified(constants.FIELD_PASSWORD)){
            user.password = hashString(user.password);
        }
        if(user.isModified(constants.FIELD_USERNAME)) {
            user.token = hashString(user.username);
        }
        next();
    });
    userSchema.methods.getFullName = function () {
        return this.first_name + ' ' + this.last_name;
    };
    userSchema.methods.comparePassword = function (candidatePassword, user, cb) {
        console.log(hashString(candidatePassword));
        console.log(this.password);
        var isMatch = candidatePassword &&
            this.password === hashString(candidatePassword);
        if(isMatch) {
            user.auth_success = isMatch;
        } else {
            user = {auth_success : isMatch};
        }
        cb(null, user);
    };
    function hashString(input) {
        if (!input) return '';
        var saltBuffer = new Buffer(salt, constants.STRING_ENCODING_BASE_64);
        return crypto.pbkdf2Sync(input,
            saltBuffer,
            constants.CRYPTO_DEFAULT_ITERATIONS,
            constants.RANDOM_STRING_LENGTH_64,
            constants.HASH_ALGO_SHA_16).toString(constants.STRING_ENCODING_BASE_64);
      }
    var Model = mongoose.model(constants.MODELS.USER, userSchema);
    this.buildSearchQuery = function (searchQuery) {
        var $or = [];
        if (searchQuery.username) {
            searchQuery.username = mUtils.addRegexOption(searchQuery.username);
            $or.push({username: searchQuery.username});
            delete searchQuery.username;// remove the key value pair
        }
        if (searchQuery.query
            && searchQuery.query.trim() !== '') {
            $or.push({username: mUtils.addRegexOption(searchQuery.query)});
            $or.push({first_name: mUtils.addRegexOption(searchQuery.query)});
            $or.push({last_name: mUtils.addRegexOption(searchQuery.query)});
            $or.push({email: mUtils.addRegexOption(searchQuery.query)});
            delete searchQuery.query;// remove the key value pair
        }
        if ($or.length > 0) {
            searchQuery.$or = $or;
        }
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

    this.findUserAccount = function(user, callback) {
      Model.findOne({
              username: user.username
          }, function (error, worm) {
            if(error || !worm){
                error = error ? error : {};
             error.msg = !worm ? constants.ERROR_INVALID_ACCOUNT: null;
            }
            callback(error, worm);
        });
    };

    this.authenticateUser = function (user, cb) {
        self.findUserAccount(user, function(error,worm){
            if (error) {
                cb(error);
            } else {
                if (worm && worm.is_verified) {
                    var authResponse = {};
                    authResponse.author_name = worm.getFullName();
                    authResponse.username = worm.username;
                    authResponse.thumbnail_url = worm.thumbnail_url;
                    authResponse.token = worm.token;
                    worm.comparePassword(user.password, authResponse, cb);
                } else {
                    var err = {};
                    err.msg = worm && !worm.is_verified? constants.ERROR_ACCOUNT_NOT_VERIFIED : constants.ERROR_INVALID_ACCOUNT;
                    cb(err, worm);
                }
            }
        });
    };
    this.incrementContributionOfUser = function(username, token, callback) {
        Model
            .findOneAndUpdate(
                {username : username, token : token},
                { $inc : { contributions : 1}})
            .select('-password')
            .select('-token')
            .exec(function(err,item){
                    callback(err,item);
            });
    };
    this.findUsersWithUsernames = function(usernames_array, callback) {
        var search_users = this.searchUsersWithUserNameQuery(usernames_array);
            if(search_users){
                Model
                .find(search_users)
                .select('-token')
                .select('-password')
                .exec(function(err, items){
                    callback(err, items)
                });
            }
    };
    this.checkUniqueUsername = function(searchQuery, callback){
        searchQuery = {username : searchQuery.username};
        Model.find(searchQuery)
            .exec(function (err, items) {
                callback(err, items);
            });
    };
    this.addNewUser = function(personal_info, callback){
        var new_user = new Model(personal_info);
        new_user.save(function (err, item) {
            callback(err, item);
        });
    };
    this.updateExistingUser = function(personal_info, token, callback){
      Model.update({_id: personal_info._id , token : token},
        {$set : personal_info},
        { upsert : false},
            function (err, items) {
                callback(err, items);
        });
    };
    this.findUsersPaged = function(searchQuery, pagingSorting, callback) {
        searchQuery = this.buildSearchQuery(searchQuery);
        Model.count(searchQuery, function(err, totalCount){
            if(err){
                callback(err, null, 0);
            } else {
                Model
                    .find(searchQuery)
                    .select('-password')
                    .select('-token')
                    .skip(pagingSorting.skipCount)
                    .limit(pagingSorting.itemsPerPage)
                    .sort(pagingSorting.sortField)
                    .exec(function (err, items) {
                        callback(err, items, totalCount);
                    });
            }
        });
    };
    this.getCountOfUsers = function(searchQuery, callback) {
        Model
        .count(searchQuery,
            function(err, totalCount){
                callback(err, totalCount);
            });
    };
    this.updateUserPassword = function(userItem, token, callback){
        Model.findOne({username : userItem.username, token : token},
            function(err, worm){
                if(err){
                    callback(err,null);
                } else {
                    var authResponse = {};
                    authResponse.username = worm.username;
                    authResponse.token = worm.token;
                    worm.comparePassword(userItem.current_password,
                        authResponse,
                        function(error, item) {
                            if(error || !item.auth_success){
                                error = error ? error : {};
                                error.msg = !item.auth_success ? constants.ERROR_INVALID_CREDENTIAL : null;
                                callback(error, item);
                            } else {
                                worm.password = userItem.password;
                                worm.save(function(e, response){
                                    callback(e,response);
                                });
                            }
                        });
                }
        });
    };
    this.initiateResetPassword = function(user_item, callback){
        this.findUserAccount(user_item,
            function (error, user_account) {
                if (error || !user_account) {
                    error = error ? error : {};
                    error.msg = constants.ERROR_INVALID_ACCOUNT;
                    callback(error, null);
                } else {
                    var now = new Date().getTime();
                    user_account.password_reset_expiry_ts = new Date(now + constants.DEFAULT_PASSWORD_RESET_EXPIRATION);
                    user_account.save(function(err, item){
                        callback(err,item);
                    });
                }
             });
    };
    this.resetUserPassword = function(userItem, callback){
        Model.findOne({_id : userItem.token},
            function(err, worm){
                if(err || !worm){
                    err = error ? error : {};
                    err.msg = constants.ERROR_INVALID_ACCOUNT;
                    callback(err,null);
                } else {
                    var now = new Date();
                    if(worm.password_reset_expiry_ts.getTime() >= now.getTime()) {
                        worm.password = userItem.password;
                        worm.password_reset_expiry_ts = now;
                        worm.save(function(e, response){
                            callback(e,response);
                        });
                    } else {
                        var error = {msg : constants.ERROR_INVALID_RESET_LINK};
                        callback(error, null);
                    }
                }
        });
    };
    this.verifyAccount = function(userItem, callback){
        Model.findOne({_id : userItem.token},
            function(err, worm){
                if(err || !worm){
                    err = error ? error : {};
                    err.msg = constants.ERROR_INVALID_ACCOUNT;
                    callback(err,null);
                } else {
                    worm.is_verified = true;
                    worm.save(function(e, response){
                        callback(e,response);
                    });
                }
        });
    };
};
module.exports.User = User;