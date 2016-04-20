/**
 * Created by scorpio on 03/02/2016.
 */
var Orientation;
(function (Orientation) {
    Orientation[Orientation["landscape"] = 0] = "landscape";
    Orientation[Orientation["portrait"] = 1] = "portrait";
})(Orientation || (Orientation = {}));
var CropFormat;
(function (CropFormat) {
    CropFormat[CropFormat["twelve16"] = 0] = "twelve16";
    CropFormat[CropFormat["nine16"] = 1] = "nine16";
})(CropFormat || (CropFormat = {}));
var ItemStatus;
(function (ItemStatus) {
    ItemStatus[ItemStatus["untouched"] = 0] = "untouched";
    ItemStatus[ItemStatus["assigned"] = 1] = "assigned";
    ItemStatus[ItemStatus["cropped"] = 2] = "cropped";
    ItemStatus[ItemStatus["completed"] = 3] = "completed";
})(ItemStatus || (ItemStatus = {}));
var BoxDims = (function () {
    function BoxDims(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }
    BoxDims.prototype.toCoordArray = function () {
        return [this.x, this.y, this.x + this.w, this.y + this.h];
    };
    BoxDims.prototype.setFromBox = function (coords) {
        this.x = coords.x;
        this.y = coords.y;
        this.w = coords.w;
        this.h = coords.h;
    };
    BoxDims.prototype.hasDims = function () {
        var hasDims = (this.w - this.x) > 0 && (this.h - this.y) > 0;
        return hasDims;
    };
    BoxDims.prototype.toJsonObj = function () {
        return {
            x: this.x,
            y: this.y,
            w: this.w,
            h: this.h
        };
    };
    BoxDims.createFromBox = function (box) {
        return new BoxDims(box.x, box.y, box.w, box.h);
    };
    return BoxDims;
})();
var CropTarget;
(function (CropTarget) {
    CropTarget[CropTarget["master"] = 1] = "master";
    CropTarget[CropTarget["alt"] = 2] = "alt";
})(CropTarget || (CropTarget = {}));
var CropDef = (function () {
    function CropDef(orientation) {
        this.orientation = orientation;
        this.percentages = new BoxDims(0, 0, 0, 0);
    }
    CropDef.fromICropDef = function (iCropDef, orientation) {
        var def = new CropDef(orientation);
        if (iCropDef.percentages)
            def.percentages = BoxDims.createFromBox(iCropDef.percentages);
        def.cropPercentages = def.percentages.toCoordArray();
        return def;
    };
    CropDef.prototype.getAspectRatio = function (format) {
        var shortSide = format == CropFormat.twelve16 ? 12 : 9;
        if (this.orientation == Orientation.portrait) {
            return shortSide / 16;
        }
        else {
            return 16 / shortSide;
        }
    };
    CropDef.prototype.isComplete = function () {
        var isComplete = (this.orientation == Orientation.landscape || this.orientation == Orientation.portrait) && this.percentages.hasDims();
        return isComplete;
    };
    CropDef.prototype.toJsonObj = function () {
        return {
            orientation: this.orientation,
            percentages: this.percentages.toJsonObj(),
            cropPercentages: this.percentages.toCoordArray()
        };
    };
    return CropDef;
})();
var CropSet = (function () {
    function CropSet(format, masterCropDef, altCropDef) {
        this.format = format;
        this.landscapeCropDef = masterCropDef;
        this.activeDef = masterCropDef;
        this.portraitCropDef = altCropDef;
        this.title = ImageCropUtils.getCropTitleFromCropFormat(format);
    }
    CropSet.fromICropSet = function (iCropSet) {
        return new CropSet(iCropSet.format, CropDef.fromICropDef(iCropSet.landscapeCropDef, Orientation.landscape), CropDef.fromICropDef(iCropSet.portraitCropDef, Orientation.portrait));
    };
    CropSet.prototype.isComplete = function () {
        var isComplete = this.landscapeCropDef.isComplete() && this.portraitCropDef.isComplete() && (this.title && this.title.length > 0);
        return isComplete;
    };
    CropSet.prototype.toJsonObj = function () {
        return {
            format: this.format,
            title: this.title,
            landscapeCropDef: this.landscapeCropDef.toJsonObj(),
            portraitCropDef: this.portraitCropDef.toJsonObj()
        };
    };
    return CropSet;
})();
var ImageCropUtils = (function () {
    function ImageCropUtils() {
    }
    ImageCropUtils.getOtherOrientation = function (givenOrientation) {
        if (givenOrientation == Orientation.landscape) {
            return Orientation.portrait;
        }
        return Orientation.landscape;
    };
    ImageCropUtils.getBoxBounds = function (orientation, format, visibleDims) {
        var prop, w, h;
        if (orientation == Orientation.landscape) {
            prop = format == CropFormat.twelve16 ? 12 / 16 : 9 / 16;
            w = visibleDims.w;
            h = visibleDims.w * prop;
            if (h > visibleDims.h) {
                h = visibleDims.h;
                w = visibleDims.h * (1 / prop);
            }
        }
        else if (orientation == Orientation.portrait) {
            prop = format == CropFormat.twelve16 ? 12 / 16 : 9 / 16;
            w = visibleDims.h * prop;
            h = visibleDims.h;
            if (w > visibleDims.w) {
                w = visibleDims.w;
                h = visibleDims.w * (1 / prop);
            }
        }
        return new BoxDims(0, 0, w, h);
    };
    ImageCropUtils.getCropTitleFromCropFormat = function (format) {
        if (format == CropFormat.twelve16)
            return "12 / 16";
        return "9 / 16";
    };
    return ImageCropUtils;
})();
var Set = (function () {
    function Set(id, name) {
        this.id = id;
        this.name = name;
        this.decks = [];
        this.toJsonObj = function () {
            return {
                id: this.id,
                name: this.name,
                icon: this.icon,
                decks: this.decks.map(function (d) {
                    return d.toJsonObj();
                })
            };
        };
    }
    Set.prototype.addDeck = function (deck) {
        this.decks.push(deck);
    };
    Set.fromIDataSet = function (iDataSet) {
        var set = new Set(iDataSet.id, iDataSet.name);
        set.icon = iDataSet.icon;
        set.decks = iDataSet.decks.map(function (d) {
            return Deck.fromIDataDeck(d);
        });
        return set;
    };
    return Set;
})();
var Deck = (function () {
    function Deck(id, name) {
        this.id = id;
        this.name = name;
        this.images = [];
        this.toJsonObj = function () {
            return {
                id: this.id,
                name: this.name,
                icon: this.icon,
                sounds: this.sounds,
                images: this.images.map(function (i) {
                    return i.toJsonObj();
                })
            };
        };
    }
    Deck.fromIDataDeck = function (idataDeck) {
        var deck = new Deck(idataDeck.id, idataDeck.name);
        deck.icon = idataDeck.icon;
        deck.sounds = idataDeck.sounds;
        deck.images = idataDeck.images.map(function (i) {
            return ImageDataItem.createFromIDataCard(i);
        });
        return deck;
    };
    return Deck;
})();
var ImageDataItem = (function () {
    function ImageDataItem(key, name, path) {
        this.key = key;
        this.name = name;
        this.path = path;
    }
    ImageDataItem.createFromIDataCard = function (iDataCard) {
        var img = new ImageDataItem(iDataCard.key, iDataCard.name, iDataCard.path);
        img.sound = iDataCard.sound;
        img.originalDims = iDataCard.originalDims ? BoxDims.createFromBox(iDataCard.originalDims) : new BoxDims(0, 0, 20, 20);
        img.sizingDims = iDataCard.sizingDims ? BoxDims.createFromBox(iDataCard.sizingDims) : new BoxDims(0, 0, 20, 20);
        img.twelve16 = CropSet.fromICropSet(iDataCard.twelve16);
        img.nine16 = CropSet.fromICropSet(iDataCard.nine16);
        img.indexInDeck = iDataCard.indexInDeck;
        img.completed = iDataCard.completed;
        return img;
    };
    ImageDataItem.prototype.setPercentages = function () {
        if (!this.sizingDims)
            return;
        //this.twelve16.setPercentages(this.sizingDims);
        //this.nine16.setPercentages(this.sizingDims);
    };
    ImageDataItem.prototype.toJsonObj = function () {
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
        };
    };
    ImageDataItem.prototype.getStatus = function () {
        if (this.indexInDeck > -1 && this.sound) {
            if (this.sizingDims && this.sizingDims.hasDims() && this.twelve16.isComplete() && this.nine16.isComplete()) {
                if (this.completed) {
                    return ItemStatus.completed;
                }
                else {
                    return ItemStatus.cropped;
                }
            }
            return ItemStatus.assigned;
        }
        return ItemStatus.untouched;
    };
    return ImageDataItem;
})();
var BacklogItem = (function () {
    function BacklogItem(key, name, path) {
        this.key = key;
        this.name = name;
        this.path = path;
    }
    return BacklogItem;
})();
//# sourceMappingURL=CropEntities.js.map