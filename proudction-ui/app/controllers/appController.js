/**
 * Created by michaelishmael on 04/02/2016.
 */

app.controller('appController', ['$scope', '$location',  'imageDataService', function ($scope, $location, imageDataService) {

    $scope.subViews = [
        'views/backlogView.html',
        'views/assignmentView.html',
        'views/croppingView.html'
    ];

    $scope.currentViewIndex = 0;
    $scope.currentView = $scope.subViews[0];
    $scope.currentItemKey = null;

    $scope.nextView = function(){
        var currentIndex = $scope.currentViewIndex;
        if(currentIndex >= $scope.subViews.length){
            currentIndex = 0;
        } else {
            currentIndex++;
        }
        $scope.currentViewIndex = currentIndex;
        $scope.currentView =  $scope.subViews[currentIndex];

    };

    $scope.$on('wizard:itemSelected', function (event, item) {
            $scope.currentItemKey = item.key;
        }
    );

    $scope.storeLastPage = function(lastPage){
        $scope.lastPage = lastPage;
    };

    /*
    $scope.$on('wizard:itemAssigned', function (event, data) {
            var view = 'crop';
            var path = data.key ? view + '/' + data.key : view;
            $location.path(path); // path not hash
        }
    );*/


}]);
