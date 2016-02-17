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
var CropTarget;
(function (CropTarget) {
    CropTarget[CropTarget["master"] = 0] = "master";
    CropTarget[CropTarget["alt"] = 1] = "alt";
})(CropTarget || (CropTarget = {}));
var ItemStatus;
(function (ItemStatus) {
    ItemStatus[ItemStatus["loaded"] = 0] = "loaded";
    ItemStatus[ItemStatus["assigned"] = 1] = "assigned";
    ItemStatus[ItemStatus["completed"] = 2] = "completed";
    ItemStatus[ItemStatus["untouched"] = 3] = "untouched";
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
        return (this.w - this.x) > 50 && (this.h - this.y) > 50;
    };
    BoxDims.createFromBox = function (box) {
        return new BoxDims(box.x, box.y, box.w, box.h);
    };
    return BoxDims;
})();
var CropDef = (function () {
    //parent:CropSet;
    function CropDef(key, target) {
        this.key = key;
        this.target = target;
        if (target == CropTarget.master) {
            this.orientation = Orientation.landscape;
        }
        else {
            this.orientation = Orientation.portrait;
        }
        this.crop = new BoxDims(0, 0, 100, 100);
    }
    CropDef.prototype.getAspectRatio = function () {
        var shortSide = 12; // this.parent.format == CropFormat.twelve16 ? 12 : 9;
        if (this.orientation == Orientation.portrait) {
            return shortSide / 16;
        }
        else {
            return 16 / shortSide;
        }
    };
    CropDef.prototype.isComplete = function () {
        return this.orientation && this.crop.hasDims();
    };
    return CropDef;
})();
var CropSet = (function () {
    function CropSet(format, masterCropDef, altCropDef) {
        this.format = format;
        this.masterCropDef = masterCropDef;
        //this.masterCropDef.parent = this;
        this.activeDef = masterCropDef;
        this.altCropDef = altCropDef;
        //this.altCropDef.parent = this;
        this.title = ImageCropUtils.getCropTitleFromCropFormat(format);
    }
    CropSet.prototype.isComplete = function () {
        return this.masterCropDef.isComplete() && this.altCropDef.isComplete();
    };
    CropSet.prototype.setMasterOrientation = function (orientation) {
        this.masterCropDef.orientation = orientation;
        this.altCropDef.orientation = ImageCropUtils.getOtherOrientation(orientation);
    };
    CropSet.prototype.switchToAltCropDef = function () {
        this.altCropDef.crop = ImageCropUtils.getBoxBounds(this.altCropDef.orientation, this.format, this.masterCropDef.crop);
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
    }
    Set.prototype.addDeck = function (deck) {
        this.decks.push(deck);
    };
    return Set;
})();
var Deck = (function () {
    function Deck(id, name) {
        this.id = id;
        this.name = name;
        this.images = [];
    }
    return Deck;
})();
var ImageDataItem = (function () {
    function ImageDataItem(key, name, path) {
        this.key = key;
        this.name = name;
        this.path = path;
        this.cropSetDict = null;
    }
    ImageDataItem.prototype.getCropSetDict = function () {
        if (!this.cropSetDict) {
            this.cropSetDict = {};
            this.cropSetDict[this.twelve16.masterCropDef.key] = this.twelve16.masterCropDef;
            this.cropSetDict[this.twelve16.masterCropDef.key] = this.twelve16.masterCropDef;
            this.cropSetDict[this.twelve16.masterCropDef.key] = this.twelve16.masterCropDef;
            this.cropSetDict[this.twelve16.masterCropDef.key] = this.twelve16.masterCropDef;
        }
        return this.cropSetDict;
    };
    ImageDataItem.prototype.getStatus = function () {
        if (this.indexInDeck > -1 && this.sound) {
            if (this.originalDims && this.originalDims.hasDims() && this.twelve16.isComplete() && this.nine16.isComplete())
                return ItemStatus.completed;
            return ItemStatus.assigned;
        }
        return ItemStatus.loaded;
    };
    return ImageDataItem;
})();
var BacklogItem = (function () {
    function BacklogItem(key, name, path) {
        this.key = key;
        this.name = name;
        this.path = path;
    }
    BacklogItem.prototype.getStatus = function () {
        return ItemStatus.untouched;
    };
    return BacklogItem;
})();
//# sourceMappingURL=CropEntities.js.map