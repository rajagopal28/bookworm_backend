# Bookworms
## Problem statement:
A typical book lover would love to buy a (paper-back) book, read it till his/her soul melts and complete it soon if that has an awesome content inside. But when the story ends, what happens to the book that kept me busy and involved for such a good amount of time? What if I have a perspective about the story or a part of the story is not clear or raising a lot of questions than it answered. What if there are people who took the story/a part of it , the way I took it or the contrary? What if my friends can explain something that I don’t get quite well from the story/a part of the story.
## The solution:
Having the problem statement explained, here comes the solution in the form of an application that helps me lend/borrow books from people having common interest. Converse and share information that are immersed in a diversified collection of people with varying thought process, through forums and chats.
## Architecture:
### Legacy - with OpenShift-1.0:
![Architecture](https://file.ac/yPrgAzJsh9o/Public/image0.png?refresh=true)
### Migrated - with Heroku + mLab:
![Architecture](https://file.ac/yPrgAzJsh9o/Public/image1.png)
### Relational schema of the backend:
![Schema](https://file.ac/yPrgAzJsh9o/Public/image3.png)

## Tech Nuances:
 - **Socket.io - web socket based realtime chats** : Including web sockets was one of the major hightlights of bookworms. I was more excited to know that something like this can be done with nodejs or the architecture I have adapted or bookworms. As I had forums in mind for Phase-1, it came very much handy to help me work with this feature with socket.io. I had few initial hickups with setting up socket listeners in parallel to the actual web node in open shift and it became harder when I wanted to migrate to Heroku. However, as a lover of mathematic saying "There won't be a problem without a solution." I dug deeps both the times and fixed the issues. Following is how websocket is implemented with respect to forum. To be short, the user who posts the forum will also see the chat added after receiving the socket broadcast from the server. The forums page, irrespective of which forum the user in, will receive the broadcast but will add the chat to the UI only if the chat received is for the forum that is open right now.
 ![Socket-Data-Flow](https://file.ac/yPrgAzJsh9o/Public/image2.png)
 - **Crucial queries and object relations** :
 1. *fetching private forums*: the mongoose modeling is bit complicated when if comes to references and de-references. In case of private forums the ask is to fetch all forums which has the logged in user in their visible_to list or created by the user. Also to de-reference the other users to which the forum is visible to.
     ```javascript
     searchQuery.is_private = true;
     searchQuery['$or'] =
         [{ author : mongoose.mongo.ObjectId(searchQuery._id)},
             { visible_to : mongoose.mongo.ObjectId(searchQuery._id) }];
    ```
 2. *fetching friends list*: As the concept of networks is nested in a duplex way, i.e., user1 will be in user2's network and viceversa. So on saving it was crucial to save the users mututually in each other's network. The query to filter should make sure that the internal reference fo the same model does not conflict. Following is the code snippet for de-referencing the users from network.
     ```javascript
       var mongoose = require('mongoose');
       var userSchema = Schema({
         _id: Schema.Types.ObjectId,
         name: String,
         dob: Number,
         network: [{ type: Schema.Types.ObjectId, ref: 'User' }]// internal reference to users
         //.. other fields ...//
       });
       var User = mongoose.model('User', userSchema);
       User.findOne(myNetworkQuery, nestedDocQuery)
           .populate('network', null, searchQuery)
           .sort(pagingSorting.sortField)
           .exec(function (err, items) {
               callback(err, items, totalCount);
           });
     ```
 - **Relationships and references in mongoose** : Fetching internal reference: As you can see in the schema diagram, we have internal referencing between users, books, forums and chats. A small snippet of mongoose de-referencing. Reference: http://mongoosejs.com/docs/populate.html
     ```javascript
        var mongoose = require('mongoose');
        var Schema = mongoose.Schema;

        var userSchema = Schema({
          _id: Schema.Types.ObjectId,
          name: String,
          dob: Number
          //.. other fields ...//
        });

        var forumSchema = Schema({
          author: { type: Schema.Types.ObjectId, ref: 'User' },
          title: String,
          // Other Fields //
          chats: [{ type: Schema.Types.ObjectId, ref: 'Chat' }]
        });

        var chatSchema = Schema({
          forum: { type: Schema.Types.ObjectId, ref: 'Forum' },
          content: String,
          // Other Fields //
          author: [{ type: Schema.Types.ObjectId, ref: 'user' }]
        });

        var Chat = mongoose.model('Chat', chatSchema);
        var Forum = mongoose.model('Forum', storySchema);
        var User = mongoose.model('User', userSchema);
        Forum.findOne({ title: /casino royale/i })
         .populate('author', 'name') // only return the Persons name
         .populate('chats')
         .exec(function (err, story) {
           if (err) return handleError(err);
           // handle response with story object
         });
     ```
 - **hooks in mongoose** : We have pre and post action hooks in mongoose which helps us manipulate the data before and after performing actions, such as insert, update, delete and select, on a particular collection tied model. Following code sample is what I used to encrypt the password using crypto library. Following is how the event hooks are handled in mongoose.
     ```javascript
        var mongoose = require('mongoose');
        var Schema = mongoose.Schema;

        var userSchema = Schema({
          _id: Schema.Types.ObjectId,
          name: String,
          dob: Number,
          password: String,
          //.. other fields ...//
        });
        userSchema.pre('save', function(next) {
          var user = this;
          user.password = methodToHashPassword(user.password);
          // ...other actions like updating timestamp and such
          next();
        });
     ```
 - **crypto salt based hashing of passwords** : Password security only came to my mind a little later when I actually started feeling bookworms as an actual website and not a pet project. On intensive research on the addons that help encrypting data in nodejs, crypto was promising. Had a lot of issues with dependencies and node version mismatch due to crypto and bcrypt compatibility issues due to downgrade of older node version that OpenShift was supporting. Following is the sample of the function that I used inside mongoose hooks to help encrypt password.
     ```javascript
        var crypto = require('crypto');

        function hashStringWithSale(password, salt/*I used a constant salt so that it would be better throughout*/){
          var hash = crypto.createHmac('sha512', salt); /** Hashing algorithm sha512 */
          hash.update(password);
          return hash.digest('hex');
      };
     ```
 - **Interceptors in angular** : interceptors are one of the fascinating concept that I found in Angular 1.0. They act the same way as the filters in J2EE based web frameworks. They intercept the api or any calls that go through the $http module and do whatever you want. I used them for 2 purposes, to put a loading overlay and to add auth information to the headers so that the data api knows the logged in user. Here is the code of the interceptor factory.
 ```javascript
       app.factory('BookWormHTTPInterceptor', ['$q', '$location', '$localStorage', 'Constants', 'LoaderService',
           function ($q, $location, $localStorage, Constants, LoaderService) {
             return {
                 'request': function (config) {
                     if(url.isAPIUrl() && url.isAuthenticationNeeded()) {
                       // add auth info to header in the api
                     }
                     LoaderService.activateSpinner();
                     return config;
                 },
                 'responseError': function (response) {
                    // on errors redirect to login with error
                     LoaderService.deactivateSpinner();
                     return $q.reject(response);
                 },
                 'response': function (response) {
                     LoaderService.deactivateSpinner();
                     return response;
                 }
             };
         }]);
 ```

 - **Grunt and it quick builds** : I was initially thinking to just reference all the module files as such but the concept of minifying and increasing a high performant site intrigued me and I looked into Grunt and Gulp. Gulp as too complicated for what I was trying to achieve so grunt looked simpler, syntax wise. Following is the shortened version of my Grunt build.
 ```javascript
 grunt.initConfig({
     pkg: grunt.file.readJSON('package.json'),
       //grunt task configuration will go here
     ngAnnotate: {
         // compile angular code to plain js code
     },
     concat: {
        // concat all the js and css files that are from vendor and app
     },
     uglify: {
         // uglifying vendor and app static css
     },
     cssmin: {
          // minifying cssmin
     }

 });
 grunt.loadNpmTasks(/* All needed npm tasks for grunt*/);
 //register grunt default task
 grunt.registerTask('default', ['ngAnnotate', 'concat', 'uglify', 'cssmin']);
 ```
## Migration:
  The site was initially deployed on OpenShift as Heroku was not supporting mongodb in their free tiers any form. But as of 2018, Redhat has stopped supporting their older version of OpenShift named 1.0 and the newer version does not seem friendly when compared to their previous versions and they mostly provide serverly less resources for free tier. As I wanted to keep the one favorite thing I loved coding for a long time alive I migrated the entire application to Heroku with mLab as the supporting mongodb backend. Eventhough mLab has lot of data restrictions for free users, it was worth the try as none really cares to use bookworms.
## Tech stack used:
The following are the technologies and libraries that I have used in this experiment. I call it my MEAN stack experiment because of the 4 major techs I’ve used.

- **Mongo DB**: Document based data management system which used Javascript Object Notations to save and retrieve user/books/chats related data that are the integral part of the system.
- **Express JS**: The application layer on top of Node JS server to enable multi route and data access support for API server that is used to process data from the front end.
    - **crypto**: Library to encrypt sensitive data in the system, such as user password.
    - **requests**: Library used to handle external API requests to third party applications used in the flow of the application.
    - **mongoose**: Library that used for Object Oriented design of the data system in mongo db.
    - **multiparty**: To handle multipart file based requests
    - **NodeMailer**: To send emails from the node app server
- Angular JS: Angular JS as the interface to get connected with the backend system.
    - **Bootstrap JS**: Angular bootstrap library to help use various UI components that are built for angular JS in order to enhance the user experience.
- **Grunt**: Build the UI assets on the client side by minifying and compressing respective files for quick loading.
- **Node JS**: A lightweight Javascript based application server that runs the in order to process user data.
    - **Socket-IO** on node JS: Socket IO to have interactive chat session in the forums section.
- **SmartFile drive API**: A cloud based file storage system which exposed API. This is used to store the user profile pictures as of now.
- **Open shift Cloud by Red-hat**: The first ever cloud platform I’ve ever learnt to use on my own. The PaaS provided by Red-hat and I’ve used the free gears(VMs) provided for the free account.
- **Heroku+mLab**: The second ever cloud platform I’ve ever learnt to use on my own. Very easy to provision and manage. mLab is not out of the box for free slots but the internal connection string setting are not blocked and i was so much relieved.
- **GitHub**: Used for Version control and repository management.

## Challenges Faced And Lessons learnt:

- Well, I just started this experiment with just the idea as the base. I had Zero knowledge on NodeJs, MongoDb, ExpressJS, cloud deployment as they were so not related to what I’ve been working on in my 1st company, but I had around 20%knowledge in Angular JS based on the pass time pet project on Ionic.
- I knew Javascript as a client side scripting language for all my(professional) life, but how does that act as a server side language? How does it convert request to responses? How does that handle concurrency and threading? These are the sample of a huge set of questions that bewildered me when I just started this experiment. But I had a conviction that, I’ll learn a lot of good things from this unexplored area of work, the fun way.
- I started with a base story but as time evolved, I started treating it like a real website that I’m gonna create and I’ve added a whole lot of things that made sense which are missed during the initial phase.
- Initially I had no idea that there is a library/layer call Express that handles multi-routed requests, so I started with simple node JS 'hello world’ type applications.
- The same applies to mongoose library, I’ve just started with the base mongoldb layer and started with dumping data and retrieving it without any proper Object oriented modeling and design formats.
- So is the cloud related deployment, which is a very new area that I had no prior working experience. It was scary to mess with a machine which is remote and has running server packages which are not under your control directly.
- This was a whole new experience to me, as I used to work only on core backend technologies which are object oriented and tied with relational database systems in a traditional way.
- More problems and stories can be found in my blog :D [Here](https://blogsofraju.wordpress.com/2017/02/16/one-crazy-trip-through-bookworms/).
- While *migrating* to **heroku** I faced couple of issues with the existing code base.
  - Static content and Asserts are not referenced properly due to directory access restrictions which was solved when the assets were moved to the actual referenced directory
  - **Socket.io** port was dynamic and the client was not able to detect with the usual ssh and non-ssh web ports. For this issue I was breaking my head for couple of days and for the porblem solved with the solution mentioned in the below 2 URLS in reference.

## Features and Use-cases:

- **Users and profiles**: Create, edit and view other profiles. Update your profile pictures, which are stored in third party API calls.
- **Books; lend and borrow**: Lend books to the available books list and view the available books. Apply various filters and request to borrow one or more books.
- **Networking**: View other users, add them to your network by requesting them.
- **Public and Private Forums**: Open chat topics based on any book to share opinions with all users or selected users from your network.

## Views in App:
### Home
![Home](https://file.ac/yPrgAzJsh9o/Public/image100.png)
### Authenticated Home
![AuthenticatedHome](https://file.ac/yPrgAzJsh9o/Public/image101.png)
![AuthenticatedHome](https://file.ac/yPrgAzJsh9o/Public/image102.png)
### Lend Book
![LendBook](https://file.ac/yPrgAzJsh9o/Public/image103.png)
### List Books
![ListBooks](https://file.ac/yPrgAzJsh9o/Public/image104.png)
![ListBooks](https://file.ac/yPrgAzJsh9o/Public/image105.png)
![ListBooks](https://file.ac/yPrgAzJsh9o/Public/image106.png)
### View Book
![ViewBook](https://file.ac/yPrgAzJsh9o/Public/image107.png)
### Edit Book
![EditBook](https://file.ac/yPrgAzJsh9o/Public/image108.png)
###Users
![Users](https://file.ac/yPrgAzJsh9o/Public/image109.png)
### Signup
![Signup](https://file.ac/yPrgAzJsh9o/Public/image110.png)
### Sign in
![SignIn](https://file.ac/yPrgAzJsh9o/Public/image.png)111
### Public Forums
![PublicForums](https://file.ac/yPrgAzJsh9o/Public/image112.png)
![PublicForums](https://file.ac/yPrgAzJsh9o/Public/image113.png)
### Private Forums
![PrivateForums](https://file.ac/yPrgAzJsh9o/Public/image114.png)
### Network
![Network](https://file.ac/yPrgAzJsh9o/Public/image115.png)
### Profile/View User
![Profile/View User](https://file.ac/yPrgAzJsh9o/Public/image116.png)
### Change password
![ChangePassword](https://file.ac/yPrgAzJsh9o/Public/image117.png)
### Edit Profile
![EditProfile](https://file.ac/yPrgAzJsh9o/Public/image118.png)
![EditProfile](https://file.ac/yPrgAzJsh9o/Public/image119.png)
### Feedback
![Feedback](https://file.ac/yPrgAzJsh9o/Public/image120.png)
### About and Contact
![About-and-Contact](https://file.ac/yPrgAzJsh9o/Public/image121.png)
![About-and-Contact](https://file.ac/yPrgAzJsh9o/Public/image122.png)
![About-and-Contact](https://file.ac/yPrgAzJsh9o/Public/image123.png)




## Repository and URL:

- GitHub: https://github.com/rajagopal28/bookworm_backend
- Live URL: https://book-worms-app.herokuapp.com/#/bookworm/home
  - (OLD) http://bookworms-dextrous.rhcloud.com/#/bookworm/home
- My Blog about the Whole experiment: https://blogsofraju.wordpress.com/2017/02/16/one-crazy-trip-through-bookworms/

## References:
 - https://www.sitepoint.com/deploy-rest-api-in-30-mins-mlab-heroku/
 - https://hackernoon.com/herokus-handshake-with-mlab-7fea651fa8c2
 - Socket session sharing issue: https://blog.heroku.com/session-affinity-ga
  - Client side fix: https://stackoverflow.com/a/44962432
- http://www.bypeople.com/css-chat/
- https://github.com/linnovate/mean-on-openshift
- http://www.sitepoint.com/5-minutes-to-min-safe-angular-code-with-grunt/
- https://nodejs.org/api/crypto.html#crypto_crypto_pbkdf2sync_password_salt_iterations_keylen_digest
- http://stackoverflow.com/questions/5681851/mongodb-combine-data-from-multiple-collections-into-one-how
- https://www.mongodb.com/blog/post/joins-and-other-aggregation-enhancements-coming-in-mongodb-3-2-part-1-of-3-introduction
- Mongoose: http://mongoosejs.com/docs/middleware.html
