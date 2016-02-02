/**
 * Created by scorpio on 01/02/2016.
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
var BoxDims = (function () {
    function BoxDims(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }
    BoxDims.prototype.toCoordArray = function () {
        return [this.x, this.y, this.w, this.h];
    };
    return BoxDims;
})();
var CropDef = (function () {
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
    return CropDef;
})();
var CropSet = (function () {
    function CropSet(format, masterCropDef, altCropDef) {
        this.format = format;
        this.masterCropDef = masterCropDef;
        this.masterCropDef.parent = this;
        this.activeDef = masterCropDef;
        this.altCropDef = altCropDef;
        this.altCropDef.parent = this;
    }
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
    return ImageCropUtils;
})();
var ImageDataItem = (function () {
    function ImageDataItem(id, path) {
        this.id = id;
        this.path = path;
        this.name = "empty";
        this.cropSetDict = null;
    }
    ImageDataItem.prototype.GetCropSetDict = function () {
        if (!this.cropSetDict) {
            this.cropSetDict = {};
            this.cropSetDict[this.twelve16.masterCropDef.key] = this.twelve16.masterCropDef;
            this.cropSetDict[this.twelve16.masterCropDef.key] = this.twelve16.masterCropDef;
            this.cropSetDict[this.twelve16.masterCropDef.key] = this.twelve16.masterCropDef;
            this.cropSetDict[this.twelve16.masterCropDef.key] = this.twelve16.masterCropDef;
        }
        return this.cropSetDict;
    };
    return ImageDataItem;
})();
var BacklogItem = (function () {
    function BacklogItem(id, path) {
        this.id = id;
        this.path = path;
    }
    return BacklogItem;
})();
var ImageDataManager = (function () {
    function ImageDataManager(seedData, changeCallback) {
        this.seedData = seedData;
        this.changeCallback = changeCallback;
        this.changeHash = '-1';
        this.backlog = [];
        this.imageDataItems = [];
        this.currentItem = null;
        if (seedData) {
            this.backlog = seedData.backlog;
            this.imageDataItems = seedData.imageDataItems;
        }
    }
    ImageDataManager.prototype.setActiveCropDef = function (key) {
        if (!this.currentItem)
            return;
        var defs = this.currentItem.GetCropSetDict();
        this.activeCropDef = defs[key];
    };
    ImageDataManager.prototype.setActiveCropCoords = function (coordArray) {
        if (!this.activeCropDef)
            return;
        this.activeCropDef.crop = new BoxDims(coordArray[0], coordArray[1], coordArray[2], coordArray[3]);
    };
    ImageDataManager.prototype.doNextCropAction = function (srcKey) {
        if (!this.activeCropDef)
            return;
        if (this.activeCropDef.key == srcKey) {
        }
        else {
            var cropDef = this.getCropDef(srcKey);
            if (this.activeCropDef.parent == cropDef.parent) {
                this.activeCropDef.parent.switchToAltCropDef();
            }
        }
    };
    ImageDataManager.prototype.getCropDef = function (key) {
        if (!this.currentItem)
            return null;
        var def = this.currentItem.GetCropSetDict()[key];
        return def;
    };
    ImageDataManager.prototype.setMasterCropOrientation = function (format, orientation) {
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
    };
    ImageDataManager.prototype.loadBacklogItem = function (backlogItem, target) {
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
    };
    ImageDataManager.prototype.finishLoadAsync = function (target) {
        var img = new Image();
        var dm = this;
        img.onload = function () {
            dm.currentItem.originalDims = new BoxDims(0, 0, img.width, img.height);
            dm.changeHash = dm.currentItem.id.toString();
            this.initializeCropStates(dm.currentItem.originalDims);
            if (dm.changeCallback)
                dm.changeCallback();
        };
        img.src = target.attr('src');
    };
    ImageDataManager.createNewImageDataItem = function (backlogItem) {
        var item = new ImageDataItem(backlogItem.id, backlogItem.path);
        item.twelve16 = new CropSet(CropFormat.twelve16, new CropDef('twM', CropTarget.master), new CropDef('twA', CropTarget.alt));
        item.nine16 = new CropSet(CropFormat.nine16, new CropDef('nnM', CropTarget.master), new CropDef('nnA', CropTarget.alt));
        return item;
    };
    ImageDataManager.prototype.initializeCropStates = function (visibleDims) {
        var ci = this.currentItem;
        ci.twelve16.masterCropDef.crop =
            ImageCropUtils.getBoxBounds(ci.twelve16.masterCropDef.orientation, ci.twelve16.format, visibleDims);
        ci.twelve16.altCropDef.crop =
            ImageCropUtils.getBoxBounds(ci.twelve16.altCropDef.orientation, ci.twelve16.format, visibleDims);
        ci.nine16.masterCropDef.crop =
            ImageCropUtils.getBoxBounds(ci.nine16.masterCropDef.orientation, ci.nine16.format, visibleDims);
        ci.nine16.altCropDef.crop =
            ImageCropUtils.getBoxBounds(ci.nine16.altCropDef.orientation, ci.nine16.format, visibleDims);
    };
    return ImageDataManager;
})();
//# sourceMappingURL=CropFormatManager.js.map