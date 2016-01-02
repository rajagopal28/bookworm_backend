function Book(mongoose) {
    'use strict';
    var self = this;
    var bookSchemaDefinition = {
        book_name : String,
        thumbnail_url : String,
        description : String,
        author_name : { type: [String], index : true},
        genres : { type: [String]},
        created_lent_ts : { type : Date, default : Date.now},
        last_modified_ts : { type : Date, default : Date.now},
        is_available : Boolean,
        exchange_only : Boolean
    };
    var bookSchema = mongoose.Schema(bookSchemaDefinition);
    this.Model = mongoose.model('Book', bookSchema);
    this.buildSearchQuery = function(searchQuery, mUtils) {
        var $or =[];
        if(searchQuery.book_name) {
            searchQuery.book_name = mUtils.addRegexOption(searchQuery.book_name);
            $or.push({book_name: searchQuery.book_name});
            delete searchQuery.book_name;// remove the key value pair
        }
        if(searchQuery.author_name) {
            searchQuery.author_name = mUtils.addRegexOption(searchQuery.author_name);
            $or.push({author_name: {$elemMatch : searchQuery.author_name }});
            delete searchQuery.author_name;// remove the key value pair
        }
        if(searchQuery.genres) {
            $or.push({genres: searchQuery.genres});
            //{$elemMatch : searchQuery.genres }
            delete searchQuery.genres;// remove the key value pair
        }
        if($or.length > 0) {
            searchQuery.$or = $or;
        }
        return searchQuery;
    };
};
module.exports.Book = Book;