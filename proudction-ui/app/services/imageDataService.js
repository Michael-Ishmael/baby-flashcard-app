/**
 * Created by michaelishmael on 02/02/2016.
 */

app.factory('imageDataService', ['$rootScope', '$timeout', function ($rootScope, $timeout) {

    var self = {};
    self.wizardIndex = 0;

    self.imageDataManger = new ImageDataManager();
    self.imageDataItems = [];
    self.currentItem = null;
    self.sets = seedData_1.sets;
    self.backlogItems = [];

    self.itemIndexes = {val: ""};

    function init(){
        for (var i = 0; i < seedData_1.backlog.length; i++) {
            var item = seedData_1.backlog[i];
            self.backlogItems.push({
                id : item.id,
                path : '../media/' + item.path,
                index : i
            });

        }
    }


    //self.cropManager = new ImageDataManager(seedData_1);

    self.getBacklogItem = function(itemId){
        for (var i = 0; i < self.backlogItems.length; i++) {
            var item = self.backlogItems[i];
            if(item.id == itemId) return item;
        }
        return null;
    };

    self.selectBacklogItem = function (item) {

        setCurrentItem(item);
        //self.imageDataManger.loadBacklogItem(item);

        self.itemIndexes.val = "";
        for (var i = 0; i < self.imageDataItems.length; i++) {
            var im = self.imageDataItems[i];
            self.itemIndexes.val += im.id + ","
        }
        self.wizardIndex++;
        $timeout(function () {
            $rootScope.$broadcast('wizard:itemSelected', self.currentItem);
        }, 100);

    };


    function setCurrentItem(backlogItem) {
        self.currentItem = null;
        for (var i = 0; i < self.imageDataItems.length; i++) {
            var item = self.imageDataItems[i];
            if (item.id == backlogItem.id) {
                self.currentItem = item;
            }
        }

        if (self.currentItem == null) {
            self.currentItem = ImageDataManager.createNewImageDataItem(backlogItem);
            self.imageDataItems.push(self.currentItem);
        }
    }

    self.getExistingItemsForDeck = function (deck) {
        var deckItems = [];
        for (var i = 0; i < self.imageDataItems.length; i++) {
            var item = self.imageDataItems[i];
            if (item.deck == deck) {
                item.index = i;
                deckItems.push(item);
            }
        }
        deckItems.sort(function (a, b) {

            return a.indexInDeck - b.indexInDeck;

        });
        return deckItems;
    };

    self.setDeckOnItem = function (item, deck) {
        if (item.deck != deck) {
            var deckItems = self.getExistingItemsForDeck(deck);
            var newIndex = 0;
            if(deckItems && deckItems.length)
                newIndex = deckItems[deckItems.length - 1].indexInDeck + 1;
            item.deck = deck;
            item.indexInDeck = newIndex;

        }
    };

    init();

    return self;
}]);


var seedData_1 = {
    backlog: [
        {id: 1, path: "donkey1.jpg"},
        {id: 2, path: "cow3.jpg"},
        {id: 3, path: "chicken1.jpg"},
        {id: 4, path: "horse1.jpg"},
        {id: 5, path: "cow2.jpg"}
    ],
    sets: [
        {
            name: 'domestic',
            decks: [
                'sheep', 'goat', 'chicken',
                'owl', 'cow', 'cat',
                'horse', 'pig', 'donkey',
                'rabbit', 'dog', 'duck'
            ]
        }
    ],
    imageDataItems: [
        {
            id: 1,
            original: 'crit1.png',
            name: 'Cow',
            twelve16: {
                master: {
                    orientation: "landscape",
                    crop: [0, 0, 1, 1]
                },
                alt: {
                    orientation: "portrait",
                    crop: [0, 0, 1, 1]
                }
            },
            nine16: {
                master: {
                    orientation: "landscape",
                    crop: [0, 0, 1, 1]
                },
                alt: {
                    orientation: "portrait",
                    crop: [0, 0, 1, 1]
                }
            }

        }
    ]
};