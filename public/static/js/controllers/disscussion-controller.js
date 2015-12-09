// DiscussionController
app.controller('DiscussionController', ['$scope', function($scope){
    $scope.status = {};
    $scope.discussions = [];
    // make service call to get list of discussions
    $scope.discussions = [
        { id: 'disc1', title: 'Discussion on topic 1', description: 'Some description of the discussion topic 1', creator : { id: 'someUserId1', name:'Some Name 1'},
        createdDate : '12/12/2012'},
        { id: 'disc2', title: 'Discussion on topic 2', description: 'Some description of the discussion topic 2', creator : { id: 'someUserId1', name:'Some Name 1'},
        createdDate : '12/12/2012'},
        { id: 'disc3', title: 'Discussion on topic 3', description: 'Some description of the discussion topic 3', creator : { id: 'someUserId1', name:'Some Name 1'},
        createdDate : '12/12/2012'},
        { id: 'disc4', title: 'Discussion on topic 4', description: 'Some description of the discussion topic 4', creator : { id: 'someUserId1', name:'Some Name 1'},
        createdDate : '12/12/2012'},
        { id: 'disc5', title: 'Discussion on topic 5', description: 'Some description of the discussion topic 5', creator : { id: 'someUserId1', name:'Some Name 1'},
        createdDate : '12/12/2012'},
        { id: 'disc6', title: 'Discussion on topic 6', description: 'Some description of the discussion topic 6', creator : { id: 'someUserId1', name:'Some Name 1'},
        createdDate : '12/12/2012'}
    ];
}])