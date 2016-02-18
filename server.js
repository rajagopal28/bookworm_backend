var mongoose = require('mongoose')
    , mongodb = require('mongodb')
    , express = require('express')
    , app = express()
    , crypto = require('crypto')
    , morgan = require('morgan')
    , logUtil = require('util')
    , fs = require('fs')
    , path = require('path')
    , https = require('https')
    , querystring = require('querystring')
    , multipart = require('connect-multiparty')
    , formData = require('form-data')
    , bodyParser = require('body-parser')
    , favicon = require('serve-favicon')
    , nodemailer = require('nodemailer')
    , smtpTransport = require('nodemailer-smtp-transport')
    , utils = require('./server/utils/common-util')
    , mailer = require('./server/utils/mailer-util')
    , book = require('./server/models/book')
    , user = require('./server/models/user')
    , forum = require('./server/models/forum')
    , SERVER_HOST_IP = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1'
    , SERVER_HOST_PORT = process.env.OPENSHIFT_NODEJS_PORT || 8080
    , socketServer = app.listen(
        SERVER_HOST_PORT,
        SERVER_HOST_IP,
        function(){
        console.log((new Date())
            + ' Server is listening on port '
            + SERVER_HOST_PORT
            + 'on ip address '
            + SERVER_HOST_IP);
    }), io = require('socket.io')(socketServer, {
        serveClient: true,
        path: '/socket.io'
    })
    , methodOverride = require('method-override');
//io.set('transports',['xhr-polling']);
/* Models */
var mUtils = new utils.Utils();
var Mailer = new mailer.Mailer(nodemailer, smtpTransport,  mUtils);
var Books = new book.Book(mongoose, mUtils);
var Users = new user.User(mongoose, crypto, mUtils);
var Forums = new forum.Forum(mongoose, mUtils);
/*** Global Variables*/
var serverConfigJSON;
var socket;
/*** Constants ***/
var constants = mUtils.constants;
console.log(mongoose.connection.readyState);


readConfigToSession(null, function(configFile) {
    Mailer.setSMTPConfig(configFile[constants.SMTP_CONFIG_KEY]);
    if (mongoose.connection.readyState != mongoose.Connection.STATES.connected) {
        var mongoConfig = configFile[constants.MONGO_CONFIG_KEY];
        if(mongoConfig) {
            var connectionString = mongoConfig.connectionPrefix
                                    + mongoConfig.user
                                    + '@'
                                    + mongoConfig.host
                                    + ':'
                                    + mongoConfig.port
                                    + '/'
                                    + mongoConfig.database;
            if(process
                && process.env
                && process.env.OPENSHIFT_MONGODB_DB_PASSWORD){
                  connectionString = process.env.OPENSHIFT_MONGODB_DB_USERNAME + ":" +
                  process.env.OPENSHIFT_MONGODB_DB_PASSWORD + "@" +
                  process.env.OPENSHIFT_MONGODB_DB_HOST + ':' +
                  process.env.OPENSHIFT_MONGODB_DB_PORT + '/' +
                  process.env.OPENSHIFT_APP_NAME;
            }
            mongoose.connect(connectionString);
        }
    }
});


var db = mongoose.connection;

db.once(constants.DB_EVENT_NAME_OPEN, function () {
    console.log('MongoDB connection successful.');
});

// all environments
accessLogStream = fs.createWriteStream(__dirname + constants.LOG_FILE_RELATIVE_PATH, {flags: 'a'});
app.set(constants.APP_ENV_VAR_PORT, process.env.PORT || constants.ENV_VALUE_DEFAULT_PORT);
app.use(express.static(path.join(__dirname, constants.EXPRESS_CONFIG_STATIC_DIR)));
app.use(favicon(__dirname + constants.APP_FAV_ICON_PATH));
app.use(morgan(constants.MORGAN_LOG_TYPE_COMBINED, {stream: accessLogStream}));
app.use(multipart());
app.use(bodyParser.json({type: constants.APP_BODY_PARSER_APPLICATION_JSON}));
app.use(methodOverride(constants.APP_X_HTTP_METHOD_OVERRIDE_HEADER));
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}));
// parse application/json
app.use(bodyParser.json());
// allow cross origin access
app.use(function (req, res, next) {
    res.setHeader(constants.APP_HEADER_ACCESS_CONTROL_ALLOW_ORIGIN, constants.APP_HEADER_VALUE_ACCESS_ALL_ORIGIN);
    res.setHeader(constants.APP_HEADER_ACCESS_CONTROL_ALLOW_METHODS, constants.APP_HEADER_VALUE_ALLOWED_METHOD_GET_POST);
    res.setHeader(constants.APP_HEADER_ACCESS_CONTROL_ALLOW_HEADERS, constants.APP_HEADER_VALUE_ALLOWED_HEADERS);
    next();
});
// routes ======================================================================
// api ---------------------------------------------------------------------
app.post('/bookworm/api/books/rental/add',ensureAuthorized,
    function (req, res) {
        console.log('Renting books');
        var inputParams = req.body;
        console.log(inputParams);
        var item = mUtils.parseRequestToDBKeys(inputParams);
        if (item.book_name) {
            console.log('has book details');
            item.is_available = true;
            Books.addNewBook(item, function (error, new_rental_book) {
                if (error) {
                    res.json(error);
                } else {
                    res.json({success : true, item :new_rental_book});
                    // send email to thank contribution
                    if(new_rental_book.contributor
                        && new_rental_book.contributor.username
                        && req.token) {
                        Users.incrementContributionOfUser(new_rental_book.contributor.username,
                            req.token, function(err, item){
                                console.log(item);
                                if(err){
                                    console.error(err);
                                } else if(item){
                                    Mailer.sendNewBookLendingConfirmation(new_rental_book, item);
                                    console.log('thanks email sent');
                                }
                            });
                    }
                }
            });
        } else {
            res.json({success: false, error : constants.ERROR_MISSING_FIELDS});
        }
});

app.post('/bookworm/api/books/rental/update',ensureAuthorized,
    function (req, res) {
        var inputParams = req.body;
        console.log(inputParams);
        var item = mUtils.parseRequestToDBKeys(inputParams);
        if (item._id && req.token) {
            Books.updateBookDetails(item, function (error, item) {
               if (error) {
                    res.send(error);
                } else {
                    res.json({success : true, item : item});
                }
            });
        } else {
            res.json({success: false, error : constants.ERROR_MISSING_FIELDS});
        }
});

app.post('/bookworm/api/books/rental/request',ensureAuthorized,
    function (req, res) {
        var inputParams = req.body;
        var item = mUtils.parseRequestToDBKeys(inputParams);
        if (item.borrower_name && item.contributor) {
            Users.findUsersWithUsernames([item.borrower_name, item.contributor.username],
                function(err, items){
                    if(err) {
                        res.send({success : false, error : constants.DEFAULT_ERROR_MSG});
                    } else {
                        if(items && items.length === 2) {
                            Mailer.sendBookRequestEmail(items, item);
                            res.json({success : true});
                        }
                    }
                });
        } else {
            res.json({success: false, error : constants.ERROR_MISSING_FIELDS});
        }
});


app.get('/bookworm/api/books/rental/all', function (req, res) {
    var inputParams = req.query;
    var searchQuery = mUtils.parseRequestToDBKeys(inputParams);
    var pagingSorting = mUtils.getPagingSortingData(searchQuery);
    console.log(pagingSorting);
    searchQuery = Books.buildSearchQuery(searchQuery, mUtils);
    console.log(searchQuery);
    Books.findPagedBookItems(searchQuery,
        pagingSorting,
        function (err, items, totalCount) {
            if (err) {
                res.send(err);
            } else {
                var parsedItems = mUtils.parseDBToResponseKeys(items);
                res.json({
                    totalItems : totalCount,
                    items : parsedItems
                });
            }
        });
});

app.post('/bookworm/api/user/profile-upload', ensureAuthorized,
    function (req, res) {
    // read config parameter
    var configJSON = serverConfigJSON;
    // console.log(configJSON);
    var now = mUtils.resetTimeToGMT(new Date()).getTime();
    if(!configJSON
        || !configJSON.cloudConfig
        || !configJSON.cloudConfig.expirationTimeStamp) {
        // I do not have a valid config in server session so read from file
        readConfigToSession(res, function(configJSON){
            // console.log(configJSON);
            if(configJSON &&
                configJSON.cloudConfig ){
                // I have read configuration now
                if(now > 1 * configJSON.cloudConfig.expirationTimeStamp) {
                    // if login auth expired login and then upload
                    loginToCloudEnvironment(configJSON.cloudConfig, function (addedTokenInfo) {
                        if(addedTokenInfo) {
                            configJSON.cloudConfig.csrftoken = addedTokenInfo.csrftoken;
                            configJSON.cloudConfig.sessionid = addedTokenInfo.sessionid;
                            configJSON.cloudConfig.expirationTimeStamp = new Date(addedTokenInfo.expirationTimestamp).getTime();
                            console.log(logUtil.inspect( 'after logging in'));
                            console.log(logUtil.inspect(now));
                            console.log(logUtil.inspect(configJSON.cloudConfig.expirationTimeStamp));
                            uploadFileToCloud(req, configJSON, function (response) {
                                if(response && response.fileName) {
                                    console.log(response);
                                    res.json({success : true,
                                        fileAbsolutePath : configJSON.cloudConfig.uploadedImagesDirectory + response.fileName
                                    });
                                } else {
                                    console.log(constants.ERROR_FILE_UPLOAD_FAILED);
                                    res.json({success: false, error : constants.ERROR_FILE_UPLOAD_FAILED});
                                }
                            });
                            // write the newly created config tokens
                            writeConfigToFile(configJSON);
                        } else {
                            console.log(constants.ERROR_CLOUD_LOGIN_FAILED);
                            res.json({success: false, error : constants.ERROR_CLOUD_LOGIN_FAILED});
                        }
                    });
                } else {
                    console.log(logUtil.inspect( 'not logging in'));
                    console.log(logUtil.inspect(now));
                    console.log(logUtil.inspect(configJSON.cloudConfig.expirationTimeStamp));
                    // here the auth token is still valid so just upload
                    uploadFileToCloud(req, configJSON, function(response) {
                        if(response && response.fileName) {
                            console.log(response);
                            res.json({success : true,
                                fileAbsolutePath : configJSON.cloudConfig.uploadedImagesDirectory + response.fileName
                            });
                        } else {
                            console.log(constants.ERROR_FILE_UPLOAD_FAILED);
                            res.json({success: false, error : constants.ERROR_FILE_UPLOAD_FAILED});
                        }
                    });
                }
            }

        });
    }
    if(configJSON && configJSON.cloudConfig
        && configJSON.cloudConfig.expirationTimeStamp ) {
        // if I have config but the token has expired
        if(now > 1 * configJSON.cloudConfig.expirationTimeStamp) {
            // if login auth expired login and then upload
            loginToCloudEnvironment( configJSON.cloudConfig, function (addedTokenInfo) {
                if(addedTokenInfo){
                    configJSON.cloudConfig.csrftoken = addedTokenInfo.csrftoken;
                    configJSON.cloudConfig.sessionid = addedTokenInfo.sessionid;
                    configJSON.cloudConfig.expirationTimeStamp = new Date(addedTokenInfo.expirationTimestamp).getTime();
                    console.log( 'kk - after logging in');
                    console.log(logUtil.inspect(now));
                    console.log(logUtil.inspect(configJSON.cloudConfig.expirationTimeStamp));
                    uploadFileToCloud(req, configJSON, function (response) {
                        if(response && response.fileName) {
                            console.log(response);
                            res.json({success : true,
                                fileAbsolutePath : configJSON.cloudConfig.uploadedImagesDirectory + response.fileName
                            });
                        } else {
                            console.log(constants.ERROR_FILE_UPLOAD_FAILED);
                            res.json({success: false, error : constants.ERROR_FILE_UPLOAD_FAILED});
                        }
                    });
                    // write the newly created config tokens
                    writeConfigToFile(configJSON);
                } else {
                    console.log(constants.ERROR_FILE_UPLOAD_FAILED);
                    res.json({success: false, error : constants.ERROR_FILE_UPLOAD_FAILED});
                }
            });
        } else {
            console.log( 'kk - not logging in');
            console.log(logUtil.inspect(now));
            console.log(logUtil.inspect(configJSON.cloudConfig.expirationTimeStamp));
            // here the auth token is still valid so just upload
            uploadFileToCloud(req,  configJSON, function(response) {
               if(response && response.fileName) {
                    console.log(response);
                    res.json({success : true,
                        fileAbsolutePath : configJSON.cloudConfig.uploadedImagesDirectory + response.fileName
                    });
                } else {
                    console.log(constants.ERROR_FILE_UPLOAD_FAILED);
                    res.json({success: false, error : constants.ERROR_FILE_UPLOAD_FAILED});
                }
            });
        }
    }
});

app.post('/bookworm/api/users/check-unique',
    function (req, res) {
        var inputParams = req.body;
        var searchQuery = mUtils.parseRequestToDBKeys(inputParams);
        if (searchQuery.username) {
            Users.checkUniqueUsername(searchQuery,
                function (err, items) {
                if (err) {
                    res.send(err);
                } else {
                    var isUsernameAvailable = items.length === 0;
                    res.json({isUsernameAvailable: isUsernameAvailable});
                }
            });
        } else {
            res.json({success: false, error : constants.ERROR_MISSING_FIELDS});
        }
});
app.post('/bookworm/api/users/login-auth',
    function (req, res) {
        var inputParams = req.body;
        var searchQuery = mUtils.parseRequestToDBKeys(inputParams);
        if (searchQuery.username) {
            Users.authenticateUser(searchQuery, function (err, response) {
                if (err) {
                    res.send(err);
                } else {
                    console.log(response);
                    response = mUtils.parseDBToResponseKeys(response);
                    res.json(response);
                }
            });
        } else {
            res.json({success: false, error : constants.ERROR_MISSING_FIELDS});
        }
});
app.post('/bookworm/api/users/register',
    function (req, res) {
        var personal_info = mUtils.parseRequestToDBKeys(req.body);
        console.log(personal_info);
        if (personal_info.first_name)// check for not empty
        {
            Users.addNewUser(personal_info,
                function (err, item) {
                    if (err) {
                        res.send(err);
                        console.error(JSON.stringify(err));
                    } else {
                        res.json({success : true, item : item});
                        console.log('Success insertion: ' + JSON.stringify(item));
                        Mailer.sendRegistrationConfirmation(item);// send email for confirmation
                    }
                });
        } else {
            res.json({success: false, error : constants.ERROR_MISSING_FIELDS});
        }
});
app.post('/bookworm/api/users/update', ensureAuthorized,
    function (req, res) {
        var personal_info = mUtils.parseRequestToDBKeys(req.body);
        var token = req.token;
        if (personal_info._id && token)// check for not empty
        {
            Users.updateExistingUser(personal_info,
                token,
                function (err, items) {
                    if (err) {
                        res.send(err);
                        console.error(JSON.stringify(err));
                    } else {
                        res.json({success : true, item : items});
                        console.log('Success insertion: ' + JSON.stringify(items));
                        Mailer.sendProfileUpdateConfirmation(personal_info);
                    }
                });
        } else {
            res.json({success: false, error : constants.ERROR_MISSING_FIELDS});
        }
});

app.get('/bookworm/api/users/all',
    function (req, res) {
        var searchQuery = mUtils.parseRequestToDBKeys(req.query);
        searchQuery = Users.buildSearchQuery(searchQuery);
        var pagingSorting = mUtils.getPagingSortingData(searchQuery);
        console.log(searchQuery);
        Users.findUsersPaged(searchQuery,
            pagingSorting,
            function (err, items, totalCount) {
                if (err) {
                    res.send(err);
                    console.error(JSON.stringify(err));
                } else {
                    var parsedItems = mUtils.parseDBToResponseKeys(items);
                    res.json({
                        'totalItems' : totalCount,
                        'items' : parsedItems
                    });
                }
            });
});

app.post('/bookworm/api/forums/add',ensureAuthorized,
    function (req, res) {
        console.log(req.body);
        var forum_item = mUtils.parseRequestToDBKeys(req.body);
        console.log(forum_item);
        if (forum_item.forum_title)// check for not empty
        {
            Forums.addNewForum(forum_item,
                function (error, new_forum) {
                    if (error) {
                        res.json(error);
                    } else {
                        res.json({success : true, item :new_forum});
                    }
                });
        } else {
            res.json({success: false, error : constants.ERROR_MISSING_FIELDS});
        }
});

app.post('/bookworm/api/forums/update',ensureAuthorized,
    function (req, res) {
        console.log(req.body);
        var forum_item = mUtils.parseRequestToDBKeys(req.body);
        console.log(forum_item);
        if (forum_item._id)// check for not empty
        {
            Forums.updateForum(forum_item, function(error, new_forum){
                if (error) {
                    res.json(error);
                } else {
                    res.json({success : true, item :new_forum});
                }
            });
        } else {
            res.json({success: false, error : constants.ERROR_MISSING_FIELDS});
        }
});

app.post('/bookworm/api/forums/chats/add',ensureAuthorized,
    function (req, res) {
        console.log(req.body);
        var chat_item = mUtils.parseRequestToDBKeys(req.body);
        console.log(chat_item);
        if (chat_item.forum_id)// check for not empty
        {
            Forums.addChatInForum(chat_item,
                function (error, new_forum) {
                    if (error) {
                        res.send(error);
                    } else {
                        if (socket) {
                            var item = {};
                            item.forumId = new_forum._id;
                            chat_item.created_ts = new Date();
                            item.chat = mUtils.parseDBToResponseKeys(chat_item);
                            console.log('in socket');
                            socket.emit(constants.SOCKET_EVENT_NEW_CHAT, item);
                        }
                        res.json({success : true, item :new_forum});
                    }

                });
        } else {
            res.json({success: false, error : constants.ERROR_MISSING_FIELDS});
        }
});

app.get('/bookworm/api/forums/all', function (req, res) {
    var inputParams = req.query;
    var searchQuery = mUtils.parseRequestToDBKeys(inputParams);
    var pagingSorting = mUtils.getPagingSortingData(searchQuery);
    searchQuery = Forums.buildSearchQuery(searchQuery);
    Forums.findForumsPaged(searchQuery,
        pagingSorting,
        function (err, items, totalCount) {
            if (err) {
                res.send(err);
            } else {
                console.log(items);
                var parsedItems = mUtils.parseDBToResponseKeys(items);
                console.log(parsedItems);
                res.json({
                    items : parsedItems,
                    totalItems : totalCount
                });
            }
        });
});

app.get('/bookworm/api/forums/chats/all',
    function (req, res) {
        var inputParams = req.query;
        var searchQuery = mUtils.parseRequestToDBKeys(inputParams);
        searchQuery = Forums.buildSearchQuery(searchQuery);
        Forums.getChatsOfForum(searchQuery, function (err, forum) {
            if (err) {
                res.send(err);
            } else {
                var parsed = mUtils.parseDBToResponseKeys(forum);
                console.log(parsed);
                res.send(parsed);
            }
        });
});

app.get('/bookworm/api/config', function (req, res) {
    readConfigToSession(res, function(configJSON) {
         res.json(configJSON[constants.CLIENT_CONFIG_KEY]);
    });
});

app.post('/bookworm/api/feedback/add',
    function (req, res) {
        console.log(req.body);
        var feedback_item = mUtils.parseRequestToDBKeys(req.body);
        console.log(feedback_item);
        if (feedback_item.feedback_text)// check for not empty
        {
            Mailer.sendFeedbackEmail(feedback_item);
            res.json({success : true, item : feedback_item});
        } else {
            res.json({success: false, error : constants.ERROR_MISSING_FIELDS});
        }
});

app.get('/test/test', ensureAuthorized, function (req, res) {
    var rent = db.collection('rent_books');
    rent.find({}).toArray(function (err, items) {
        if (err) {
            res.send(err);
        } else {
            res.send(items);
        }
    });
});

app.get('/test/test1', function (req, res) {
    Books.Model.find().exec(function (err, items) {
        if (err) {
            res.send(err);
        } else {
            // console.log(items);
            var parsedItems = [];
            for (var index = 0; index < items.length; index++) {
                parsedItems.push(mUtils.parseDBToResponseKeys(items[index]));
            }
            res.send(parsedItems);
        }
    });
});

// application -------------------------------------------------------------
app.get('*', function (req, res) {
    res.sendFile(__dirname + '/public/index-dev.html'); // load the single view file (angular will handle the page changes on the front-end)
});
function ensureAuthorized(req, res, next) {
    var bearerToken;
    var bearerHeader = req.headers[constants.REQ_HEADER_AUTHORIZATION];
    if (bearerHeader) {
        var bearer = bearerHeader.split(' ');
        bearerToken = bearer[1];// because bearer[0] === 'Bearer'
        Users.getCountOfUsers({token: bearerToken},
            function(err, totalCount){
                if(err || totalCount === 0){
                    res.sendStatus(403);
                } else {
                    req.token = bearerToken;
                    next();
                }
            });
    } else {
        res.sendStatus(403);
    }
}
function writeConfigToFile(newConfig){
    fs.writeFile(__dirname + constants.CONFIG_FILE_RELATIVE_PATH, JSON.stringify(newConfig), function(err) {
        console.log(err);
    });
}
function readConfigToSession(res, callback) {
    fs.readFile(__dirname + constants.CONFIG_FILE_RELATIVE_PATH
        , constants.FORMAT_UTF_8
        , function (err,data) {
          if (err && res) {
            res.send(err);
          } else {
            var configJSON = JSON.parse(data);
            if(configJSON) {
                serverConfigJSON = configJSON;
                callback(configJSON);
            }
          }
        });
}
function loginToCloudEnvironment(cloudConfig, callback){
    var data = querystring.stringify({
            login : cloudConfig.username,
            password : cloudConfig.password
        });
        var options = {
          host: cloudConfig.host,
          port: cloudConfig.port,
          path: cloudConfig.loginAuthPath,
          method: constants.METHOD_POST,
          headers: {
            'Content-Type': constants.FORM_TYPE_URL_ENCODED,
            'Content-Length': Buffer.byteLength(data)
          }
        };
        var buff = '';
        var config = {};
        var apiRequest = https.request(options, function(apiRes) {
            var setCookie = apiRes.headers[constants.HEADER_SET_COOKIE];
            for(var index=0; index< setCookie.length; index++) {
                var cookieItem = setCookie[index];
                var segments = cookieItem.split(';');
                if (cookieItem.indexOf(constants.COOKIE_VAR_STRING_CSFR_TOKEN_PREFIX) != -1) {
                    var temp = segments[0].trim();
                    var startIndex = temp.indexOf(constants.COOKIE_VAR_STRING_CSFR_TOKEN_PREFIX)
                                        + constants.COOKIE_VAR_STRING_CSFR_TOKEN_PREFIX.length;
                    config.csrftoken = temp.substring(startIndex);
                }
                if(cookieItem.indexOf(constants.COOKIE_VAR_STRING_SESSION_ID_PREFIX) != -1) {
                    temp = segments[0].trim();
                    var startIndex = temp.indexOf(constants.COOKIE_VAR_STRING_SESSION_ID_PREFIX)
                                        + constants.COOKIE_VAR_STRING_SESSION_ID_PREFIX.length;
                    config.sessionid = temp.substring(startIndex);
                    temp = segments[1].trim();
                    var endIndex = temp.indexOf(constants.COOKIE_VAR_STRING_EXPIRES_PREFIX);
                    config.expirationTimestamp = temp.substring(endIndex + constants.COOKIE_VAR_STRING_EXPIRES_PREFIX.length).trim();
                }
            }
            apiRes.setEncoding(constants.FORMAT_UTF_8);
            apiRes.on(constants.HTTP_REQUEST_EVENT_NAME_DATA
                , function (chunk) {
                  buff+= chunk;
                });
            apiRes.on(constants.HTTP_REQUEST_EVENT_NAME_END
                , function() {
                    //console.log(buff);
                    callback(config);
                });
        });
        apiRequest.on(constants.HTTP_REQUEST_EVENT_NAME_ERROR
                    , function (error) {
                        console.error(error);
                        callback(null);
                    });
        apiRequest.write(data);
        apiRequest.end();
}
function uploadFileToCloud(req, serverConfig, callback) {
    var cloudConfig = serverConfig.cloudConfig;
    var ACCEPTED_FILE_PATHS = serverConfig.acceptedImageFormats;
    var cloudFileName = req.body.username;
    var fileExtension = path.extname(req.files.file.name).toLowerCase();
    var tempPath = req.files.file.path,
        targetPath = constants.TEMP_FILE_PATH
                        + cloudFileName
                        + fileExtension;
    if(req.files.file.length > constants.MAX_FILE_UPLOAD_SIZE) {
        console.error('FILE LIMIT EXCEEDED');
        callback(null);
        return;
    }
    if (ACCEPTED_FILE_PATHS
        && fileExtension
        && ACCEPTED_FILE_PATHS.indexOf(fileExtension) !== -1) {
        fs.rename(tempPath, targetPath, function(err) {
            if (err) {
                console.log('Error!');
                console.error(err);
              } else {
                var someForm = new formData();
                someForm.append(constants.REQUEST_PARAM_CLOUD_FILE_NAME, fs.createReadStream(targetPath));
                var fileHeader = someForm.getHeaders();
                someForm.getLength(function(err,length){
                    fileHeader[constants.HEADER_CONTENT_LENGTH] = length;
                    fileHeader.cookie = cloudConfig.cookieString
                        + ' '
                        + constants.COOKIE_VAR_STRING_CSFR_TOKEN_PREFIX
                        + cloudConfig.csrftoken +';'
                        + ' '
                        + constants.COOKIE_VAR_STRING_SESSION_ID_PREFIX
                        + cloudConfig.sessionid ;
                    fileHeader.referer = cloudConfig.referer;
                    fileHeader.origin = cloudConfig.origin;
                    fileHeader[constants.HEADER_X_CSRF_TOKEN] = cloudConfig.csrftoken;
                    fileHeader[constants.HEADER_ACCEPT_ENCODING] =  constants.DEFAULT_ACCEPT_HEADER_FOR_UPLOAD;
                    console.log(fileHeader);
                    var options = {
                        host: cloudConfig.host,
                        port: cloudConfig.port,
                        path: cloudConfig.docUploadPath,
                        headers: fileHeader,
                        method: constants.METHOD_POST
                    };
                    var apiReq = https.request(options, function(apiRes){
                        console.log('STATUS: ' + apiRes.statusCode);
                        console.log('HEADERS: ' + JSON.stringify(apiRes.headers));
                        apiRes.setEncoding(constants.FORMAT_UTF_8);
                        var buff= '';
                        apiRes.on(constants.HTTP_REQUEST_EVENT_NAME_DATA
                            , function (chunk) {
                              buff+= chunk;
                            });
                        apiRes.on(constants.HTTP_REQUEST_EVENT_NAME_END
                            , function() {
                                // console.log(buff);
                                fs.unlink(targetPath);
                                callback({fileName : cloudFileName + fileExtension, apiResponseString :buff});
                            });
                    });
                    someForm.pipe(apiReq);
                    apiReq.on(constants.HTTP_REQUEST_EVENT_NAME_ERROR
                        , function (error) {
                            console.error(error);
                            callback(null);
                        });
                });
              }
        });
    } else {
        console.error('Unknown file type');
    }
}
// socket IO -----------------------------------------------------------------
io.sockets.on(constants.SOCKET_EVENT_CONNECTION, function (mSocket) {
    socket = mSocket;
    console.log('new socket connection');
});