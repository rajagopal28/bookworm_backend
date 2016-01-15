function Forum(mongoose) {
    'use strict';
    var self = this;
    var chatSchemaDefinition = {content : String, 
                  created_ts: { type: Date, 
                               default: Date.now},
                 author_id : String};
    var charSchema = { 
        chat_comment : String,
        author_id : String,
        created_lent_ts : { type : Date, default : Date.now},
        last_modified_ts : { type : Date, default : Date.now}
    }; 
    mongoose.Schema(chatSchemaDefinition);
    var forumSchemaDefinition = {
        forum_title : String,
        thumbnail_url : String,
        description : String,
        author_id : String,
        chats : [charSchema],
        created_ts : { type : Date, default : Date.now},
        last_modified_ts : { type : Date, default : Date.now}
    };
    var forumSchema = mongoose.Schema(forumSchemaDefinition);
    this.Model = mongoose.model('Forum', forumSchema);
    this.buildSearchQuery = function(searchQuery){
      if(searchQuery.title) {
        searchQuery.title = mUtils.addRegexOption(searchQuery.title);
        }
        return searchQuery;
    };
};
module.exports.Forum = Forum;