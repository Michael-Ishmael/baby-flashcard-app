/**
 * Created by scorpio on 13/02/2016.
 */
app.controller('iconCollectionSetupController', ['$scope', 'imageDataService', function ($scope, imageDataService) {


    $scope.creatingItem = false;
    $scope.editingItem = false;
    $scope.currentItem = null;


    $scope.createItem = function () {

        $scope.currentItem = $scope.createCollectionItem($scope.collectionParams.collectionType);
        $scope.creatingItem = true;
    };

    $scope.editItem = function(item) {
        $scope.currentItem = item;
        $scope.editingItem = true;
    };

    $scope.saveItem = function () {

        $scope.saveCollectionItem($scope.collectionParams.collectionType, $scope.creatingItem);
        $scope.editingItem = false;
        $scope.creatingItem = false;

        init();
    };

    $scope.cancelEdit = function(){
        $scope.editingItem = false;
        $scope.creatingItem = false;
    };

    $scope.deleteItem = function(){
        $scope.deleteCollectionItem($scope.collectionParams.collectionType);
        $scope.editingItem = false;
    };

    $scope.setCurrentItem = function (item) {
        $scope.currentItem = item;
        $scope.setCurrentCollectionItem($scope.collectionParams.collectionType)
    };


}]);