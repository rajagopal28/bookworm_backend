function Utils() {
    'use strict';
    var self = this;
    this.constants = {
        VARIABLE_TYPE_OBJECT : 'object',
        PATTERN_TO_MATCH_FORMATTER_MESSAGE : /\{(\d+)\}/g,
        RESET_TO_GMT_TIME_MINUTES_IN_MILLI : (60 * 1000),
        FORM_TYPE_URL_ENCODED :'application/x-www-form-urlencoded',
        HEADER: {
            X_CSRF_TOKEN : 'X-CSRFToken',
            ACCEPT_ENCODING: 'Accept-Encoding',
            SET_COOKIE : 'set-cookie',
            CONTENT_LENGTH : 'content-length'
        },
        APP : {
            ENV_VAR_PORT : 'port',
            FAV_ICON_PATH : '/public/static/images/favicon.ico',
            BODY_PARSER_APPLICATION_JSON : 'application/vnd.api+json',
            X_HTTP_METHOD_OVERRIDE_HEADER : 'X-HTTP-Method-Override',
            HEADER : {
                ACCESS_CONTROL_ALLOW_ORIGIN : 'Access-Control-Allow-Origin',
                ACCESS_CONTROL_ALLOW_HEADERS : 'Access-Control-Allow-Headers',
                VALUE_ACCESS_ALL_ORIGIN : '*',
                VALUE_ALLOWED_METHOD_GET_POST : 'GET, POST',
                ACCESS_CONTROL_ALLOW_METHODS : 'Access-Control-Allow-Methods',
                VALUE_ALLOWED_HEADERS : 'X-Requested-With,content-type, Authorization'
            }
        },
        DEFAULT_ACCEPT_HEADER_FOR_UPLOAD: 'gzip, deflate',
        METHOD_POST : 'POST',
        FORMAT_UTF_8: 'utf8',
        COOKIE_VAR_STRING : {
            CSFR_TOKEN_PREFIX : 'csrftoken=',
            SESSION_ID_PREFIX : 'sessionid=',
            EXPIRES_PREFIX : 'expires='
        },
        REQUEST_PARAM_CLOUD_FILE_NAME : 'file',
        REQ_HEADER_AUTHORIZATION : 'authorization',
        LOG_FILE_RELATIVE_PATH : '/server/logfile.log',
        CONFIG_FILE_RELATIVE_PATH : '/server/config.json',
        TEMP_FILE_PATH : './public/static/images/',
        SOCKET_EVENT_CONNECTION : 'connection',
        SOCKET_EVENT_NEW_CHAT: 'new-chat',
        HTTP_REQUEST_EVENT_NAME : {
            DATA : 'data',
            END : 'end',
            ERROR : 'error'
        },
        ERROR: {
            FILE_UPLOAD_FAILED : 'Unable to upload file to cloud!!',
            MISSING_FIELDS : 'Missing one or more required fields',
            INVALID_ACCOUNT : 'Invalid Input',
            ACCOUNT_NOT_VERIFIED : 'Your email is not verified!',
            INVALID_CREDENTIAL : 'Current password incorrect',
            INVALID_RESET_LINK : 'Reset password link expired',
            CLOUD_LOGIN_FAILED : 'Unable to login to cloud!!',
            DEFAULT : 'Sorry!! Something went wrong! Try after sometime!'
        },
        SMTP_CONFIG_KEY : 'smtpConfig',
        MONGO_CONFIG_KEY : 'mongoConfig',
        CLIENT_CONFIG_KEY : 'clientConfig',
        DB_EVENT_NAME_OPEN : 'open',
        EXPRESS_CONFIG_STATIC_DIR : 'public',
        MORGAN_LOG_TYPE_COMBINED : 'combined',
        ENV_VALUE_DEFAULT_PORT : 8080,
        MAX_FILE_UPLOAD_SIZE : 5242880,
        SCHEMA_HOOK : {
            UPDATE : 'update',
            SAVE : 'save'
        },
        FIELD : {
            PASSWORD : 'password',
            USERNAME : 'username',
            CONTRIBUTOR : 'contributor',
            AUTHOR : 'author',
            AUTHOR_IN_CHATS : 'chats.author'
        },
        DEFAULT_PASSWORD_RESET_EXPIRATION : (1000 * 60 * 60 * 24 * 5), //<-- 5 days
        CRYPTO_DEFAULT_ITERATIONS : 10000,
        STRING_ENCODING_BASE_64 : 'base64',
        SALT_STRING_RANDOM_CHIPHER : 'L0nd0n6rdi9eIsF@11in9DownTwink1eTwin1eLitt1e5t@r',
        RANDOM_STRING_LENGTH_64 : 64,
        HASH_ALGO_SHA_16 : 'sha512',
        MODELS : {
            FORUM : 'Forum',
            USER : 'User',
            BOOK : 'Book'
        }
    };
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
        'exchangeOnly': 'exchange_only',
        'referredBook': 'referred_book',
        'chats': 'chats',
        'chatComment': 'chat_comment',
        'pageNumber' : 'page_number',
        'itemsPerPage' : 'items_per_page',
        'primarySort' : 'primary_sort',
        'contributor' : 'contributor',
        'contributions' : 'contributions',
        'borrowerName' : 'borrower_name',
        'feedbackComment' : 'feedback_text',
        'feedbackType' : 'feedback_type',
        'currentPassword' : 'current_password',
        'query' : 'query',
        'identifier':'identifier'
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
            if (o && typeof o === self.constants.VARIABLE_TYPE_OBJECT && o !== null) {
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
        if (typeof keyValuePairJSON !== self.constants.VARIABLE_TYPE_OBJECT ||
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
            // skip all till previous page
            pagingSortingData.skipCount = (params[requestToDBKeys.pageNumber] -  1)
                * params[requestToDBKeys.itemsPerPage];
            pagingSortingData.itemsPerPage = params[requestToDBKeys.itemsPerPage]
        }
        if(params[requestToDBKeys.primarySort]) {
            var sort = params[requestToDBKeys.primarySort];
            for(var key in sort) {
                if(sort.hasOwnProperty(key)){
                    pagingSortingData.sortField = key;
                    if('desc' === sort[key]){
                        pagingSortingData.sortField = '-' + key;
                    }
                }
            }
        }
        delete params[requestToDBKeys.pageNumber];
        delete params[requestToDBKeys.itemsPerPage];
        delete params[requestToDBKeys.primarySort];
        return pagingSortingData;
    };
    this.getDateFromCookieString = function(dateStringFromCookie) {
        if(dateStringFromCookie) {
            var seperatorSpace = ' ';
        // cookie date format  'Wed, 27-Jan-2016 16:42:50 GMT'
        var startIndex,endIndex, temp;
        temp = dateStringFromCookie.split(' ');
        // now I have all the strings in array
        endIndex = temp[0].indexOf(',');
        var dayOfWeek = temp[0].substring(0, endIndex);// temp[0] = 'Wed,'
        var stringDate = temp[1];// temp[1] = 27-Jan-2016
        var stringTime = temp[2];// temp[2] = '16:42:50'
        var timeZone = temp[3];// temp[3] = 'GMT '

        temp = stringDate.split('-');
        var newDateString = dayOfWeek + seperatorSpace
                            + temp[1] + seperatorSpace // Jan
                            + temp[0] + seperatorSpace // 27
                            + temp[2] + seperatorSpace // 2016
                            + stringTime + seperatorSpace
                            + timeZone;
        return newDateString;
        // javascript date format 'Wed Jan 27 2016 16:42:508 GMT+0530 (IST)'
        }
    };
    this.resetTimeToGMT = function(dateObj) {

        return new Date(dateObj.getTime() + (dateObj.getTimezoneOffset() * self.constants.RESET_TO_GMT_TIME_MINUTES_IN_MILLI));
    };
    this.formatWithArguments = function(string, replacements) {
        return string.replace(self.constants.PATTERN_TO_MATCH_FORMATTER_MESSAGE, function() {
            return replacements[arguments[1]];
        });
    };
};
module.exports.Utils = Utils;