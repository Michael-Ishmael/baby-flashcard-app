/**
 * Created by michaelishmael on 04/02/2016.
 */

app.controller('backlogController', ['$scope', 'imageDataService', function ($scope, imageDataService) {

    $scope.backlog = [];

    function init(){
        for (var i = 0; i < seedData_1.backlog.length; i++) {
            var item = seedData_1.backlog[i];
            $scope.backlog.push({
                id : item.id,
                path : '../media/' + item.path,
                index : i
            });

        }
    }

    $scope.selectImage = function(item){
        imageDataService.selectBacklogItem(item);
    };


    init();

}]);
