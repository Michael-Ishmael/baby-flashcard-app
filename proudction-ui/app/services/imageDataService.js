/**
 * Created by michaelishmael on 02/02/2016.
 */

app.factory('imageDataService', ['$rootScope', '$http', '$q', '$timeout', function ($rootScope, $http, $q, $timeout) {

    var loader = {
        loadData: function (resolve, reject) {

            var resourcePromise = $http({
                method: 'GET',
                url: 'http://localhost:8000/imageprocessor/resources'
            });

            var dataPromise = $http({
                method: 'GET',
                url: 'http://localhost:8000/imageprocessor/'
            });

            $q.all([resourcePromise, dataPromise]).then(
                function successCallback(responses) {
                    if (resolve) resolve(responses);
                },
                function errorCallback(response) {
                    if (reject) reject(response);
                });


        },
        syncData: function (data) {

            $http.post('http://localhost:8000/imageprocessor/update', data).then(function (response) {
            }, function (response) {

            });

        },
        ready: function (dataObj) {
            return $q(function (resolve, reject) {
                if (dataObj.loaded) {
                    resolve();
                } else {
                    var interval = setInterval(function () {
                        if (dataObj.loaded) {
                            clearInterval(interval);
                            resolve();
                        }

                    }, 100)
                }
            });
        },
        broadcast: function(message, data){
            $timeout(function () {
                $rootScope.$broadcast(message, data);
            }, 100);
        },
        uploadImage: function(key, callback){

            var transform = function(data){
                return $.param(data);
            };

            $http.post('http://localhost:8000/imageprocessor/updatecard', {imageKey: key},

                {
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
                    transformRequest: transform
                }
            ).then(function (response) {
                if(callback) callback(true)
            }, function (response) {
                if(callback) callback(false)
            });
        }

    };

    return new ImageDataManager(loader);


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


    function init() {
        loadData();
    }


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
        }
    }

    init();

    return self;
}]);
