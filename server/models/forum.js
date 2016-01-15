function Forum(mongoose) {
    'use strict';
    var self = this;
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
            google_id : String
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
    this.Model = mongoose.model('Forum', forumSchema);
    this.buildSearchQuery = function (searchQuery) {
        if (searchQuery.title) {
            searchQuery.title = mUtils.addRegexOption(searchQuery.title);
        }
        return searchQuery;
    };
};
module.exports.Forum = Forum;