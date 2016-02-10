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

    $scope.$on('wizard:itemSelected', function (event, data) {
            var view = 'assign';
            var path = data.id ? view + '/' + data.id : view;
            $location.path(path); // path not hash
        }
    );

    $scope.$on('wizard:itemAssigned', function (event, data) {
            var view = 'crop';
            var path = data.id ? view + '/' + data.id : view;
            $location.path(path); // path not hash
        }
    );


}]);
