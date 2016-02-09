/**
 * Created by michaelishmael on 04/02/2016.
 */

app.controller('backlogController', ['$scope', 'imageDataService', function ($scope, imageDataService) {

    $scope.backlog = [];

    function init(){
        $scope.backlog = imageDataService.backlogItems;
    }

    $scope.selectImage = function(item){
        imageDataService.selectBacklogItem(item);
    };


    init();

}]);
