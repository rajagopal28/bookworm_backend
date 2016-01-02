var http = require("http")
    ,server = http.Server(app)
	, express = require("express")
	, app = express()
	, morgan = require('morgan')
    , fs = require('fs')
	, json = require('express-json')
	, methodOverride = require('method-override')
	, cookieParser = require('cookie-parser')
	, session = require('express-session')
	, errorHandler = require('errorhandler')
    , utils = require('./server/models/utils')
    , book = require('./server/models/book')
    , user = require('./server/models/user')
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
var Users = new user.User(mongoose);
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
// routes ======================================================================

// api ---------------------------------------------------------------------
app.post('/bookworm/api/books/rental/add',function(req,res) {
	res.header('Access-Control-Allow-Origin', "*");
	var rent = db.collection('rent_books');
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
	res.header('Access-Control-Allow-Origin', "*");
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
	res.header('Access-Control-Allow-Origin', "*");
    var inputParams = req.query;
    var searchQuery = mUtils.parseRequestToDBKeys(inputParams);
    if(searchQuery.title) {
        searchQuery.title = mUtils.addRegexOption(searchQuery.title);
    }
		
	var rent = db.collection('worm_forums');
    console.log(JSON.stringify(searchQuery));
	rent.find(searchQuery).toArray(function(err,items) {
		if(err) {
			res.send(err);
		} else {
            var parsedItems = [];
            for(var index in items) {
                var parsed = mUtils.parseDBToResponseKeys(items[index]);
                if(parsed.id) {
                    parsed.id = parsed.id.valueOf();
                    console.log(parsed.valueOf());
                }
                parsedItems.push(parsed);
            }
            console.log(parsedItems);
			res.send(parsedItems);
		}
	});
});
app.get('/bookworm/api/users/check-unique',function(req,res) {
	res.header('Access-Control-Allow-Origin', "*");
    var inputParams = req.query;
    var searchQuery = mUtils.parseRequestToDBKeys(inputParams);
    if(searchQuery.username) {
        Users.Model.find(searchQuery)
            .exec(function(err,items) {
                    if(err) {
                        res.send(err);
                    } else {
                        var isUserUnique = 
                            items.length === 0;
                        res.send({isUserUnique : isUserUnique});
                    }
                });
    }
		
	var rent = db.collection('worm_forums');
    console.log(JSON.stringify(searchQuery));
	rent.find(searchQuery).toArray();
});
app.post('/bookworm/api/users/register',function(req,res) {
	res.header('Access-Control-Allow-Origin', "*");
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
	res.header('Access-Control-Allow-Origin', "*");
    console.log(req.body);
    var forum_item = mUtils.parseRequestToDBKeys(req.body);
    console.log(forum_item);
    if(forum_item.forum_title)// check for not empty
    {
        forum_item.created_ts = new Date().getTime();
        forum_item.last_modified_ts = new Date().getTime();
        var users = db.collection('worm_forums');
        console.log(JSON.stringify(forum_item));
        users.insert([forum_item],function(err,items) {
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

app.get('/test/test',function(req,res) {
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

// socket IO -----------------------------------------------------------------
io.sockets.on('connection', function (socket) {
console.log('new socket connection');
  socket.on('ferret', function (name, fn) {
    console.log('woot');
      console.log(name);
      // console.log(fn);
  });
});