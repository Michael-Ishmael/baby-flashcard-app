/**
 * Created by michaelishmael on 02/02/2016.
 */

app.factory('imageDataService', ['$rootScope', '$http', '$q', '$timeout', function ($rootScope, $http, $q, $timeout) {

    var self = {};
    self.wizardIndex = 0;

    self.imageDataManger = new ImageDataManager();
    self.cropManager = new CropManager();

    self.currentItem = null;
    self.currentDeck = null;
    self.currentSet = null;

    self.setIcons = [];
    self.deckIcons = [];
    self.backlog = [];
    self.loaded = false;

    self.data = {};

    function loadData(resolve, reject) {

        var resourcePromise = $http({
            method: 'GET',
            url: 'http://localhost:8000/imageprocessor/resources'
        });

        var dataPromise = $http({
            method: 'GET',
            url: 'http://localhost:8000/imageprocessor/'
        });

        $q.all([resourcePromise, dataPromise]).then(
            function successCallback(repsonses) {
                var resourceData = repsonses[0].data;
                var applicationData = repsonses[1].data;
                initWithData(resourceData, applicationData);
                self.loaded = true;
                if(resolve) resolve(true);
                /*                $timeout(function () {
                 $rootScope.$broadcast('wizard:ready', {
                 backlog: self.backlog,
                 data: data
                 }
                 );
                 }, 100);*/

            },
            function errorCallback(response) {
                if(reject) reject(response);
            });


    }

    function initWithData(resourceData, applicationData) {
        self.setIcons = resourceData.setIcons.map(
            function (i) {
                return {
                    name: i.name,
                    path: '../media/seticons/' + i.path
                }
            }
        );

        self.deckIcons = resourceData.deckIcons.map(
            function (i) {
                return {
                    name: i.name,
                    path: '../media/deckthumbs/' + i.path
                }
            }
        );

        self.soundFolders = [];
        var foundSubs = {};
        for (var i = 0; i < resourceData.sounds.length; i++) {
            var sound = resourceData.sounds[i];
            var subFolder = sound.subFolder;
            if (!foundSubs.hasOwnProperty(subFolder)) {
                self.soundFolders.push(subFolder);
                foundSubs[subFolder] = subFolder;
            }
        }

        self.sounds = resourceData.sounds;

        self.backlog = resourceData.backlog.map(function (i) {
            return {
                name: i.name,
                path: i.path,
                displayPath: '../media/backlog/' + i.path,
                key: i.path
            }
        });

        self.imageDataManger.initWithSeedData({
            backlog: self.backlog,
            data: applicationData
        });

        self.sets = self.imageDataManger.sets;

    }

    function syncData() {
        var data = {
            sets: self.imageDataManger.sets
        };
        $http.post('http://localhost:8000/imageprocessor/update', data).then(function (response) {
        }, function (response) {

        });

    }

    function init() {
        loadData();
    }

    self.ready = function () {
        return $q(function (resolve, reject) {
            if (self.loaded) {
                resolve(self);
            } else {
                var interval =  setInterval(function(){
                    if(self.loaded){
                        clearInterval(interval)
                        resolve(self);

                    }

                }, 100)
            }
        });
    };

    self.createSet = function (setName) {
        return self.imageDataManger.createSet(setName)
    };

    self.saveSet = function (set, add) {
        if (add) self.imageDataManger.addSet(set);
        syncData();
    };

    self.deleteSet = function (set) {
        if (self.imageDataManger.deleteSet(set)) {
            syncData();
        }
    };

    self.createDeck = function (deckName) {
        return self.imageDataManger.createDeck(deckName)
    };

    self.saveDeck = function (deck, parentSet) {
        if (parentSet) self.imageDataManger.addDeck(deck, parentSet);
        syncData();
    };

    self.deleteDeck = function (deck, parentSet) {
        if (self.imageDataManger.deleteDeck(deck, parentSet)) {
            syncData();
        }
    };

    self.getBacklogItem = function (itemKey) {
        for (var i = 0; i < self.backlog.length; i++) {
            var item = self.backlog[i];
            if (item.key == itemKey) return item;
        }
        return null;
    };

    self.selectBacklogItem = function (item) {

        setCurrentItem(item);
        self.wizardIndex++;
        $timeout(function () {
            $rootScope.$broadcast('wizard:itemSelected', self.currentItem);
        }, 100);

    };

    function setCurrentItem(backlogItem) {
        self.currentItem = null;
        for (var i = 0; i < self.imageDataManger.sets.length; i++) {
            var set = self.imageDataManger.sets[i];
            for (var j = 0; j < self.imageDataManger.decks.length; j++) {
                var deck = self.imageDataManger.decks[j];
                for (var k = 0; k < deck.images.length; k++) {
                    var image = deck.images[k];
                    if (image.key == backlogItem.path) {
                        self.currentSet = set;
                        self.currentDeck = deck;
                        self.currentItem = image;
                        break;
                    }
                }
                if (self.currentItem) break;
            }
            if (self.currentItem) break;
        }

        if (self.currentItem == null) {
            self.currentItem = CropManager.createNewImageDataItem(backlogItem);
            self.imageDataItems.push(self.currentItem);
        }
    }

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