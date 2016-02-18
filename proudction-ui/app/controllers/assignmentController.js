/**
 * Created by michaelishmael on 04/02/2016.
 */

app.controller('assignmentController', ['$scope', '$routeParams', '$location', 'imageDataService',
        function ($scope, $routeParams, $location, imageDataService) {


    function init() {

    }


    $scope.getImagePath = function (seedPath) {
        if(!seedPath)  return "mask.png";
        return '../media/backlog/' + seedPath;
    };

    $scope.getSoundPath = function (seedPath) {
        if(!seedPath)  return "#";
        return '../media/sounds/' + seedPath;
    };


    $scope.sortableOptions = {

        stop: function (e, ui) {
            var deckItems = $scope.selectedDeck.images;
            for (var i = 0; i < deckItems.length; i++) {
                var item = deckItems[i];
                item.indexInDeck = i;
            }
        }
    };

    $scope.$on('$viewContentLoaded', function () {
        $scope.selectedDecks = [];
        $scope.dataChanged = false;
        imageDataService.ready().then(
            function isReady(){

                if (!imageDataService.currentItem) {
                    var imageId = $routeParams.imageId;
                    var item = imageDataService.getBacklogItem(imageId);
                    if (item) imageDataService.selectBacklogItem(item);
                    $scope.setPreviewPath(imageDataService.currentItem);
                }

                $scope.currentItem = imageDataService.currentItem;

                $scope.sets = imageDataService.sets;
                $scope.selectedSet = imageDataService.currentSet;
                $scope.decks = set.decks;
                $scope.selectedDeck = imageDataService.currentDeck;
                if(imageDataService.currentDeck) $scope.selectedDecks.push(imageDataService.currentDeck)

                if (!imageDataService.currentItem || imageDataService.currentItem.indexInDeck == -1)
                    $scope.selectedIndex = 0;
                else
                    $scope.selectedIndex = imageDataService.currentItem.indexInDeck;

                $scope.setPreviewPath(imageDataService.currentItem);

            },
            function failed(){}
        );


    });

    $scope.setPreviewPath = function (item) {
        $scope.previewPath = '../media/backlog/' + item.path;

    };

    $scope.$watch(
        'selectedDecks',
        function (newValue, oldValue) {
            if (newValue && newValue.length) {
                var deck = newValue[0];
                $scope.selectedDeck = deck;
                var item = $scope.currentItem;
                checkAddImageToDeck(deck, item);
            }
        }
    );

    $scope.$watch('currentItem.sound', function(nv, ov){
        if(nv && nv != ov){
            $scope.dataChanged = true;
        }
    });

    $scope.saveChanges = function(){

        imageDataService.save();
        $scope.dataChanged = false;
    };

    function checkAddImageToDeck(deck, image){
        if(!(deck && image)) return;
        for (var i = 0; i < deck.images.length; i++) {
            var deckImage = deck.images[i];
            if(deckImage.key == image.key) return;
        }

        deck.images.push(image);
        image.indexInDeck = deck.images.length;
        $scope.dataChanged = true;
    }

    function removeImageFromDeck(deck, image){
        var indexFound = -1;
        for (var i = 0; i < deck.images.length; i++) {
            var deckImage = deck.images[i];
            if(deckImage.key == image.key){
                indexFound = i;
                break;
            }
        }
        if(indexFound > -1){
            deck.images.splice(indexFound, 1);
        }
    }

    function getIndexFromName(arr, name) {
        for (var i = 0; i < arr.length; i++) {
            var item = arr[i];
            if (item.name == name) {
                return i;
            }
        }
        return -1;
    }

    $scope.itemComplete = function () {
        var item = $scope.currentItem;
        return item && item.sound && item.indexInDeck > -1
    };

    $scope.moveNext = function(){
        var view = 'crop';
        var path = $scope.currentItem ? view + '/' + $scope.currentItem .key : view;
        $location.path(path); // path not hash

    };

    init();

}]);

