///<reference path="CropEntities.ts"/>
/**
 * Created by scorpio on 01/02/2016.
 */



class ImageDataManager {

    public changeHash = '-1';
    public backlog:Array<BacklogItem> = [];
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
            this.currentItem = ImageDataManager.createNewImageDataItem(backlogItem);
            this.imageDataItems.push(this.currentItem);
        }
        this.currentItem.sizingDims = targetDims;
        this.changeHash = this.currentItem.id.toString();
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

    public setStateForIndex(index:number){
        switch (index){
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

    public getExistingIndexesForDeck(deckName:string):Array<number>{
        var existingIndexes:Array<number> = [];
        for (var i = 0; i < this.imageDataItems.length; i++) {
            var item = this.imageDataItems[i];
            if(item.deck && item.deck.name == deckName && item.indexInDeck > -1){
                existingIndexes.push(item.indexInDeck);
            }
        }
        return existingIndexes;
    }

    private static createNewImageDataItem(backlogItem:BacklogItem):ImageDataItem {

        var item = new ImageDataItem(backlogItem.id, backlogItem.path);
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