/**
 * Created by michaelishmael on 04/02/2016.
 */

app.controller('backlogController', ['$scope', 'imageDataService', function ($scope, imageDataService) {

    $scope.backlog = [];
    $scope.ready = false;

    function init(){
        $scope.ready = imageDataService.ready;
    }


    $scope.$on('wizard:ready', function (event, data) {
            $scope.ready = true;
            $scope.backlog = data.backlog.map(function(i){
                return {
                    id: i.id,
                    name : i.name,
                    path : '../media/backlog/' + i.sub_path
                }
            });
        }
    );

    $scope.selectImage = function(item){
        imageDataService.selectBacklogItem(item);
    };


    init();

}]);
