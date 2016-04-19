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

enum ItemStatus {
    untouched,
    assigned,
    cropped,
    completed
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

interface IImageData {
    sets:Array<IDataSet>;
}

interface IImageTarget {
    attr(src:string):string;
    width():number;
    height():number;
}

interface IBox {
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

    setFromBox(coords:IBox) {
        this.x = coords.x;
        this.y = coords.y;
        this.w = coords.w;
        this.h = coords.h;
    }

    hasDims() {
        var hasDims = (this.w - this.x) > 0 && (this.h - this.y) > 0;
        return hasDims;
    }

    toJsonObj():IBox {
        return {
            x: this.x,
            y: this.y,
            w: this.w,
            h: this.h
        }
    }

    public static createFromBox(box:IBox) {
        return new BoxDims(box.x, box.y, box.w, box.h);
    }
}

enum CropTarget{
    master = 1,
    alt = 2
}

interface ICropDef {

    orientation:Orientation;
    percentages:IBox;
    cropPercentages:Array<number>;
}

class CropDef implements ICropDef {

    percentages:BoxDims;
    cropPercentages:Array<number>;

    public static fromICropDef(iCropDef:ICropDef, orientation:Orientation):CropDef {
        var def = new CropDef(orientation);
        if(iCropDef.percentages)
            def.percentages = BoxDims.createFromBox(iCropDef.percentages);
            def.cropPercentages = def.percentages.toCoordArray();
        return def;
    }


    constructor(public orientation:Orientation) {
        this.percentages = new BoxDims(0, 0, 0, 0);
    }


    getAspectRatio(format:CropFormat):number {
        var shortSide = format == CropFormat.twelve16 ? 12 : 9;
        if (this.orientation == Orientation.portrait) {
            return shortSide / 16;
        } else {
            return 16 / shortSide;
        }
    }

    isComplete():boolean {
        var isComplete = (this.orientation == Orientation.landscape || this.orientation == Orientation.portrait ) && this.percentages.hasDims();
        return isComplete;
    }

    toJsonObj():ICropDef {
        return {
            orientation: this.orientation,
            percentages: this.percentages.toJsonObj(),
            cropPercentages: this.percentages.toCoordArray()
        }
    }
}

interface ICropSet {
    format:CropFormat;
    landscapeCropDef:ICropDef;
    portraitCropDef:ICropDef;
    title:string;
}

class CropSet implements ICropSet {

    public landscapeCropDef:CropDef;
    public portraitCropDef:CropDef;
    public activeDef:CropDef;
    public title:string;

    public static fromICropSet(iCropSet:ICropSet):CropSet {
        return new CropSet(iCropSet.format,
            CropDef.fromICropDef(iCropSet.landscapeCropDef, Orientation.landscape),
            CropDef.fromICropDef(iCropSet.portraitCropDef, Orientation.portrait));
    }

    constructor(public format:CropFormat, masterCropDef:CropDef, altCropDef:CropDef) {
        this.landscapeCropDef = masterCropDef;
        this.activeDef = masterCropDef;
        this.portraitCropDef = altCropDef;
        this.title = ImageCropUtils.getCropTitleFromCropFormat(format);
    }


    public isComplete():boolean {
        var isComplete = this.landscapeCropDef.isComplete() && this.portraitCropDef.isComplete() && (this.title && this.title.length > 0);
        return isComplete;
    }

    public toJsonObj():ICropSet {
        return {
            format: this.format,
            title: this.title,
            landscapeCropDef: this.landscapeCropDef.toJsonObj(),
            portraitCropDef: this.portraitCropDef.toJsonObj()
        }
    }

}

class ImageCropUtils {

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

    public static getCropTitleFromCropFormat(format:CropFormat):string {
        if (format == CropFormat.twelve16) return "12 / 16";
        return "9 / 16";
    }
}

class Set implements IDataSet {

    icon:string;
    decks:Array<IDataDeck> = [];

    constructor(public id:number, public name:string) {

    }

    public addDeck(deck:IDataDeck) {
        this.decks.push(deck);
    }

    toJsonObj = function () {
        return {
            id: this.id,
            name: this.name,
            icon: this.icon,
            decks: this.decks.map(function (d) {
                return d.toJsonObj()
            })
        }
    };

    public static fromIDataSet = function (iDataSet:IDataSet):Set {
        var set = new Set(iDataSet.id, iDataSet.name);
        set.icon = iDataSet.icon;
        set.decks = iDataSet.decks.map(function (d) {
            return Deck.fromIDataDeck(d)
        });
        return set;
    }
}

class Deck implements IDataDeck {

    //cards:Array<IDataCard>;
    sounds:Array<IDataItem>;

    icon:string;
    images:Array<ImageDataItem> = [];

    constructor(public id:number, public name:string) {

    }

    public static fromIDataDeck = function (idataDeck:IDataDeck):Deck {
        var deck = new Deck(idataDeck.id, idataDeck.name);
        deck.icon = idataDeck.icon;
        deck.sounds = idataDeck.sounds;
        deck.images = idataDeck.images.map(function (i) {
            return ImageDataItem.createFromIDataCard(i);
        });
        return deck;
    };

    toJsonObj = function () {
        return {
            id: this.id,
            name: this.name,
            icon: this.icon,
            sounds: this.sounds,
            images: this.images.map(function (i) {
                return i.toJsonObj()
            })
        }
    }
}

interface IDataItem {

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
    sizingDims:IBox;
    twelve16:ICropSet;
    nine16:ICropSet;
    completed:boolean;
    discarded:boolean;

}

class ImageDataItem implements IDataCard, IDataItem {

    indexInDeck:number;

    public sound:string;
    public twelve16:CropSet;
    public nine16:CropSet;
    public originalDims:BoxDims;
    public sizingDims:BoxDims;
    public completed:boolean;
    public discarded:boolean;

    public static createFromIDataCard(iDataCard:IDataCard):ImageDataItem {

        var img = new ImageDataItem(iDataCard.key, iDataCard.name, iDataCard.path);
        img.sound = iDataCard.sound;
        img.originalDims = iDataCard.originalDims ? BoxDims.createFromBox(iDataCard.originalDims) : new BoxDims(0, 0, 20, 20);
        img.sizingDims = iDataCard.sizingDims ? BoxDims.createFromBox(iDataCard.sizingDims) : new BoxDims(0, 0, 20, 20);
        img.twelve16 = CropSet.fromICropSet(iDataCard.twelve16);
        img.nine16 = CropSet.fromICropSet(iDataCard.nine16);
        img.indexInDeck = iDataCard.indexInDeck;
        img.completed  = iDataCard.completed;
        return img;
    }

    constructor(public key:string, public name:string, public path:string) {

    }

    setPercentages(){
        if(!this.sizingDims) return;
        //this.twelve16.setPercentages(this.sizingDims);
        //this.nine16.setPercentages(this.sizingDims);
    }

    public toJsonObj():IDataCard {
        this.setPercentages();
        return {
            key: this.key,
            name: this.name,
            path: this.path,
            indexInDeck: this.indexInDeck,
            sound: this.sound,
            originalDims: this.originalDims.toJsonObj(),
            sizingDims: this.sizingDims ? this.sizingDims.toJsonObj() : null,
            twelve16: this.twelve16.toJsonObj(),
            nine16: this.nine16.toJsonObj(),
            completed: this.completed,
            discarded: this.discarded
        }
    }

    public getStatus():ItemStatus {
        if (this.indexInDeck > -1 && this.sound) {
            if (this.sizingDims && this.sizingDims.hasDims() && this.twelve16.isComplete() && this.nine16.isComplete()) {
                if (this.completed) {
                    return ItemStatus.completed;
                } else {
                    return ItemStatus.cropped;
                }
            }
            return ItemStatus.assigned;
        }
        return ItemStatus.untouched;
    }

}

class BacklogItem {


    constructor(public key:string, public name:string, public path:string) {

    }

    status:ItemStatus;
}
