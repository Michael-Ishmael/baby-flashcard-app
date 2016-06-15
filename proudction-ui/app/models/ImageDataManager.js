///<reference path="CropEntities.ts"/>
/**
 * Created by scorpio on 01/02/2016.
 */
var ImageDataManager = (function () {
    function ImageDataManager(loader) {
        this.loaded = false;
        this.setIcons = [];
        this.deckIcons = [];
        this.sounds = [];
        this.soundFolders = [];
        this.currentItem = null;
        this.currentDeck = null;
        this.currentSet = null;
        this.sets = [];
        this.decks = [];
        this.items = [];
        this.backlog = [];
        this.discardedItems = [];
        this.initialised = false;
        this.loader = null;
        this.getBacklogItem = function (itemKey) {
            for (var i = 0; i < this.backlog.length; i++) {
                var item = this.backlog[i];
                if (item.key == itemKey)
                    return item;
            }
            return null;
        };
        this.selectBacklogItem = function (item, view) {
            this.setCurrentItem(item);
            this.loader.broadcast('wizard:itemSelected', this.currentItem);
            //if(view == 'crop'){
            //    this.loader.broadcast('wizard:itemAssigned', this.currentItem);
            //} else {
            //    
            //}
        };
        this.loader = loader;
        this.init();
    }
    ImageDataManager.prototype.init = function () {
        if (this.loader) {
            var self = this;
            this.loader.loadData(function (responses) {
                self.dataLoaded(responses);
            }, function (response) {
                self.dataFailed(response);
            });
            this.initialised = true;
        }
    };
    ImageDataManager.prototype.save = function () {
        var data = {
            sets: this.sets.map(function (s) { return s.toJsonObj(); }),
            discarded: this.discardedItems.map(function (d) { return d.toJsonObj(); })
        };
        this.loader.syncData(data);
    };
    ImageDataManager.prototype.uploadImage = function (item) {
        this.loader.uploadImage(item.key);
    };
    ImageDataManager.prototype.markComplete = function (item) {
        if (item.getStatus() == ItemStatus.cropped || item.getStatus() == ItemStatus.completed) {
            item.completed = true;
            var matchingBacklogItem = this.findItemInBacklog(item);
            if (matchingBacklogItem)
                matchingBacklogItem.status = item.getStatus();
            this.save();
        }
    };
    ImageDataManager.prototype.discardImage = function (item) {
        var indexToRemove = -1;
        for (var i = 0; i < this.decks.length; i++) {
            var deck = this.decks[i];
            indexToRemove = -1;
            for (var j = 0; j < deck.images.length; j++) {
                var image = deck.images[j];
                if (image.key == item.key) {
                    indexToRemove = j;
                }
            }
            if (indexToRemove > -1) {
                this.decks[i].images.splice(indexToRemove, 1);
                break;
            }
        }
        this.discardedItems.push(BacklogItem.createFromIDataItem(image));
    };
    ImageDataManager.prototype.restoredDiscardedItem = function (itemKey) {
        var indexToRemove = -1;
        var item;
        for (var i = 0; i < this.discardedItems.length; i++) {
            var loopItem = this.discardedItems[i];
            if (loopItem.key == itemKey) {
                indexToRemove = i;
                item = loopItem;
                break;
            }
        }
        if (indexToRemove > -1) {
            this.discardedItems.splice(indexToRemove, 1);
            this.backlog.push(BacklogItem.createFromIDataItem(item));
        }
    };
    ImageDataManager.prototype.ready = function () {
        return this.loader.ready(this);
    };
    ImageDataManager.prototype.dataLoaded = function (responses) {
        var resourceData = responses[0].data;
        var applicationData = responses[1].data;
        this.initWithData(resourceData, applicationData);
        this.loaded = true;
    };
    ImageDataManager.prototype.initWithData = function (resourceData, applicationData) {
        this.setIcons = resourceData.setIcons.map(function (i) {
            return {
                name: i.name,
                path: '../media/seticons/' + i.path
            };
        });
        this.deckIcons = resourceData.deckIcons.map(function (i) {
            return {
                name: i.name,
                path: '../media/deckthumbs/' + i.path
            };
        });
        this.soundFolders = [];
        var foundSubs = {};
        for (var i = 0; i < resourceData.sounds.length; i++) {
            var sound = resourceData.sounds[i];
            var subFolder = sound.subFolder;
            if (!foundSubs.hasOwnProperty(subFolder)) {
                this.soundFolders.push(subFolder);
                foundSubs[subFolder] = subFolder;
            }
        }
        this.sounds = resourceData.sounds;
        this.backlog = resourceData.backlog
            .filter(function (i) {
            if (!applicationData.discarded)
                return true;
            for (var j = 0; j < applicationData.discarded.length; j++) {
                var discardedItem = applicationData.discarded[j];
                if (i.name == discardedItem.key)
                    return false;
            }
            return true;
        })
            .map(function (i) {
            return {
                name: i.name,
                path: i.path,
                displayPath: '../media/backlog/' + i.path,
                key: i.name,
                status: ItemStatus.untouched
            };
        });
        this.loadFromImageHierarchy(applicationData);
    };
    ImageDataManager.prototype.dataFailed = function (message) {
    };
    ImageDataManager.prototype.setCurrentItem = function (backlogItem) {
        this.currentSet = null;
        this.currentDeck = null;
        this.currentItem = null;
        for (var i = 0; i < this.sets.length; i++) {
            var set = this.sets[i];
            for (var j = 0; j < this.decks.length; j++) {
                var deck = this.decks[j];
                for (var k = 0; k < deck.images.length; k++) {
                    var image = deck.images[k];
                    if (image.key == backlogItem.path) {
                        this.currentSet = set;
                        this.currentDeck = deck;
                        this.currentItem = image; //ImageDataItem.createFromIDataCard(image);
                        break;
                    }
                }
                if (this.currentItem)
                    break;
            }
            if (this.currentItem)
                break;
        }
        if (this.currentItem == null) {
            this.currentItem = CropManager.createNewImageDataItem(backlogItem);
            backlogItem.status = this.currentItem.getStatus();
        }
    };
    ImageDataManager.prototype.createSet = function (setName) {
        var newSetId = ImageDataManager.getNextIdForDataSet(this.sets);
        var set = new Set(newSetId, setName);
        set.icon = "";
        return set;
    };
    ImageDataManager.prototype.addSet = function (set) {
        this.sets.push(set);
    };
    ImageDataManager.prototype.deleteSet = function (setToDelete) {
        if (setToDelete.decks.length > 0)
            return false;
        ImageDataManager.removeItemFromDataSet(setToDelete, this.sets);
        return true;
    };
    ImageDataManager.prototype.createDeck = function (deckName) {
        var newSetId = ImageDataManager.getNextIdForDataSet(this.decks);
        var deck = new Deck(newSetId, deckName);
        deck.icon = "";
        return deck;
    };
    ImageDataManager.prototype.addDeck = function (deck, parentSet) {
        this.decks.push(deck);
        //deck.parentSet = parentSet;
        parentSet.decks.push(deck);
    };
    ImageDataManager.prototype.deleteDeck = function (deckToDelete, parentSet) {
        if (deckToDelete.images.length > 0)
            return false;
        ImageDataManager.removeItemFromDataSet(deckToDelete, this.decks);
        ImageDataManager.removeItemFromDataSet(deckToDelete, parentSet.decks);
        return true;
    };
    ImageDataManager.removeItemFromDataSet = function (itemToDelete, dataSet) {
        var indexToRemove = -1;
        for (var i = 0; i < dataSet.length; i++) {
            if (dataSet[i] == itemToDelete) {
                indexToRemove = i;
                break;
            }
        }
        if (indexToRemove > -1)
            dataSet.splice(indexToRemove, 1);
    };
    ImageDataManager.getNextIdForDataSet = function (dataSet) {
        var maxId = 0;
        for (var i = 0; i < dataSet.length; i++) {
            var item = dataSet[i];
            if (item.id > maxId)
                maxId = item.id;
        }
        return maxId + 1;
    };
    ImageDataManager.prototype.loadFromImageHierarchy = function (imageData) {
        for (var i = 0; i < imageData.sets.length; i++) {
            var set = Set.fromIDataSet(imageData.sets[i]);
            this.sets.push(set);
            for (var j = 0; j < set.decks.length; j++) {
                var deck = set.decks[j];
                this.decks.push(deck);
                for (var k = 0; k < deck.images.length; k++) {
                    var card = ImageDataItem.createFromIDataCard(deck.images[k]);
                    this.items.push(card);
                    var matchingBacklogItem = this.findItemInBacklog(card);
                    if (matchingBacklogItem) {
                        matchingBacklogItem.status = card.getStatus();
                    }
                }
            }
        }
        if (imageData.discarded) {
            this.discardedItems = imageData.discarded.map(function (discardedEl) {
                return BacklogItem.createFromIDataItem(discardedEl);
            });
        }
    };
    ImageDataManager.prototype.findItemInBacklog = function (item, searchDiscardedBacklog) {
        if (searchDiscardedBacklog === void 0) { searchDiscardedBacklog = false; }
        var arr = searchDiscardedBacklog ? this.discardedItems : this.backlog;
        for (var i = 0; i < arr.length; i++) {
            var backlogItem = arr[i];
            if (backlogItem.key == item.key) {
                return backlogItem;
            }
        }
        return null;
    };
    return ImageDataManager;
}());
var CropManager = (function () {
    function CropManager() {
        this.currentItem = null;
    }
    CropManager.prototype.loadItem = function (item, target) {
        this.currentItem = item;
        this.currentItem.sizingDims = new BoxDims(0, 0, target.width(), target.height());
        //if(item.getStatus() < ItemStatus.cropped) this.recalculateCropStates();
        this.finishLoadAsync(target);
        return this.currentItem;
    };
    CropManager.prototype.finishLoadAsync = function (target) {
        var img = new Image();
        var dm = this;
        img.onload = function () {
            dm.currentItem.originalDims = new BoxDims(0, 0, img.width, img.height);
        };
        img.src = target.attr('src');
    };
    CropManager.prototype.setStateForIndex = function (index) {
        switch (index) {
            case 0:
                this.activeCropSet = this.currentItem.twelve16;
                this.activeCropDef = this.currentItem.twelve16.landscapeCropDef;
                break;
            case 1:
                this.activeCropSet = this.currentItem.twelve16;
                this.activeCropDef = this.currentItem.twelve16.portraitCropDef;
                break;
            case 2:
                this.activeCropSet = this.currentItem.nine16;
                this.activeCropDef = this.currentItem.nine16.landscapeCropDef;
                break;
            case 3:
                this.activeCropSet = this.currentItem.nine16;
                this.activeCropDef = this.currentItem.nine16.portraitCropDef;
                break;
        }
    };
    CropManager.prototype.clearCropActions = function () {
        this.activeCropSet = null;
        this.activeCropDef = null;
    };
    CropManager.prototype.setMasterCropOrientation = function (orientation) {
        if (this.activeCropDef) {
            var cropSet = this.getCropSetForDef(this.activeCropDef);
            cropSet.landscapeCropDef.orientation = orientation;
            cropSet.portraitCropDef.orientation = ImageCropUtils.getOtherOrientation(orientation);
            this.recalculateCropStates();
        }
    };
    CropManager.prototype.getCropSetForDef = function (def) {
        if (this.currentItem) {
            if (this.currentItem.twelve16.landscapeCropDef == def)
                return this.currentItem.twelve16;
            if (this.currentItem.twelve16.portraitCropDef == def)
                return this.currentItem.twelve16;
            if (this.currentItem.nine16.landscapeCropDef == def)
                return this.currentItem.nine16;
            if (this.currentItem.nine16.portraitCropDef == def)
                return this.currentItem.nine16;
        }
    };
    CropManager.createNewImageDataItem = function (backlogItem) {
        var item = new ImageDataItem(backlogItem.key, backlogItem.name, backlogItem.path);
        item.originalDims = new BoxDims(0, 0, 100, 100);
        item.twelve16 = new CropSet(CropFormat.twelve16, new CropDef(Orientation.landscape), new CropDef(Orientation.portrait));
        item.nine16 = new CropSet(CropFormat.nine16, new CropDef(Orientation.landscape), new CropDef(Orientation.portrait));
        return item;
    };
    CropManager.prototype.recalculateCropStates = function () {
        var ci = this.currentItem;
        /*        ci.twelve16.landscapeCropDef.crop =
                    ImageCropUtils.getBoxBounds(ci.twelve16.landscapeCropDef.orientation, ci.twelve16.format, ci.sizingDims);
        
                ci.twelve16.portraitCropDef.crop =
                    ImageCropUtils.getBoxBounds(ci.twelve16.portraitCropDef.orientation, ci.twelve16.format, ci.sizingDims);
        
                ci.nine16.landscapeCropDef.crop =
                    ImageCropUtils.getBoxBounds(ci.nine16.landscapeCropDef.orientation, ci.nine16.format, ci.sizingDims);
        
                ci.nine16.portraitCropDef.crop =
                    ImageCropUtils.getBoxBounds(ci.nine16.portraitCropDef.orientation, ci.nine16.format, ci.sizingDims);*/
    };
    return CropManager;
}());
//# sourceMappingURL=ImageDataManager.js.map