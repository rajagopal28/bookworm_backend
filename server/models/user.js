function User(mongoose) {
    'use strict';
    var self = this;
    var userSchemaDefinition = {
        username : String,
        first_name : String,
        dob : { type : Date},
        last_name : String,
        password : String,
        gender : String,
        email : String,
        created_lent_ts : { type : Date , default : Date.now},
        last_modified_ts : { type : Date , default : Date.now}
    };
    var userSchema = mongoose.Schema(userSchemaDefinition);
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
};
module.exports.User = User;