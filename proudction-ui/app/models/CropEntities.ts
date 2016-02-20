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

    toJsonObj():IBox{
        return {
            x: this.x,
            y: this.y,
            w: this.w,
            h: this.h
        }
    }

    public static createFromBox(box:IBox){
        return new BoxDims(box.x, box.y, box.w, box.h);
    }
}

interface ICropDef {

    orientation:Orientation;
    crop:IBox;
}

class CropDef implements ICropDef {

    orientation:Orientation;
    crop:BoxDims;
    //parent:CropSet;

    public static fromICropDef(iCropDef:ICropDef, target:CropTarget):CropDef{
        var def = new CropDef(target);
        def.orientation = iCropDef.orientation;
        def.crop = BoxDims.createFromBox(iCropDef.crop);
        return def;
    }

    constructor(public target:CropTarget){
        if(target == CropTarget.master){
            this.orientation = Orientation.landscape;
        } else {
            this.orientation = Orientation.portrait;
        }
        this.crop = new BoxDims(0, 0, 100, 100);
    }

    getAspectRatio(format:CropFormat):number{
        var shortSide = format == CropFormat.twelve16 ? 12 : 9;
        if(this.orientation == Orientation.portrait){
            return shortSide / 16;
        } else {
            return 16 / shortSide;
        }
    }

    isComplete():boolean{
        return (this.orientation == Orientation.landscape || this.orientation == Orientation.portrait ) && this.crop.hasDims();
    }

    toJsonObj():ICropDef{
        return {
            orientation:this.orientation,
            crop:this.crop.toJsonObj()
        }
    }
}

interface ICropSet{
    format:CropFormat;
    masterCropDef:ICropDef;
    altCropDef:ICropDef;
    title:string;
}

class CropSet implements ICropSet {

    public masterCropDef:CropDef;
    public altCropDef:CropDef;
    public activeDef:CropDef;
    public title:string;

    public static fromICropSet(iCropSet:ICropSet):CropSet{
        return new CropSet(iCropSet.format,
            CropDef.fromICropDef(iCropSet.masterCropDef, CropTarget.master),
            CropDef.fromICropDef(iCropSet.altCropDef, CropTarget.alt))
    }

    constructor(public format:CropFormat, masterCropDef:CropDef, altCropDef:CropDef) {
        this.masterCropDef = masterCropDef;
        //this.masterCropDef.parent = this;
        this.activeDef = masterCropDef;
        this.altCropDef = altCropDef;
        //this.altCropDef.parent = this;
        this.title = ImageCropUtils.getCropTitleFromCropFormat(format);
    }

    public setMasterOrientation(orientation:Orientation){
        this.masterCropDef.orientation = orientation;
        this.altCropDef.orientation = ImageCropUtils.getOtherOrientation(orientation);
    }

    public switchToAltCropDef(){
        this.altCropDef.crop = ImageCropUtils.getBoxBounds(this.altCropDef.orientation, this.format, this.masterCropDef.crop)
    }

    public isComplete():boolean{
        return this.masterCropDef.isComplete() && this.altCropDef.isComplete() && (this.title && this.title.length > 0);
    }

    public toJsonObj():ICropSet {
        return {
            format: this.format,
            title: this.title,
            masterCropDef: this.masterCropDef.toJsonObj(),
            altCropDef: this.altCropDef.toJsonObj()
        }
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

    toJsonObj = function(){
        return {
            id: this.id,
            name: this.name,
            icon: this.icon,
            decks: this.decks.map(function(d){ return d.toJsonObj() })
        }
    };

    public static fromIDataSet = function(iDataSet:IDataSet):Set{
        var set = new Set(iDataSet.id, iDataSet.name);
        set.icon = iDataSet.icon;
        set.decks = iDataSet.decks.map(function(d){ return Deck.fromIDataDeck(d) });
        return set;
    }
}

class Deck implements IDataDeck {

    //cards:Array<IDataCard>;
    sounds:Array<IDataItem>;

    icon:string;
    images:Array<ImageDataItem> = [];

    constructor(public id:number, public name:string){

    }

    public static fromIDataDeck = function(idataDeck:IDataDeck):Deck{
        var deck = new Deck(idataDeck.id, idataDeck.name);
        deck.icon = idataDeck.icon;
        deck.sounds = idataDeck.sounds;
        deck.images = idataDeck.images.map(function(i){ return ImageDataItem.createFromIDataCard(i); });
        return deck;
    };

    toJsonObj = function(){
        return {
            id: this.id,
            name: this.name,
            icon: this.icon,
            sounds: this.sounds,
            images: this.images.map(function(i){ return i.toJsonObj() })
        }
    }
}

interface IDataItem{

    key:string;
    name:string;
    path:string;

}

interface IDataCard {
    key:string;
    name:string;
    path:string;
    indexInDeck:number;
    sound:string;
    originalDims:IBox;
    twelve16:ICropSet;
    nine16:ICropSet;

}

class ImageDataItem implements IDataCard, IDataItem{

    indexInDeck:number;

    public sound:string;
    public twelve16:CropSet;
    public nine16:CropSet;
    public originalDims:BoxDims;
    public sizingDims:BoxDims;

    public static createFromIDataCard(iDataCard:IDataCard):ImageDataItem{

        var img = new ImageDataItem(iDataCard.key, iDataCard.name, iDataCard.path);
        img.sound = iDataCard.sound;
        img.originalDims = iDataCard.originalDims ? BoxDims.createFromBox(iDataCard.originalDims) : new BoxDims(0, 0, 100, 100);
        img.twelve16 = CropSet.fromICropSet(iDataCard.twelve16);
        img.nine16 = CropSet.fromICropSet(iDataCard.nine16);
        img.indexInDeck = iDataCard.indexInDeck;
        return img;
    }

    constructor(public key:string, public name:string, public path:string) {

    }

    public toJsonObj():IDataCard{
        return {
            key: this.key,
            name: this.name,
            path: this.path,
            indexInDeck: this.indexInDeck,
            sound: this.sound,
            originalDims: this.originalDims.toJsonObj(),
            twelve16: this.twelve16.toJsonObj(),
            nine16: this.nine16.toJsonObj()
        }
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

    status:ItemStatus;
}
