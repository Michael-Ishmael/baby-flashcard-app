/**
 * Created by michaelishmael on 04/02/2016.
 */

app.controller('backlogController', ['$scope', '$location', 'imageDataService', function ($scope, $location, imageDataService) {


    function init(){
        $scope.ready = imageDataService.ready;
    }


    $scope.$on('$viewContentLoaded', function () {

        imageDataService.ready().then(
            function isReady(){

                $scope.backlog = imageDataService.backlog;
                $scope.ready = false;

                var completedHierarchy = {
                    decks: []
                };

                var discardedImages = imageDataService.discardedItems;

                for (var i = 0; i < imageDataService.sets.length; i++) {
                    var set = imageDataService.sets[i];
                    for (var j = 0; j < set.decks.length; j++) {
                        var deck = set.decks[j];
                        var localDeck = null;
                        for (var k = 0; k < deck.images.length; k++) {
                            var image = deck.images[k];
                            if(image.getStatus() == ItemStatus.completed && !image.discarded){
                                if(!localDeck){
                                    localDeck = { name: deck.name, icon:deck.icon, images:[] };
                                    completedHierarchy.decks.push(localDeck);
                                }
                                localDeck.images.push(image);
                            }
                        }
                    }
                }

                $scope.completedHierarchy = completedHierarchy;
                $scope.discardedImages = discardedImages;
                $scope.ready = true;
            },
            function failed(){}
        );


    });

    $scope.isInProgress = function(item){
        return item.status == ItemStatus.assigned || item.status == ItemStatus.cropped
    };

    $scope.getImagePath = function (seedPath) {
        if(!seedPath)  return "mask.png";
        return '../media/backlog/' + seedPath;
    };

    $scope.selectImage = function(item){
        imageDataService.selectBacklogItem(item);
        var view = 'assign';
        var path = item.key ? view + '/' + item.key : view;
        $location.path(path); // path not hash
    };

    $scope.restoreDiscardedImage = function(itemKey){
        imageDataService.restoredDiscardedItem(itemKey);
        imageDataService.save();
    };


    init();

}]);
