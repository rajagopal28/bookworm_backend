function Book(mongoose) {
    'use strict';
    var self = this;
    var constants = {
        SCHEMA_HOOK_UPDATE : 'update',
        SCHEMA_HOOK_SAVE : 'save'
    };
    var MODEL_NAME_BOOK = 'Book';
    var bookSchemaDefinition = {
        book_name: String,
        thumbnail_url: String,
        description: String,
        google_id : String,
        isbn : String,
        author_name: {type: [String], index: true},
        genres: {type: [String]},
        created_lent_ts: {type: Date, default: Date.now},
        last_modified_ts: {type: Date, default: Date.now},
        is_available: Boolean,
        exchange_only: Boolean,
        contributor: {
            author_name: String,
            username: String,
            thumbnail_url: String
        }
    };
    var bookSchema = mongoose.Schema(bookSchemaDefinition);
    bookSchema.pre(constants.SCHEMA_HOOK_SAVE, function(next){
        var book = this;
        book.last_modified_ts = Date.now();
        next();
    });
    this.Model = mongoose.model(MODEL_NAME_BOOK, bookSchema);
    this.buildSearchQuery = function (searchQuery, mUtils) {
        var $or = [];
        if (searchQuery.book_name) {
            searchQuery.book_name = mUtils.addRegexOption(searchQuery.book_name);
            $or.push({book_name: searchQuery.book_name});
            delete searchQuery.book_name;// remove the key value pair
        }
        if (searchQuery.author_name) {
            searchQuery.author_name = mUtils.addRegexOption(searchQuery.author_name);
            $or.push({author_name: {$elemMatch: searchQuery.author_name}});
            delete searchQuery.author_name;// remove the key value pair
        }
        if (searchQuery.genres) {
            $or.push({genres: searchQuery.genres});
            //{$elemMatch : searchQuery.genres }
            delete searchQuery.genres;// remove the key value pair
        }
        if ($or.length > 0) {
            searchQuery.$or = $or;
        }
        return searchQuery;
    };
};
module.exports.Book = Book;