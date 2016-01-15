function Utils() {
    'use strict';
    var self = this;
    var requestToDBKeys = {
        'id': '_id',
        'firstName': 'first_name',
        'lastName': 'last_name',
        'gender': 'gender',
        'dob': 'dob',
        'email': 'email',
        'genres': 'genres',
        'isbn': 'isbn',
        'thumbnailURL': 'thumbnail_url',
        'bookName': 'book_name',
        'authSuccess': 'auth_success',
        'forumTitle': 'forum_title',
        'forumId': 'forum_id',
        'description': 'description',
        'username': 'username',
        'token': 'token',
        'password': 'password',
        'confirmPassword': 'password',
        'rememberMe': 'remember_me',
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
        'availableOnly': 'is_available',
        'exchangeOnly': 'exchange_only',
        'referredBook': 'referred_book',
        'chats': 'chats',
        'chatComment': 'chat_comment'
    };

    function reverseKeyValuePairs(key_value_pairs) {
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
    }

    var dbToResponseKeys = reverseKeyValuePairs(requestToDBKeys);
    this.parseRequestToDBKeys = function (requestAttributes) {
        return convertKeysAndMapValues(requestAttributes, requestToDBKeys, [requestToDBKeys.id, dbToResponseKeys._id]);
    };
    this.parseDBToResponseKeys = function (db_key_values) {
        return convertKeysAndMapValues(db_key_values, dbToResponseKeys, [requestToDBKeys.id, dbToResponseKeys._id]);
    };
    function convertKeysAndMapValues(keyValuePairJSON, keyToKeyMap, skipList) {
        if (typeof keyValuePairJSON !== 'object' ||
                keyValuePairJSON instanceof Date) {
            return keyValuePairJSON;
        } else {
            if (keyValuePairJSON instanceof Array) {
                var index;
                for (index = 0; index < keyValuePairJSON.length; index++) {
                    keyValuePairJSON[index] = convertKeysAndMapValues(keyValuePairJSON[index], keyToKeyMap, skipList);
                }
                return keyValuePairJSON;
            } else {
                var alteredKeyValuePairJSON = {}, key, value, changedKey;
                for (key in keyValuePairJSON) {
                    value = keyValuePairJSON[key];
                    changedKey = keyToKeyMap[key];
                    if (changedKey) {
                        console.log(changedKey);
                        if (skipList.indexOf(changedKey) === -1) {
                            alteredKeyValuePairJSON[changedKey] = convertKeysAndMapValues(value,keyToKeyMap, skipList);
                        } else {
                            alteredKeyValuePairJSON[changedKey] = value;
                        }
                    }
                }
                return alteredKeyValuePairJSON;
            }
        }
    }
    this.addRegexOption = function (value, caseSensitive) {
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