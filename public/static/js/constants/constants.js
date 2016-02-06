app.constant('Constants', {
    DEFAULT_ITEMS_PER_PAGE : 10,
    DEFAULT_MAXIMUM_PAGES : 10,
    SORT_ORDER_ASC : 'asc',
    SORT_ORDER_DESC : 'desc',
    DEFAULT_SORT_FIELD : 'createdTS',
    DEFAULT_LOCAL_IMAGES_PATH : '../static/images/',
    DEFAULT_POST_ERROR_MESSAGE : 'Problem submitting the details. Please try after sometime!',
    ERROR_LOGIN_FAILED : 'Invalid credentials!!',
    DEFAULT_DATA_ERROR_MESSAGE : 'Something went wring. Please try after sometime!',
    PARAM_USER_NAME : 'username',
    PARAM_USER_IMAGE_FILE_NAME : 'file',
    MAX_FILE_UPLOAD_LIMIT : '5242880', // Bytes --> 5MB
    ERROR_MESSAGE_FILE_SIZE_LIMIT_EXCEEDED : 'Sorry we cannot upload the file. File size should be less than 5MB.',
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