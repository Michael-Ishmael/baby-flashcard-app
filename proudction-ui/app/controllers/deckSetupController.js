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
        imageDataService.ready().then(
            function success(){
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
            },
            function fail(){

            }
        );



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

    $scope.$watch('currentDeck.soundFolder', function (nv, ov) {
        if(nv && nv != ov){
            setupSounds();
        }

    }, true);

    $scope.$watch('sounds|filter:{selected:true}', function (nv) {
        if($scope.currentDeck)
            $scope.currentDeck.sounds = nv.map(function(s){
               return {
                   name: s.name,
                   path: s.path
               }
            });
    }, true);

    $scope.createCollectionItem = function (collectionType) {
        var item = null;
        if(collectionType == 'set'){
            item = imageDataService.createSet();
            $scope.currentSet = item;
            $scope.currentDeck = null;
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
            $scope.currentDeck = null;
            $scope.paramholder.deckParams.existingItems = $scope.currentSet.decks;
        }
        if(collectionType == 'deck'){
            $scope.currentDeck = item;
            setupSounds();
        }
    };

    $scope.saveCollectionItem = function (collectionType, add) {
        if(collectionType == 'set'){
            if(add) imageDataService.addSet($scope.currentSet);
            imageDataService.save();
        }
        if(collectionType == 'deck'){
            if(add) imageDataService.addDeck($scope.currentDeck, $scope.currentSet);
            imageDataService.save();
        }
        //init();
    };

    $scope.deleteCollectionItem = function(collectionType){
        if(collectionType == 'set'){
            if(imageDataService.deleteSet($scope.currentSet)){
                imageDataService.save();
            }
        }
        if(collectionType == 'deck'){
            if(imageDataService.deleteDeck($scope.currentDeck, $scope.currentSet)){
                imageDataService.save();
            }

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
