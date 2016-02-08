function Forum(mongoose) {
    'use strict';
    var self = this;
    var constants = {
        SCHEMA_HOOK_UPDATE : 'update',
        SCHEMA_HOOK_SAVE : 'save'
    };
    var MODEL_NAME_FORUM = 'Forum';
    var chatSchemaDefinition = {
        chat_comment: String,
        author: {
            author_name: String,
            username: String,
            thumbnail_url: String
        },
        created_ts: {type: Date, default: Date.now},
        last_modified_ts: {type: Date, default: Date.now}
    };
    var charSchema = mongoose.Schema(chatSchemaDefinition);
    var forumSchemaDefinition = {
        forum_title: String,
        referred_book :{
            book_name : String,
            isbn : String,
            google_id : String,
            thumbnail_url : String,
            description : String
        },
        description: String,
        author: {
            author_name: String,
            username: String,
            thumbnail_url: String
        },
        chats: [charSchema],
        created_ts: {type: Date, default: Date.now},
        last_modified_ts: {type: Date, default: Date.now}
    };
    var forumSchema = mongoose.Schema(forumSchemaDefinition);
    forumSchema.pre(constants.SCHEMA_HOOK_UPDATE, function(next){
        var forum = this;
        forum.last_modified_ts = Date.now();
        next();
    });
    this.Model = mongoose.model(MODEL_NAME_FORUM, forumSchema);
    this.buildSearchQuery = function (searchQuery) {
        if (searchQuery.title) {
            searchQuery.title = self.addRegexOption(searchQuery.title);
        }
        return searchQuery;
    };
};
module.exports.Forum = Forum;