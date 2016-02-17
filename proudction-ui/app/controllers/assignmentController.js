/**
 * Created by michaelishmael on 04/02/2016.
 */

app.controller('assignmentController', ['$scope', '$routeParams', 'imageDataService', function ($scope, $routeParams, imageDataService) {


    function init() {

    }

    $scope.selectedData = {};
    $scope.selectedDecks = [];

    $scope.getImagePath = function (seedPath) {
        return '../media/backlog/' + seedPath;
    };


    $scope.sortableOptions = {

        stop: function (e, ui) {
            var deckItems = $scope.existingDeckCards;
            for (var i = 0; i < deckItems.length; i++) {
                var item = deckItems[i];
                item.indexInDeck = i;
            }
        }
    };

    $scope.$on('$viewContentLoaded', function () {

        imageDataService.ready().then(
            function isReady(){

                if (!imageDataService.currentItem) {
                    var imageId = $routeParams.imageId;
                    var item = imageDataService.getBacklogItem(imageId);
                    if (item) imageDataService.selectBacklogItem(item);
                    $scope.setPreviewPath(imageDataService.currentItem);
                }

                $scope.currentItem = imageDataService.currentItem;
                if(imageDataService.currentDeck){
                    $scope.selectedDecks.push(imageDataService.currentDeck)
                }
                $scope.sets = imageDataService.sets;
                $scope.selectedSet = imageDataService.currentSet;
                $scope.decks = set.decks;
                //var deckIndex = getIndexFromName(decks, deck.name)
                $scope.selectedDeck = imageDataService.currentDeck;
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
                $scope.currentDeck = deck;
                var item = $scope.currentItem;
                $scope.currentDeck.images.push(item);
                item.indexInDeck = $scope.currentDeck.images.length;

                $scope.soundsForDeck = deck.sounds.map(function(s){ return{
                    name: s.name,
                    path: '../media/sounds/' + s.path
                } }); // imageDataService.getSoundsForDeck(deck);
            }
        }
    );

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
        return item && item.deck && item.indexInDeck > -1
    };

    $scope.moveNext = function(){
        $scope.$emit('wizard:itemAssigned', imageDataService.currentItem);
    };

    init();

}]);

