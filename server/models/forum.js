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
                delete chat_item.forum_id;
                if (forum_item) {
                    console.log(forum_item);
                    forum_item.chats.push(chat_item);
                    forum_item.save(function (error, new_forum) {
                        callback(error, new_forum);
                    });
                }
            });
    };
    this.findForumsPaged = function(searchQuery,pagingSorting, callback) {
        Model.count(searchQuery, function(err, totalCount){
            if (err) {
                callback(err, null, 0);
            } else {
                Model.find(searchQuery)
                .select(mUtils.restrictField(constants.FIELD.CHATS))
                .populate(constants.FIELD.AUTHOR)
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
        .populate(constants.FIELD.AUTHOR_IN_CHATS)
        .exec(function (err, forum) {
           callback(err,forum);
        });
    };
};
module.exports.Forum = Forum;