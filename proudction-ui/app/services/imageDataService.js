/**
 * Created by michaelishmael on 02/02/2016.
 */

app.factory('imageDataService', ['$rootScope', '$http', '$timeout', function ($rootScope, $http, $timeout) {

    var self = {};
    self.wizardIndex = 0;

    self.imageDataManger = new ImageDataManager();
    self.imageDataItems = [];
    self.currentItem = null;
    self.sets = seedData_1.sets;
    self.backlogItems = [];
    self.setIcons = [];
    self.deckIcons = [];

    self.itemIndexes = {val: ""};
    self.ready = false;
    self.data = {};

    function loadData() {
        $http({
            method: 'GET',
            url: 'http://localhost:8000/imageprocessor/'
        }).then(function successCallback(response) {

            self.setIcons = [
                {
                    name: 'chickenIcon.gif',
                    path: '../media/seticons/chickenIcon.gif'
                },
                {
                    name: 'lionIcon.gif',
                    path: '../media/seticons/lionIcon.gif'
                }
            ];

            self.deckIcons = [
                {
                    name: 'chickenThumb.png',
                    path: '../media/deckthumbs/domestic/chickenThumb.png'
                },
                {
                    name: 'cowThumb.png',
                    path: '../media/deckthumbs/domestic/cowThumb.png'
                },
                {
                    name: 'horseThumb.png',
                    path: '../media/deckthumbs/domestic/horseThumb.png'
                }
            ];

            self.data = response.data;
            self.imageDataManger.sets = response.data.sets;
            self.sets = self.imageDataManger.sets;
            self.ready = true;
            $timeout(function () {
                $rootScope.$broadcast('wizard:ready', self.data);
            }, 100);

        }, function errorCallback(response) {

        });
    }

    function syncData() {
        var data = {
            sets: self.imageDataManger.sets
        } ;
        $http.post('http://localhost:8000/imageprocessor/update', data).then(function(response){
            console.log(response.data);
        }, function(response){

        });

    }

    function init() {
        loadData();
        self.sets = self.imageDataManger.sets;
/*        for (var i = 0; i < seedData_1.backlog.length; i++) {
            var item = seedData_1.backlog[i];
            self.backlogItems.push({
                id: item.id,
                path: '../media/' + item.path,
                index: i
            });

        }*/
    }

    self.createSet = function (setName) {
        return self.imageDataManger.createSet(setName)
    };

    self.saveSet = function (set, add) {
        if(add) self.imageDataManger.addSet(set);
        syncData();
    };

    self.deleteSet = function(set){
        if(self.imageDataManger.deleteSet(set))
        {
            syncData();
        }
    };

    self.createDeck = function (deckName) {
        return self.imageDataManger.createDeck(deckName)
    };

    self.saveDeck = function (deck, parentSet) {
        if(parentSet) self.imageDataManger.addDeck(deck, parentSet);
        syncData();
    };

    self.deleteDeck = function(deck, parentSet){
        if(self.imageDataManger.deleteDeck(deck, parentSet))
        {
            syncData();
        }
    };


    //self.cropManager = new ImageDataManager(seedData_1);

    self.getBacklogItem = function (itemId) {
        for (var i = 0; i < self.backlogItems.length; i++) {
            var item = self.backlogItems[i];
            if (item.id == itemId) return item;
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

    self.getSoundsForDeck = function (deckName) {
        var soundNames = seedData_1.sounds[deckName];
        var deckSounds = [];
        for (var i = 0; i < soundNames.length; i++) {
            var sound = soundNames[i];
            deckSounds.push({name: sound, path: '../media/sounds/' + sound});
        }
        return deckSounds;
    };

    self.setDeckOnItem = function (item, deck) {
        if (item.deck != deck) {
            var deckItems = self.getExistingItemsForDeck(deck);
            var newIndex = 0;
            if (deckItems && deckItems.length)
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
    sounds: {
        'chicken': [
            'Chicken1.mp3',
            'Chicken2.mp3',
            'Chicken3.mp3',
            'Chicken4.mp3',
            'Chicken5.mp3',
            'Chicken6.mp3'
        ],
        'cow': [
            'Cow1.mp3',
            'Cow2.mp3',
            'Cow3.mp3',
            'Cow4.mp3',
            'Cow5.mp3',
            'Cow6.mp3'
        ],
        'horse': [
            'Horse1.mp3',
            'Horse2.mp3',
            'Horse3.mp3',
            'Horse4.mp3',
            'Horse5.mp3',
            'Horse6.mp3'
        ]
    },
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