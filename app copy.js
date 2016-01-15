var http = require("http")
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
//, MongoClient = mongodb.MongoClient
    , Server = mongodb.Server
    , BSON = mongodb.BSONPure
    , Db = mongodb.Db
    , MongoServer = mongodb.Server
    , bodyParser = require('body-parser')
    , favicon = require('serve-favicon')
    , path = require('path');

// Express middleware to populate 'req.body' so we can access POST variables
// app.use(express.bodyParser());

//var mongoclient = new MongoClient(new Server('localhost','27017'),{'native_parser' : true});
//var db = new Db('local', new MongoServer('localhost', 27017, { 'native_parser': true }));
var db;
console.log(mongoose.connection.readyState);
if (mongoose.connection.readyState != mongoose.Connection.STATES.connected) {
    mongoose.connect("mongodb://root@localhost:27017/admin");
}
db = mongoose.connection;

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
accessLogStream = fs.createWriteStream(__dirname + '/public/logfile.txt', {flags: 'a'})
app.set('port', process.env.PORT || 8080);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
//app.use(express.favicon());
app.use(favicon(__dirname + '/public/favicon.ico'));
// app.use(express.logger('dev'));
//app.use(logger({path: __dirname +"/public/logfile.txt"}));
app.use(morgan('combined', {stream: accessLogStream}))
app.use(json());
//app.use(bodyParser.urlencoded());
app.use(methodOverride('X-HTTP-Method-Override'));
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}));
// parse application/json
app.use(bodyParser.json());
// cookie parser not needed as session is used
//app.use(cookieParser('your secret here'));
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: {secure: true}
}));
// app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
    app.use(errorHandler());
}
app.post('/bookworm/rentBooks', function (req, res) {
    res.header('Access-Control-Allow-Origin', "*");
    var rent = db.collection('rent_books');
    console.log("Renting books");
    // console.log(req.query);
    // console.log(req.body);
    // console.log(req.params);
    var input_params = req.body;
    if (input_params['fname']) {

    }
    if (input_params['bookname']) {
        console.log('has book details');
        var item = {};
        item.id = input_params['id'];
        item.name = input_params['bookname'];
        item.isbn = input_params['isbn'];
        item.exchange_only = req.body['exchange_only'] == 'true';
        item.is_available = true;
        item.created_ts = new Date().getTime();
        rent.insert([item], function (err, items) {
            if (err) {
                res.send(err);
                console.error(JSON.stringify(err));
            } else {
                res.send(items);
                console.log("Success insertion: " + JSON.stringify(items));
            }
        });
    }

});

app.get('/bookworm/allRentalBooks', function (req, res) {
    res.header('Access-Control-Allow-Origin', "*");
    // console.log(req.query);
    // console.log(req.body);
    // console.log(req.params);
    var input_params = req.query;
    var search_query = {};
    search_query.is_available = true;
    if (input_params['bookname']) {
        search_query.name = {'$regex': input_params['bookname']};
    }
    if (input_params['isbn']) {
        search_query.isbn = input_params['isbn'];
    }

    var rent = db.collection('rent_books');
    console.log(JSON.stringify(search_query));
    rent.find(search_query).toArray(function (err, items) {
        if (err) {
            res.send(err);
        } else {
            res.send(items);
        }
    });
});
app.post('/bookworm/registerUser', function (req, res) {
    res.header('Access-Control-Allow-Origin', "*");
    console.log(req.query);
    console.log(req.body);
    var input_params = req.body;
    console.log(req.params);
    var personal_info = {};
    if (input_params['fname']) {
        personal_info.fname = input_params['fname'];
    }
    if (input_params['lname']) {
        personal_info.lname = input_params['lname'];
    }
    if (input_params['gender']) {
        personal_info.gender = input_params['gender'];
    }
    if (input_params['dob']) {
        personal_info.dob = input_params['dob'];
    }
    if (input_params['gender']) {
        personal_info.gender = input_params['gender'];
    }
    if (personal_info.fname) {
        var users = db.collection('user_worms');
        console.log(JSON.stringify(personal_info));
        users.insert([personal_info], function (err, items) {
            if (err) {
                res.send(err);
                console.error(JSON.stringify(err));
            } else {
                res.send(items);
                console.log("Success insertion: " + JSON.stringify(items));
            }
        });
    }

});

app.get('/test/test', function (req, res) {
    var rent = db.collection('rent_books');
    rent.find({is_available: true}).toArray(function (err, items) {
        if (err) {
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