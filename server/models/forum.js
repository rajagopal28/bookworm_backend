function Forum(mongoose) {
    'use strict';
    var self = this;
    var chatSchemaDefinition = {content : String, 
                  created_ts: { type: Date, 
                               default: Date.now},
                 author_id : String};
    var charSchema = mongoose.Schema(chatSchemaDefinition);
    var forumSchemaDefinition = {
        forum_title : String,
        thumbnail_url : String,
        description : String,
        author_id : String,
        chats : [chatSchema],
        genres : { type: [String]},
        created_lent_ts : { type : Date, default : Date.now},
        last_modified_ts : { type : Date, default : Date.now}
    };
    var forumSchema = mongoose.Schema(forumSchemaDefinition);
    this.Model = mongoose.model('Forum', forumSchema);
};
module.exports.Forum = Forum;