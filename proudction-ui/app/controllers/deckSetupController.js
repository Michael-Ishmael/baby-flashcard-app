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
        $scope.soundFolders = imageDataService.soundFolders;




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

    function setupSounds(){

        var deck = $scope.currentDeck;
        if(imageDataService.sounds && deck){

            var selectedPaths = deck.sounds ? deck.sounds.map(function(s){return s.path }) : [] ;

            $scope.sounds = imageDataService.sounds.map(function(s){
                var selected = selectedPaths.indexOf(s.path) > -1;
                return {
                    name: s.name,
                    path: s.path,
                    subFolder: s.subFolder,
                    selected: selected
                }
            });
        }
    }

    $scope.$watch('sounds|filter:{selected:true}', function (nv) {
        if($scope.currentDeck)
            $scope.currentDeck.sounds = nv;
    }, true);

    $scope.createCollectionItem = function (collectionType) {
        var item = null;
        if(collectionType == 'set'){
            item = imageDataService.createSet();
            $scope.currentSet = item;
            $scope.paramholder.deckParams.existingItems = $scope.currentSet.decks;
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
            $scope.paramholder.deckParams.existingItems = $scope.currentSet.decks;
        }
        if(collectionType == 'deck'){
            $scope.currentDeck = item;
            setupSounds();
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
