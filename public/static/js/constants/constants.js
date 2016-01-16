app.constant('Constants', {
    DEFAULT_ITEMS_PER_PAGE : 10,
    SORT_ORDER_ASC : 'asc',
    SORT_ORDER_DESC : 'desc',
    DEFAULT_SORT_FIELD : 'createdTS',
    getDefaultPagingSortingData : function() {
        return {
            itemsPerPage : this.DEFAULT_ITEMS_PER_PAGE,
            totalItems : 0,
            pageNumber : 1,
            primarySort : {
                sortOrder : this.SORT_ORDER_ASC,
                sortField : this.DEFAULT_SORT_FIELD
            },
            maximumPages : 10
        };
    }
});