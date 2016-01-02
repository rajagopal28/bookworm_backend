function Utils() {
    'use strict';
    var self = this;
    this.requestToDBKeys = {
        'id': '_id',
        'firstName': 'first_name',
        'lastName': 'last_name',
        'gender': 'gender',
        'dob': 'dob',
        'email': 'email',
        'genres': 'genres',
        'isbn': 'isbn',
        'thumbnail': 'thumbnail_url',
        'bookName': 'book_name',
        'forumTitle': 'forum_title',
        'description': 'description',
        'username': 'username',
        'password': 'password',
        'confirmPassword': 'password',
        'authorName': 'author_name',
        'googleId': 'google_id',
        'author': 'author',
        'locality': 'locality',
        'creator': 'creator_name',
        'createdTS': 'created_ts',
        'lastModifiedTS': 'last_modified_ts',
        'commentsCount': 'comments_count',
        'lendDate': 'created_lent_ts',
        'isAvailable': 'is_available',
        'exhangeOnly': 'exchange_only',
        'referredBook': 'referred_book'
    };
    this.reverseKeyValuePairs = function (key_value_pairs) {
        var value_key_pairs = {}, key, value;
        for (key in key_value_pairs) {
            if (key_value_pairs.hasOwnProperty(key)) {
                value = key_value_pairs[key];
                if (value.trim() !== '') {
                    value_key_pairs[value.toString()] = key.toString();
                }
            }
        }
        return value_key_pairs;
    };
    this.parseRequestToDBKeys = function (request_attributes) {
        var db_key_values = {}, key;
        for(key in request_attributes) {
            // console.log(request_attributes[key]);
            var value = request_attributes[key];
            var db_key = self.requestToDBKeys[key];
            if (self.requestToDBKeys[key]) {
                if (value instanceof Array) {
                    db_key_values[db_key] = value;
                }
                else if (typeof value === 'object') {
                    db_key_values[db_key] = self.parseRequestToDBKeys(value);
                } else {
                    if (request_attributes[key].trim() !== '') {

                        db_key_values[db_key] = value;
                    }
                }
            }
        }
        return db_key_values;
    };
    this.parseDBToResponseKeys = function(db_key_values) {
        // console.log(db_key_values);
        var response_key_values = {};
        var dbToResponseKeys = self.reverseKeyValuePairs(self.requestToDBKeys);
        // console.log(dbToResponseKeys);
        for (var key in db_key_values) {
            if (dbToResponseKeys[key.toString()] && db_key_values[key]) {
                var db_key = dbToResponseKeys[key.toString()];
                var value = db_key_values[key];
                if (typeof value === 'object') {
                    response_key_values[db_key] = self.parseDBToResponseKeys(value);
                } else {
                    response_key_values[db_key] = value;
                }
            }
        }
        return response_key_values;
    };
    this.addRegexOption = function(value, caseSensitive) {
        if (!caseSensitive) {
            // value = '^' + value + '$';
            return {
                '$regex': value,
                $options: 'i'
            }
        }
        return {
            '$regex': value
        }
    };
};
module.exports.Utils = Utils;