/**
 * Created by scorpio on 13/02/2016.
 */

app.controller('deckSetupController', ['$scope', 'imageDataService', function ($scope, imageDataService) {

    $scope.sets = [];
    $scope.currentSet = null;

    $scope.decks = [];
    $scope.currentDeck = null;

    $scope.collectionParams = {
        collectionType: "set",
        iconList: [],
        existingItems: []
    };

    $scope.paramholder = {
        setParams: null,
        deckParams: null
    };

    function init() {
        $scope.ready = imageDataService.ready;
        $scope.sets = imageDataService.sets;
        $scope.setIcons = imageDataService.setIcons;
        $scope.decks = imageDataService.decks;
        $scope.deckIcons = imageDataService.deckIcons;

        $scope.paramholder.setParams = {
            collectionType: "set",
            iconList: $scope.setIcons,
            existingItems: $scope.sets
        };

        $scope.paramholder.deckParams = {
            collectionType: "deck",
            iconList: $scope.deckIcons,
            existingItems: $scope.decks
        };

    }

    $scope.createCollectionItem = function (collectionType) {
        var item = null;
        if(collectionType == 'set'){
            item = imageDataService.createSet();
            $scope.currentSet = item;
        }
        if(collectionType == 'deck'){
            item = imageDataService.createDeck();
            $scope.currentDeck = item;
        }
        return item;
    };

    $scope.setCurrentCollectionItem = function(collectionType, item) {
        if(collectionType == 'set'){
            $scope.currentSet = item;
        }
        if(collectionType == 'deck'){
            $scope.currentDeck = item;
        }
    };

    $scope.saveCollectionItem = function (collectionType, add) {
        if(collectionType == 'set'){
            imageDataService.saveSet($scope.currentSet, add);
        }
        if(collectionType == 'deck'){
            imageDataService.saveDeck($scope.currentDeck, add ? $scope.currentSet : null);
        }
        init();
    };

    $scope.deleteCollectionItem = function(collectionType){
        if(collectionType == 'set'){
            imageDataService.deleteSet($scope.currentSet);
        }
        if(collectionType == 'deck'){
            imageDataService.deleteDeck($scope.currentDeck, $scope.currentSet);

        }
    };

    $scope.sortableOptions = {

        stop: function (e, ui) {
            /*            var deckItems = $scope.existingDeckCards;
             for (var i = 0; i < deckItems.length; i++) {
             var item = deckItems[i];
             item.indexInDeck = i;
             }*/
        }
    };

    $scope.$on('wizard:ready', function (event, data) {
            init();
            //$scope.ready = true;
            //$scope.backlog = data.backlog.map(function (i) {
            //    return {
            //        id: i.id,
            //        name: i.name,
            //        path: '../media/backlog/' + i.sub_path
            //    }
            //});
        }
    );

    $scope.selectImage = function (item) {
        imageDataService.selectBacklogItem(item);
    };


    init();

}]);
