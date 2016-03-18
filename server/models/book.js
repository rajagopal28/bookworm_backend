function Book(mongoose, mUtils) {
    'use strict';
    var self = this;
    var constants = mUtils.constants;
    var bookSchemaDefinition = {
        book_name: {
            type: String,
            required: true
          },
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
        contributor: {type: mongoose.Schema.Types.ObjectId, ref: constants.MODELS.USER }
    };
    var bookSchema = mongoose.Schema(bookSchemaDefinition);
    bookSchema.pre(constants.SCHEMA_HOOK.SAVE, function(next){
        var book = this;
        book.last_modified_ts = Date.now();
        next();
    });
    var Model = mongoose.model(constants.MODELS.BOOK, bookSchema);
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

    this.addNewBook = function(new_book, callback){
        var new_rental_book = new Model(new_book);
            new_rental_book.save(function (error, new_rental_book) {
                callback(error, new_rental_book);
            });
    };
    this.updateBookDetails = function(book_item, callback){
      Model
          .update({_id : book_item._id},
            { $set : book_item }, {upsert : false},
            function (error, saved_rental_book) {
                callback(error, saved_rental_book);
            });
    };
    this.findPagedBookItems = function(searchQuery, pagingSorting, callback) {
        Model.count(searchQuery,
        function(err,totalCount){
            if(err) {
                callback(err, null, 0);
            } else {
                Model
                    .find(searchQuery)
                    .skip(pagingSorting.skipCount)
                    .limit(pagingSorting.itemsPerPage)
                    .populate(constants.FIELD.CONTRIBUTOR)
                    .sort(pagingSorting.sortField)
                    .exec(function (err, items) {
                        callback(err,items, totalCount);
                    });
            }
        });
    };
};
module.exports.Book = Book;