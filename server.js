var http = require("http")
    , https = require("https")
    , querystring = require("querystring")
    , server = http.Server(app)
    , express = require("express")
    , app = express()
    , morgan = require('morgan')
    , fs = require('fs')
    , path = require('path')
    , json = require('express-json')
    , multipart = require('connect-multiparty')
    , formData = require('form-data')
    , methodOverride = require('method-override')
    , session = require('express-session')
    , errorHandler = require('errorhandler')
    , bcrypt = require('bcrypt')
    , utils = require('./server/models/utils')
    , book = require('./server/models/book')
    , user = require('./server/models/user')
    , forum = require('./server/models/forum')
    , mongoose = require('mongoose')
    , mongodb = require("mongodb")
    , bodyParser = require('body-parser')
    , favicon = require('serve-favicon')
    , socketServer = app.listen(8080)
    , io = require('socket.io')(socketServer, {
        serveClient: true,
        path: '/socket.io'
    });
//io.set('transports',['xhr-polling']);
/* Models */
var mUtils = new utils.Utils();
var Books = new book.Book(mongoose);
var Users = new user.User(mongoose, bcrypt);
var Forums = new forum.Forum(mongoose);
var socket;
console.log(mongoose.connection.readyState);
if (mongoose.connection.readyState != mongoose.Connection.STATES.connected) {
    mongoose.connect("mongodb://root@localhost:27017/admin");
}
var db = mongoose.connection;

db.once('open', function () {
    console.log('MongoDB connection successful.');
});

// all environments
accessLogStream = fs.createWriteStream(__dirname + '/server/logfile.txt', {flags: 'a'});
app.set('port', process.env.PORT || 8080);
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
//app.use(express.favicon());
app.use(favicon(__dirname + '/public/static/images/favicon.ico'));
app.use(morgan('dev'));
app.use(json());
app.use(multipart());
app.use(bodyParser.json({type: 'application/vnd.api+json'}));
app.use(methodOverride('X-HTTP-Method-Override'));
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}));
// parse application/json
app.use(bodyParser.json());
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: {secure: true}
}));

// development only
if ('development' === app.get('env')) {
    app.use(errorHandler());
}
// allow cross origin access
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
    next();
});
// routes ======================================================================
// api ---------------------------------------------------------------------
app.post('/bookworm/api/books/rental/add',ensureAuthorized,
    function (req, res) {
        console.log("Renting books");
        var inputParams = req.body;
        console.log(inputParams);
        var item = mUtils.parseRequestToDBKeys(inputParams);
        if (item.book_name) {
            console.log('has book details');
            item.is_available = true;
            var new_rental_book = new Books.Model(item);
            new_rental_book.save(function (error, new_rental_book) {
                if (error) {
                    res.send(error);
                }
                res.send(new_rental_book);
            });
        }
});

app.post('/bookworm/api/books/rental/update',ensureAuthorized,
    function (req, res) {
        var inputParams = req.body;
        console.log(inputParams);
        var item = mUtils.parseRequestToDBKeys(inputParams);
        if (item._id) {
            Books.Model.update({_id : item._id}, { $set : item }, {upsert : true},
                function (error, saved_rental_book) {
                if (error) {
                    res.send(error);
                }
                res.send(saved_rental_book);
            });
        }
});

app.get('/bookworm/api/books/rental/all', function (req, res) {
    var inputParams = req.query;
    var searchQuery = mUtils.parseRequestToDBKeys(inputParams);
    var pagingSorting = mUtils.getPagingSortingData(searchQuery);
    console.log(pagingSorting);
    searchQuery = Books.buildSearchQuery(searchQuery, mUtils);
    console.log(searchQuery);
    Books.Model.count(searchQuery,
        function(err,totalCount){
        if(err) {
            res.send(err);
        } else {
            Books.Model
                .find(searchQuery)
                .skip(pagingSorting.skipCount)
                .limit(pagingSorting.itemsPerPage)
                .sort(pagingSorting.sortField)
                .exec(function (err, items) {
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
        }
    });
});
app.get('/bookworm/api/forums/all', function (req, res) {
    var inputParams = req.query;
    var searchQuery = mUtils.parseRequestToDBKeys(inputParams);
    var pagingSorting = mUtils.getPagingSortingData(searchQuery);
    searchQuery = Forums.buildSearchQuery(searchQuery);
    Forums.Model.count(searchQuery, function(err, totalCount){
        if (err) {
            res.send(err);
        } else {
            Forums.Model.find(searchQuery)
            .select('-chats')
                .skip(pagingSorting.skipCount)
                .limit(pagingSorting.itemsPerPage)
                .sort(pagingSorting.sortField)
                .exec(function (err, items) {
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
        }

    });
    console.log(JSON.stringify(searchQuery));
});
app.get('/bookworm/api/forums/chats/all',
    function (req, res) {
        var inputParams = req.query;
        var searchQuery = mUtils.parseRequestToDBKeys(inputParams);
        searchQuery = Forums.buildSearchQuery(searchQuery);
        Forums.Model.findOne(searchQuery)
            .exec(function (err, forum) {
                if (err) {
                    res.send(err);
                } else {
                    var parsed = mUtils.parseDBToResponseKeys(forum);
                    console.log(parsed);
                    res.send(parsed);
                }
            });
});
app.post('/bookworm/api/users/check-unique',
    function (req, res) {
        var inputParams = req.body;
        var searchQuery = mUtils.parseRequestToDBKeys(inputParams);
        if (searchQuery.username) {
            Users.Model.find(searchQuery)
                .exec(function (err, items) {
                    if (err) {
                        res.send(err);
                    } else {
                        var isUsernameAvailable =
                            items.length === 0;
                        res.send({isUsernameAvailable: isUsernameAvailable});
                    }
                });
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
                    res.send(response);
                }
            });
        }
});
app.post('/bookworm/api/users/register',
    function (req, res) {
        var personal_info = mUtils.parseRequestToDBKeys(req.body);
        console.log(personal_info);
        if (personal_info.first_name)// check for not empty
        {
            var new_user = new Users.Model(personal_info);
            new_user.save(function (err, items) {
                if (err) {
                    res.send(err);
                    console.error(JSON.stringify(err));
                } else {
                    res.send(items);
                    console.log("Success insertion: " + JSON.stringify(items));
                }
            });
        } else {
            res.send();
        }
});
app.post('/bookworm/api/users/update', ensureAuthorized,
    function (req, res) {
        var personal_info = mUtils.parseRequestToDBKeys(req.body);
        var token = req.token;
        if (personal_info._id && token)// check for not empty
        {
            Users.Model.update({_id: personal_info._id , token : token},
                {$set : personal_info},
                { upsert : true},
                function (err, items) {
                    if (err) {
                        res.send(err);
                        console.error(JSON.stringify(err));
                    } else {
                        res.send(items);
                        console.log("Success insertion: " + JSON.stringify(items));
                    }
            });
        } else {
            res.send();
        }
});

app.get('/bookworm/api/users/all',
    function (req, res) {
        var searchQuery = mUtils.parseRequestToDBKeys(req.query);
        searchQuery = Users.buildSearchQuery(searchQuery);
        var pagingSorting = mUtils.getPagingSortingData(searchQuery);
        console.log(searchQuery);
        Users.Model.count(searchQuery, function(err, totalCount){
            if(err){
                res.send(err);
            } else {
                Users.Model
                    .find(searchQuery)
                    .select('-password')
                    .select('-token')
                    .skip(pagingSorting.skipCount)
                    .limit(pagingSorting.itemsPerPage)
                    .sort(pagingSorting.sortField)
                    .exec(function (err, items) {
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
            var forum = new Forums.Model(forum_item);
            forum.save(function (error, new_forum) {
                if (error) {
                    res.json(error);
                }
                res.json(new_forum);
            });
        } else {
            res.send({error : 'Invalid form data'});
        }
});

app.post('/bookworm/api/forums/chats/add',ensureAuthorized,
    function (req, res) {
        console.log(req.body);
        var chat_item = mUtils.parseRequestToDBKeys(req.body);
        console.log(chat_item);
        if (chat_item.forum_id)// check for not empty
        {
            var forum = Forums.Model
                .findOne({_id: chat_item.forum_id})
                .exec(function (error, forum_item) {
                    delete chat_item.forum_id;
                    if (forum_item) {
                        console.log(forum_item);
                        forum_item.chats.push(chat_item);
                        chat_item.created_ts = new Date();
                        forum_item.save(function (error, new_forum) {
                            if (error) {
                                res.send(error);
                            } else {
                                if (socket) {
                                    var item = {};
                                    item.forumId = forum_item._id;
                                    item.chat = mUtils.parseDBToResponseKeys(chat_item);
                                    console.log('in socket');
                                    socket.emit('new-chat', item);
                                }
                                res.json(new_forum);
                            }

                        });
                    }
                });

        } else {
            res.send();
        }
});

app.get('/bookworm/api/config', function (req, res) {
    fs.readFile(__dirname + '/server/config.json', 'utf8', function (err,data) {
      if (err) {
        res.send(err);
      } else {
          var configJSON = JSON.parse(data);
        res.json(configJSON["clientConfig"]);
      }
    });
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



app.get('/test/test2', function (req, res) {
    var data = querystring.stringify({
        login : 'rajagopal28',
        password : 'password'
    });
    // path: '/api/2/path/info/?format=json',
    var options = {
      host: 'rajagopal28.smartfile.com',
      port: 443,
      path: '/ftp/login/',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(data)
      }
    };
    var apiResponse = {};
    var buff = '';
    var config = {};
    var apiRequest = https.request(options, function(apiRes) {
        console.log('STATUS: ' + apiRes.statusCode);
        console.log('HEADERS: ' + JSON.stringify(apiRes.headers));
        config.headers = apiRes.headers;
        apiRes.setEncoding('utf8');
        apiRes.on('data', function (chunk) {
          buff+= chunk;
        });
        apiRes.on('end', function() {
            console.log(buff);
            res.send(buff);
        });
        apiResponse = apiRes;
    });
    apiRequest.write(data);
    apiRequest.end();
    // res.json([{ request : apiRequest},{ response : apiResponse}]);
});

app.get('/test/test3', function (req, res) {
    var options = {
        host: 'rajagopal28.smartfile.com',
        port: 443,
         path: '/api/2/path/info/ProfilePics/bay_max.gif?format=json',
        headers : {
            cookie : '_ga=GA1.2.1883368505.1453891337; ' +
            'optimizelyEndUserId=oeu1453891338904r0.5625616400502622; ' +
            'optimizelySegments=%7B%223018470184%22%3A%22gc%22%2C%223018720298%22%3A%22search%22%2C%223023000432%22%3A%22false%22%7D;' +
            ' optimizelyBuckets=%7B%7D;' +
            ' __hstc=20283623.368dbee3677a5c15a485ecf50bc702dd.1453891341364.1453891341364.1453891341364.1;' +
            ' __hssrc=1; hsfirstvisit=https%3A%2F%2Fwww.smartfile.com%2Fdeveloper%2F|https%3A%2F%2Fwww.google.co.in%2F|1453891341362;' +
            ' hubspotutk=368dbee3677a5c15a485ecf50bc702dd;' +
            ' _pk_ref.1.dc32=%5B%22%22%2C%22%22%2C1453891373%2C%22https%3A%2F%2Fwww.smartfile.com%2Fdeveloper%2F%22%5D;' +
            ' PRUM_EPISODES=s=1453892646058&r=https%3A//app.smartfile.com/ftp/login/;' +
            ' csrftoken=YXru14hrxgM0SAeo9QA8FDhv4zoEn7bc;' +
            ' sessionid=62115b93ff478de68ab87c8c647be902;' +
            ' _pk_id.1.dc32=91a58db4e853bb9b.1453891373.1.1453892687.1453891373.;' +
            ' _pk_ses.1.dc32=*; __zlcmid=YtfHekQLGTVouL'
        },
        method : 'GET'
    };
    /*"set-cookie": ["csrftoken=Ocy9ttyYW7EiLNp69rq4Ei8BRP7qTM8E; expires=Wed, 25-Jan-2017 16:22:51 GMT; Max-Age=31449600; Path=/",
                "sessionid=4330f0e1b17aab0201539be42fcdfb72; expires=Wed, 27-Jan-2016 16:42:50 GMT; Max-Age=1199; Path=/"] */
    var apiReq = https.request(options, function(apiRes){
        console.log('STATUS: ' + apiRes.statusCode);
        console.log('HEADERS: ' + JSON.stringify(apiRes.headers));
        apiRes.setEncoding('utf8');
        var buff= '';
        apiRes.on('data', function (chunk) {
          buff+= chunk;
        });
        apiRes.on('end', function() {
            console.log(buff);
            res.send(buff);
        });
    });
    apiReq.end();
});

app.post('/test/test4', function (req, res) {
    var tempPath = req.files.file.path,
        targetPath = './public/' + req.files.file.name ;
    if (path.extname(req.files.file.name).toLowerCase() === '.png') {
        fs.rename(tempPath, targetPath, function(err) {
            if (err) throw err;
            // res.send("Upload completed!");
            if (err) {
                console.log('Error!');
              } else {
                var someForm = new formData();
                someForm.append('file', fs.createReadStream(targetPath));
                var fileHeader = someForm.getHeaders();
                someForm.getLength(function(err,length){
                    fileHeader['content-length'] = length;

                    console.log(fileHeader);
                    fileHeader.cookie = '_ga=GA1.2.1883368505.1453891337; ' +
                            'optimizelyEndUserId=oeu1453891338904r0.5625616400502622; ' +
                            'optimizelySegments=%7B%223018470184%22%3A%22gc%22%2C%223018720298%22%3A%22search%22%2C%223023000432%22%3A%22false%22%7D;' +
                            ' optimizelyBuckets=%7B%7D;' +
                            ' __hstc=20283623.368dbee3677a5c15a485ecf50bc702dd.1453891341364.1453891341364.1453891341364.1;' +
                            ' __hssrc=1; hsfirstvisit=https%3A%2F%2Fwww.smartfile.com%2Fdeveloper%2F|https%3A%2F%2Fwww.google.co.in%2F|1453891341362;' +
                            ' hubspotutk=368dbee3677a5c15a485ecf50bc702dd;' +
                            ' _pk_ref.1.dc32=%5B%22%22%2C%22%22%2C1453891373%2C%22https%3A%2F%2Fwww.smartfile.com%2Fdeveloper%2F%22%5D;' +
                            ' PRUM_EPISODES=s=1453892646058&r=https%3A//app.smartfile.com/ftp/login/;' +
                            ' csrftoken=YXru14hrxgM0SAeo9QA8FDhv4zoEn7bc;' +
                            ' sessionid=62115b93ff478de68ab87c8c647be902;' +
                            ' _pk_id.1.dc32=91a58db4e853bb9b.1453891373.1.1453892687.1453891373.;' +
                            ' _pk_ses.1.dc32=*; __zlcmid=YtfHekQLGTVouL';
                    fileHeader.referer = "https://rajagopal28.smartfile.com/";
                    fileHeader.origin = "http://www.smartfile.com/developer";
                    fileHeader["X-CSRFToken"] = "YXru14hrxgM0SAeo9QA8FDhv4zoEn7bc";
                    fileHeader["Accept-Encoding"] =  "gzip, deflate";
                      var options = {
                        host: 'rajagopal28.smartfile.com',
                        port: 443,
                         path: '/api/2/path/data/ProfilePics/',
                        headers : fileHeader,
                        method : 'POST'
                    };

                    /*"set-cookie": ["csrftoken=Ocy9ttyYW7EiLNp69rq4Ei8BRP7qTM8E; expires=Wed, 25-Jan-2017 16:22:51 GMT; Max-Age=31449600; Path=/",
                                "sessionid=4330f0e1b17aab0201539be42fcdfb72; expires=Wed, 27-Jan-2016 16:42:50 GMT; Max-Age=1199; Path=/"]*/
                    var apiReq = https.request(options, function(apiRes){
                        console.log('STATUS: ' + apiRes.statusCode);
                        console.log('HEADERS: ' + JSON.stringify(apiRes.headers));
                        apiRes.setEncoding('utf8');
                        var buff= '';
                        apiRes.on('data', function (chunk) {
                          buff+= chunk;
                        });
                        apiRes.on('end', function() {
                            // console.log(buff);
                            fs.unlink(targetPath);
                            res.send(buff);
                        });
                    });
                    someForm.pipe(apiReq);
                    apiReq.on('error', function (error) {
                        console.log(error);
                    });
                });
              }
        });
    }

});


// application -------------------------------------------------------------
app.get('*', function (req, res) {
    res.sendFile(__dirname + '/public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
});
function ensureAuthorized(req, res, next) {
    var bearerToken;
    var bearerHeader = req.headers["authorization"];
    if (typeof bearerHeader !== 'undefined') {
        var bearer = bearerHeader.split(" ");
        bearerToken = bearer[1];// because bearer[0] === 'Bearer'
        Users.Model
            .count({token: bearerToken},
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
// socket IO -----------------------------------------------------------------
io.sockets.on('connection', function (mSocket) {
    socket = mSocket;
    console.log('new socket connection');
    socket.on('ferret', function (name, fn) {
        console.log('woot');
        console.log(name);
        // console.log(fn);
    });
});