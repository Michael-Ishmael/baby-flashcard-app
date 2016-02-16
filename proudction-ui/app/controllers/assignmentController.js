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
        var sets = imageDataService.sets;
        $scope.sets = sets;
        var setIndex = -1;
        if (imageDataService.currentItem && imageDataService.currentItem.deck != null) {
            var deck = imageDataService.currentItem.deck;
            setIndex = getIndexFromName(sets, deck.set);

        }
        if (setIndex == -1) setIndex = 0;
        var set = sets[setIndex];
        $scope.selectedSet = set;
        $scope.decks = set.decks;
        //var deckIndex = getIndexFromName(decks, deck.name)
        $scope.selectedDeck = deck;
        if (!imageDataService.currentItem || imageDataService.currentItem.indexInDeck == -1)
            $scope.selectedIndex = 0;
        else
            $scope.selectedIndex = imageDataService.currentItem.indexInDeck;

        $scope.setPreviewPath(imageDataService.currentItem);
    });

    $scope.setPreviewPath = function (item) {
        $scope.previewPath = '../media/backlog/' + item.path;

    };

    $scope.$watch(
        'selectedDecks',
        function (newValue, oldValue) {
            if (newValue && newValue.length) {
                var deck = newValue[0];
                var item = $scope.currentItem;
                imageDataService.setDeckOnItem(item, deck);

                $scope.selectedDeck = item.deck;
                $scope.existingDeckCards = imageDataService.getExistingItemsForDeck(deck);
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

