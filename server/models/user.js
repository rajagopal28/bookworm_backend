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
        network : [{type: mongoose.Schema.Types.ObjectId, ref: constants.MODELS.USER }],
        created_ts: {type: Date, default: Date.now},
        last_modified_ts: {type: Date, default: Date.now}
    };
    var userSchema = mongoose.Schema(userSchemaDefinition);
    userSchema.pre(constants.SCHEMA_HOOK.UPDATE, function(next){
        var user = this;
        console.log('updating user in hook - pre update');
        user.last_modified_ts = new Date();
        console.log(user.last_modified_ts);
        next();
    });
    userSchema.pre(constants.SCHEMA_HOOK.SAVE, function (next) {
        var user = this;
        user.last_modified_ts = new Date();
          // generate a salt
        if (user.isModified(constants.FIELD.PASSWORD)){
            user.password = hashString(user.password);
        }
        if(user.isModified(constants.FIELD.USERNAME)) {
            user.token = hashString(user.username);
        }
        next();
    });
    userSchema.methods.getFullName = function () {
        return this.first_name + ' ' + this.last_name;
    };
    userSchema.methods.comparePassword = function (candidatePassword, user, cb) {
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
        if (searchQuery.identifier) {
            if(mongoose.Types.ObjectId.isValid(searchQuery.identifier)) {
                $or.push({_id: searchQuery.identifier});
            } else {
                $or.push({username: searchQuery.identifier});
                $or.push({email: searchQuery.identifier});
            }
            delete searchQuery.identifier;// remove the key value pair
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
    this.searchUsersWithUserNameQuery = function(usersList, fieldToPopulate) {
        var searchQuery = {};
        if(fieldToPopulate) {
            searchQuery[fieldToPopulate] = {$in : []};
        } else {
            searchQuery.username = {$in : []};
            fieldToPopulate = constants.FIELD.USERNAME;
        }
        if(usersList && usersList.length){
            for(var index=0; index < usersList.length; index++){
                searchQuery[fieldToPopulate].$in.push(usersList[index]);
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
             error.msg = !worm ? constants.ERROR.INVALID_ACCOUNT: null;
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
                    authResponse.first_name = worm.first_name;
                    authResponse.last_name = worm.last_name;
                    authResponse.username = worm.username;
                    authResponse.thumbnail_url = worm.thumbnail_url;
                    authResponse.token = worm.token;
                    authResponse._id = worm._id;
                    worm.comparePassword(user.pass_key, authResponse, cb);
                } else {
                    var err = {};
                    err.msg = worm && !worm.is_verified? constants.ERROR.ACCOUNT_NOT_VERIFIED : constants.ERROR.INVALID_ACCOUNT;
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
        .select(mUtils.restrictField(constants.FIELD.PASSWORD))
        .select(mUtils.restrictField(constants.FIELD.TOKEN))
        .exec(function(err,item){
                callback(err,item);
        });
    };
    this.findUsersWithUsernames = function(usernames_array, callback) {
        var search_users = this.searchUsersWithUserNameQuery(usernames_array);
        findListedUsers(search_users, callback);
    };
    this.findUsersWithIdentifiers = function(userIds_array, callback) {
        var search_users = this.searchUsersWithUserNameQuery(userIds_array, constants.FIELD.IDENTIFIER);
        findListedUsers(search_users, callback);
    };
    this.checkUniqueUsername = function(searchQuery, callback){
        searchQuery = {username : searchQuery.username};
        Model.find(searchQuery)
            .exec(function (err, items) {
                callback(err, items);
            });
    };
    this.addNewUser = function(personal_info, callback){
        // assign password to the right field and remove the old key
        personal_info.password = personal_info.pass_key;
        delete personal_info.pass_key;
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
                    .select(mUtils.restrictField(constants.FIELD.PASSWORD))
                    .select(mUtils.restrictField(constants.FIELD.TOKEN))
                    .skip(pagingSorting.skipCount)
                    .limit(pagingSorting.itemsPerPage)
                    .sort(pagingSorting.sortField)
                    .exec(function (err, items) {
                        callback(err, items, totalCount);
                    });
            }
        });
    };
    this.getCountOfAllUsersInNetwork = function(searchQuery, callback) {
        Model
        .findOne(searchQuery)
        .exec(function (err, items) {
            callback(err, items.network.length);
        });
    };
    this.findUsersInNetworkPaged = function(searchQuery, pagingSorting, callback) {
        var myNetworkQuery = {_id : searchQuery._id};
        delete searchQuery._id;
        searchQuery = this.buildSearchQuery(searchQuery);
        var nestedDocQuery = mUtils.buildNestedDocumentArrayPagination(constants.FIELD.NETWORK,
                            1*pagingSorting.skipCount,
                            1*pagingSorting.itemsPerPage);
        this.getCountOfAllUsersInNetwork(myNetworkQuery,
            function(err, totalCount){
                if(err){
                    callback(err, null, 0);
                } else {
                    Model
                        .findOne(myNetworkQuery, nestedDocQuery)
                        .select(mUtils.restrictField(constants.FIELD.PASSWORD))
                        .select(mUtils.restrictField(constants.FIELD.TOKEN))
                        .populate(constants.FIELD.NETWORK, null, searchQuery)
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
                                error.msg = !item.auth_success ? constants.ERROR.INVALID_CREDENTIAL : null;
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
                    error.msg = constants.ERROR.INVALID_ACCOUNT;
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
                    err.msg = constants.ERROR.INVALID_ACCOUNT;
                    callback(err,null);
                } else {
                    var now = new Date();
                    if(worm.password_reset_expiry_ts.getTime() >= now.getTime()) {
                        worm.password = userItem.pass_key;
                        worm.password_reset_expiry_ts = now;
                        worm.save(function(e, response){
                            callback(e,response);
                        });
                    } else {
                        var error = {msg : constants.ERROR.INVALID_RESET_LINK};
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
                    err.msg = constants.ERROR.INVALID_ACCOUNT;
                    callback(err,null);
                } else {
                    worm.is_verified = true;
                    worm.save(function(e, response){
                        callback(e,response);
                    });
                }
        });
    };
    this.addToNetwork = function(userItem, callback){
        var search_users = this.searchUsersWithUserNameQuery([userItem._id, userItem.friend_id], constants.FIELD.IDENTIFIER);
        findListedUsers(search_users,
            function(err, items){
                console.log(items);
             if(items.length === 2 ) {
                addUserToNetwork(items[0], items[1], function(err, savedItems) {
                    if(err) {
                        callback(err, null);
                    } else {
                        addUserToNetwork(items[1], items[0], callback)
                    }
                });
             } else {
                 callback({msg : constants.ERROR.INVALID_ACCOUNT}, null);
             }
        })
    };
    this.removeFriendFromNetwork = function(userItem, callback){
        var search_users = this.searchUsersWithUserNameQuery([userItem._id, userItem.friend_id], constants.FIELD.IDENTIFIER);
        findListedUsers(search_users,
            function(err, items){
                console.log(items);
             if(items.length === 2 ) {
                removeUserFromNetwork(items[0], items[1], function(err, savedItems) {
                    if(err) {
                        callback(err, null);
                    } else {
                        removeUserFromNetwork(items[1], items[0], callback)
                    }
                });
             } else {
                 callback({msg : constants.ERROR.INVALID_ACCOUNT}, null);
             }
        })
    };
    function addUserToNetwork(myInfo, friendInfo, callback) {
        if(myInfo.network.indexOf(friendInfo._id) === -1) {
            myInfo.network.push(friendInfo._id);
            myInfo.save(function(err, item) {
                callback(err, [myInfo, friendInfo]);
            });
        } else {
            callback({msg : constants.ERROR.USER_ALREADY_IN_NETWORK}, null);
        }
    }
    function removeUserFromNetwork(myInfo, friendInfo, callback) {
        if(myInfo.network.indexOf(friendInfo._id) !== -1) {
            myInfo.network.splice(myInfo.network.indexOf(friendInfo._id), 1);
            myInfo.save(function(err, item) {
                callback(err, [myInfo, friendInfo]);
            });
        } else {
            callback({msg : constants.ERROR.USER_ALREADY_IN_NETWORK}, null);
        }
    }
    function findListedUsers(usersListQuery, callback) {
       if(usersListQuery){
            Model
            .find(usersListQuery)
            .select(mUtils.restrictField(constants.FIELD.PASSWORD))
            .select(mUtils.restrictField(constants.FIELD.TOKEN))
            .exec(function(err, items){
                callback(err, items);
            });
        }
    }
};
module.exports.User = User;