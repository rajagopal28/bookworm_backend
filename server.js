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
    'firstName' : 'first_name',
    'lastName' : 'last_name',
    'gender' : 'gender',
    'dob' : 'dob',
    'email' : 'email',
    'genres' : 'genres',
    'thumbnail' : 'thumbnailURL',
    'bookName' : 'name',
    'discussionTitle':'discussion_title',
    'description':'description',
    'username' : 'username',
    'password' : 'password',
    'confirmPassword' : 'password',
    'authorName' : 'author',
    'creator':'creator_name',
    'createdTS':'created_ts',
    'lastModifiedTS':'last_modified_ts',
    'commentsCount':'comments_count',
    'lendDate' : 'created_lent_ts',
    'isAvailable' : 'is_available',
    'exhangeOnly' : 'exchange_only'
};
function reverseKeyValuePairs(key_value_pairs){
  var value_key_pairs = {};
    for(var key in key_value_pairs){
        var value = key_value_pairs[key];
        if(value.trim() != '')
            value_key_pairs[value.toString()] = key.toString(); 
    }
    return value_key_pairs;
}
function parseRequestToDBKeys(request_attributes){
    var db_key_values = {};
    for(var key in request_attributes) {
        // console.log(request_attributes[key]);
        if(requestToDBKeys[key]){
            if(request_attributes[key] instanceof Array) {
                request_attributes[key] = request_attributes[key].join(",");
            }
           if( request_attributes[key].trim() !=''){
                var db_key = requestToDBKeys[key];
                db_key_values[db_key] = request_attributes[key].trim();
            } 
        } 
    }
    return db_key_values;
}
function parseDBToResponseKeys(db_key_values){
    // console.log(db_key_values);
    var response_key_values = {};
    var dbToResponseKeys = reverseKeyValuePairs(requestToDBKeys);
    // console.log(dbToResponseKeys);
    for(var key in db_key_values) {
        if(dbToResponseKeys[key.toString()] && db_key_values[key] !=''){
            var db_key = dbToResponseKeys[key.toString()];
            response_key_values[db_key] = db_key_values[key];
        }
    }
    return response_key_values;
}
function addRegexOption(value, caseSensitive){
    if(!caseSensitive) {
        // value = '^' + value + '$';
        return {'$regex': value, $options: 'i'}
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
app.post('/bookworm/api/books/rental/add',function(req,res) {
	res.header('Access-Control-Allow-Origin', "*");
	var rent = db.collection('rent_books');
	console.log("Renting books");
    var input_params = req.body;
    
    var item = parseRequestToDBKeys(input_params);
    console.log(item);
	if(item.name) {
		console.log('has book details');
		item.is_available= true;
        if(item.author) {
            item.author = item.author.split(", ");
        }
        
		item.created_lent_ts = new Date().getTime();
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

app.get('/bookworm/api/books/rental/all',function(req,res) {
	res.header('Access-Control-Allow-Origin', "*");
    var input_params = req.query;
    var search_query = parseRequestToDBKeys(input_params);
    var $or =[];
    search_query.is_available = true;
    if(search_query.name) {
        search_query.name = addRegexOption(search_query.name);
        $or.push({name: search_query.name});
        delete search_query.name;// remove the key value pair
    }
    if(search_query.author) {
        search_query.author = addRegexOption(search_query.author);
        $or.push({author: {$elemMatch : search_query.author }});
        delete search_query.author;// remove the key value pair
    }
    if(search_query.genres) {
        search_query.genres = search_query.genres.split(",");
        $or.push({genres: {$elemMatch : search_query.genres }});
        delete search_query.genres;// remove the key value pair
    }
    if($or.length > 0) {
        search_query.$or = $or;
    }
		
	var rent = db.collection('rent_books');
    console.log(JSON.stringify(search_query));
	rent.find(search_query).toArray(function(err,items) {
		if(err) {
			res.send(err);
		} else {
           
            var parsedItems = [];
            for(var index in items) {
           // console.log(items[index]);
                parsedItems.push(parseDBToResponseKeys(items[index]));
                // console.log(parseDBToResponseKeys(items[index]));    
            }
			res.send(parsedItems);
		}
	});
});
app.get('/bookworm/api/discussions/all',function(req,res) {
	res.header('Access-Control-Allow-Origin', "*");
    var input_params = req.query;
    var search_query = parseRequestToDBKeys(input_params);
    if(search_query.name) {
        search_query.name = addRegexOption(search_query.name);
    }
		
	var rent = db.collection('worm_discussions');
    console.log(JSON.stringify(search_query));
	rent.find(search_query).toArray(function(err,items) {
		if(err) {
			res.send(err);
		} else {
            var parsedItems = [];
            for(var index in items) {
                parsedItems.push(parseDBToResponseKeys(items[index]));
            }
			res.send(parsedItems);
		}
	});
});
app.post('/bookworm/api/users/register',function(req,res) {
	res.header('Access-Control-Allow-Origin', "*");
    var personal_info = parseRequestToDBKeys(req.body);
    console.log(personal_info);
    if(personal_info.first_name)// check for not empty
    {
        personal_info.created_ts = new Date().getTime();
        personal_info.last_modified_ts = new Date().getTime();
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

app.post('/bookworm/api/discussions/add',function(req,res) {
	res.header('Access-Control-Allow-Origin', "*");
    var discussion_item = parseRequestToDBKeys(req.body);
    console.log(discussion_item);
    if(discussion_item.title)// check for not empty
    {
        discussion_item.created_ts = new Date().getTime();
        discussion_item.last_modified_ts = new Date().getTime();
        var users = db.collection('worm_discussions');
        console.log(JSON.stringify(discussion_item));
        users.insert([discussion_item],function(err,items) {
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