app.constant('Constants', {
    DEFAULT_ITEMS_PER_PAGE : 10,
    DEFAULT_MAXIMUM_PAGES : 10,
    SORT_ORDER_ASC : 'asc',
    SORT_ORDER_DESC : 'desc',
    DEFAULT_SORT_FIELD : 'createdTS',
    DEFAULT_LOCAL_IMAGES_PATH : '../static/images/',
    DEFAULT_POST_ERROR_MESSAGE : 'Problem submitting the details. Please try after sometime!',
    MESSAGE_USERNAME_AVAILABLE : 'User name available',
    MESSAGE_USERNAME_UNAVAILABLE : 'User name is not available',
    MODAL_SIZE_LARGE : 'l',
    MODAL_DISMISS_RESPONSE : 'cancel',
    DEFAULT_HTTP_TIMEOUT : '1000', // milliseconds
    DEFAULT_MIN_YEAR : 1900,
    DEFAULT_MIN_MONTH : 5,
    DEFAULT_MIN_DATE : 22,
    DEFAULT_DATE_FORMAT : 'dd-MMMM-yyyy',
    DEFAULT_YEAR_FORMAT : 'yy',
    PARAM_VALUE_GENDER_MALE : 'male',
    PARAM_VALUE_GENDER_FEMALE : 'female',
    ERROR_LOGIN_FAILED : 'Invalid credentials!!',
    ERROR_MISSING_REQUIRED_FIELDS : 'Missing one or more required fields',
    DEFAULT_DATA_ERROR_MESSAGE : 'Something went wring. Please try after sometime!',
    PARAM_USER_NAME : 'username',
    PARAM_USER_IMAGE_FILE_NAME : 'file',
    MAX_FILE_UPLOAD_LIMIT : '5242880', // Bytes --> 5MB
    GOOGLE_BOOKS_SEARCH_PARAM_ISBN : 'isbn:',
    GOOGLE_BOOKS_SEARCH_PARAM_IN_TITLE : 'intitle:',
    GOOGLE_BOOKS_SEARCH_MAX_RESULTS : 10,
    GOOGLE_BOOK_VALID_ISBN_LENGTHS : [10,13],
    GOOGLE_BOOK_MIN_TITLE_QUERY_LIMIT : 5,
    GOOGLE_BOOK_ISBN_TYPE_10 : 'ISBN_10',
    ALL_BOOK_GENRES : ['History', 'Romance', 'Drama', 'Mystery', 'Science', 'Fiction', 'Thriller', 'Comedy', 'Philosophy', 'Spiritual'],
    BOOKWORM_HTTP_AUTH_TOKEN_BEARER : 'Bearer ',
    ERROR_MESSAGE_FILE_SIZE_LIMIT_EXCEEDED : 'Sorry we cannot upload the file. File size should be less than 5MB.',

    EVENT_NAME_DATE_SET : 'date-set',
    EVENT_NAME_NEW_CHAT : 'new-chat',
    getDefaultPagingSortingData : function() {
        var pageSortDefaults = {
            itemsPerPage : this.DEFAULT_ITEMS_PER_PAGE,
            totalItems : 0,
            pageNumber : 1,
            primarySort : {},
            maximumPages : this.DEFAULT_MAXIMUM_PAGES
        };
        pageSortDefaults.primarySort[this.DEFAULT_SORT_FIELD] = this.SORT_ORDER_ASC;
        return pageSortDefaults;
    }
});