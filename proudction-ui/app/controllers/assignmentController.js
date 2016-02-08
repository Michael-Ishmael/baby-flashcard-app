/**
 * Created by michaelishmael on 04/02/2016.
 */

app.controller('assignmentController', ['$scope', 'imageDataService', function ($scope, imageDataService) {


/*    $scope.currentItem = imageDataService.currentItem;
    $scope.initialized = false;
    $scope.sets = [{id: 1, name: 'domestic'}];
    $scope.selectedSet = null;
    $scope.decks = [];
    $scope.selectedDeck = null;
    $scope.availableIndexes = [];
    $scope.selectedIndex = -1;*/

    function init() {

    }

    $scope.getImagePath = function (seedPath) {
        return seedPath;
    };

    $scope.$on('$viewContentLoaded', function() {
        $scope.currentItem = imageDataService.currentItem;
        var sets = imageDataService.sets;
        $scope.sets = sets;
        var setIndex = -1;
        if(imageDataService.currentItem && imageDataService.currentItem.deck != null){
            var deck = imageDataService.currentItem.deck;
            setIndex = getIndexFromName(sets, deck.set);

        }
        if(setIndex == -1) setIndex = 0;
        var set = sets[setIndex];
        $scope.selectedSet = set;
        $scope.decks = set.decks;
        //var deckIndex = getIndexFromName(decks, deck.name)
        $scope.selectedDeck = deck;
        if(!imageDataService.currentItem || imageDataService.currentItem.indexInDeck == -1)
            $scope.selectedIndex = 0;
        else
            $scope.selectedIndex = imageDataService.currentItem.indexInDeck;
    });
    
    //$scope.getExistingDeckCards = function(){
    //    var selectedDeck = $scope.selectedDeck;
    //    if(!(selectedDeck && selectedDeck.length)) return [];
    //    var items = imageDataService.getExistingItemsForDeck(selectedDeck[0]);
    //    return items;
    //
    //};

    $scope.$watch(
        'selectedDeck',
        function(newValue, oldValue){
            if(newValue && newValue.length){
                var deck = newValue[0];
                var item = $scope.currentItem;
                imageDataService.setDeckOnItem(item, deck);
                $scope.existingDeckCards = imageDataService.getExistingItemsForDeck(deck);
            }
        }

    );

    function getIndexFromName(arr, name){
        for (var i = 0; i < arr.length; i++) {
            var item = arr[i];
            if(item.name == name){
                return i;
            }
        }
        return -1;
    }

    $scope.$on('wizard:itemSelected', function (event, data) {
            $scope.currentItem = data;
            $scope.itemIndexes = imageDataService.itemIndexes;
        }
    );

    init();

}]);

