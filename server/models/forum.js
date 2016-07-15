function Forum(mongoose, mUtils) {
    'use strict';
    var self = this;
    var constants = mUtils.constants;
    var chatSchemaDefinition = {
        chat_comment: String,
        author: {type: mongoose.Schema.Types.ObjectId, ref: constants.MODELS.USER },
        created_ts: {type: Date, default: Date.now},
        last_modified_ts: {type: Date, default: Date.now}
    };
    var charSchema = mongoose.Schema(chatSchemaDefinition);
    var forumSchemaDefinition = {
        forum_title: {
            type: String,
            required: true
          },
        referred_book :{
            book_name : String,
            isbn : String,
            google_id : String,
            thumbnail_url : String,
            description : String
        },
        description: {
            type: String,
            required: true
          },
        author: {type: mongoose.Schema.Types.ObjectId, ref: constants.MODELS.USER },
        is_private : {type : Boolean, default: false},
        visible_to : [{type: mongoose.Schema.Types.ObjectId, ref: constants.MODELS.USER }],
        chats: [charSchema],
        created_ts: {type: Date, default: Date.now},
        last_modified_ts: {type: Date, default: Date.now}
    };
    var forumSchema = mongoose.Schema(forumSchemaDefinition);
    forumSchema.pre(constants.SCHEMA_HOOK.UPDATE, function(next){
        var forum = this;
        forum.last_modified_ts = Date.now();
        next();
    });
    var Model = mongoose.model(constants.MODELS.FORUM, forumSchema);
    this.buildSearchQuery = function (searchQuery) {
        if (searchQuery.title) {
            searchQuery.title = mUtils.addRegexOption(searchQuery.title);
        }
        return searchQuery;
    };
    this.addNewForum = function(forum_item, callback){
        var forum = new Model(forum_item);
        forum.save(function (error, new_forum) {
            callback(error, new_forum);
        });
    };
    this.updateForum = function(forum_item,callback){
       Model.update(
            {_id : forum_item._id},
            { $set : forum_item},
            { upsert : false},
            function (error, new_forum) {
                callback(error, new_forum);
            });
    };
    this.addChatInForum = function(chat_item, callback){
        Model.findOne({_id: chat_item.forum_id})
            .exec(function (error, forum_item) {
                // save author info and send only id while inserting
                var author = chat_item.author;
                chat_item.author=author._id;
                delete chat_item.forum_id;
                if (forum_item) {
                    forum_item.chats.push(chat_item);
                    forum_item.save(function (error, new_forum) {
                        chat_item.author = author;
                        // chat_item is by reference so the corresponding reference will be updated
                        callback(error, new_forum);
                    });
                }
            });
    };
    this.findPublicForumsPaged = function(searchQuery,pagingSorting, callback) {
        if(!searchQuery._id) {
            searchQuery.is_private = false;
        }
        this.findForumsPaged(searchQuery,pagingSorting, callback);
    };
    this.findPrivateForumsPaged = function(searchQuery,pagingSorting, callback) {
        searchQuery.is_private = true;
        searchQuery['$or'] =
            [{ author : mongoose.mongo.ObjectId(searchQuery._id)},
                { visible_to : mongoose.mongo.ObjectId(searchQuery._id) }];
        delete searchQuery._id;
        this.findForumsPaged(searchQuery,pagingSorting, callback);
    };
    this.findForumsPaged = function(searchQuery,pagingSorting, callback) {
        Model.count(searchQuery, function(err, totalCount){
            if (err) {
                callback(err, null, 0);
            } else {
                var queryPartition = Model.find(searchQuery)
                .select(mUtils.restrictField(constants.FIELD.CHATS));
                if(searchQuery._id) {
                    queryPartition = queryPartition.populate(constants.FIELD.VISIBLE_TO);
                }
                queryPartition.populate(constants.FIELD.AUTHOR)
                    .select(mUtils.restrictField(constants.FIELD.AUTHOR_PASSWORD))
                    .select(mUtils.restrictField(constants.FIELD.AUTHOR_TOKEN))
                .skip(pagingSorting.skipCount)
                .limit(pagingSorting.itemsPerPage)
                .sort(pagingSorting.sortField)
                .exec(function (err, items) {
                    callback(err, items, totalCount);
                });
            }

        });
    };
    this.getChatsOfForum = function(searchQuery, callback){
      Model.findOne(searchQuery)
        .populate(constants.FIELD.VISIBLE_TO)
        .populate(constants.FIELD.AUTHOR)
        .populate(constants.FIELD.AUTHOR_IN_CHATS)
          .select(mUtils.restrictField(constants.FIELD.CHAT_AUTHOR_PASSWORD))
          .select(mUtils.restrictField(constants.FIELD.CHAT_AUTHOR_TOKEN))
        .exec(function (err, forum) {
           callback(err,forum);
        });
    };
    this.getChatsOfPrivateForum = function(options, callback) {
        checkUserHasAccessToPrivateForum(options, function() {
            options._id = options.forum_id;
            delete options.forum_id;
            self.getChatsOfForum(options, callback);
        });
    };
    this.addChatToPrivateForum = function(options, callback) {
        checkUserHasAccessToPrivateForum(options, function() {
            delete options._id;
            self.addChatInForum(options, callback);
        });
    };
    function checkUserHasAccessToPrivateForum(options, callback) {
        var searchQuery = {};
        searchQuery.is_private = true;
        searchQuery._id = options.forum_id;
        searchQuery['$or'] =
            [{ author : mongoose.mongo.ObjectId(options._id)},
                { visible_to : mongoose.mongo.ObjectId(options._id) }];
        Model.count(searchQuery, function(err, totalCount){
            if (err || totalCount !== 1) {
                err = err? err : {};
                err.msg = constants.ERROR.NO_ACCESS_TO_FORUM;
                callback(err, null);
            } else {
                callback(null, options);
            }
        });
    }
}
module.exports.Forum = Forum;