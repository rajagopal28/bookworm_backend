var http = require("http")
	,express = require("express")
	,app = express()
	,logger = require('express-logger')
	,json = require('express-json')
	,methodOverride = require('method-override')
	,cookieParser = require('cookie-parser')
	,session = require('express-session')
	,errorHandler = require('errorhandler')
	,mongoose = require('mongoose')
	,mongodb = require("mongodb")
	,MongoClient = mongodb.MongoClient
	,Server = mongodb.Server
	,BSON = mongodb.BSONPure
	,Db = mongodb.Db
	,MongoServer = mongodb.Server
	,bodyParser = require('body-parser')
	,favicon = require('serve-favicon')
	,path = require('path');

// Express middleware to populate 'req.body' so we can access POST variables
// app.use(express.bodyParser());

//var mongoclient = new MongoClient(new Server('localhost','27017'),{'native_parser' : true});
//var db = new Db('local', new MongoServer('localhost', 27017, { 'native_parser': true }));
mongoose.connect("mongodb://raju:raju@localhost:27017/admin");
var db = mongoose.connection;
db.once('open', function () {
	app.listen(8080);
	console.log('MongoDB connection successful.');
});
 /*var MongoClient = mongodb.MongoClient;
 
 var url = 'mongodb://raju:raju@localhost:27017/admin';
 // Connect using MongoClient

 MongoClient.connect(url, function(err, db) {

 var testDb = db.db('admin'); //use can chose the database here
 console.log('connected');

 app.get('/test/test1',function(req,res) {
	var rent = testDb.collection('rent_books');
	rent.find({is_available : false}).toArray(function(err,items) {
		if(err) {
			res.send(err);
		} else {
			res.send(items);
		}
	});
});
 //db.close();
});*/
//db.open(function (err, something) {
//});
// all environments
app.set('port', process.env.PORT || 8080);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
//app.use(express.favicon());
app.use(favicon(__dirname + '/public/favicon.ico'));
// app.use(express.logger('dev'));
app.use(logger({path: __dirname +"/public/logfile.txt"}));
app.use(json());
//app.use(bodyParser.urlencoded());
app.use(methodOverride('X-HTTP-Method-Override'));
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());
// cookie parser not needed as session is used
//app.use(cookieParser('your secret here'));
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}));
// app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(errorHandler());
}
app.post('/bookworm/rentBooks',function(req,res) {
	res.header('Access-Control-Allow-Origin', "*");
	var rent = db.collection('rent_books');
	console.log("Renting books");
	console.log(req.query);
	console.log(req.body);
	console.log(req.params);
	if(req.body['bookname']) {
		console.log('has sboos details');
		var item = {};
		item.id =  req.body['id'];
		item.name = req.body['bookname'];
		item.isbn = req.body['isbn'];
		item.is_available= true;
		item.created_ts = new Date().getTime();
		rent.insert([item],function(err,items) {
			if(err) {
				res.send(err);
			} else {
				res.send(items);
			}
		});
	}
	
});

app.get('/bookworm/allRentalBooks',function(req,res) {
	res.header('Access-Control-Allow-Origin', "*");
	var rent = db.collection('rent_books');
	rent.find({is_available : true}).toArray(function(err,items) {
		if(err) {
			res.send(err);
		} else {
			res.send(items);
		}
	});
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

// defaut HTTP handlers
/*
http.createServer(function(request, response) {
  response.writeHead(200, {"Content-Type": "text/plain"});
  response.write("It's alive! Yay");

  response.end();
}).listen(8000);
*/