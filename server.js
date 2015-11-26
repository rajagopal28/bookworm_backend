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
	, mongoose = require('mongoose')
	, mongodb = require("mongodb")
	, bodyParser = require('body-parser')
	, favicon = require('serve-favicon')
	, path = require('path')
    , socketServer = app.listen(8080)
    , io = require('socket.io')(socketServer,{
      serveClient: true,
      path: '/socket.io'
    });
//io.set('transports',['xhr-polling']);
var db;
var requestToDBKeys = {
    'firsName' : 'firsName',
    'lastName' : 'lastName',
    'gender' : 'gender',
    'dob' : 'dob',
    'bookTitle' : 'name',
    'authorName' : 'author',
    'lendtDate' : 'createdDate',
    'isAvailable' : 'is_available',
    'exhangeOnly' : 'exchange_only'
};
function parseRequestToDBKeys(request_attributes){
    var db_key_values = {};
    for(var key in request_attributes) {
        if(requestToDBKeys[key] && request_attributes[key].trim() !=''){
            var db_key = requestToDBKeys[key];
            db_key_values[db_key] = request_attributes[key].trim();
        }
    }
    return db_key_values;
}
function addRegexOption(value, caseSensitive){
    if(!caseSensitive) {
        // value = '^' + value + '$';
    }
    return {'$regex': value}
}
console.log(mongoose.connection.readyState);
if(mongoose.connection.readyState != mongoose.Connection.STATES.connected ) {
    mongoose.connect("mongodb://root@localhost:27017/admin");
}
db = mongoose.connection;

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
app.post('/bookworm/api/rentBooks',function(req,res) {
	res.header('Access-Control-Allow-Origin', "*");
	var rent = db.collection('rent_books');
	console.log("Renting books");
    var input_params = req.body;
    var item = parseRequestToDBKeys(input_params);
	if(item.name) {
		console.log('has book details');
		item.is_available= true;
		item.created_ts = new Date().getTime();
		rent.insert([item],function(err,items) {
			if(err) {
				res.send(err);
                console.error(JSON.stringify(err));
			} else {
				res.send(items);
                console.log("Success insertion: " + JSON.stringify(items));
			}
		});
	}
	
});

app.get('/bookworm/api/allRentalBooks',function(req,res) {
	res.header('Access-Control-Allow-Origin', "*");
    var input_params = req.query;
    var search_query = parseRequestToDBKeys(input_params);
    
    search_query.is_available = true;
    if(search_query.name) {
        search_query.name = addRegexOption(search_query.name);
    }
    if(search_query.author) {
        search_query.isbn = addRegexOption(search_query.author);
    }
		
	var rent = db.collection('rent_books');
    console.log(JSON.stringify(search_query));
	rent.find(search_query).toArray(function(err,items) {
		if(err) {
			res.send(err);
		} else {
			res.send(items);
		}
	});
});
app.post('/bookworm/api/registerUser',function(req,res) {
	res.header('Access-Control-Allow-Origin', "*");
    console.log(req.query);
	console.log(req.body);
	console.log(req.params);
    var personal_info = req.body;
    if(personal_info.firstName)// check for not empty
    {
        var users = db.collection('user_worms');
        console.log(JSON.stringify(personal_info));
        users.insert([personal_info],function(err,items) {
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
	rent.find({is_available : true}).toArray(function(err,items) {
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