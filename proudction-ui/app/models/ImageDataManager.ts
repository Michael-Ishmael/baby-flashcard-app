///<reference path="CropEntities.ts"/>
/**
 * Created by scorpio on 01/02/2016.
 */

interface IIdedItem {
    id: number;
}
interface IFileItem {
    name: string;
    path: string;
    subFolder: string;
}

interface IPromise {
    then(success:(data:any) => void, fail:(failMessage:any) => void):void;
}

interface IAsynDataObject {
    loaded: boolean;
}

interface IDataLoader {
    loadData(success:(data:any) => void, fail:(failMessage:any) => void);
    syncData(data:any);
    ready(dataObj:IAsynDataObject):IPromise;
    broadcast(message:string, data:any):void;
}

class ImageDataManager implements IAsynDataObject {

    public loaded:boolean = false;
    public setIcons:Array<IFileItem> = [];
    public deckIcons:Array<IFileItem> = [];
    public sounds:Array<IFileItem> = [];
    public soundFolders:Array<string> = [];

    public currentItem:ImageDataItem = null;
    public currentDeck:Deck = null;
    public currentSet:Set = null;

    public sets:Array<Set> = [];
    public decks:Array<Deck> = [];
    public items:Array<ImageDataItem> = [];
    public backlog:Array<IDataItem> = [];

    private initialised:boolean = false;
    private loader:IDataLoader = null;

    constructor(loader:IDataLoader) {
        this.loader = loader;
        this.init();
    }

    private init():void {
        if (this.loader) {
            var self = this;
            this.loader.loadData(function (responses) {
                self.dataLoaded(responses);
            }, function (response) {
                self.dataFailed(response);
            });
            this.initialised = true;
        }
    }

    public save():void {
        var data = {
            sets: this.sets
        };
        this.loader.syncData(data);
    }

    public ready():IPromise {
        return this.loader.ready(this);
    }

    private dataLoaded(responses:Array<any>):void {

        var resourceData = responses[0].data;
        var applicationData = responses[1].data;
        this.initWithData(resourceData, applicationData);

        this.loaded = true;
    }

    private initWithData(resourceData, applicationData):void {
        this.setIcons = resourceData.setIcons.map(
            function (i) {
                return {
                    name: i.name,
                    path: '../media/seticons/' + i.path
                }
            }
        );

        this.deckIcons = resourceData.deckIcons.map(
            function (i) {
                return {
                    name: i.name,
                    path: '../media/deckthumbs/' + i.path
                }
            }
        );

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

        this.backlog = resourceData.backlog.map(function (i) {
            return {
                name: i.name,
                path: i.path,
                displayPath: '../media/backlog/' + i.path,
                key: i.path
            }
        });

        this.loadFromImageHierarchy(applicationData)
    }

    private dataFailed(message:any):void {

    }

    public getBacklogItem = function (itemKey) {
        for (var i = 0; i < this.backlog.length; i++) {
            var item = this.backlog[i];
            if (item.key == itemKey) return item;
        }
        return null;
    };

    public selectBacklogItem = function (item) {

        this.setCurrentItem(item);
        this.loader.broadcast('wizard:itemSelected', this.currentItem);
    };

    private setCurrentItem(backlogItem) {
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
                        this.currentItem = image;
                        break;
                    }
                }
                if (this.currentItem) break;
            }
            if (this.currentItem) break;
        }

        if (this.currentItem == null) {
            this.currentItem = CropManager.createNewImageDataItem(backlogItem);
        }
    }


    public createSet(setName:string):Set {
        var newSetId = ImageDataManager.getNextIdForDataSet(this.sets);
        var set = new Set(newSetId, setName);
        set.icon = "";
        return set;
    }

    public addSet(set:Set) {
        this.sets.push(set);
    }

    public deleteSet(setToDelete:Set):boolean {
        if (setToDelete.decks.length > 0) return false;
        ImageDataManager.removeItemFromDataSet(setToDelete, this.sets);
        return true;
    }

    public createDeck(deckName:string):Deck {
        var newSetId = ImageDataManager.getNextIdForDataSet(this.decks);
        var deck = new Deck(newSetId, deckName);
        deck.icon = "";
        return deck;
    }

    public addDeck(deck:Deck, parentSet:Set) {
        this.decks.push(deck);
        //deck.parentSet = parentSet;
        parentSet.decks.push(deck);
    }

    public deleteDeck(deckToDelete:Deck, parentSet:Set):boolean {
        if (deckToDelete.images.length > 0) return false;
        ImageDataManager.removeItemFromDataSet(deckToDelete, this.decks);
        ImageDataManager.removeItemFromDataSet(deckToDelete, parentSet.decks);
        return true;
    }

    private static removeItemFromDataSet(itemToDelete:any, dataSet:Array<any>) {
        var indexToRemove = -1;
        for (var i = 0; i < dataSet.length; i++) {
            if (dataSet[i] == itemToDelete) {
                indexToRemove = i;
                break;
            }
        }
        if (indexToRemove > -1) dataSet.splice(indexToRemove, 1);
    }

    private static getNextIdForDataSet(dataSet:Array<IIdedItem>) {
        var maxId:number = 0;
        for (var i = 0; i < dataSet.length; i++) {
            var item = dataSet[i];
            if (item.id > maxId) maxId = item.id;
        }
        return maxId + 1;
    }

    private loadFromImageHierarchy(imageData:IImageData) {
        for (var i = 0; i < imageData.sets.length; i++) {
            var set = <Set>imageData.sets[i];
            this.sets.push(set);
            for (var j = 0; j < set.decks.length; j++) {
                var deck = <Deck>set.decks[j];
                this.decks.push(deck);

                for (var k = 0; k < deck.images.length; k++) {
                    var card = deck.images[k];
                    var imageDataItem = this.createImageDataItemFromCard(card);
                    this.items.push(imageDataItem);
                }
            }
        }
    }

    private createImageDataItemFromCard(card:IDataCard):ImageDataItem {
        var backlogItem = this.getMatchingBacklogItem(card.key);
        var imageDataItem:ImageDataItem;
        if (backlogItem) {
            imageDataItem = new ImageDataItem(card.key, card.path, backlogItem.path)
        } else {
            imageDataItem = new ImageDataItem(card.key, card.path, null)
        }

        imageDataItem.indexInDeck = card.indexInDeck;
        //imageDataItem.originalDims = BoxDims.createFromBox(card.originalsize);
        //imageDataItem.twelve16

        return imageDataItem;
    }

    private getMatchingBacklogItem(key:string) {
        for (var i = 0; i < this.backlog.length; i++) {
            var backlogItem = this.backlog[i];
            if (backlogItem.key == key) {
                return backlogItem;
            }
        }
        return null;
    }

}


class CropManager {

    public backlog:Array<IDataItem> = [];
    public completed:Array<ImageDataItem> = [];
    public imageDataItems:Array<ImageDataItem> = [];
    public currentItem:ImageDataItem = null;
    public activeCropDef:CropDef;

    constructor() {

    }

    public loadBacklogItem(backlogItem:BacklogItem, target:IImageTarget) {
        this.currentItem = null;
        var targetDims = new BoxDims(0, 0, target.width(), target.height());
        for (var i = 0; i < this.imageDataItems.length; i++) {
            var item = this.imageDataItems[i];
            if (item.key == backlogItem.key) {
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

    }

    private finishLoadAsync(target:IImageTarget) {
        var img = new Image();
        var dm = this;
        img.onload = function () {
            dm.currentItem.originalDims = new BoxDims(0, 0, img.width, img.height);
        };
        img.src = target.attr('src');
    }

    public setStateForIndex(index:number) {
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
    }

    public clearCropActions() {
        this.activeCropDef = null;
    }

    public setMasterCropOrientation(orientation:Orientation) {
        if (this.activeCropDef) {
            //var cropSet = this.activeCropDef.parent;
            //cropSet.masterCropDef.orientation = orientation;
            //cropSet.altCropDef.orientation = ImageCropUtils.getOtherOrientation(orientation);
            this.recalculateCropStates();
        }

    }


    public static createNewImageDataItem(backlogItem:BacklogItem):ImageDataItem {

        var item = new ImageDataItem(backlogItem.key, backlogItem.name, backlogItem.path);
        item.twelve16 = new CropSet(CropFormat.twelve16, new CropDef('twM', CropTarget.master), new CropDef('twA', CropTarget.alt));
        item.nine16 = new CropSet(CropFormat.nine16, new CropDef('nnM', CropTarget.master), new CropDef('nnA', CropTarget.alt));

        return item;

    }

    private recalculateCropStates() {
        var ci = this.currentItem;
        ci.twelve16.masterCropDef.crop =
            ImageCropUtils.getBoxBounds(ci.twelve16.masterCropDef.orientation, ci.twelve16.format, ci.sizingDims);

        ci.twelve16.altCropDef.crop =
            ImageCropUtils.getBoxBounds(ci.twelve16.altCropDef.orientation, ci.twelve16.format, ci.sizingDims);

        ci.nine16.masterCropDef.crop =
            ImageCropUtils.getBoxBounds(ci.nine16.masterCropDef.orientation, ci.nine16.format, ci.sizingDims);

        ci.nine16.altCropDef.crop =
            ImageCropUtils.getBoxBounds(ci.nine16.altCropDef.orientation, ci.nine16.format, ci.sizingDims);
    }


}

