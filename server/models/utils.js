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
        'chatComment': 'chat_comment',
        'pageNumber' : 'page_number',
        'itemsPerPage' : 'items_per_page',
        'primarySort' : 'primary_sort',
        'sortKey' : 'sort_key',
        'sortOrder' : 'sort_order'
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
    function parseIfJSONString(someString) {
        try {
            var o = JSON.parse(someString);
            // Handle non-exception-throwing cases:
            // Neither JSON.parse(false) or JSON.parse(1234) throw errors, hence the type-checking,
            // but... JSON.parse(null) returns 'null', and typeof null === "object",
            // so we must check for that, too.
            if (o && typeof o === "object" && o !== null) {
                return o;
            }
        } catch (e) {
            // do nothing
        }
        return null;
    }
    var dbToResponseKeys = reverseKeyValuePairs(requestToDBKeys);
    this.parseRequestToDBKeys = function (requestAttributes) {
        return convertKeysAndMapValues(requestAttributes, requestToDBKeys, [requestToDBKeys.id, dbToResponseKeys._id]);
    };
    this.parseDBToResponseKeys = function (db_key_values) {
        return convertKeysAndMapValues(db_key_values, dbToResponseKeys, [requestToDBKeys.id, dbToResponseKeys._id]);
    };
    function convertKeysAndMapValues(keyValuePairJSON, keyToKeyMap, skipList) {
        var jsonCheck = parseIfJSONString(keyValuePairJSON);
        if(jsonCheck) {
            keyValuePairJSON = jsonCheck;
        }
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
                        // console.log(changedKey);
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
    this.getPagingSortingData = function(params) {
        var pagingSortingData = {};
        if(params[requestToDBKeys.pageNumber] &&
            params[requestToDBKeys.itemsPerPage]){
            pagingSortingData.skipCount = params[requestToDBKeys.pageNumber]
                * params[requestToDBKeys.itemsPerPage];
        }
        if(params[requestToDBKeys.primarySort] &&
            params[requestToDBKeys.primarySort][requestToDBKeys.sortKey]) {
            pagingSortingData.sortField = params[requestToDBKeys.primarySort][requestToDBKeys.sortKey];
            if('desc' === params[requestToDBKeys.primarySort][requestToDBKeys.sortKey]) {
                pagingSortingData.sortField = '-' + pagingSortingData.sortField;
            }
        }
        delete params[requestToDBKeys.pageNumber];
        delete params[requestToDBKeys.itemsPerPage];
        delete params[requestToDBKeys.primarySort];
        return pagingSortingData;
    };
};
module.exports.Utils = Utils;