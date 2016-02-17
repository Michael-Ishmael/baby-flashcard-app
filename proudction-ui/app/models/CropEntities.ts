/**
 * Created by scorpio on 03/02/2016.
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

enum ItemStatus {
    loaded,
    assigned,
    completed,
    untouched
}

interface IDataCard {
    key:string;
    path:string;
    indexInDeck:number;
    sound:string;
    //originalsize:IBox;
    //portraitbounds:IBox;
    //landscapebounds:IBox;
}

interface IDataDeck {
    id:number;
    name:string;
    icon:string;
    images:Array<IDataCard>;
    sounds:Array<IDataItem>;
}

interface IDataSet {
    id:number;
    name:string;
    icon:string;
    decks:Array<IDataDeck>;
}

interface IImageData{
    sets:Array<IDataSet>;
}

interface ISeedData {
    backlog:Array<IDataItem>;
    data:IImageData;
}

interface IImageTarget {
    attr(src:string):string;
    width():number;
    height():number;
}

interface IBox{
    x:number;
    y:number;
    w:number;
    h:number;
}

class BoxDims implements IBox {

    constructor(public x:number, public y:number, public w:number, public h:number) {

    }

    toCoordArray():Array<number> {
        return [this.x, this.y, this.x + this.w, this.y + this.h];
    }

    setFromBox(coords:IBox){
        this.x = coords.x;
        this.y = coords.y;
        this.w = coords.w;
        this.h = coords.h;
    }

    hasDims(){
        return (this.w - this.x) > 50 && (this.h - this.y) > 50;
    }

    public static createFromBox(box:IBox){
        return new BoxDims(box.x, box.y, box.w, box.h);
    }
}



class CropDef {

    orientation:Orientation;
    crop:BoxDims;
    //parent:CropSet;

    constructor(public key:string, public target:CropTarget){
        if(target == CropTarget.master){
            this.orientation = Orientation.landscape;
        } else {
            this.orientation = Orientation.portrait;
        }
        this.crop = new BoxDims(0, 0, 100, 100);
    }

    getAspectRatio():number{
        var shortSide = 12; // this.parent.format == CropFormat.twelve16 ? 12 : 9;
        if(this.orientation == Orientation.portrait){
            return shortSide / 16;
        } else {
            return 16 / shortSide;
        }
    }

    isComplete():boolean{
        return this.orientation && this.crop.hasDims();
    }
}

class CropSet {

    public masterCropDef:CropDef;
    public altCropDef:CropDef;
    public activeDef:CropDef;
    public title:string;

    constructor(public format:CropFormat, masterCropDef:CropDef, altCropDef:CropDef) {
        this.masterCropDef = masterCropDef;
        //this.masterCropDef.parent = this;
        this.activeDef = masterCropDef;
        this.altCropDef = altCropDef;
        //this.altCropDef.parent = this;
        this.title = ImageCropUtils.getCropTitleFromCropFormat(format);
    }

    public isComplete():boolean{
        return this.masterCropDef.isComplete() && this.altCropDef.isComplete();
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

    public static getCropTitleFromCropFormat(format:CropFormat):string{
        if(format == CropFormat.twelve16) return "12 / 16";
        return "9 / 16";
    }
}

class Set implements IDataSet {

    icon:string;
    decks:Array<IDataDeck> = [];

    constructor(public id:number, public name:string){

    }

    public addDeck(deck:IDataDeck){
        this.decks.push(deck);
    }
}

class Deck implements IDataDeck {

    //cards:Array<IDataCard>;
    sounds:Array<IDataItem>;

    icon:string;
    images:Array<ImageDataItem> = [];

    constructor(public id:number, public name:string){

    }
}

interface IDataItem{

    key:string;
    name:string;
    path:string;

    getStatus():ItemStatus;
}

class ImageDataItem implements IDataCard{

    indexInDeck:number;

    public sound:string;
    public twelve16:CropSet;
    public nine16:CropSet;
    public originalDims:BoxDims;
    public sizingDims:BoxDims;

    constructor(public key:string, public name:string, public path:string) {

    }

    private cropSetDict:{ [id:string]:CropDef } = null;

    public getCropSetDict():{ [id:string]:CropDef}{

        if(!this.cropSetDict) {
            this.cropSetDict = {};
            this.cropSetDict[this.twelve16.masterCropDef.key] = this.twelve16.masterCropDef;
            this.cropSetDict[this.twelve16.masterCropDef.key] = this.twelve16.masterCropDef;
            this.cropSetDict[this.twelve16.masterCropDef.key] = this.twelve16.masterCropDef;
            this.cropSetDict[this.twelve16.masterCropDef.key] = this.twelve16.masterCropDef;
        }

        return this.cropSetDict;
    }

    public getStatus():ItemStatus{
        if(this.indexInDeck > -1 && this.sound){
            if (this.originalDims && this.originalDims.hasDims() && this.twelve16.isComplete() && this.nine16.isComplete())
                return ItemStatus.completed;
            return ItemStatus.assigned;
        }
        return ItemStatus.loaded;
    }

}

class BacklogItem{


    constructor(public key:string, public name:string, public path:string) {

    }

    getStatus():ItemStatus {
        return ItemStatus.untouched;
    }
}

interface SeedData {
    backlog:Array<BacklogItem>;
    imageDataItems:Array<ImageDataItem>;
}

interface GeneralCallback {
    () : void;
}
