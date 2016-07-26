app.constant('Constants', {
    DEFAULT_ITEMS_PER_PAGE : 10,
    DEFAULT_MAXIMUM_PAGES : 10,
    SORT_ORDER_ASC : 'asc',
    SORT_ORDER_DESC : 'desc',
    DEFAULT_SORT_FIELD : 'createdTS',
    DEFAULT_LOCAL_IMAGES_PATH : '../static/images/',
    DEFAULT_CONFIRMATION_MESSAGE : 'Are you sure want to perform this action?',
    CONFIRM_REMOVE_FRIEND : 'Are you sure want to remove this user from your network?',
    CONFIRM_ADD_FRIEND : 'Are you sure want to send friend request to this user?',
    CONFIRM_ADD_BOOK : 'Are you sure want to add this book to the list?',
    CONFIRM_EDIT_BOOK : 'Are you sure want to edit this book\'s details?',
    CONFIRM_ADD_FORUM : 'Are you sure want to add this forum?',
    CONFIRM_EDIT_FORUM : 'Are you sure want to edit this forum?',
    CONFIRM_BORROW_BOOK : 'Are you sure want to send this borrow request?',
    DEFAULT_POST_ERROR_MESSAGE : 'Problem submitting the details. Please try after sometime!',
    INFO_MESSAGE_AUTO_COMPLETE_FORM_BOOK : ' This form has autocomplete enabled for some fields. Type in \n ISBN or Book name to fill in details.',
    DEFAULT_POST_SUCCESS_MESSAGE : 'Your data has been submitted!',
    SUCCESS_MESSAGE_PASSWORD_RESET_REQUESTED : ' Your Will receive an email confirmation shortly!!',
    SUCCESS_MESSAGE_PASSWORD_RESET_SENT : ' Your password has been reset!',
    SUCCESS_MESSAGE_PASSWORD_REST_DONE : ' Password change successful!!',
    SUCCESS_MESSAGE_FRIEND_REQUEST_SENT : ' Your request has been sent!',
    SUCCESS_MESSAGE_FRIEND_ADDED : ' Friend added to your network',
    SUCCESS_MESSAGE_IMAGE_UPLOADED : 'Your image has been uploaded to the file system. Please click save in update profile to apply it to profile.',
    SUCCESS_MESSAGE_FEEDBACK_SENT : 'Your feedback have been submitted. Thanks for sharing your good thoughts and supporting BookWorm.',
    SUCCESS_MESSAGE_BORROW_REQUEST_SENT : 'Your request has been sent to the user. You\'ll receive a direct email response.',
    INFO_MESSAGE_REGISTRATION_EMAIL : 'Kindly give a valid email ID. \n The current system depends on emails to allow interaction between bookworms.\n We are working on bringing smarter ways of interactions.',
    MESSAGE_USERNAME_AVAILABLE : 'User name available',
    MESSAGE_USERNAME_UNAVAILABLE : 'User name is not available',
    MODAL_SIZE_LARGE : 'l',
    MODAL_SIZE_SMALL : 's',
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
    MSG_TYPE : {
        SUCCESS: 'success',
        ERROR: 'danger',
        WARN: 'warning',
        INFO: 'info'
    },
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
    },
    getPostSuccessMessage: function(successMsg) {
        return this.getMessage(successMsg? successMsg : this.DEFAULT_POST_SUCCESS_MESSAGE, this.MSG_TYPE.SUCCESS);
    },
    getPostErrorMessage: function(error) {
        return this.getMessage(error && error.msg? error.msg : this.DEFAULT_DATA_ERROR_MESSAGE, this.MSG_TYPE.ERROR);
    },
    getGetErrorMessage: function(error) {
        return this.getMessage(error && error.msg? error.msg : this.DEFAULT_DATA_ERROR_MESSAGE, this.MSG_TYPE.ERROR);
    },
    getMessage: function( message, type) {
        return {text: message, type: type};
    }
});