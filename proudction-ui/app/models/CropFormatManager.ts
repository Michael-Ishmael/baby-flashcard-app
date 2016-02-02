/**
 * Created by scorpio on 01/02/2016.
 */

enum Orientation{
    landscape,
    portrait
}

enum CropFormat{
    twelve16,
    nine16
}

enum CropTarget {
    master,
    alt
}

interface IImageTarget {
    attr(src:string):string
}

class BoxDims {

    constructor(public x:number, public y:number, public w:number, public h:number) {

    }

    toCoordArray() {
        return [this.x, this.y, this.w, this.h];
    }

}

class CropDef {

    orientation:Orientation;
    crop:BoxDims;
    parent:CropSet;

    constructor(public key:string, public target:CropTarget){
        if(target == CropTarget.master){
            this.orientation = Orientation.landscape;
        } else {
            this.orientation = Orientation.portrait;
        }
        this.crop = new BoxDims(0, 0, 100, 100);
    }
}

class CropSet {

    public masterCropDef:CropDef;
    public altCropDef:CropDef;
    public activeDef:CropDef;

    constructor(public format:CropFormat, masterCropDef:CropDef, altCropDef:CropDef) {
        this.masterCropDef = masterCropDef;
        this.masterCropDef.parent = this;
        this.activeDef = masterCropDef;
        this.altCropDef = altCropDef;
        this.altCropDef.parent = this
    }

    public setMasterOrientation(orientation:Orientation){
        this.masterCropDef.orientation = orientation;
        this.altCropDef.orientation = ImageCropUtils.getOtherOrientation(orientation);
    }

    public switchToAltCropDef(){
        this.altCropDef.crop = ImageCropUtils.getBoxBounds(this.altCropDef.orientation, this.format, this.masterCropDef.crop)
    }


}

class ImageCropUtils{

    public static getOtherOrientation(givenOrientation:Orientation):Orientation {
        if (givenOrientation == Orientation.landscape) {
            return Orientation.portrait;
        }
        return Orientation.landscape;
    }

    public static getBoxBounds(orientation:Orientation, format:CropFormat, visibleDims:BoxDims):BoxDims {

        var prop, w, h;
        if (orientation == Orientation.landscape) {
            prop = format == CropFormat.twelve16 ? 12 / 16 : 9 / 16;
            w = visibleDims.w;
            h = visibleDims.w * prop;
            if (h > visibleDims.h) {
                h = visibleDims.h;
                w = visibleDims.h * (1 / prop)
            }
        } else if (orientation == Orientation.portrait) {
            prop = format == CropFormat.twelve16 ? 12 / 16 : 9 / 16;
            w = visibleDims.h * prop;
            h = visibleDims.h;
            if (w > visibleDims.w) {
                w = visibleDims.w;
                h = visibleDims.w * (1 / prop);
            }

        }
        return new BoxDims(0, 0, w, h);
    }

}

class ImageDataItem {

    public name:string = "empty";
    public twelve16:CropSet;
    public nine16:CropSet;
    public originalDims:BoxDims;

    constructor(public id:number, public path:string) {

    }

    private cropSetDict:{ [id:string]:CropDef } = null;

    public GetCropSetDict():{ [id:string]:CropDef}{

        if(!this.cropSetDict) {
            this.cropSetDict = {};
            this.cropSetDict[this.twelve16.masterCropDef.key] = this.twelve16.masterCropDef;
            this.cropSetDict[this.twelve16.masterCropDef.key] = this.twelve16.masterCropDef;
            this.cropSetDict[this.twelve16.masterCropDef.key] = this.twelve16.masterCropDef;
            this.cropSetDict[this.twelve16.masterCropDef.key] = this.twelve16.masterCropDef;
        }

        return this.cropSetDict;
    }

}

class BacklogItem {

    constructor(public id:number, public path:string) {

    }
}

interface SeedData {
    backlog:Array<BacklogItem>;
    imageDataItems:Array<ImageDataItem>;
}

interface GeneralCallback {
    () : void;
}

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

    public setActiveCropDef(key:string){
        if(!this.currentItem) return;
        var defs = this.currentItem.GetCropSetDict();
        this.activeCropDef = defs[key];
    }

    public setActiveCropCoords(coordArray:Array<number>){
        if(!this.activeCropDef) return;
        this.activeCropDef.crop = new BoxDims(coordArray[0], coordArray[1], coordArray[2], coordArray[3]);

    }

    public doNextCropAction(srcKey:string){
        if(!this.activeCropDef) return;
        if(this.activeCropDef.key == srcKey){

        } else {
            var cropDef = this.getCropDef(srcKey);
            if(this.activeCropDef.parent == cropDef.parent){
                this.activeCropDef.parent.switchToAltCropDef();
            }
        }
    }

    private getCropDef(key):CropDef{
        if(!this.currentItem) return null;
        var def = this.currentItem.GetCropSetDict()[key];
        return def;
    }

    public setMasterCropOrientation(format:CropFormat, orientation:Orientation) {
        switch (format) {
            case CropFormat.twelve16:
                this.currentItem.twelve16.masterCropDef.orientation = orientation;
                this.currentItem.twelve16.altCropDef.orientation = ImageCropUtils.getOtherOrientation(orientation);
                break;
            case CropFormat.nine16:
                this.currentItem.nine16.masterCropDef.orientation = orientation;
                this.currentItem.nine16.altCropDef.orientation = ImageCropUtils.getOtherOrientation(orientation);
                break;
        }
    }

    public loadBacklogItem(backlogItem:BacklogItem, target:IImageTarget) {
        this.currentItem = null;
        for (var i = 0; i < this.imageDataItems.length; i++) {
            var item = this.imageDataItems[i];
            if (item.id == backlogItem.id) {
                this.currentItem = item;
            }
        }
        if (this.currentItem == null)
            this.currentItem = ImageDataManager.createNewImageDataItem(backlogItem);

        this.finishLoadAsync(target);

    }

    private finishLoadAsync(target:IImageTarget) {
        var img = new Image();
        var dm = this;
        img.onload = function () {
            dm.currentItem.originalDims = new BoxDims(0, 0, img.width, img.height);
            dm.changeHash = dm.currentItem.id.toString();
            this.initializeCropStates(dm.currentItem.originalDims);
            if (dm.changeCallback) dm.changeCallback();

        };
        img.src = target.attr('src');
    }

    private static createNewImageDataItem(backlogItem:BacklogItem):ImageDataItem {

        var item = new ImageDataItem(backlogItem.id, backlogItem.path);
        item.twelve16 = new CropSet(CropFormat.twelve16, new CropDef('twM', CropTarget.master), new CropDef('twA', CropTarget.alt));
        item.nine16 = new CropSet(CropFormat.nine16, new CropDef('nnM', CropTarget.master), new CropDef('nnA', CropTarget.alt));

        return item;

    }

    private initializeCropStates(visibleDims:BoxDims){
        var ci = this.currentItem;
        ci.twelve16.masterCropDef.crop =
            ImageCropUtils.getBoxBounds(ci.twelve16.masterCropDef.orientation, ci.twelve16.format, visibleDims);

        ci.twelve16.altCropDef.crop =
            ImageCropUtils.getBoxBounds(ci.twelve16.altCropDef.orientation, ci.twelve16.format, visibleDims);

        ci.nine16.masterCropDef.crop =
            ImageCropUtils.getBoxBounds(ci.nine16.masterCropDef.orientation, ci.nine16.format, visibleDims);

        ci.nine16.altCropDef.crop =
            ImageCropUtils.getBoxBounds(ci.nine16.altCropDef.orientation, ci.nine16.format, visibleDims);
    }



}