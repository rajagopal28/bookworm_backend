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
// template engine can be used in express to build html easily by passing parameters
// link --> http://expressjs.com/en/guide/using-template-engines.html
// jade is the default tempate parser engine that is used to parse html
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
//app.use(express.favicon());
app.use(favicon(__dirname + '/public/favicon.ico'));
// app.use(express.logger('dev'));
//app.use(logger({path: __dirname +"/public/logfile.txt"}));
app.use(morgan('combined', {stream: accessLogStream}));
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

app.post('/test/test2', function (req, res) {
    var configJSON = serverConfigJSON;
    var now = mUtils.resetTimeToGMT(new Date()).getTime();
    if(!configJSON || !configJSON.cloudConfig || !configJSON.cloudConfig.authExpiration) {
        // I do not have a valid config in server session so read from file
        readConfigToSession(res, function(configJSON){
            console.log('inside file read');
            if(configJSON &&
                configJSON.cloudConfig){
                // I have a read configuration now
                if(now > (1 * configJSON.cloudConfig.expirationTimeStamp)) {
                    console.log('token expired');
                    // if login auth expired login and then upload
                    loginToCloudEnvironment(configJSON.cloudConfig, function (addedTokenInfo) {
                        configJSON.cloudConfig.csrftoken = addedTokenInfo.csrftoken;
                        configJSON.cloudConfig.sessionid = addedTokenInfo.sessionid;
                         console.log(addedTokenInfo);
                        configJSON.cloudConfig.expirationTimeStamp = new Date(addedTokenInfo.expirationTimestamp).getTime();
                        console.log(configJSON.cloudConfig.expirationTimeStamp);
                         //console.log(configJSON);
                        console.log(now);
                       /*
                       uploadFileToCloud(req, configJSON, function (response) {
                            res.send(response);
                        });
                        // write the newly created config tokens
                         writeConfigToFile(configJSON);
                         */
                    });
                }
            }
        });
    }

});
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
// defaut HTTP handlers
/*
 http.createServer(function(request, response) {
 response.writeHead(200, {"Content-Type": "text/plain"});
 response.write("It's alive! Yay");

 response.end();
 }).listen(8000);
 */