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
.controller('DiscussionChatController', ['$scope','$routeParams', function($scope, $routeParams){
    var discussionId = $routeParams.discussionId;
    console.log(discussionId);
    $scope.isCommentorAuthor = function(chatItem) {
        return chatItem.creator.id === $scope.discussion.creator.id;
    };
    $scope.discussion = {};
    $scope.discussionChats = [];
    // make service call to get list of discussion and the 
    $scope.discussion = { id: 'disc1', title: 'Discussion on topic 1', description: 'Some description of the discussion topic 1', creator : { id: 'someUserId1', name:'Some Name 1'},
        createdDate : '12/12/2012'};
    $scope.discussionChats = [
        { id: 'chat1', title: 'Chatter on topic 1', description: 'Some description of the Chatter topic 1', creator : { id: 'someUserId1', name:'Some Name 1'},
        createdDate : '12/12/2012'},
        { id: 'chat2', title: 'Chatter on topic 2', description: 'Some description of the Chatter topic 2', creator : { id: 'someUserId2', name:'Some Name 2'},
        createdDate : '12/12/2012'},
        { id: 'chat3', title: 'Chatter on topic 3', description: 'Some description of the Chatter topic 3', creator : { id: 'someUserId3', name:'Some Name 3'},
        createdDate : '12/12/2012'},
        { id: 'chat4', title: 'Chatter on topic 4', description: 'Some description of the Chatter topic 4', creator : { id: 'someUserId1', name:'Some Name 1'},
        createdDate : '12/12/2012'},
        { id: 'chat5', title: 'Chatter on topic 5', description: 'Some description of the Chatter topic 5', creator : { id: 'someUserId4', name:'Some Name 4'},
        createdDate : '12/12/2012'},
        { id: 'chat6', title: 'Chatter on topic 6', description: 'Some description of the Chatter topic 6', creator : { id: 'someUserId1', name:'Some Name 1'},
        createdDate : '12/12/2012'}
    ];
    
}])