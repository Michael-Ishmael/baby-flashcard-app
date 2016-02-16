///<reference path="CropEntities.ts"/>
/**
 * Created by scorpio on 01/02/2016.
 */
var ImageDataManager = (function () {
    function ImageDataManager() {
        this.backlog = [];
        this.sets = [];
        this.decks = [];
        this.items = [];
        this.completed = [];
    }
    ImageDataManager.prototype.initWithSeedData = function (data) {
        this.backlog = data.sBacklog;
        this.loadFromImageHierarchy(data.data);
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
            var set = imageData[i];
            this.sets.push(set.name);
            for (var j = 0; j < set.decks.length; j++) {
                var deck = set.decks[j];
                this.decks.push(deck);
                for (var k = 0; k < deck.cards.length; k++) {
                    var card = deck.cards[k];
                    var imageDataItem = this.createImageDataItemFromCard(card);
                    this.items.push(imageDataItem);
                }
            }
        }
    };
    ImageDataManager.prototype.createImageDataItemFromCard = function (card, deck) {
        var backlogItem = this.getMatchingBacklogItem(card.id);
        var imageDataItem;
        if (backlogItem) {
            imageDataItem = new ImageDataItem(card.id, card.image, backlogItem.path);
        }
        else {
            imageDataItem = new ImageDataItem(card.id, card.image, null);
        }
        imageDataItem.deck = deck;
        imageDataItem.indexInDeck = card.index;
        imageDataItem.originalDims = BoxDims.createFromBox(card.originalsize);
        //imageDataItem.twelve16
        return imageDataItem;
    };
    ImageDataManager.prototype.getMatchingBacklogItem = function (id) {
        for (var i = 0; i < this.backlog.length; i++) {
            var backlogItem = this.backlog[i];
            if (backlogItem.id == id) {
                return backlogItem;
            }
        }
        return null;
    };
    return ImageDataManager;
})();
var CropManager = (function () {
    function CropManager(seedData, changeCallback) {
        this.seedData = seedData;
        this.changeCallback = changeCallback;
        this.backlog = [];
        this.completed = [];
        this.imageDataItems = [];
        this.currentItem = null;
        if (seedData) {
            this.backlog = seedData.backlog;
            this.imageDataItems = seedData.imageDataItems;
        }
    }
    CropManager.prototype.loadBacklogItem = function (backlogItem, target) {
        this.currentItem = null;
        var targetDims = new BoxDims(0, 0, target.width(), target.height());
        for (var i = 0; i < this.imageDataItems.length; i++) {
            var item = this.imageDataItems[i];
            if (item.id == backlogItem.id) {
                this.currentItem = item;
            }
        }
        if (this.currentItem == null) {
            this.currentItem = CropManager.createNewImageDataItem(backlogItem);
            this.imageDataItems.push(this.currentItem);
        }
        this.currentItem.sizingDims = targetDims;
        this.recalculateCropStates();
        this.finishLoadAsync(target);
        return this.currentItem;
    };
    CropManager.prototype.finishLoadAsync = function (target) {
        var img = new Image();
        var dm = this;
        img.onload = function () {
            dm.currentItem.originalDims = new BoxDims(0, 0, img.width, img.height);
            if (dm.changeCallback)
                dm.changeCallback();
        };
        img.src = target.attr('src');
    };
    CropManager.prototype.setStateForIndex = function (index) {
        switch (index) {
            case 0:
                this.activeCropDef = this.currentItem.twelve16.masterCropDef;
                break;
            case 1:
                this.activeCropDef = this.currentItem.twelve16.altCropDef;
                break;
            case 2:
                this.activeCropDef = this.currentItem.nine16.masterCropDef;
                break;
            case 3:
                this.activeCropDef = this.currentItem.nine16.altCropDef;
                break;
        }
    };
    CropManager.prototype.clearCropActions = function () {
        this.activeCropDef = null;
    };
    CropManager.prototype.setMasterCropOrientation = function (orientation) {
        if (this.activeCropDef) {
            var cropSet = this.activeCropDef.parent;
            cropSet.masterCropDef.orientation = orientation;
            cropSet.altCropDef.orientation = ImageCropUtils.getOtherOrientation(orientation);
            this.recalculateCropStates();
        }
    };
    CropManager.prototype.getExistingIndexesForDeck = function (deckName) {
        var existingIndexes = [];
        for (var i = 0; i < this.imageDataItems.length; i++) {
            var item = this.imageDataItems[i];
            if (item.deck && item.deck.name == deckName && item.indexInDeck > -1) {
                existingIndexes.push(item.indexInDeck);
            }
        }
        return existingIndexes;
    };
    CropManager.createNewImageDataItem = function (backlogItem) {
        var item = new ImageDataItem(backlogItem.key, backlogItem.name, backlogItem.path);
        item.twelve16 = new CropSet(CropFormat.twelve16, new CropDef('twM', CropTarget.master), new CropDef('twA', CropTarget.alt));
        item.nine16 = new CropSet(CropFormat.nine16, new CropDef('nnM', CropTarget.master), new CropDef('nnA', CropTarget.alt));
        return item;
    };
    CropManager.prototype.recalculateCropStates = function () {
        var ci = this.currentItem;
        ci.twelve16.masterCropDef.crop =
            ImageCropUtils.getBoxBounds(ci.twelve16.masterCropDef.orientation, ci.twelve16.format, ci.sizingDims);
        ci.twelve16.altCropDef.crop =
            ImageCropUtils.getBoxBounds(ci.twelve16.altCropDef.orientation, ci.twelve16.format, ci.sizingDims);
        ci.nine16.masterCropDef.crop =
            ImageCropUtils.getBoxBounds(ci.nine16.masterCropDef.orientation, ci.nine16.format, ci.sizingDims);
        ci.nine16.altCropDef.crop =
            ImageCropUtils.getBoxBounds(ci.nine16.altCropDef.orientation, ci.nine16.format, ci.sizingDims);
    };
    return CropManager;
})();
//# sourceMappingURL=ImageDataManager.js.map