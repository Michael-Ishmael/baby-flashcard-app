/**
 * Created by michaelishmael on 04/02/2016.
 */

app.controller('backlogController', ['$scope', 'imageDataService', function ($scope, imageDataService) {


    function init(){
        $scope.ready = imageDataService.ready;
    }


    $scope.$on('$viewContentLoaded', function () {

        imageDataService.ready().then(
            function isReady(){

                $scope.backlog = imageDataService.backlog;
                $scope.ready = false;


            },
            function failed(){}
        );


    });

    $scope.selectImage = function(item){
        imageDataService.selectBacklogItem(item);
    };


    init();

}]);
