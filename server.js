var http = require("http")
    , server = http.Server(app)
	, express = require("express")
	, app = express()
	, morgan = require('morgan')
    , fs = require('fs')
	, json = require('express-json')
	, methodOverride = require('method-override')
	, cookieParser = require('cookie-parser')
	, session = require('express-session')
	, errorHandler = require('errorhandler')
    , bcrypt = require('bcrypt')
    , utils = require('./server/models/utils')
    , book = require('./server/models/book')
    , user = require('./server/models/user')
    , forum = require('./server/models/forum')
	, mongoose = require('mongoose')
	, mongodb = require("mongodb")
    , BSON = mongodb.BSONPure
	, bodyParser = require('body-parser')
	, favicon = require('serve-favicon')
	, path = require('path')
    , socketServer = app.listen(8080)
    , io = require('socket.io')(socketServer,{
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
if(mongoose.connection.readyState != mongoose.Connection.STATES.connected ) {
    mongoose.connect("mongodb://root@localhost:27017/admin");
}
var db = mongoose.connection;

db.once('open', function () {
	console.log('MongoDB connection successful.');
});

// all environments
accessLogStream = fs.createWriteStream(__dirname + '/public/logfile.txt', {flags: 'a'})
app.set('port', process.env.PORT || 8080);
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
//app.use(express.favicon());
app.use(favicon(__dirname + '/public/static/images/favicon.ico'));
app.use(morgan('dev'))
app.use(json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(methodOverride('X-HTTP-Method-Override'));
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}));

// development only
if ('development' == app.get('env')) {
  app.use(errorHandler());
}
// allow cross origin access
app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
    next();
});
// routes ======================================================================

// api ---------------------------------------------------------------------
app.post('/bookworm/api/books/rental/add',function(req,res) {
	console.log("Renting books");
    var inputParams = req.body;
    console.log(inputParams);
    var item = mUtils.parseRequestToDBKeys(inputParams);
	if(item.book_name) {        
		console.log('has book details');
		item.is_available= true;
        var new_rental_book = new Books.Model(item);
        new_rental_book.save(function(error, new_rental_book) {
            if(error) {
                console.error(error);
            }
            console.log(new_rental_book);
        });
	}
});

app.get('/bookworm/api/books/rental/all',function(req,res) {
	
    var inputParams = req.query;
    var searchQuery = mUtils.parseRequestToDBKeys(inputParams);
    console.log(searchQuery);
    searchQuery = Books.buildSearchQuery(searchQuery, mUtils);
    console.log(searchQuery);
    Books.Model.
    find(searchQuery).exec(function(err,items) {
		if(err) {
			res.send(err);
		} else {
			var parsedItems = [];
            for(var index in items) {                parsedItems.push(mUtils.parseDBToResponseKeys(items[index]));  
            }
			res.send(parsedItems);
		}
	});
});
app.get('/bookworm/api/forums/all',function(req,res) {
	
    var inputParams = req.query;
    console.log(inputParams);
    var searchQuery = mUtils.parseRequestToDBKeys(inputParams);
    searchQuery = Forums.buildSearchQuery(searchQuery);
	Forums.Model.find(searchQuery)
    .select('-chats')
        .exec(function(err,items) {
		if(err) {
			res.send(err);
		} else {
            var parsedItems = [];
            for(var index in items) {
                var parsed = mUtils.parseDBToResponseKeys(items[index]);
                parsedItems.push(parsed);
            }
            console.log(parsedItems);
			res.send(parsedItems);
		}
	});
    console.log(JSON.stringify(searchQuery));
});
app.get('/bookworm/api/forums/chats/all',function(req,res) {
	
    var inputParams = req.query;
    console.log(inputParams);
    var searchQuery = mUtils.parseRequestToDBKeys(inputParams);
    searchQuery = Forums.buildSearchQuery(searchQuery);
	Forums.Model.findOne(searchQuery)
        .exec(function(err, forum) {
		if(err) {
			res.send(err);
		} else {
            var parsed = mUtils.parseDBToResponseKeys(forum);            
            console.log(parsed);
			res.send(parsed);
		}
	});
    console.log(JSON.stringify(searchQuery));
});
app.post('/bookworm/api/users/check-unique',function(req,res) {
	
    var inputParams = req.body;
    var searchQuery = mUtils.parseRequestToDBKeys(inputParams);
    if(searchQuery.username) {
        Users.Model.find(searchQuery)
            .exec(function(err,items) {
                    if(err) {
                        res.send(err);
                    } else {
                        var isUsernameAvailable = 
                            items.length === 0;
                        res.send({isUsernameAvailable : isUsernameAvailable});
                    }
                });
    }
});
app.post('/bookworm/api/users/login-auth',function(req,res) {
	
    var inputParams = req.body;
    var searchQuery = mUtils.parseRequestToDBKeys(inputParams);
    if(searchQuery.username) {
        Users.authenticateUser(searchQuery,function(err, isMatch, token) {
            if (err) {
                res.send(err);
            } 
            else{
                res.send({authSuccess : isMatch, token: token});
            }
        });
    }
});
app.post('/bookworm/api/users/register',function(req,res) {
	
    var personal_info = mUtils.parseRequestToDBKeys(req.body);
    console.log(personal_info);
    if(personal_info.first_name)// check for not empty
    {
        var new_user = new Users.Model(personal_info);
        new_user.save(function(err,items) {
                if(err) {
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

app.post('/bookworm/api/forums/add',function(req,res) {
    console.log(req.body);
    var forum_item = mUtils.parseRequestToDBKeys(req.body);
    console.log(forum_item);
    if(forum_item.forum_title)// check for not empty
    {
        var forum = new Forums.Model(forum_item);
        forum.save(function(error, new_forum) {
            if(error) {
                console.error(error);
            }
            console.log(new_forum);
        });
    } else {
        res.send();
    }
	
});

app.post('/bookworm/api/forums/chats/add',function(req,res) {
    console.log(req.body);
    var chat_item = mUtils.parseRequestToDBKeys(req.body);
    console.log(chat_item);
    if(chat_item.forum_id)// check for not empty
    {
        var forum = Forums.Model
        .findOne({_id : chat_item.forum_id})
        .exec(function(error, forum_item){
             delete chat_item.forum_id;
             if(forum_item) {
                 console.log(forum_item);
                 forum_item.chats.push(chat_item);
                 forum_item.save(function(error, new_forum) {
                    if(error) {
                        res.send(error);
                    } else {
                        if(socket) {
                            var item = {};
                            item.forum_id = forum_item._id;
                            item.chat = chat_item;
                            console.log('in socket');
                            socket.emit('new-chat', item);
                        }
                        res.send(new_forum);
                    }
                    
                });
             }   
        });
        
    } else {
        res.send();
    }
	
});

app.get('/test/test', ensureAuthorized ,function(req,res) {
	var rent = db.collection('rent_books');
	rent.find({}).toArray(function(err,items) {
		if(err) {
			res.send(err);
		} else {
			res.send(items);
		}
	});
});

 // application -------------------------------------------------------------
    app.get('*', function(req, res) {
        res.sendFile(__dirname + '/public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
    });
function ensureAuthorized(req, res, next) {
    var bearerToken;
    var bearerHeader = req.headers["authorization"];
    if (typeof bearerHeader !== 'undefined') {
        var bearer = bearerHeader.split(" ");
        bearerToken = bearer[1];
        req.token = bearerToken;
        next();
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