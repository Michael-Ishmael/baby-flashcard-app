///<reference path="CropEntities.ts"/>
/**
 * Created by scorpio on 01/02/2016.
 */

interface IIdedItem{
    id: number;
}


class ImageDataManager {

    public backlog:Array<IDataItem> = [];
    public sets:Array<Set> = [];
    public decks:Array<Deck> = [];
    public items:Array<ImageDataItem> = [];
    public completed:Array<ImageDataItem> = [];

    public initWithSeedData(data:ISeedData) {
        this.backlog = data.sBacklog;
        this.loadFromImageHierarchy(data.data)
    }

    public createSet(setName:string):Set{
        var newSetId = ImageDataManager.getNextIdForDataSet(this.sets);
        var set = new Set(newSetId, setName);
        set.icon = "";
        return set;
    }

    public addSet(set:Set){
        this.sets.push(set);
    }

    public deleteSet(setToDelete:Set):boolean{
        if(setToDelete.decks.length > 0) return false;
        ImageDataManager.removeItemFromDataSet(setToDelete, this.sets);
        return true;
    }

    public createDeck(deckName:string):Deck{
        var newSetId = ImageDataManager.getNextIdForDataSet(this.decks);
        var deck = new Deck(newSetId, deckName);
        deck.icon = "";
        return deck;
    }

    public addDeck(deck:Deck, parentSet:Set){
        this.decks.push(deck);
        //deck.parentSet = parentSet;
        parentSet.decks.push(deck);
    }

    public deleteDeck(deckToDelete:Deck, parentSet:Set):boolean{
        if(deckToDelete.images.length > 0) return false;
        ImageDataManager.removeItemFromDataSet(deckToDelete, this.decks);
        ImageDataManager.removeItemFromDataSet(deckToDelete, parentSet.decks);
        return true;
    }


    private static removeItemFromDataSet(itemToDelete:any, dataSet:Array<any>){
        var indexToRemove = -1;
        for (var i = 0; i < dataSet.length; i++) {
            if(dataSet[i] == itemToDelete){
                indexToRemove = i;
                break;
            }
        }
        if(indexToRemove > -1) dataSet.splice(indexToRemove, 1);
    }


    private static getNextIdForDataSet(dataSet:Array<IIdedItem>){
        var maxId:number = 0;
        for (var i = 0; i < dataSet.length; i++) {
            var item = dataSet[i];
            if(item.id > maxId) maxId = item.id;
        }
        return maxId + 1;
    }

    private loadFromImageHierarchy(imageData:IImageData){
        for (var i = 0; i < imageData.sets.length; i++) {
            var set  = imageData[i];
            this.sets.push(set.name);
            for (var j = 0; j < set.decks.length; j++) {
                var deck = set.decks[j];
                this.decks.push(deck);

                for (var k = 0; k < deck.cards.length; k++) {
                    var card = deck.cards[k];
                    var imageDataItem = this.createImageDataItemFromCard(card);
                    this.items.push(imageDataItem)

                }
            }

        }
    }

    private createImageDataItemFromCard(card:IDataCard, deck:IDataDeck):ImageDataItem{
        var backlogItem = this.getMatchingBacklogItem(card.id);
        var imageDataItem:ImageDataItem;
        if(backlogItem){
            imageDataItem = new ImageDataItem(card.id, card.image, backlogItem.path)
        } else {
            imageDataItem = new ImageDataItem(card.id, card.image, null)
        }

        imageDataItem.deck = deck;
        imageDataItem.indexInDeck = card.index;
        imageDataItem.originalDims = BoxDims.createFromBox(card.originalsize);
        //imageDataItem.twelve16

        return imageDataItem;
    }

    private getMatchingBacklogItem(id:number){
        for (var i = 0; i < this.backlog.length; i++) {
            var backlogItem = this.backlog[i];
            if(backlogItem.id == id){
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

    constructor(private seedData?:SeedData, private changeCallback?:GeneralCallback) {
        if (seedData) {
            this.backlog = seedData.backlog;
            this.imageDataItems = seedData.imageDataItems;
        }
    }

    public loadBacklogItem(backlogItem:BacklogItem, target:IImageTarget) {
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

    }

    private finishLoadAsync(target:IImageTarget) {
        var img = new Image();
        var dm = this;
        img.onload = function () {
            dm.currentItem.originalDims = new BoxDims(0, 0, img.width, img.height);
            if (dm.changeCallback) dm.changeCallback();

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
            var cropSet = this.activeCropDef.parent;
            cropSet.masterCropDef.orientation = orientation;
            cropSet.altCropDef.orientation = ImageCropUtils.getOtherOrientation(orientation);
            this.recalculateCropStates();
        }

    }

    public getExistingIndexesForDeck(deckName:string):Array<number> {
        var existingIndexes:Array<number> = [];
        for (var i = 0; i < this.imageDataItems.length; i++) {
            var item = this.imageDataItems[i];
            if (item.deck && item.deck.name == deckName && item.indexInDeck > -1) {
                existingIndexes.push(item.indexInDeck);
            }
        }
        return existingIndexes;
    }

    private static createNewImageDataItem(backlogItem:BacklogItem):ImageDataItem {

        var item = new ImageDataItem(backlogItem.id, backlogItem.name, backlogItem.path);
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

